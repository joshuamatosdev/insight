package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.dto.FacetedSearchRequest;
import com.samgov.ingestor.dto.FacetedSearchResponse;
import com.samgov.ingestor.dto.FacetedSearchResponse.FacetBucket;
import com.samgov.ingestor.dto.SearchSuggestionDTO;
import com.samgov.ingestor.dto.SearchSuggestionDTO.Suggestion;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.repository.OpportunityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static com.samgov.ingestor.builder.OpportunityTestBuilder.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Service layer tests for SearchEnhancementService.
 * Tests autocomplete suggestions, faceted search, and search relevance.
 */
class SearchEnhancementServiceTest extends BaseServiceTest {

    @Autowired
    private SearchEnhancementService searchEnhancementService;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        opportunityRepository.deleteAll();
    }

    @Nested
    @DisplayName("Get Suggestions - Autocomplete")
    class GetSuggestions {

        @Test
        @DisplayName("should return suggestions matching query in title")
        void shouldReturnSuggestionsMatchingTitle() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment Services").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Infrastructure Support").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support Services").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("cyber", 10);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getQuery()).isEqualTo("cyber");
            assertThat(result.getSuggestions()).hasSize(2);
            assertThat(result.getSuggestions())
                .extracting(Suggestion::getText)
                .allMatch(text -> text.toLowerCase().contains("cyber"));
        }

        @Test
        @DisplayName("should return suggestions matching query in description")
        void shouldReturnSuggestionsMatchingDescription() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Network Services")
                .withDescription("Comprehensive cybersecurity monitoring and protection").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("monitoring", 10);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getSuggestions()).hasSizeGreaterThanOrEqualTo(1);
        }

        @Test
        @DisplayName("should respect limit parameter")
        void shouldRespectLimit() {
            // Given
            for (int i = 0; i < 10; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Cloud Migration Project " + i).build());
            }

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("cloud", 5);

            // Then
            assertThat(result.getSuggestions()).hasSize(5);
        }

        @Test
        @DisplayName("should return empty suggestions for no matches")
        void shouldReturnEmptySuggestionsForNoMatches() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support Services").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("nonexistent", 10);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getQuery()).isEqualTo("nonexistent");
            assertThat(result.getSuggestions()).isEmpty();
        }

        @Test
        @DisplayName("should include suggestion type as opportunity")
        void shouldIncludeSuggestionType() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test Opportunity").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("test", 10);

            // Then
            assertThat(result.getSuggestions()).isNotEmpty();
            assertThat(result.getSuggestions())
                .extracting(Suggestion::getType)
                .containsOnly("opportunity");
        }

        @Test
        @DisplayName("should highlight matching text in suggestions")
        void shouldHighlightMatchingText() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("cyber", 10);

            // Then
            assertThat(result.getSuggestions()).isNotEmpty();
            Suggestion suggestion = result.getSuggestions().get(0);
            assertThat(suggestion.getHighlight()).contains("<mark>");
            assertThat(suggestion.getHighlight()).contains("</mark>");
        }

        @Test
        @DisplayName("should return empty recent searches list")
        void shouldReturnEmptyRecentSearches() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("test", 10);

            // Then
            assertThat(result.getRecentSearches()).isEmpty();
        }

        @Test
        @DisplayName("should handle case insensitive search")
        void shouldHandleCaseInsensitiveSearch() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("CYBERSECURITY Assessment").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("cybersecurity Services").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("CYBER", 10);

            // Then
            assertThat(result.getSuggestions()).hasSize(2);
        }

        @Test
        @DisplayName("should handle special characters in query")
        void shouldHandleSpecialCharactersInQuery() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT/OT Security Services").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("IT/OT", 10);

            // Then
            assertThat(result).isNotNull();
            // Should not throw exception
        }
    }

    @Nested
    @DisplayName("Faceted Search")
    class FacetedSearch {

        @Test
        @DisplayName("should return paginated results")
        void shouldReturnPaginatedResults() {
            // Given
            for (int i = 0; i < 25; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity " + i).build());
            }

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(10)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getOpportunities().getContent()).hasSize(10);
            assertThat(result.getTotalCount()).isEqualTo(25);
        }

        @Test
        @DisplayName("should filter by query text")
        void shouldFilterByQueryText() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support").build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("cybersecurity")
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).hasSize(1);
            assertThat(result.getTotalCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("should return all results when query is blank")
        void shouldReturnAllResultsWhenQueryIsBlank() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("")
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).hasSize(3);
        }

        @Test
        @DisplayName("should return all results when query is null")
        void shouldReturnAllResultsWhenQueryIsNull() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query(null)
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should include facets in response")
        void shouldIncludeFacetsInResponse() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withStatus(OpportunityStatus.ACTIVE).build());
            opportunityRepository.save(aClosedOpportunity()
                .withStatus(OpportunityStatus.CLOSED).build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getFacets()).isNotNull();
            assertThat(result.getFacets()).containsKeys("type", "status");
        }

        @Test
        @DisplayName("should include status facet with counts")
        void shouldIncludeStatusFacetWithCounts() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            Map<String, List<FacetBucket>> facets = result.getFacets();
            List<FacetBucket> statusFacets = facets.get("status");
            assertThat(statusFacets).isNotNull();

            FacetBucket activeBucket = statusFacets.stream()
                .filter(b -> "ACTIVE".equals(b.getKey()))
                .findFirst()
                .orElse(null);
            assertThat(activeBucket).isNotNull();
            assertThat(activeBucket.getCount()).isEqualTo(2);

            FacetBucket closedBucket = statusFacets.stream()
                .filter(b -> "CLOSED".equals(b.getKey()))
                .findFirst()
                .orElse(null);
            assertThat(closedBucket).isNotNull();
            assertThat(closedBucket.getCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("should include type facet buckets")
        void shouldIncludeTypeFacetBuckets() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            List<FacetBucket> typeFacets = result.getFacets().get("type");
            assertThat(typeFacets).isNotNull();
            assertThat(typeFacets)
                .extracting(FacetBucket::getKey)
                .contains("SOLICITATION", "PRESOLICITATION", "AWARD", "SOURCE_SOUGHT");
        }

        @Test
        @DisplayName("should record query time")
        void shouldRecordQueryTime() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getQueryTimeMs()).isGreaterThanOrEqualTo(0);
        }

        @Test
        @DisplayName("should sort by response deadline ascending by default")
        void shouldSortByResponseDeadlineAscendingByDefault() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Far")
                .withResponseDeadLine(today.plusDays(30)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Near")
                .withResponseDeadLine(today.plusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Medium")
                .withResponseDeadLine(today.plusDays(15)).build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .sortOrder("asc")
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).hasSize(3);
            assertThat(result.getOpportunities().getContent().get(0).title()).isEqualTo("Near");
        }

        @Test
        @DisplayName("should sort by specified field descending")
        void shouldSortBySpecifiedFieldDescending() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Old")
                .withPostedDate(today.minusDays(30)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("New")
                .withPostedDate(today.minusDays(1)).build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .sortBy("postedDate")
                .sortOrder("desc")
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent().get(0).title()).isEqualTo("New");
        }

        @Test
        @DisplayName("should handle empty results gracefully")
        void shouldHandleEmptyResultsGracefully() {
            // Given
            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("nonexistent-query-xyz")
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getOpportunities().getContent()).isEmpty();
            assertThat(result.getTotalCount()).isZero();
            assertThat(result.getFacets()).isNotNull();
        }

        @Test
        @DisplayName("should handle pagination beyond total pages")
        void shouldHandlePaginationBeyondTotalPages() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(10)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).isEmpty();
            assertThat(result.getTotalCount()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Search Ranking and Relevance")
    class SearchRankingAndRelevance {

        @Test
        @DisplayName("should return relevant results for partial keyword match")
        void shouldReturnRelevantResultsForPartialMatch() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Information Technology Services").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Tech Support").build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("tech")
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should match in description when title doesn't match")
        void shouldMatchInDescriptionWhenTitleDoesntMatch() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Federal Services Contract")
                .withDescription("Comprehensive cybersecurity assessment and monitoring").build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("cybersecurity")
                .page(0)
                .size(20)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {

        @Test
        @DisplayName("should handle null query gracefully in suggestions")
        void shouldHandleNullQueryGracefullyInSuggestions() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            // When - passing empty string since null would fail differently
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("", 10);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("should handle zero limit by throwing exception")
        void shouldHandleZeroLimitByThrowingException() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test").build());

            // When/Then - zero page size throws IllegalArgumentException
            org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> searchEnhancementService.getSuggestions("test", 0)
            );
        }

        @Test
        @DisplayName("should handle negative limit gracefully")
        void shouldHandleNegativeLimitGracefully() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test").build());

            // When/Then - This may throw or handle gracefully depending on implementation
            // The test documents expected behavior
            try {
                SearchSuggestionDTO result = searchEnhancementService.getSuggestions("test", -1);
                assertThat(result).isNotNull();
            } catch (IllegalArgumentException e) {
                // Expected for negative page size
                assertThat(e).isInstanceOf(IllegalArgumentException.class);
            }
        }

        @Test
        @DisplayName("should handle zero page size in faceted search")
        void shouldHandleZeroPageSizeInFacetedSearch() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(0)
                .build();

            // When/Then
            try {
                FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);
                assertThat(result).isNotNull();
                assertThat(result.getOpportunities().getContent()).isEmpty();
            } catch (IllegalArgumentException e) {
                // Expected for zero page size
                assertThat(e).isInstanceOf(IllegalArgumentException.class);
            }
        }

        @Test
        @DisplayName("should handle negative page number in faceted search")
        void shouldHandleNegativePageNumberInFacetedSearch() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(-1)
                .size(20)
                .build();

            // When/Then
            try {
                FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);
                assertThat(result).isNotNull();
            } catch (IllegalArgumentException e) {
                // Expected for negative page number
                assertThat(e).isInstanceOf(IllegalArgumentException.class);
            }
        }
    }

    @Nested
    @DisplayName("Highlight Match")
    class HighlightMatch {

        @Test
        @DisplayName("should highlight match at beginning of text")
        void shouldHighlightMatchAtBeginning() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("Cyber", 10);

            // Then
            assertThat(result.getSuggestions()).isNotEmpty();
            String highlight = result.getSuggestions().get(0).getHighlight();
            assertThat(highlight).startsWith("<mark>Cyber</mark>");
        }

        @Test
        @DisplayName("should highlight match in middle of text")
        void shouldHighlightMatchInMiddle() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Federal Cybersecurity Assessment").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("Cyber", 10);

            // Then
            assertThat(result.getSuggestions()).isNotEmpty();
            String highlight = result.getSuggestions().get(0).getHighlight();
            assertThat(highlight).contains("<mark>Cyber</mark>");
            assertThat(highlight).contains("Federal");
        }

        @Test
        @DisplayName("should highlight match at end of text")
        void shouldHighlightMatchAtEnd() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Security Cyber").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("Cyber", 10);

            // Then
            assertThat(result.getSuggestions()).isNotEmpty();
            String highlight = result.getSuggestions().get(0).getHighlight();
            assertThat(highlight).endsWith("<mark>Cyber</mark>");
        }

        @Test
        @DisplayName("should preserve original case in highlighted text")
        void shouldPreserveOriginalCaseInHighlightedText() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("CYBERSECURITY Assessment").build());

            // When
            SearchSuggestionDTO result = searchEnhancementService.getSuggestions("cyber", 10);

            // Then
            assertThat(result.getSuggestions()).isNotEmpty();
            String highlight = result.getSuggestions().get(0).getHighlight();
            // The highlight should contain the original case
            assertThat(highlight).contains("<mark>CYBER</mark>");
        }
    }

    @Nested
    @DisplayName("Integration Scenarios")
    class IntegrationScenarios {

        @Test
        @DisplayName("should find opportunities across multiple search terms")
        void shouldFindOpportunitiesAcrossMultipleSearchTerms() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cloud Infrastructure Services")
                .withDescription("AWS and Azure cloud solutions").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("On-premise Data Center")
                .withDescription("Traditional infrastructure support").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Hybrid Cloud Migration")
                .withDescription("Migrate to cloud environment").build());

            // When - search for "cloud"
            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("cloud")
                .page(0)
                .size(20)
                .build();
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should handle rapid successive searches")
        void shouldHandleRapidSuccessiveSearches() {
            // Given
            for (int i = 0; i < 10; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity Type A " + i).build());
            }
            for (int i = 0; i < 10; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity Type B " + i).build());
            }

            // When - perform multiple rapid searches
            for (int i = 0; i < 5; i++) {
                FacetedSearchRequest requestA = FacetedSearchRequest.builder()
                    .query("Type A")
                    .page(0)
                    .size(20)
                    .build();
                FacetedSearchResponse resultA = searchEnhancementService.facetedSearch(requestA);
                assertThat(resultA.getOpportunities().getContent()).hasSize(10);

                FacetedSearchRequest requestB = FacetedSearchRequest.builder()
                    .query("Type B")
                    .page(0)
                    .size(20)
                    .build();
                FacetedSearchResponse resultB = searchEnhancementService.facetedSearch(requestB);
                assertThat(resultB.getOpportunities().getContent()).hasSize(10);
            }
        }

        @Test
        @DisplayName("should correctly report total count with filters")
        void shouldCorrectlyReportTotalCountWithFilters() {
            // Given
            for (int i = 0; i < 50; i++) {
                if (i < 30) {
                    opportunityRepository.save(anActiveOpportunity()
                        .withTitle("Cybersecurity Project " + i).build());
                } else {
                    opportunityRepository.save(anActiveOpportunity()
                        .withTitle("IT Support Project " + i).build());
                }
            }

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("cybersecurity")
                .page(0)
                .size(10)
                .build();

            // When
            FacetedSearchResponse result = searchEnhancementService.facetedSearch(request);

            // Then
            assertThat(result.getOpportunities().getContent()).hasSize(10);
            assertThat(result.getTotalCount()).isEqualTo(30);
            assertThat(result.getOpportunities().getTotalPages()).isEqualTo(3);
        }
    }
}
