package com.samgov.ingestor.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Cache configuration for application performance.
 * In production, replace ConcurrentMapCacheManager with Redis.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String OPPORTUNITIES_CACHE = "opportunities";
    public static final String CONTRACTS_CACHE = "contracts";
    public static final String USERS_CACHE = "users";
    public static final String TENANT_SETTINGS_CACHE = "tenantSettings";
    public static final String PERMISSIONS_CACHE = "permissions";

    @Bean
    @Primary
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
            OPPORTUNITIES_CACHE,
            CONTRACTS_CACHE,
            USERS_CACHE,
            TENANT_SETTINGS_CACHE,
            PERMISSIONS_CACHE
        );
        return cacheManager;
    }

    /**
     * Cache TTL values (for Redis implementation)
     */
    public static class CacheTTL {
        public static final long OPPORTUNITIES_SECONDS = 300;  // 5 minutes
        public static final long CONTRACTS_SECONDS = 600;      // 10 minutes
        public static final long USERS_SECONDS = 300;          // 5 minutes
        public static final long TENANT_SETTINGS_SECONDS = 3600; // 1 hour
        public static final long PERMISSIONS_SECONDS = 1800;   // 30 minutes
    }
}
