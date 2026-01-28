package com.samgov.ingestor.service;

import com.samgov.ingestor.client.SbirGovApiClient;
import com.samgov.ingestor.dto.SbirAwardDto;
import com.samgov.ingestor.model.SbirAward;
import com.samgov.ingestor.repository.SbirAwardRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for ingesting SBIR/STTR awards from SBIR.gov.
 */
@Service
public class SbirIngestionService {

    private static final Logger log = LoggerFactory.getLogger(SbirIngestionService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final SbirGovApiClient sbirApiClient;
    private final SbirAwardRepository sbirAwardRepository;

    public SbirIngestionService(SbirGovApiClient sbirApiClient, SbirAwardRepository sbirAwardRepository) {
        this.sbirApiClient = sbirApiClient;
        this.sbirAwardRepository = sbirAwardRepository;
    }

    /**
     * Ingest recent SBIR/STTR awards from SBIR.gov.
     * Fetches current and previous year awards for all configured agencies.
     *
     * @return IngestionResult with counts
     */
    @Transactional
    public IngestionResult ingestRecentAwards() {
        if (!sbirApiClient.isEnabled()) {
            log.info("SBIR.gov integration is disabled");
            return new IngestionResult(0, 0, 0);
        }

        log.info("Starting SBIR.gov award ingestion");
        long startTime = System.currentTimeMillis();

        AtomicInteger newCount = new AtomicInteger(0);
        AtomicInteger updatedCount = new AtomicInteger(0);

        try {
            List<SbirAwardDto> awards = sbirApiClient.fetchRecentAwards();
            log.info("Fetched {} awards from SBIR.gov", awards.size());

            for (SbirAwardDto dto : awards) {
                try {
                    processAward(dto, newCount, updatedCount);
                } catch (Exception e) {
                    log.error("Failed to process SBIR award: {}", dto.agencyTrackingNumber(), e);
                }
            }
        } catch (Exception e) {
            log.error("Error during SBIR.gov ingestion", e);
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("SBIR.gov ingestion completed in {}ms. New: {}, Updated: {}",
                duration, newCount.get(), updatedCount.get());

        return new IngestionResult(newCount.get(), updatedCount.get(), duration);
    }

    /**
     * Ingest awards for a specific agency and year.
     */
    @Transactional
    public IngestionResult ingestByAgencyAndYear(String agency, Integer year) {
        if (!sbirApiClient.isEnabled()) {
            return new IngestionResult(0, 0, 0);
        }

        log.info("Ingesting SBIR.gov awards for agency: {}, year: {}", agency, year);
        long startTime = System.currentTimeMillis();

        AtomicInteger newCount = new AtomicInteger(0);
        AtomicInteger updatedCount = new AtomicInteger(0);

        try {
            List<SbirAwardDto> awards = sbirApiClient.fetchAwards(agency, year);
            log.info("Fetched {} awards for {} ({})", awards.size(), agency, year);

            for (SbirAwardDto dto : awards) {
                try {
                    processAward(dto, newCount, updatedCount);
                } catch (Exception e) {
                    log.error("Failed to process award: {}", dto.agencyTrackingNumber(), e);
                }
            }
        } catch (Exception e) {
            log.error("Error ingesting awards for {}/{}", agency, year, e);
        }

        long duration = System.currentTimeMillis() - startTime;
        return new IngestionResult(newCount.get(), updatedCount.get(), duration);
    }

    /**
     * Process a single award DTO - insert or update.
     */
    private void processAward(SbirAwardDto dto, AtomicInteger newCount, AtomicInteger updatedCount) {
        if (dto.agencyTrackingNumber() == null || dto.agency() == null) {
            log.warn("Skipping award with null tracking number or agency");
            return;
        }

        Optional<SbirAward> existing = sbirAwardRepository
                .findByAgencyTrackingNumberAndAgency(dto.agencyTrackingNumber(), dto.agency());

        if (existing.isPresent()) {
            SbirAward award = existing.get();
            updateAwardFromDto(award, dto);
            sbirAwardRepository.save(award);
            updatedCount.incrementAndGet();
            log.debug("Updated SBIR award: {}", dto.agencyTrackingNumber());
        } else {
            SbirAward award = convertDtoToEntity(dto);
            sbirAwardRepository.save(award);
            newCount.incrementAndGet();
            log.debug("Created new SBIR award: {}", dto.agencyTrackingNumber());
        }
    }

    /**
     * Convert DTO to new entity.
     */
    private SbirAward convertDtoToEntity(SbirAwardDto dto) {
        SbirAward award = new SbirAward();
        award.setId(UUID.randomUUID().toString());
        award.setAgencyTrackingNumber(dto.agencyTrackingNumber());
        updateAwardFromDto(award, dto);
        return award;
    }

    /**
     * Update entity fields from DTO.
     */
    private void updateAwardFromDto(SbirAward award, SbirAwardDto dto) {
        award.setFirm(dto.firm());
        award.setAwardTitle(dto.awardTitle());
        award.setAgency(dto.agency());
        award.setBranch(dto.branch());
        award.setPhase(dto.normalizedPhase());
        award.setProgram(dto.program());
        award.setContract(dto.contract());
        award.setProposalAwardDate(parseDate(dto.proposalAwardDate()));
        award.setContractEndDate(parseDate(dto.contractEndDate()));
        award.setSolicitationNumber(dto.solicitationNumber());
        award.setSolicitationYear(parseInteger(dto.solicitationYear()));
        award.setTopicCode(dto.topicCode());
        award.setAwardYear(parseInteger(dto.awardYear()));
        award.setAwardAmount(parseBigDecimal(dto.awardAmount()));
        award.setUei(dto.uei());
        award.setHubzoneOwned(parseBoolean(dto.hubzoneOwned()));
        award.setSociallyEconomicallyDisadvantaged(parseBoolean(dto.sociallyEconomicallyDisadvantaged()));
        award.setWomenOwned(parseBoolean(dto.womenOwned()));
        award.setNumberEmployees(parseInteger(dto.numberEmployees()));
        award.setCompanyUrl(dto.companyUrl());
        award.setCity(dto.city());
        award.setState(dto.state());
        award.setZip(dto.zip());
        award.setPocName(dto.pocName());
        award.setPocEmail(dto.pocEmail());
        award.setPocPhone(dto.pocPhone());
        award.setPiName(dto.piName());
        award.setPiEmail(dto.piEmail());
        award.setResearchKeywords(dto.researchAreaKeywords());
        award.setAbstractText(dto.abstractText());
        award.setAwardLink(dto.awardLink());
        award.setIsSbir(dto.isSbir());
        award.setIsSttr(dto.isSttr());
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(dateStr);
            } catch (DateTimeParseException e2) {
                try {
                    // Handle ISO 8601 with timezone (e.g., "2026-01-22T12:00:00-05:00")
                    return java.time.OffsetDateTime.parse(dateStr).toLocalDate();
                } catch (DateTimeParseException e3) {
                    log.debug("Unable to parse date: {}", dateStr);
                    return null;
                }
            }
        }
    }

    private Integer parseInteger(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            String cleaned = value.replaceAll("[^0-9.-]", "");
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isBlank()) return null;
        return "Y".equalsIgnoreCase(value) || 
               "Yes".equalsIgnoreCase(value) || 
               "true".equalsIgnoreCase(value) ||
               "1".equals(value);
    }

    /**
     * Get summary statistics.
     */
    public SbirStats getStats() {
        long total = sbirAwardRepository.count();
        long sbir = sbirAwardRepository.findByIsSbirTrue().size();
        long sttr = sbirAwardRepository.findByIsSttrTrue().size();
        List<String> agencies = sbirAwardRepository.findDistinctAgencies();
        List<String> phases = sbirAwardRepository.findDistinctPhases();
        
        return new SbirStats(total, sbir, sttr, agencies, phases);
    }

    public record IngestionResult(int newRecords, int updatedRecords, long durationMs) {
        public String toMessage() {
            return String.format("SBIR.gov ingestion completed in %dms. New: %d, Updated: %d",
                    durationMs, newRecords, updatedRecords);
        }
    }

    public record SbirStats(
            long totalAwards,
            long sbirCount,
            long sttrCount,
            List<String> agencies,
            List<String> phases
    ) {}
}
