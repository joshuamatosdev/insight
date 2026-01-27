package com.samgov.ingestor.service;

import com.samgov.ingestor.config.CacheConfig;
import com.samgov.ingestor.dto.OpportunityDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for CacheService ensuring proper caching behavior with multi-tenant isolation.
 * Uses ConcurrentMapCacheManager for testing without requiring Redis.
 */
class CacheServiceTest {

    private CacheService cacheService;
    private CacheManager cacheManager;
    private UUID testTenantId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        cacheManager = new ConcurrentMapCacheManager(
            CacheConfig.OPPORTUNITIES_CACHE,
            CacheConfig.CONTRACTS_CACHE,
            CacheConfig.USERS_CACHE,
            CacheConfig.TENANT_SETTINGS_CACHE,
            CacheConfig.PERMISSIONS_CACHE,
            CacheConfig.SEARCH_RESULTS_CACHE,
            CacheConfig.API_RESPONSES_CACHE
        );
        cacheService = new CacheService(cacheManager);
        testTenantId = UUID.randomUUID();
        testUserId = UUID.randomUUID();

        // Clear all caches before each test
        cacheManager.getCacheNames().forEach(name -> {
            var cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
            }
        });
    }

    private OpportunityDto createTestOpportunityDto(String id, String title) {
        return OpportunityDto.builder()
            .id(id)
            .title(title)
            .solicitationNumber("SOL-" + id)
            .description("Test description for " + title)
            .postedDate(LocalDate.now())
            .responseDeadline(LocalDate.now().plusDays(30))
            .naicsCode("541511")
            .type("k")
            .agency("Test Agency")
            .office("Test Office")
            .setAsideType("Small Business")
            .url("http://example.com/" + id)
            .placeOfPerformanceState("DC")
            .placeOfPerformanceCity("Washington")
            .placeOfPerformanceZip("20001")
            .isSbir(true)
            .isSttr(false)
            .sbirPhase("Phase I")
            .awardAmount(BigDecimal.valueOf(100000))
            .source("SAM.gov")
            .isPastDeadline(false)
            .isClosingSoon(false)
            .daysUntilDeadline(14L)
            .build();
    }

    @Nested
    @DisplayName("Cache Key Generation")
    class CacheKeyGeneration {

        @Test
        @DisplayName("should generate cache key with tenant ID prefix")
        void shouldGenerateCacheKeyWithTenantPrefix() {
            // Given
            String entityType = "opportunity";
            String entityId = "test-123";

            // When
            String cacheKey = cacheService.generateCacheKey(testTenantId, entityType, entityId);

            // Then
            assertThat(cacheKey).isEqualTo("tenant:" + testTenantId + ":opportunity:test-123");
        }

        @Test
        @DisplayName("should generate different keys for different tenants")
        void shouldGenerateDifferentKeysForDifferentTenants() {
            // Given
            UUID tenant1 = UUID.randomUUID();
            UUID tenant2 = UUID.randomUUID();
            String entityType = "opportunity";
            String entityId = "same-id";

            // When
            String key1 = cacheService.generateCacheKey(tenant1, entityType, entityId);
            String key2 = cacheService.generateCacheKey(tenant2, entityType, entityId);

            // Then
            assertThat(key1).isNotEqualTo(key2);
        }

        @Test
        @DisplayName("should generate search cache key with query hash")
        void shouldGenerateSearchCacheKey() {
            // Given
            String queryHash = "abc123";

            // When
            String cacheKey = cacheService.generateSearchCacheKey(testTenantId, queryHash);

            // Then
            assertThat(cacheKey).startsWith("tenant:" + testTenantId + ":search:");
            assertThat(cacheKey).endsWith(queryHash);
        }
    }

    @Nested
    @DisplayName("Opportunity Caching")
    class OpportunityCaching {

        @Test
        @DisplayName("should cache opportunity by ID")
        void shouldCacheOpportunityById() {
            // Given
            String opportunityId = "opp-123";
            OpportunityDto opportunity = createTestOpportunityDto(opportunityId, "Test Cached Opportunity");

            // When
            cacheService.cacheOpportunity(testTenantId, opportunity);

            // Then
            Optional<OpportunityDto> cached = cacheService.getCachedOpportunity(testTenantId, opportunityId);
            assertThat(cached).isPresent();
            assertThat(cached.get().title()).isEqualTo("Test Cached Opportunity");
        }

        @Test
        @DisplayName("should return empty optional when opportunity not in cache")
        void shouldReturnEmptyWhenNotInCache() {
            // When
            Optional<OpportunityDto> cached = cacheService.getCachedOpportunity(testTenantId, "nonexistent");

            // Then
            assertThat(cached).isEmpty();
        }

        @Test
        @DisplayName("should isolate cached opportunities by tenant")
        void shouldIsolateCachedOpportunitiesByTenant() {
            // Given
            String opportunityId = "opp-456";
            OpportunityDto opportunity = createTestOpportunityDto(opportunityId, "Tenant 1 Opportunity");
            UUID otherTenantId = UUID.randomUUID();

            // Cache for first tenant
            cacheService.cacheOpportunity(testTenantId, opportunity);

            // When/Then - first tenant can retrieve
            Optional<OpportunityDto> cached = cacheService.getCachedOpportunity(testTenantId, opportunityId);
            assertThat(cached).isPresent();

            // When/Then - other tenant cannot retrieve the same key
            Optional<OpportunityDto> otherTenantCached = cacheService.getCachedOpportunity(otherTenantId, opportunityId);
            assertThat(otherTenantCached).isEmpty();
        }
    }

    @Nested
    @DisplayName("Cache Eviction")
    class CacheEviction {

        @Test
        @DisplayName("should evict single opportunity from cache")
        void shouldEvictSingleOpportunity() {
            // Given
            String opportunityId = "opp-evict";
            OpportunityDto opportunity = createTestOpportunityDto(opportunityId, "To Be Evicted");
            cacheService.cacheOpportunity(testTenantId, opportunity);

            // Verify it's cached
            assertThat(cacheService.getCachedOpportunity(testTenantId, opportunityId)).isPresent();

            // When
            cacheService.evictOpportunity(testTenantId, opportunityId);

            // Then
            assertThat(cacheService.getCachedOpportunity(testTenantId, opportunityId)).isEmpty();
        }

        @Test
        @DisplayName("should evict all opportunities for a tenant")
        void shouldEvictAllOpportunitiesForTenant() {
            // Given
            OpportunityDto opp1 = createTestOpportunityDto("opp-1", "Opp 1");
            OpportunityDto opp2 = createTestOpportunityDto("opp-2", "Opp 2");

            cacheService.cacheOpportunity(testTenantId, opp1);
            cacheService.cacheOpportunity(testTenantId, opp2);

            // Verify both are cached
            assertThat(cacheService.getCachedOpportunity(testTenantId, "opp-1")).isPresent();
            assertThat(cacheService.getCachedOpportunity(testTenantId, "opp-2")).isPresent();

            // When
            cacheService.evictAllOpportunitiesForTenant(testTenantId);

            // Then - ConcurrentMapCacheManager clears all entries
            assertThat(cacheService.getCachedOpportunity(testTenantId, "opp-1")).isEmpty();
            assertThat(cacheService.getCachedOpportunity(testTenantId, "opp-2")).isEmpty();
        }

        @Test
        @DisplayName("should evict search results from cache")
        void shouldEvictSearchResults() {
            // Given
            String queryHash = "test-query-hash";

            cacheService.cacheSearchResults(testTenantId, queryHash, "test-results");

            // Verify it's cached
            assertThat(cacheService.getCachedSearchResults(testTenantId, queryHash)).isPresent();

            // When
            cacheService.evictSearchResults(testTenantId, queryHash);

            // Then
            assertThat(cacheService.getCachedSearchResults(testTenantId, queryHash)).isEmpty();
        }
    }

    @Nested
    @DisplayName("User Session Caching")
    class UserSessionCaching {

        @Test
        @DisplayName("should cache user session data")
        void shouldCacheUserSession() {
            // Given
            String sessionData = "{\"preferences\": {\"theme\": \"dark\"}}";

            // When
            cacheService.cacheUserSession(testUserId, sessionData);

            // Then
            Optional<String> cached = cacheService.getCachedUserSession(testUserId);
            assertThat(cached).isPresent();
            assertThat(cached.get()).isEqualTo(sessionData);
        }

        @Test
        @DisplayName("should evict user session from cache")
        void shouldEvictUserSession() {
            // Given
            cacheService.cacheUserSession(testUserId, "session-data");
            assertThat(cacheService.getCachedUserSession(testUserId)).isPresent();

            // When
            cacheService.evictUserSession(testUserId);

            // Then
            assertThat(cacheService.getCachedUserSession(testUserId)).isEmpty();
        }
    }

    @Nested
    @DisplayName("API Response Caching")
    class ApiResponseCaching {

        @Test
        @DisplayName("should cache API response")
        void shouldCacheApiResponse() {
            // Given
            String endpoint = "/api/opportunities";
            String response = "{\"count\": 100}";

            // When
            cacheService.cacheApiResponse(testTenantId, endpoint, response);

            // Then
            Optional<String> cached = cacheService.getCachedApiResponse(testTenantId, endpoint);
            assertThat(cached).isPresent();
            assertThat(cached.get()).isEqualTo(response);
        }

        @Test
        @DisplayName("should evict API response from cache")
        void shouldEvictApiResponse() {
            // Given
            String endpoint = "/api/opportunities";
            cacheService.cacheApiResponse(testTenantId, endpoint, "response");
            assertThat(cacheService.getCachedApiResponse(testTenantId, endpoint)).isPresent();

            // When
            cacheService.evictApiResponse(testTenantId, endpoint);

            // Then
            assertThat(cacheService.getCachedApiResponse(testTenantId, endpoint)).isEmpty();
        }
    }

    @Nested
    @DisplayName("Hash Generation")
    class HashGeneration {

        @Test
        @DisplayName("should generate consistent hash for same input")
        void shouldGenerateConsistentHash() {
            // Given
            String input = "keyword=test&agency=DoD";

            // When
            String hash1 = cacheService.generateQueryHash(input);
            String hash2 = cacheService.generateQueryHash(input);

            // Then
            assertThat(hash1).isEqualTo(hash2);
        }

        @Test
        @DisplayName("should generate different hashes for different inputs")
        void shouldGenerateDifferentHashes() {
            // Given
            String input1 = "keyword=test";
            String input2 = "keyword=other";

            // When
            String hash1 = cacheService.generateQueryHash(input1);
            String hash2 = cacheService.generateQueryHash(input2);

            // Then
            assertThat(hash1).isNotEqualTo(hash2);
        }
    }

    @Nested
    @DisplayName("Clear All Caches")
    class ClearAllCaches {

        @Test
        @DisplayName("should clear all caches")
        void shouldClearAllCaches() {
            // Given - add items to different caches
            OpportunityDto opportunity = createTestOpportunityDto("opp-clear", "To Clear");
            cacheService.cacheOpportunity(testTenantId, opportunity);
            cacheService.cacheUserSession(testUserId, "session-data");
            cacheService.cacheApiResponse(testTenantId, "/api/test", "response");

            // Verify all are cached
            assertThat(cacheService.getCachedOpportunity(testTenantId, "opp-clear")).isPresent();
            assertThat(cacheService.getCachedUserSession(testUserId)).isPresent();
            assertThat(cacheService.getCachedApiResponse(testTenantId, "/api/test")).isPresent();

            // When
            cacheService.clearAllCaches();

            // Then
            assertThat(cacheService.getCachedOpportunity(testTenantId, "opp-clear")).isEmpty();
            assertThat(cacheService.getCachedUserSession(testUserId)).isEmpty();
            assertThat(cacheService.getCachedApiResponse(testTenantId, "/api/test")).isEmpty();
        }
    }
}
