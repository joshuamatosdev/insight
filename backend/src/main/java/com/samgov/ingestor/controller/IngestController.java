package com.samgov.ingestor.controller;

import com.samgov.ingestor.client.SamApiClient;
import com.samgov.ingestor.dto.SamOpportunityDto;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.service.GeocodingService;
import com.samgov.ingestor.service.IngestionService;
import com.samgov.ingestor.service.IngestionService.IngestionResult;
import com.samgov.ingestor.service.UsaSpendingIngestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for manual ingestion triggers and opportunity queries.
 */
@RestController
@RequestMapping("/api/v1")
@PreAuthorize("isAuthenticated()")
public class IngestController {

    private static final Logger log = LoggerFactory.getLogger(IngestController.class);

    private final IngestionService ingestionService;
    private final OpportunityRepository opportunityRepository;
    private final SamApiClient samApiClient;
    private final UsaSpendingIngestionService usaSpendingIngestionService;
    private final GeocodingService geocodingService;

    public IngestController(IngestionService ingestionService,
                           OpportunityRepository opportunityRepository,
                           SamApiClient samApiClient,
                           UsaSpendingIngestionService usaSpendingIngestionService,
                           GeocodingService geocodingService) {
        this.ingestionService = ingestionService;
        this.opportunityRepository = opportunityRepository;
        this.samApiClient = samApiClient;
        this.usaSpendingIngestionService = usaSpendingIngestionService;
        this.geocodingService = geocodingService;
    }

