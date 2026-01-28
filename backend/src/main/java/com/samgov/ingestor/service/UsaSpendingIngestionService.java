package com.samgov.ingestor.service;

import com.samgov.ingestor.client.UsaSpendingApiClient;
import com.samgov.ingestor.config.UsaSpendingProperties;
import com.samgov.ingestor.dto.UsaSpendingAwardDto;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.DataSource;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.model.Opportunity.ContractLevel;
import com.samgov.ingestor.repository.OpportunityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for ingesting federal spending/award data from USAspending.gov.
 * Maps USAspending awards to Opportunity entities for unified querying.
 */
@Service
public class UsaSpendingIngestionService {

    private static final Logger log = LoggerFactory.getLogger(UsaSpendingIngestionService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final UsaSpendingApiClient usaSpendingClient;
    private final OpportunityRepository opportunityRepository;
    private final UsaSpendingProperties properties;

    public UsaSpendingIngestionService(
            UsaSpendingApiClient usaSpendingClient,
            OpportunityRepository opportunityRepository,
            UsaSpendingProperties properties) {
        this.usaSpendingClient = usaSpendingClient;
        this.opportunityRepository = opportunityRepository;
        this.properties = properties;
    }

    /**
     * Ingest recent awards from USAspending.gov.
     * Uses configured NAICS codes and agencies as filters.
     *
     * @return IngestionResult with counts
     */
    @Transactional
    public IngestionResult ingestRecentAwards() {
        if (!usaSpendingClient.isEnabled()) {
            log.info("USAspending integration is disabled");
            return new IngestionResult(0, 0, 0, 0);
        }

        log.info("Starting USAspending.gov ingestion");
        long startTime = System.currentTimeMillis();

        AtomicInteger newCount = new AtomicInteger(0);
        AtomicInteger updatedCount = new AtomicInteger(0);
        AtomicInteger skippedCount = new AtomicInteger(0);

        try {
            List<String> naicsCodes = properties.getNaicsCodes();
            List<String> agencies = properties.getAgencies();

            if (naicsCodes.isEmpty() && agencies.isEmpty()) {
                // No filters - fetch all recent awards
                ingestAwards(null, null, newCount, updatedCount, skippedCount);
            } else if (!naicsCodes.isEmpty()) {
                // Fetch by NAICS codes
                for (String naicsCode : naicsCodes) {
                    ingestAwards(naicsCode, null, newCount, updatedCount, skippedCount);
                }
            } else {
                // Fetch by agencies
                for (String agency : agencies) {
                    ingestAwards(null, agency, newCount, updatedCount, skippedCount);
                }
            }
        } catch (Exception e) {
            log.error("Error during USAspending ingestion", e);
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("USAspending ingestion completed in {}ms. New: {}, Updated: {}, Skipped: {}",
                duration, newCount.get(), updatedCount.get(), skippedCount.get());

        return new IngestionResult(newCount.get(), updatedCount.get(), skippedCount.get(), duration);
    }

    /**
     * Ingest awards by NAICS code.
     */
    @Transactional
    public IngestionResult ingestByNaics(String naicsCode) {
        if (!usaSpendingClient.isEnabled()) {
            return new IngestionResult(0, 0, 0, 0);
        }

        log.info("Ingesting USAspending awards for NAICS: {}", naicsCode);
        long startTime = System.currentTimeMillis();

        AtomicInteger newCount = new AtomicInteger(0);
        AtomicInteger updatedCount = new AtomicInteger(0);
        AtomicInteger skippedCount = new AtomicInteger(0);

        ingestAwards(naicsCode, null, newCount, updatedCount, skippedCount);

        long duration = System.currentTimeMillis() - startTime;
        return new IngestionResult(newCount.get(), updatedCount.get(), skippedCount.get(), duration);
    }

    /**
     * Ingest awards by agency.
     */
    @Transactional
    public IngestionResult ingestByAgency(String agency) {
        if (!usaSpendingClient.isEnabled()) {
            return new IngestionResult(0, 0, 0, 0);
        }

        log.info("Ingesting USAspending awards for agency: {}", agency);
        long startTime = System.currentTimeMillis();

        AtomicInteger newCount = new AtomicInteger(0);
        AtomicInteger updatedCount = new AtomicInteger(0);
        AtomicInteger skippedCount = new AtomicInteger(0);

        ingestAwards(null, agency, newCount, updatedCount, skippedCount);

        long duration = System.currentTimeMillis() - startTime;
        return new IngestionResult(newCount.get(), updatedCount.get(), skippedCount.get(), duration);
    }

    /**
     * Fetch and process awards with optional filters.
     */
    private void ingestAwards(String naicsCode, String agency,
                              AtomicInteger newCount, AtomicInteger updatedCount, AtomicInteger skippedCount) {
        try {
            List<UsaSpendingAwardDto> awards = usaSpendingClient.fetchAllAwards(naicsCode, agency);
            log.info("Fetched {} awards from USAspending (NAICS: {}, Agency: {})",
                    awards.size(), naicsCode, agency);

            for (UsaSpendingAwardDto dto : awards) {
                try {
                    processAward(dto, newCount, updatedCount, skippedCount);
                } catch (Exception e) {
                    log.error("Failed to process USAspending award: {}", dto.awardId(), e);
                    skippedCount.incrementAndGet();
                }
            }
        } catch (Exception e) {
            log.error("Error fetching awards (NAICS: {}, Agency: {})", naicsCode, agency, e);
        }
    }

    /**
     * Process a single award DTO - insert or update as Opportunity.
     */
    private void processAward(UsaSpendingAwardDto dto,
                              AtomicInteger newCount, AtomicInteger updatedCount, AtomicInteger skippedCount) {
        if (dto.awardId() == null || dto.awardId().isBlank()) {
            log.debug("Skipping award with null ID");
            skippedCount.incrementAndGet();
            return;
        }

        // Use award ID as solicitation number for USAspending records
        String solicitationNumber = "USASPEND-" + dto.awardId().replaceAll("[^a-zA-Z0-9-]", "");

        Optional<Opportunity> existing = opportunityRepository.findBySolicitationNumber(solicitationNumber);

        if (existing.isPresent()) {
            Opportunity opp = existing.get();
            updateOpportunityFromDto(opp, dto);
            opportunityRepository.save(opp);
            updatedCount.incrementAndGet();
            log.debug("Updated USAspending opportunity: {}", solicitationNumber);
        } else {
            Opportunity opp = createOpportunityFromDto(dto, solicitationNumber);
            opportunityRepository.save(opp);
            newCount.incrementAndGet();
            log.debug("Created new USAspending opportunity: {}", solicitationNumber);
        }
    }

    /**
     * Create new Opportunity entity from USAspending DTO.
     */
    private Opportunity createOpportunityFromDto(UsaSpendingAwardDto dto, String solicitationNumber) {
        Opportunity opp = Opportunity.builder()
                .id(UUID.randomUUID().toString())
                .solicitationNumber(solicitationNumber)
                .dataSource(DataSource.USA_SPENDING)
                .contractLevel(determineContractLevel(dto.awardingAgency()))
                .status(determineStatus(dto.endDate()))
                .build();

        updateOpportunityFromDto(opp, dto);
        return opp;
    }

    /**
     * Update Opportunity fields from USAspending DTO.
     */
    private void updateOpportunityFromDto(Opportunity opp, UsaSpendingAwardDto dto) {
        // Title and description
        String title = buildTitle(dto);
        opp.setTitle(title);
        opp.setDescription(dto.description());

        // Dates
        opp.setPostedDate(parseDate(dto.startDate()));
        opp.setResponseDeadLine(parseDate(dto.endDate()));

        // Award amount (already BigDecimal from DTO)
        BigDecimal amount = dto.awardAmount();
        opp.setAwardAmount(amount);
        if (amount != null) {
            opp.setEstimatedValueLow(amount);
            opp.setEstimatedValueHigh(amount);
        }

        // Agency info
        opp.setAgency(dto.awardingAgency());
        opp.setSubAgency(dto.awardingSubAgency());

        // Contractor/Recipient info
        opp.setIncumbentContractor(dto.recipientName());

        // Contract info
        opp.setContractType(dto.contractAwardType());
        opp.setContractNumber(dto.awardId());

        // NAICS/PSC codes
        opp.setNaicsCode(dto.naicsCode());
        opp.setNaicsDescription(dto.naicsDescription());
        opp.setPscCode(dto.pscCode());

        // Place of performance
        opp.setPlaceOfPerformanceCity(dto.popCity());
        opp.setPlaceOfPerformanceState(dto.popState());
        opp.setPlaceOfPerformanceZip(dto.popZip());
        opp.setPlaceOfPerformanceCountry(dto.popCountry() != null ? dto.popCountry() : "USA");

        // Source info
        opp.setSource("USAspending.gov");
        String internalId = dto.internalId();
        if (internalId != null && !internalId.isBlank()) {
            opp.setUrl("https://www.usaspending.gov/award/" + internalId);
        }

        // DoD detection
        String agency = dto.awardingAgency();
        if (agency != null && (agency.toLowerCase().contains("defense") ||
            agency.toLowerCase().contains("dod") ||
            agency.toLowerCase().contains("army") ||
            agency.toLowerCase().contains("navy") ||
            agency.toLowerCase().contains("air force"))) {
            opp.setIsDod(true);
            opp.setContractLevel(ContractLevel.DOD);
        }

        // Update status based on end date
        opp.setStatus(determineStatus(dto.endDate()));
    }

    /**
     * Build a descriptive title for the opportunity.
     */
    private String buildTitle(UsaSpendingAwardDto dto) {
        StringBuilder title = new StringBuilder();

        if (dto.recipientName() != null && !dto.recipientName().isBlank()) {
            title.append(dto.recipientName());
        }

        if (dto.awardingAgency() != null && !dto.awardingAgency().isBlank()) {
            if (title.length() > 0) {
                title.append(" - ");
            }
            title.append(dto.awardingAgency());
        }

        if (dto.contractAwardType() != null && !dto.contractAwardType().isBlank()) {
            if (title.length() > 0) {
                title.append(" (");
                title.append(dto.contractAwardType());
                title.append(")");
            }
        }

        if (title.length() == 0) {
            title.append("USAspending Award: ").append(dto.awardId());
        }

        // Truncate if too long
        String result = title.toString();
        return result.length() > 500 ? result.substring(0, 497) + "..." : result;
    }

    /**
     * Determine contract level based on agency name.
     */
    private ContractLevel determineContractLevel(String agency) {
        if (agency == null) {
            return ContractLevel.FEDERAL;
        }

        String agencyLower = agency.toLowerCase();
        if (agencyLower.contains("defense") || agencyLower.contains("dod") ||
            agencyLower.contains("army") || agencyLower.contains("navy") ||
            agencyLower.contains("air force") || agencyLower.contains("marine")) {
            return ContractLevel.DOD;
        }

        return ContractLevel.FEDERAL;
    }

    /**
     * Determine opportunity status based on end date.
     */
    private OpportunityStatus determineStatus(String endDateStr) {
        LocalDate endDate = parseDate(endDateStr);
        if (endDate == null) {
            return OpportunityStatus.AWARDED;
        }

        if (endDate.isBefore(LocalDate.now())) {
            return OpportunityStatus.CLOSED;
        }

        return OpportunityStatus.AWARDED;
    }

    /**
     * Parse date string to LocalDate, handling ISO 8601 with timezone.
     */
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
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

    /**
     * Parse string to BigDecimal (handles currency formatting).
     */
    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            String cleaned = value.replaceAll("[^0-9.-]", "");
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            log.debug("Unable to parse amount: {}", value);
            return null;
        }
    }

    /**
     * Get USAspending data statistics.
     */
    public UsaSpendingStats getStats() {
        long total = opportunityRepository.findByDataSource(
                DataSource.USA_SPENDING,
                org.springframework.data.domain.PageRequest.of(0, 1)
        ).getTotalElements();

        return new UsaSpendingStats(total, usaSpendingClient.isEnabled());
    }

    /**
     * Ingestion result record.
     */
    public record IngestionResult(int newRecords, int updatedRecords, int skippedRecords, long durationMs) {
        public String toMessage() {
            return String.format("USAspending ingestion completed in %dms. New: %d, Updated: %d, Skipped: %d",
                    durationMs, newRecords, updatedRecords, skippedRecords);
        }
    }

    /**
     * Statistics record.
     */
    public record UsaSpendingStats(long totalAwards, boolean integrationEnabled) {}
}
