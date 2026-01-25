package com.samgov.ingestor.controller;

import com.samgov.ingestor.client.SamApiClient;
import com.samgov.ingestor.dto.SamOpportunityDto;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.service.IngestionService;
import com.samgov.ingestor.service.IngestionService.IngestionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for manual ingestion triggers and opportunity queries.
 */
@RestController
@RequestMapping("/api")
public class IngestController {

    private static final Logger log = LoggerFactory.getLogger(IngestController.class);

    private final IngestionService ingestionService;
    private final OpportunityRepository opportunityRepository;
    private final SamApiClient samApiClient;

    public IngestController(IngestionService ingestionService, 
                           OpportunityRepository opportunityRepository,
                           SamApiClient samApiClient) {
        this.ingestionService = ingestionService;
        this.opportunityRepository = opportunityRepository;
        this.samApiClient = samApiClient;
    }

    /**
     * Manually triggers the ingestion process.
     * POST /api/ingest
     *
     * @return Status message with ingestion results
     */
    @PostMapping("/ingest")
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

    /**
     * Returns all opportunities from the database.
     * GET /api/opportunities
     *
     * @return List of all Opportunity entities
     */
    @GetMapping("/opportunities")
    public ResponseEntity<List<Opportunity>> getAllOpportunities() {
        log.info("Fetching all opportunities");
        List<Opportunity> opportunities = opportunityRepository.findAll();
        log.info("Returning {} opportunities", opportunities.size());
        return ResponseEntity.ok(opportunities);
    }

    /**
     * Search SAM.gov directly for opportunities by type.
     * GET /api/search?ptype=r (Sources Sought)
     * GET /api/search?ptype=o (Original/Solicitation)
     * GET /api/search?ptype=k (Combined Synopsis/Solicitation)
     * GET /api/search?ptype=p (Presolicitation)
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
}
