package com.samgov.ingestor.service;

import com.samgov.ingestor.config.CacheConfig;
import com.samgov.ingestor.dto.OpportunityDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing application caching with multi-tenant isolation.
 * All cache keys include tenant ID prefix to ensure data isolation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {

    private static final String CACHE_KEY_SEPARATOR = ":";
    private static final String TENANT_PREFIX = "tenant";
    private static final String OPPORTUNITY_TYPE = "opportunity";
    private static final String SEARCH_TYPE = "search";
    private static final String SESSION_TYPE = "session";
    private static final String API_RESPONSE_TYPE = "api";

    private final CacheManager cacheManager;

    // ============================================
    // CACHE KEY GENERATION
    // ============================================

    /**
     * Generate a tenant-isolated cache key.
     *
     * @param tenantId the tenant ID
     * @param entityType the type of entity (opportunity, search, session, etc.)
     * @param entityId the entity identifier
     * @return the generated cache key
     */
    public String generateCacheKey(UUID tenantId, String entityType, String entityId) {
        return String.join(CACHE_KEY_SEPARATOR, TENANT_PREFIX, tenantId.toString(), entityType, entityId);
    }

    /**
     * Generate a cache key for search results.
     *
     * @param tenantId the tenant ID
     * @param queryHash hash of the search query parameters
     * @return the generated cache key
     */
    public String generateSearchCacheKey(UUID tenantId, String queryHash) {
        return generateCacheKey(tenantId, SEARCH_TYPE, queryHash);
    }

    /**
     * Generate a consistent hash for a query string.
     *
     * @param queryString the query string to hash
     * @return the hash string
     */
    public String generateQueryHash(String queryString) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(queryString.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available", e);
            // Fallback to simple hash code
            return String.valueOf(queryString.hashCode());
        }
    }

    // ============================================
    // OPPORTUNITY CACHING
    // ============================================

    /**
     * Cache an opportunity DTO.
     *
     * @param tenantId the tenant ID
     * @param opportunity the opportunity to cache
     */
    public void cacheOpportunity(UUID tenantId, OpportunityDto opportunity) {
        if (opportunity == null || opportunity.id() == null) {
            log.warn("Cannot cache null opportunity or opportunity without ID");
            return;
        }
        String cacheKey = generateCacheKey(tenantId, OPPORTUNITY_TYPE, opportunity.id());
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            cache.put(cacheKey, opportunity);
            log.debug("Cached opportunity {} for tenant {}", opportunity.id(), tenantId);
        }
    }

    /**
     * Get a cached opportunity.
     *
     * @param tenantId the tenant ID
     * @param opportunityId the opportunity ID
     * @return the cached opportunity, or empty if not found
     */
    public Optional<OpportunityDto> getCachedOpportunity(UUID tenantId, String opportunityId) {
        String cacheKey = generateCacheKey(tenantId, OPPORTUNITY_TYPE, opportunityId);
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            OpportunityDto cached = cache.get(cacheKey, OpportunityDto.class);
            if (cached != null) {
                log.debug("Cache hit for opportunity {} tenant {}", opportunityId, tenantId);
                return Optional.of(cached);
            }
        }
        log.debug("Cache miss for opportunity {} tenant {}", opportunityId, tenantId);
        return Optional.empty();
    }

    /**
     * Evict a single opportunity from cache.
     *
     * @param tenantId the tenant ID
     * @param opportunityId the opportunity ID to evict
     */
    public void evictOpportunity(UUID tenantId, String opportunityId) {
        String cacheKey = generateCacheKey(tenantId, OPPORTUNITY_TYPE, opportunityId);
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            cache.evict(cacheKey);
            log.debug("Evicted opportunity {} from cache for tenant {}", opportunityId, tenantId);
        }
    }

    /**
     * Evict all opportunities for a specific tenant.
     * Note: This clears the entire cache. In Redis, pattern-based eviction would be more efficient.
     *
     * @param tenantId the tenant ID
     */
    public void evictAllOpportunitiesForTenant(UUID tenantId) {
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            // For ConcurrentMapCacheManager, we clear all. Redis would support pattern-based eviction.
            cache.clear();
            log.info("Cleared opportunities cache for tenant {}", tenantId);
        }
    }

    // ============================================
    // SEARCH RESULTS CACHING
    // ============================================

    /**
     * Cache search results.
     *
     * @param tenantId the tenant ID
     * @param queryHash hash of the search parameters
     * @param results the search results to cache
     */
    public void cacheSearchResults(UUID tenantId, String queryHash, Object results) {
        String cacheKey = generateSearchCacheKey(tenantId, queryHash);
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            cache.put(cacheKey, results);
            log.debug("Cached search results for query {} tenant {}", queryHash, tenantId);
        }
    }

    /**
     * Get cached search results.
     *
     * @param tenantId the tenant ID
     * @param queryHash hash of the search parameters
     * @param <T> the type of results
     * @return the cached results, or empty if not found
     */
    @SuppressWarnings("unchecked")
    public <T> Optional<T> getCachedSearchResults(UUID tenantId, String queryHash) {
        String cacheKey = generateSearchCacheKey(tenantId, queryHash);
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            Cache.ValueWrapper wrapper = cache.get(cacheKey);
            if (wrapper != null) {
                log.debug("Cache hit for search {} tenant {}", queryHash, tenantId);
                return Optional.ofNullable((T) wrapper.get());
            }
        }
        log.debug("Cache miss for search {} tenant {}", queryHash, tenantId);
        return Optional.empty();
    }

    /**
     * Evict search results from cache.
     *
     * @param tenantId the tenant ID
     * @param queryHash hash of the search parameters
     */
    public void evictSearchResults(UUID tenantId, String queryHash) {
        String cacheKey = generateSearchCacheKey(tenantId, queryHash);
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            cache.evict(cacheKey);
            log.debug("Evicted search results {} for tenant {}", queryHash, tenantId);
        }
    }

    // ============================================
    // USER SESSION CACHING
    // ============================================

    /**
     * Cache user session data.
     *
     * @param userId the user ID
     * @param sessionData the session data to cache
     */
    public void cacheUserSession(UUID userId, String sessionData) {
        String cacheKey = SESSION_TYPE + CACHE_KEY_SEPARATOR + userId.toString();
        Cache cache = cacheManager.getCache(CacheConfig.USERS_CACHE);
        if (cache != null) {
            cache.put(cacheKey, sessionData);
            log.debug("Cached session for user {}", userId);
        }
    }

    /**
     * Get cached user session.
     *
     * @param userId the user ID
     * @return the cached session data, or empty if not found
     */
    public Optional<String> getCachedUserSession(UUID userId) {
        String cacheKey = SESSION_TYPE + CACHE_KEY_SEPARATOR + userId.toString();
        Cache cache = cacheManager.getCache(CacheConfig.USERS_CACHE);
        if (cache != null) {
            String cached = cache.get(cacheKey, String.class);
            if (cached != null) {
                log.debug("Cache hit for session user {}", userId);
                return Optional.of(cached);
            }
        }
        log.debug("Cache miss for session user {}", userId);
        return Optional.empty();
    }

    /**
     * Evict user session from cache.
     *
     * @param userId the user ID
     */
    public void evictUserSession(UUID userId) {
        String cacheKey = SESSION_TYPE + CACHE_KEY_SEPARATOR + userId.toString();
        Cache cache = cacheManager.getCache(CacheConfig.USERS_CACHE);
        if (cache != null) {
            cache.evict(cacheKey);
            log.debug("Evicted session for user {}", userId);
        }
    }

    // ============================================
    // API RESPONSE CACHING
    // ============================================

    /**
     * Cache an API response.
     *
     * @param tenantId the tenant ID
     * @param endpoint the API endpoint
     * @param response the response to cache
     */
    public void cacheApiResponse(UUID tenantId, String endpoint, String response) {
        String cacheKey = generateCacheKey(tenantId, API_RESPONSE_TYPE, generateQueryHash(endpoint));
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            cache.put(cacheKey, response);
            log.debug("Cached API response for {} tenant {}", endpoint, tenantId);
        }
    }

    /**
     * Get cached API response.
     *
     * @param tenantId the tenant ID
     * @param endpoint the API endpoint
     * @return the cached response, or empty if not found
     */
    public Optional<String> getCachedApiResponse(UUID tenantId, String endpoint) {
        String cacheKey = generateCacheKey(tenantId, API_RESPONSE_TYPE, generateQueryHash(endpoint));
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            String cached = cache.get(cacheKey, String.class);
            if (cached != null) {
                log.debug("Cache hit for API {} tenant {}", endpoint, tenantId);
                return Optional.of(cached);
            }
        }
        log.debug("Cache miss for API {} tenant {}", endpoint, tenantId);
        return Optional.empty();
    }

    /**
     * Evict API response from cache.
     *
     * @param tenantId the tenant ID
     * @param endpoint the API endpoint
     */
    public void evictApiResponse(UUID tenantId, String endpoint) {
        String cacheKey = generateCacheKey(tenantId, API_RESPONSE_TYPE, generateQueryHash(endpoint));
        Cache cache = cacheManager.getCache(CacheConfig.OPPORTUNITIES_CACHE);
        if (cache != null) {
            cache.evict(cacheKey);
            log.debug("Evicted API response {} for tenant {}", endpoint, tenantId);
        }
    }

    // ============================================
    // CACHE STATISTICS
    // ============================================

    /**
     * Clear all caches.
     */
    public void clearAllCaches() {
        cacheManager.getCacheNames().forEach(name -> {
            Cache cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
            }
        });
        log.info("Cleared all caches");
    }
}
