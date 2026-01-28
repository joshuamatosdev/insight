package com.samgov.ingestor.runner;

import com.samgov.ingestor.service.IngestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Runs ingestion automatically on application startup.
 * Fetches Sources Sought (ptype=r) opportunities for all configured NAICS codes.
 */
@Component
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
