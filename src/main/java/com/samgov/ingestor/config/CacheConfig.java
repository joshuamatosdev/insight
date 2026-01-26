package com.samgov.ingestor.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String OPPORTUNITIES_CACHE = "opportunities";
    public static final String NAICS_CODES_CACHE = "naicsCodes";
    public static final String AGENCIES_CACHE = "agencies";
    public static final String USER_CACHE = "users";
    public static final String TENANT_CACHE = "tenants";
    public static final String ROLES_CACHE = "roles";

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                OPPORTUNITIES_CACHE,
                NAICS_CODES_CACHE,
                AGENCIES_CACHE,
                USER_CACHE,
                TENANT_CACHE,
                ROLES_CACHE
        );
    }
}
