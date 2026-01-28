package com.samgov.ingestor.controller;

import com.samgov.ingestor.client.SbirGovApiClient;
import com.samgov.ingestor.dto.SbirAwardDto;
import com.samgov.ingestor.model.SbirAward;
import com.samgov.ingestor.repository.SbirAwardRepository;
import com.samgov.ingestor.service.SbirIngestionService;
import com.samgov.ingestor.service.SbirIngestionService.IngestionResult;
import com.samgov.ingestor.service.SbirIngestionService.SbirStats;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;
import java.util.Map;

/**
 * REST controller for SBIR.gov data - awards, solicitations, and ingestion.
 */
@RestController
@RequestMapping("/sbir")
@PreAuthorize("isAuthenticated()")
public class SbirController {

    private static final Logger log = LoggerFactory.getLogger(SbirController.class);

    private final SbirIngestionService sbirIngestionService;
    private final SbirAwardRepository sbirAwardRepository;
    private final SbirGovApiClient sbirApiClient;

    public SbirController(SbirIngestionService sbirIngestionService,
                          SbirAwardRepository sbirAwardRepository,
                          SbirGovApiClient sbirApiClient) {
        this.sbirIngestionService = sbirIngestionService;
        this.sbirAwardRepository = sbirAwardRepository;
        this.sbirApiClient = sbirApiClient;
    }

    // ==================== Ingestion Endpoints ====================

    /**
     * Trigger ingestion of recent SBIR.gov awards.
     * POST /sbir/ingest
     */
    @PostMapping("/ingest")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> ingestAwards() {
        log.info("SBIR.gov ingestion triggered via API");

        try {
            IngestionResult result = sbirIngestionService.ingestRecentAwards();

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "source", "SBIR.gov",
                    "message", result.toMessage(),
                    "newRecords", result.newRecords(),
                    "updatedRecords", result.updatedRecords(),
                    "durationMs", result.durationMs()
            ));
        } catch (Exception e) {
            log.error("SBIR.gov ingestion failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "SBIR.gov ingestion failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Trigger ingestion for a specific agency and year.
     * POST /sbir/ingest/{agency}?year=2024
     */
    @PostMapping("/ingest/{agency}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> ingestByAgency(
            @PathVariable String agency,
            @RequestParam(required = false) Integer year) {
        
        int targetYear = year != null ? year : Year.now().getValue();
        log.info("SBIR.gov ingestion for {} ({}) triggered", agency, targetYear);

        try {
            IngestionResult result = sbirIngestionService.ingestByAgencyAndYear(agency, targetYear);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "agency", agency,
                    "year", targetYear,
                    "message", result.toMessage(),
                    "newRecords", result.newRecords(),
                    "updatedRecords", result.updatedRecords(),
                    "durationMs", result.durationMs()
            ));
        } catch (Exception e) {
            log.error("SBIR.gov ingestion failed for {}/{}", agency, targetYear, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // ==================== Query Endpoints ====================

    /**
     * Get all SBIR awards from database.
     * GET /sbir/awards
     */
    @GetMapping("/awards")
    public ResponseEntity<List<SbirAward>> getAllAwards(
            @RequestParam(required = false) String agency,
            @RequestParam(required = false) String phase,
            @RequestParam(required = false) Integer year) {
        
        List<SbirAward> awards;

        if (agency != null && !agency.isBlank()) {
            awards = sbirAwardRepository.findByAgency(agency.toUpperCase());
        } else if (phase != null && !phase.isBlank()) {
            awards = sbirAwardRepository.findByPhase(phase.toUpperCase());
        } else if (year != null) {
            awards = sbirAwardRepository.findByAwardYear(year);
        } else {
            awards = sbirAwardRepository.findAll();
        }

        log.info("Returning {} SBIR awards", awards.size());
        return ResponseEntity.ok(awards);
    }

    /**
     * Get recent SBIR awards (last 2 years).
     * GET /sbir/awards/recent
     */
    @GetMapping("/awards/recent")
    public ResponseEntity<List<SbirAward>> getRecentAwards() {
        int startYear = Year.now().getValue() - 1;
        List<SbirAward> awards = sbirAwardRepository.findRecentAwards(startYear);
        log.info("Returning {} recent SBIR awards", awards.size());
        return ResponseEntity.ok(awards);
    }

    /**
     * Search SBIR awards by keyword.
     * GET /sbir/awards/search?q=cybersecurity
     */
    @GetMapping("/awards/search")
    public ResponseEntity<List<SbirAward>> searchAwards(@RequestParam String q) {
        log.info("Searching SBIR awards for: {}", q);
        List<SbirAward> awards = sbirAwardRepository.searchByKeyword(q);
        log.info("Found {} awards matching '{}'", awards.size(), q);
        return ResponseEntity.ok(awards);
    }

    /**
     * Get SBIR statistics.
     * GET /sbir/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<SbirStats> getStats() {
        return ResponseEntity.ok(sbirIngestionService.getStats());
    }

    /**
     * Get list of agencies with award counts.
     * GET /sbir/agencies
     */
    @GetMapping("/agencies")
    public ResponseEntity<Map<String, Long>> getAgencies() {
        List<String> agencies = sbirAwardRepository.findDistinctAgencies();
        Map<String, Long> agencyCounts = agencies.stream()
                .collect(java.util.stream.Collectors.toMap(
                        a -> a,
                        a -> sbirAwardRepository.countByAgency(a)
                ));
        return ResponseEntity.ok(agencyCounts);
    }

    // ==================== Live Search Endpoints ====================

    /**
     * Search SBIR.gov API directly (live, not from database).
     * GET /sbir/search/live?agency=DOD&year=2024
     */
    @GetMapping("/search/live")
    public ResponseEntity<Map<String, Object>> searchLive(
            @RequestParam(required = false) String agency,
            @RequestParam(required = false) Integer year) {
        
        log.info("Live SBIR.gov search - agency: {}, year: {}", agency, year);
        long startTime = System.currentTimeMillis();

        try {
            List<SbirAwardDto> results = sbirApiClient.fetchAwards(agency, year);
            long duration = System.currentTimeMillis() - startTime;

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "source", "SBIR.gov (live)",
                    "count", results.size(),
                    "durationMs", duration,
                    "awards", results
            ));
        } catch (Exception e) {
            log.error("Live SBIR.gov search failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Search SBIR.gov by company name (live).
     * GET /sbir/search/firm?name=acme
     */
    @GetMapping("/search/firm")
    public ResponseEntity<Map<String, Object>> searchByFirm(@RequestParam String name) {
        log.info("Searching SBIR.gov for firm: {}", name);
        long startTime = System.currentTimeMillis();

        try {
            List<SbirAwardDto> results = sbirApiClient.searchByFirm(name);
            long duration = System.currentTimeMillis() - startTime;

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "firm", name,
                    "count", results.size(),
                    "durationMs", duration,
                    "awards", results
            ));
        } catch (Exception e) {
            log.error("Firm search failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get configured agencies.
     * GET /sbir/config/agencies
     */
    @GetMapping("/config/agencies")
    public ResponseEntity<List<String>> getConfiguredAgencies() {
        return ResponseEntity.ok(sbirApiClient.getConfiguredAgencies());
    }
}
