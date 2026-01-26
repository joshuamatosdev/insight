package com.samgov.ingestor.service;

import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.ProcurementSource;
import com.samgov.ingestor.repository.ProcurementSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Procurement source management service.
 * Manages external data sources for opportunity ingestion.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProcurementSourceService {

    private final ProcurementSourceRepository sourceRepository;

    public record CreateSourceRequest(
        String name,
        String shortCode,
        String description,
        Opportunity.ContractLevel contractLevel,
        ProcurementSource.SourceType sourceType,
        String stateCode,
        String stateName,
        String locality,
        String apiEndpoint,
        Boolean apiKeyRequired,
        String webPortalUrl,
        String rssFeedUrl,
        Boolean scrapeEnabled,
        String scrapeConfig,
        Integer refreshIntervalHours
    ) {}

    public record SourceResponse(
        UUID id,
        String name,
        String shortCode,
        String description,
        Opportunity.ContractLevel contractLevel,
        ProcurementSource.SourceType sourceType,
        String stateCode,
        String stateName,
        String locality,
        String apiEndpoint,
        Boolean apiKeyRequired,
        String webPortalUrl,
        Boolean isActive,
        Integer refreshIntervalHours,
        Instant lastIngestionAt,
        Integer lastIngestionCount,
        Long totalOpportunitiesIngested
    ) {}

    @Transactional
    public SourceResponse createSource(CreateSourceRequest request) {
        if (request.shortCode() != null && sourceRepository.findByShortCode(request.shortCode()).isPresent()) {
            throw new IllegalArgumentException("Source with this short code already exists");
        }

        ProcurementSource source = new ProcurementSource();
        source.setName(request.name());
        source.setShortCode(request.shortCode());
        source.setDescription(request.description());
        source.setContractLevel(request.contractLevel());
        source.setSourceType(request.sourceType());
        source.setStateCode(request.stateCode());
        source.setStateName(request.stateName());
        source.setLocality(request.locality());
        source.setApiEndpoint(request.apiEndpoint());
        source.setApiKeyRequired(request.apiKeyRequired() != null ? request.apiKeyRequired() : false);
        source.setWebPortalUrl(request.webPortalUrl());
        source.setRssFeedUrl(request.rssFeedUrl());
        source.setScrapeEnabled(request.scrapeEnabled() != null ? request.scrapeEnabled() : false);
        source.setScrapeConfig(request.scrapeConfig());
        source.setRefreshIntervalHours(request.refreshIntervalHours() != null ? request.refreshIntervalHours() : 24);
        source.setIsActive(true);

        source = sourceRepository.save(source);
        log.info("Created procurement source: {} ({})", source.getName(), source.getShortCode());

        return toResponse(source);
    }

    @Transactional(readOnly = true)
    public List<SourceResponse> getAllSources() {
        return sourceRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SourceResponse> getActiveSources() {
        return sourceRepository.findByIsActiveTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<SourceResponse> getSourceByShortCode(String shortCode) {
        return sourceRepository.findByShortCode(shortCode).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<SourceResponse> getSourcesByContractLevel(Opportunity.ContractLevel level) {
        return sourceRepository.findByContractLevelAndIsActiveTrue(level).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<SourceResponse> getSourcesByState(String stateCode) {
        return sourceRepository.findByStateCodeAndIsActiveTrue(stateCode).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ProcurementSource> getSourcesDueForIngestion() {
        // Find sources where last ingestion was longer than refresh interval ago
        return sourceRepository.findByIsActiveTrue().stream()
            .filter(source -> {
                if (source.getLastIngestionAt() == null) {
                    return true; // Never ingested
                }
                Instant cutoff = Instant.now().minus(source.getRefreshIntervalHours(), ChronoUnit.HOURS);
                return source.getLastIngestionAt().isBefore(cutoff);
            })
            .toList();
    }

    @Transactional
    public void recordIngestion(UUID sourceId, int count) {
        ProcurementSource source = sourceRepository.findById(sourceId)
            .orElseThrow(() -> new IllegalArgumentException("Source not found"));

        source.setLastIngestionAt(Instant.now());
        source.setLastIngestionCount(count);
        source.setTotalOpportunitiesIngested(source.getTotalOpportunitiesIngested() + count);

        sourceRepository.save(source);
        log.info("Recorded ingestion for source {}: {} new opportunities", source.getName(), count);
    }

    @Transactional
    public void activateSource(UUID sourceId) {
        ProcurementSource source = sourceRepository.findById(sourceId)
            .orElseThrow(() -> new IllegalArgumentException("Source not found"));

        source.setIsActive(true);
        sourceRepository.save(source);
        log.info("Activated procurement source: {}", source.getName());
    }

    @Transactional
    public void deactivateSource(UUID sourceId) {
        ProcurementSource source = sourceRepository.findById(sourceId)
            .orElseThrow(() -> new IllegalArgumentException("Source not found"));

        source.setIsActive(false);
        sourceRepository.save(source);
        log.info("Deactivated procurement source: {}", source.getName());
    }

    @Transactional
    public void deleteSource(UUID sourceId) {
        sourceRepository.deleteById(sourceId);
        log.info("Deleted procurement source: {}", sourceId);
    }

    @Transactional(readOnly = true)
    public SourceStats getSourceStats() {
        long total = sourceRepository.count();
        long active = sourceRepository.countByIsActiveTrue();
        long federal = sourceRepository.countByContractLevel(Opportunity.ContractLevel.FEDERAL);
        long dod = sourceRepository.countByContractLevel(Opportunity.ContractLevel.DOD);
        long state = sourceRepository.countByContractLevel(Opportunity.ContractLevel.STATE);
        long local = sourceRepository.countByContractLevel(Opportunity.ContractLevel.LOCAL);
        List<String> states = sourceRepository.findDistinctStateCodes();

        return new SourceStats(total, active, federal, dod, state, local, states.size());
    }

    /**
     * Initialize default federal procurement sources.
     */
    @Transactional
    public void initializeDefaultSources() {
        // SAM.gov
        if (sourceRepository.findByShortCode("SAM_GOV").isEmpty()) {
            createSource(new CreateSourceRequest(
                "SAM.gov", "SAM_GOV",
                "System for Award Management - Federal Opportunities",
                Opportunity.ContractLevel.FEDERAL,
                ProcurementSource.SourceType.API,
                null, null, null,
                "https://api.sam.gov/opportunities/v2/search",
                true,
                "https://sam.gov/content/opportunities",
                null, false, null, 4
            ));
        }

        // SBIR.gov
        if (sourceRepository.findByShortCode("SBIR_GOV").isEmpty()) {
            createSource(new CreateSourceRequest(
                "SBIR.gov", "SBIR_GOV",
                "Small Business Innovation Research / STTR Program",
                Opportunity.ContractLevel.FEDERAL,
                ProcurementSource.SourceType.API,
                null, null, null,
                "https://api.sbir.gov/solicitations",
                true,
                "https://www.sbir.gov/solicitations",
                null, false, null, 24
            ));
        }

        // USA Spending
        if (sourceRepository.findByShortCode("USA_SPENDING").isEmpty()) {
            createSource(new CreateSourceRequest(
                "USASpending.gov", "USA_SPENDING",
                "Federal spending and contract awards data",
                Opportunity.ContractLevel.FEDERAL,
                ProcurementSource.SourceType.API,
                null, null, null,
                "https://api.usaspending.gov/api/v2/",
                false,
                "https://www.usaspending.gov/",
                null, false, null, 24
            ));
        }

        log.info("Initialized default procurement sources");
    }

    private SourceResponse toResponse(ProcurementSource source) {
        return new SourceResponse(
            source.getId(),
            source.getName(),
            source.getShortCode(),
            source.getDescription(),
            source.getContractLevel(),
            source.getSourceType(),
            source.getStateCode(),
            source.getStateName(),
            source.getLocality(),
            source.getApiEndpoint(),
            source.getApiKeyRequired(),
            source.getWebPortalUrl(),
            source.getIsActive(),
            source.getRefreshIntervalHours(),
            source.getLastIngestionAt(),
            source.getLastIngestionCount(),
            source.getTotalOpportunitiesIngested()
        );
    }

    public record SourceStats(
        long totalSources,
        long activeSources,
        long federalSources,
        long dodSources,
        long stateSources,
        long localSources,
        int statesCovered
    ) {}
}
