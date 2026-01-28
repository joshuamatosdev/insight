package com.samgov.ingestor.runner;

import com.samgov.ingestor.service.IngestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Runs ingestion automatically on application startup.
 * Fetches Sources Sought (ptype=r) opportunities for all configured NAICS codes.
 *
 * DISABLED BY DEFAULT to minimize API calls.
 * Set app.startup-ingestion.enabled=true to enable.
 */
@Component
@ConditionalOnProperty(name = "app.startup-ingestion.enabled", havingValue = "true", matchIfMissing = false)
public class StartupIngestionRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupIngestionRunner.class);

    private final IngestionService ingestionService;

    public StartupIngestionRunner(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("=== Starting automatic Sources Sought ingestion on boot ===");
        
        try {
            int savedCount = ingestionService.ingestSourcesSought();
            log.info("=== Startup ingestion complete: {} opportunities saved ===", savedCount);
        } catch (Exception e) {
            log.error("=== Startup ingestion failed: {} ===", e.getMessage(), e);
        }
    }
}
