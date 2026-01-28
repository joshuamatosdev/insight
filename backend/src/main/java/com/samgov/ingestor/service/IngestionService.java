package com.samgov.ingestor.service;

import com.samgov.ingestor.client.SamApiClient;
import com.samgov.ingestor.dto.SamOpportunityDto;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.repository.OpportunityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service responsible for orchestrating the ingestion of opportunities from SAM.gov.
 * Uses virtual threads for concurrent fetching across multiple NAICS codes.
 * NAICS codes are configured via application.yaml.
 */
@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final SamApiClient samApiClient;
    private final OpportunityRepository opportunityRepository;

    public IngestionService(SamApiClient samApiClient, OpportunityRepository opportunityRepository) {
        this.samApiClient = samApiClient;
        this.opportunityRepository = opportunityRepository;
    }

    /**
     * Runs the ingestion process for all configured NAICS codes.
     * Spawns a virtual thread for each NAICS code to fetch opportunities concurrently.
     * Scheduled to run daily at 8 AM.
     *
     * @return IngestionResult containing counts of new and updated records
     */
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public IngestionResult runIngestion() {
        List<String> naicsCodes = samApiClient.getConfiguredNaicsCodes();
        log.info("Starting ingestion for NAICS codes: {}", naicsCodes);
        long startTime = System.currentTimeMillis();

        AtomicInteger newCount = new AtomicInteger(0);
        AtomicInteger updatedCount = new AtomicInteger(0);

        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            // Spawn a virtual thread for each NAICS code
            List<CompletableFuture<List<SamOpportunityDto>>> futures = naicsCodes.stream()
                    .map(naicsCode -> CompletableFuture.supplyAsync(
                            () -> fetchForNaicsCode(naicsCode), executor))
                    .toList();

            // Wait for all fetches to complete and collect results
            List<SamOpportunityDto> allOpportunities = futures.stream()
                    .map(CompletableFuture::join)
                    .flatMap(List::stream)
                    .toList();

            log.info("Fetched {} total opportunities from SAM.gov", allOpportunities.size());

            // Process each opportunity with upsert logic
            for (SamOpportunityDto dto : allOpportunities) {
                try {
                    processOpportunity(dto, newCount, updatedCount);
                } catch (Exception e) {
                    log.error("Failed to process opportunity: {}", dto.solicitationNumber(), e);
                }
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Ingestion completed in {}ms. New: {}, Updated: {}", duration, newCount.get(), updatedCount.get());

        return new IngestionResult(newCount.get(), updatedCount.get(), duration);
    }

    /**
     * Fetches opportunities for a single NAICS code with error handling.
     */
    private List<SamOpportunityDto> fetchForNaicsCode(String naicsCode) {
        log.info("Fetching opportunities for NAICS code: {}", naicsCode);
        try {
            List<SamOpportunityDto> results = samApiClient.fetchOpportunities(naicsCode);
            log.info("Fetched {} opportunities for NAICS code: {}", results.size(), naicsCode);
            return results;
        } catch (Exception e) {
            log.error("Error fetching opportunities for NAICS code: {}", naicsCode, e);
            return List.of();
        }
    }

    /**
     * Processes a single opportunity DTO, performing upsert logic.
     * If solicitation number exists, updates the record; otherwise creates new.
     */
    private void processOpportunity(SamOpportunityDto dto, AtomicInteger newCount, AtomicInteger updatedCount) {
        if (dto.solicitationNumber() == null || dto.solicitationNumber().isBlank()) {
            log.warn("Skipping opportunity with null/blank solicitation number: {}", dto.noticeId());
            return;
        }

        Optional<Opportunity> existing = opportunityRepository.findBySolicitationNumber(dto.solicitationNumber());

        if (existing.isPresent()) {
            // Update existing record
            Opportunity opportunity = existing.get();
            updateOpportunityFromDto(opportunity, dto);
            opportunityRepository.save(opportunity);
            updatedCount.incrementAndGet();
            log.debug("Updated opportunity: {}", dto.solicitationNumber());
        } else {
            // Create new record
            Opportunity opportunity = convertDtoToEntity(dto);
            opportunityRepository.save(opportunity);
            newCount.incrementAndGet();
            log.debug("Created new opportunity: {}", dto.solicitationNumber());
        }
    }

    /**
     * Converts a DTO to a new Opportunity entity.
     */
    private Opportunity convertDtoToEntity(SamOpportunityDto dto) {
        Opportunity opportunity = new Opportunity();
        opportunity.setId(dto.noticeId());
        opportunity.setTitle(dto.title());
        opportunity.setSolicitationNumber(dto.solicitationNumber());
        opportunity.setPostedDate(parseDate(dto.postedDate()));
        opportunity.setResponseDeadLine(parseDate(dto.responseDeadLine()));
        opportunity.setNaicsCode(dto.naicsCode());
        opportunity.setType(dto.type());
        opportunity.setUrl(dto.uiLink());
        opportunity.setSource("SAM.gov");
        
        // Detect SBIR/STTR from title
        String title = dto.title() != null ? dto.title().toUpperCase() : "";
        opportunity.setIsSbir(title.contains("SBIR"));
        opportunity.setIsSttr(title.contains("STTR"));
        opportunity.setSbirPhase(detectSbirPhase(title));
        
        return opportunity;
    }
    
    /**
     * Detects SBIR/STTR phase from opportunity title.
     * Looks for patterns like "Phase I", "Phase II", "Phase III", "Phase 1", etc.
     */
    private String detectSbirPhase(String title) {
        if (title == null) return null;
        String upperTitle = title.toUpperCase();
        
        // Check for Phase III / Phase 3
        if (upperTitle.contains("PHASE III") || upperTitle.contains("PHASE 3")) {
            return "III";
        }
        // Check for Phase II / Phase 2
        if (upperTitle.contains("PHASE II") || upperTitle.contains("PHASE 2")) {
            return "II";
        }
        // Check for Phase I / Phase 1 (check after II/III to avoid false matches)
        if (upperTitle.contains("PHASE I") || upperTitle.contains("PHASE 1")) {
            // Make sure it's not Phase II or III
            if (!upperTitle.contains("PHASE II") && !upperTitle.contains("PHASE III")) {
                return "I";
            }
        }
        return null;
    }

    /**
     * Updates an existing Opportunity entity from a DTO.
     */
    private void updateOpportunityFromDto(Opportunity opportunity, SamOpportunityDto dto) {
        opportunity.setTitle(dto.title());
        opportunity.setPostedDate(parseDate(dto.postedDate()));
        opportunity.setResponseDeadLine(parseDate(dto.responseDeadLine()));
        opportunity.setNaicsCode(dto.naicsCode());
        opportunity.setType(dto.type());
        opportunity.setUrl(dto.uiLink());
        
        // Update SBIR/STTR flags
        String title = dto.title() != null ? dto.title().toUpperCase() : "";
        opportunity.setIsSbir(title.contains("SBIR"));
        opportunity.setIsSttr(title.contains("STTR"));
        opportunity.setSbirPhase(detectSbirPhase(title));
    }

    /**
     * Parses a date string to LocalDate, handling multiple formats including ISO 8601 with timezone.
     * Examples: "2024-01-15", "2024-01-15T10:00:00", "2024-01-15T10:00:00-05:00"
     */
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            // Try standard format: yyyy-MM-dd
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            try {
                // Try ISO format without timezone
                return LocalDate.parse(dateStr);
            } catch (DateTimeParseException e2) {
                try {
                    // Try ISO 8601 with timezone (e.g., "2026-01-22T12:00:00-05:00")
                    // Parse as OffsetDateTime, then extract date
                    return java.time.OffsetDateTime.parse(dateStr).toLocalDate();
                } catch (DateTimeParseException e3) {
                    log.warn("Unable to parse date: {}", dateStr);
                    return null;
                }
            }
        }
    }

    /**
     * Ingests Sources Sought (ptype=r) opportunities for all configured NAICS codes.
     * Called on application startup.
     *
     * @return Total count of saved opportunities
     */
    @Transactional
    public int ingestSourcesSought() {
        List<String> naicsCodes = samApiClient.getConfiguredNaicsCodes();
        log.info("Starting Sources Sought ingestion for {} NAICS codes", naicsCodes.size());
        long startTime = System.currentTimeMillis();

        AtomicInteger newCount = new AtomicInteger(0);
        AtomicInteger updatedCount = new AtomicInteger(0);

        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            // Spawn a virtual thread for each NAICS code - fetching Sources Sought only
            List<CompletableFuture<List<SamOpportunityDto>>> futures = naicsCodes.stream()
                    .map(naicsCode -> CompletableFuture.supplyAsync(
                            () -> samApiClient.fetchSourcesSought(naicsCode), executor))
                    .toList();

            // Wait for all fetches to complete and collect results
            List<SamOpportunityDto> allOpportunities = futures.stream()
                    .map(CompletableFuture::join)
                    .flatMap(List::stream)
                    .toList();

            log.info("Fetched {} Sources Sought opportunities from SAM.gov", allOpportunities.size());

            // Process each opportunity with upsert logic
            for (SamOpportunityDto dto : allOpportunities) {
                try {
                    processOpportunity(dto, newCount, updatedCount);
                } catch (Exception e) {
                    log.error("Failed to process opportunity: {}", dto.solicitationNumber(), e);
                }
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        int totalSaved = newCount.get() + updatedCount.get();
        log.info("Sources Sought ingestion completed in {}ms. New: {}, Updated: {}, Total: {}",
                duration, newCount.get(), updatedCount.get(), totalSaved);

        return totalSaved;
    }

    /**
     * Ingests SBIR/STTR opportunities by searching for keywords.
     * Called as part of the main ingestion or separately.
     *
     * @return IngestionResult with counts
     */
    @Transactional
    public IngestionResult ingestSbirSttr() {
        if (!samApiClient.isSbirEnabled()) {
            log.info("SBIR/STTR ingestion is disabled");
            return new IngestionResult(0, 0, 0);
        }

        log.info("Starting SBIR/STTR ingestion");
        long startTime = System.currentTimeMillis();

        AtomicInteger newCount = new AtomicInteger(0);
        AtomicInteger updatedCount = new AtomicInteger(0);

        try {
            List<SamOpportunityDto> sbirOpportunities = samApiClient.fetchAllSbirSttr();
            log.info("Fetched {} SBIR/STTR opportunities from SAM.gov", sbirOpportunities.size());

            for (SamOpportunityDto dto : sbirOpportunities) {
                try {
                    processOpportunity(dto, newCount, updatedCount);
                } catch (Exception e) {
                    log.error("Failed to process SBIR opportunity: {}", dto.solicitationNumber(), e);
                }
            }
        } catch (Exception e) {
            log.error("Error during SBIR/STTR ingestion", e);
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("SBIR/STTR ingestion completed in {}ms. New: {}, Updated: {}",
                duration, newCount.get(), updatedCount.get());

        return new IngestionResult(newCount.get(), updatedCount.get(), duration);
    }

    /**
     * Runs full ingestion including regular opportunities and SBIR/STTR.
     *
     * @return Combined IngestionResult
     */
    @Transactional
    public IngestionResult runFullIngestion() {
        log.info("Starting full ingestion (regular + SBIR/STTR)");
        long startTime = System.currentTimeMillis();

        // Run regular ingestion
        IngestionResult regularResult = runIngestion();

        // Run SBIR/STTR ingestion
        IngestionResult sbirResult = ingestSbirSttr();

        long totalDuration = System.currentTimeMillis() - startTime;
        int totalNew = regularResult.newRecords() + sbirResult.newRecords();
        int totalUpdated = regularResult.updatedRecords() + sbirResult.updatedRecords();

        log.info("Full ingestion completed in {}ms. Total New: {}, Total Updated: {}",
                totalDuration, totalNew, totalUpdated);

        return new IngestionResult(totalNew, totalUpdated, totalDuration);
    }

    /**
     * Record to hold ingestion results.
     */
    public record IngestionResult(int newRecords, int updatedRecords, long durationMs) {
        public String toMessage() {
            return String.format("Ingestion completed in %dms. New records: %d, Updated records: %d",
                    durationMs, newRecords, updatedRecords);
        }
    }
}
