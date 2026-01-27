package com.samgov.ingestor.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheManager;

/**
 * Cache configuration for application performance.
 *
 * This configuration provides:
 * - A fallback ConcurrentMapCacheManager when Redis is not available
 * - Cache name constants used across the application
 * - TTL values for cache entries (used by RedisConfig when Redis is enabled)
 *
 * For production deployments with Redis, set spring.data.redis.host to enable
 * Redis-based caching via RedisConfig.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String OPPORTUNITIES_CACHE = "opportunities";
    public static final String CONTRACTS_CACHE = "contracts";
    public static final String USERS_CACHE = "users";
    public static final String TENANT_SETTINGS_CACHE = "tenantSettings";
    public static final String PERMISSIONS_CACHE = "permissions";
    public static final String SEARCH_RESULTS_CACHE = "searchResults";
    public static final String API_RESPONSES_CACHE = "apiResponses";

    /**
     * Fallback CacheManager using ConcurrentMapCache.
     * Only created when no RedisCacheManager is available (e.g., in tests or local dev without Redis).
     */
    @Bean
    @ConditionalOnMissingBean(RedisCacheManager.class)
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
            OPPORTUNITIES_CACHE,
            CONTRACTS_CACHE,
            USERS_CACHE,
            TENANT_SETTINGS_CACHE,
            PERMISSIONS_CACHE,
            SEARCH_RESULTS_CACHE,
            API_RESPONSES_CACHE
        );
        return cacheManager;
    }

    /**
     * Cache TTL values (in seconds) for Redis implementation.
     */
    public static class CacheTTL {
        public static final long OPPORTUNITIES_SECONDS = 300;     // 5 minutes
        public static final long CONTRACTS_SECONDS = 600;         // 10 minutes
        public static final long USERS_SECONDS = 300;             // 5 minutes
        public static final long TENANT_SETTINGS_SECONDS = 3600;  // 1 hour
        public static final long PERMISSIONS_SECONDS = 1800;      // 30 minutes
        public static final long SEARCH_RESULTS_SECONDS = 120;    // 2 minutes
        public static final long API_RESPONSES_SECONDS = 60;      // 1 minute

        private CacheTTL() {
            // Utility class
        }
    }
}