    /**
     * Manually triggers the ingestion process.
     * POST /ingest
     *
     * @return Status message with ingestion results
     */
    @PostMapping("/ingest")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerIngestion() {
        log.info("Manual ingestion triggered via API");

        try {
            IngestionResult result = ingestionService.runIngestion();

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", result.toMessage(),
                    "newRecords", result.newRecords(),
                    "updatedRecords", result.updatedRecords(),
                    "durationMs", result.durationMs()
            ));
        } catch (Exception e) {
            log.error("Ingestion failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "Ingestion failed: " + e.getMessage()
            ));
        }
    }

    // REMOVED: Duplicate endpoint - use OpportunityController#searchOpportunities instead
    // OpportunityController provides proper pagination, filtering, and search

    /**
     * Search SAM.gov directly for opportunities by type.
     * GET /search?ptype=r (Sources Sought)
     * GET /search?ptype=o (Original/Solicitation)
     * GET /search?ptype=k (Combined Synopsis/Solicitation)
     * GET /search?ptype=p (Presolicitation)
     *
     * @param ptype Procurement type filter
     * @param naics Optional specific NAICS code (searches all configured if omitted)
     * @return Live results from SAM.gov API
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchOpportunities(
            @RequestParam(defaultValue = "r") String ptype,
            @RequestParam(required = false) String naics) {
        
        String ptypeLabel = switch (ptype.toLowerCase()) {
            case "r" -> "Sources Sought";
            case "o" -> "Solicitation (Original)";
            case "k" -> "Combined Synopsis/Solicitation";
            case "p" -> "Presolicitation";
            default -> "Unknown (" + ptype + ")";
        };
        
        log.info("Searching SAM.gov for {} opportunities", ptypeLabel);
        long startTime = System.currentTimeMillis();

        try {
            List<SamOpportunityDto> results;
            
            if (naics != null && !naics.isBlank()) {
                results = samApiClient.fetchOpportunitiesWithParams(naics, ptype, 100);
            } else {
                results = samApiClient.searchAllNaics(ptype);
            }

            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Search completed: {} {} opportunities found in {}ms", 
                    results.size(), ptypeLabel, duration);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "type", ptypeLabel,
                    "ptype", ptype,
                    "count", results.size(),
                    "durationMs", duration,
                    "opportunities", results
            ));

        } catch (Exception e) {
            log.error("Search failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "Search failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Shortcut endpoint for Sources Sought opportunities.
     * GET /api/sources-sought
     */
    @GetMapping("/sources-sought")
    public ResponseEntity<Map<String, Object>> searchSourcesSought() {
        return searchOpportunities("r", null);
    }

    /**
     * Triggers SBIR/STTR-only ingestion.
     * POST /api/ingest/sbir
     *
     * @return Status message with SBIR ingestion results
     */
    @PostMapping("/ingest/sbir")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerSbirIngestion() {
        log.info("SBIR/STTR ingestion triggered via API");

        try {
            IngestionResult result = ingestionService.ingestSbirSttr();

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "type", "SBIR/STTR",
                    "message", result.toMessage(),
                    "newRecords", result.newRecords(),
                    "updatedRecords", result.updatedRecords(),
                    "durationMs", result.durationMs()
            ));
        } catch (Exception e) {
            log.error("SBIR/STTR ingestion failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "SBIR/STTR ingestion failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Triggers full ingestion (regular + SBIR/STTR).
     * POST /ingest/full
     *
     * @return Status message with full ingestion results
     */
    @PostMapping("/ingest/full")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerFullIngestion() {
        log.info("Full ingestion (regular + SBIR/STTR) triggered via API");

        try {
            IngestionResult result = ingestionService.runFullIngestion();

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "type", "Full (Regular + SBIR/STTR)",
                    "message", result.toMessage(),
                    "newRecords", result.newRecords(),
                    "updatedRecords", result.updatedRecords(),
                    "durationMs", result.durationMs()
            ));
        } catch (Exception e) {
            log.error("Full ingestion failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "Full ingestion failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Returns SBIR/STTR opportunities from the database.
     * GET /api/opportunities/sbir
     *
     * @param phase Optional phase filter (I, II, III)
     * @return List of SBIR opportunities
     */
    @GetMapping("/opportunities/sbir")
    public ResponseEntity<List<Opportunity>> getSbirOpportunities(
            @RequestParam(required = false) String phase) {
        log.info("Fetching SBIR opportunities, phase filter: {}", phase);
        
        List<Opportunity> opportunities;
        if (phase != null && !phase.isBlank()) {
            opportunities = opportunityRepository.findSbirSttrByPhase(phase.toUpperCase());
        } else {
            opportunities = opportunityRepository.findAllSbirSttr();
        }
        
        log.info("Returning {} SBIR/STTR opportunities", opportunities.size());
        return ResponseEntity.ok(opportunities);
    }

    /**
     * Search SAM.gov directly for SBIR/STTR opportunities.
     * GET /api/search/sbir
     *
     * @return Live SBIR/STTR results from SAM.gov API
     */
    @GetMapping("/search/sbir")
    public ResponseEntity<Map<String, Object>> searchSbirOpportunities() {
        log.info("Searching SAM.gov for SBIR/STTR opportunities");
        long startTime = System.currentTimeMillis();

        try {
            List<SamOpportunityDto> results = samApiClient.fetchAllSbirSttr();
            long duration = System.currentTimeMillis() - startTime;

            log.info("SBIR/STTR search completed: {} opportunities found in {}ms",
                    results.size(), duration);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "type", "SBIR/STTR",
                    "count", results.size(),
                    "durationMs", duration,
                    "opportunities", results
            ));

        } catch (Exception e) {
            log.error("SBIR/STTR search failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "SBIR/STTR search failed: " + e.getMessage()
            ));
        }
    }

    // ============================================
    // USAspending.gov ENDPOINTS
    // ============================================

    /**
     * Triggers USAspending.gov data ingestion.
     * POST /api/ingest/usa-spending
     *
     * @return Status message with ingestion results
     */
    @PostMapping("/ingest/usa-spending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerUsaSpendingIngestion() {
        log.info("USAspending.gov ingestion triggered via API");

        try {
            var result = usaSpendingIngestionService.ingestRecentAwards();

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "type", "USAspending.gov",
                    "message", result.toMessage(),
                    "newRecords", result.newRecords(),
                    "updatedRecords", result.updatedRecords(),
                    "skippedRecords", result.skippedRecords(),
                    "durationMs", result.durationMs()
            ));
        } catch (Exception e) {
            log.error("USAspending.gov ingestion failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "USAspending.gov ingestion failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Triggers USAspending.gov ingestion for a specific NAICS code.
     * POST /api/ingest/usa-spending/naics/{naicsCode}
     *
     * @param naicsCode NAICS code to filter by
     * @return Status message with ingestion results
     */
    @PostMapping("/ingest/usa-spending/naics/{naicsCode}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerUsaSpendingByNaics(
            @PathVariable String naicsCode) {
        log.info("USAspending.gov ingestion for NAICS {} triggered via API", naicsCode);

        try {
            var result = usaSpendingIngestionService.ingestByNaics(naicsCode);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "type", "USAspending.gov",
                    "naicsCode", naicsCode,
                    "message", result.toMessage(),
                    "newRecords", result.newRecords(),
                    "updatedRecords", result.updatedRecords(),
                    "durationMs", result.durationMs()
            ));
        } catch (Exception e) {
            log.error("USAspending.gov ingestion for NAICS {} failed", naicsCode, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "USAspending.gov ingestion failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Get USAspending integration statistics.
     * GET /api/ingest/usa-spending/stats
     */
    @GetMapping("/ingest/usa-spending/stats")
    public ResponseEntity<Map<String, Object>> getUsaSpendingStats() {
        var stats = usaSpendingIngestionService.getStats();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "totalAwards", stats.totalAwards(),
                "integrationEnabled", stats.integrationEnabled()
        ));
    }

    // ============================================
    // GEOCODING ENDPOINTS
    // ============================================

    /**
     * Triggers batch geocoding of opportunities.
     * POST /api/ingest/geocode
     *
     * @param limit Maximum number of opportunities to geocode (default 100)
     * @return Status message with geocoding results
     */
    @PostMapping("/ingest/geocode")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerGeocoding(
            @RequestParam(defaultValue = "100") int limit) {
        log.info("Geocoding triggered via API, limit: {}", limit);

        try {
            int geocoded = geocodingService.batchGeocodeOpportunities(limit);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "type", "Geocoding",
                    "message", String.format("Geocoded %d opportunities", geocoded),
                    "geocodedCount", geocoded,
                    "requestedLimit", limit
            ));
        } catch (Exception e) {
            log.error("Geocoding failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "Geocoding failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Get geocoding statistics.
     * GET /api/ingest/geocode/stats
     */
    @GetMapping("/ingest/geocode/stats")
    public ResponseEntity<Map<String, Object>> getGeocodingStats() {
        var stats = geocodingService.getStats();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "totalOpportunities", stats.totalOpportunities(),
                "geocodedCount", stats.geocodedCount(),
                "needsGeocodingCount", stats.needsGeocodingCount(),
                "geocodedPercentage", String.format("%.1f%%", stats.geocodedPercentage())
        ));
    }

    /**
     * Get geocoded opportunities for map display.
     * GET /api/opportunities/geocoded
     */
    @GetMapping("/opportunities/geocoded")
    public ResponseEntity<List<Opportunity>> getGeocodedOpportunities() {
        log.info("Fetching geocoded opportunities for map");
        List<Opportunity> opportunities = opportunityRepository.findAllGeocoded();
        log.info("Returning {} geocoded opportunities", opportunities.size());
        return ResponseEntity.ok(opportunities);
    }

    /**
     * Get opportunity counts by state (FIPS code).
     * GET /api/opportunities/by-state
     */
    @GetMapping("/opportunities/by-state")
    public ResponseEntity<Map<String, Object>> getOpportunitiesByState() {
        log.info("Fetching opportunity counts by state");
        List<Object[]> counts = opportunityRepository.countByFipsState();

        // Convert to map for easier frontend consumption
        var stateCounts = counts.stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "stateCount", stateCounts.size(),
                "data", stateCounts
        ));
    }
}
