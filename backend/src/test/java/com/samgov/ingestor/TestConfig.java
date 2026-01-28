package com.samgov.ingestor;

import org.springframework.boot.test.context.TestConfiguration;

/**
 * Test configuration for integration tests.
 *
 * Uses the dev PostgreSQL server at localhost:5433.
 * Database schema is managed via hibernate.ddl-auto=create-drop in test profile.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestConfig {
    // Configuration is in application-test.yaml
    // Uses dev PostgreSQL server directly (no Testcontainers)
}
