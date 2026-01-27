package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.elasticsearch.OpportunityDocument;
import com.samgov.ingestor.elasticsearch.OpportunitySearchRepository;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.ContractLevel;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.service.ElasticsearchService.SearchStats;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.util.List;

import static com.samgov.ingestor.builder.OpportunityTestBuilder.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for ElasticsearchService.
 *
 * Uses an external Elasticsearch instance (from docker-compose) for testing.
 * Tests verify indexing, search, and query functionality.
 *
 * Start Elasticsearch before running: docker-compose up -d elasticsearch
 * Tests are automatically skipped if Elasticsearch is not available at localhost:9200.
 */
@SpringBootTest
@ActiveProfiles("elasticsearch-test")
@DisplayName("Elasticsearch Service Integration Tests")
@EnabledIf("isElasticsearchAvailable")
class ElasticsearchServiceTest extends BaseServiceTest {

    private static final String ELASTICSEARCH_URL = "http://localhost:9200";

    static boolean isElasticsearchAvailable() {
        try {
            URL url = new URL(ELASTICSEARCH_URL + "/_cluster/health");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(2000);
            connection.setReadTimeout(2000);
            int responseCode = connection.getResponseCode();
            connection.disconnect();
            return responseCode == 200;
        } catch (Exception e) {
            return false;
        }
    }

    @DynamicPropertySource
    static void elasticsearchProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.elasticsearch.uris", () -> ELASTICSEARCH_URL);
        registry.add("elasticsearch.enabled", () -> "true");
    }

    @Autowired
    private ElasticsearchService elasticsearchService;

    @Autowired
    private OpportunitySearchRepository searchRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private ElasticsearchOperations elasticsearchOperations;

    /**
     * Force Elasticsearch to refresh the index so documents become searchable immediately.
     * This is the correct way to handle ES near-real-time behavior in tests.
     */
    private void refreshIndex() {
        IndexOperations indexOps = elasticsearchOperations.indexOps(OpportunityDocument.class);
        indexOps.refresh();
    }

    /**
     * Assert full Page metadata for proper pagination verification.
     */
    private void assertPageMetadata(Page<?> page, int expectedSize, long expectedTotal, int expectedPage) {
        assertThat(page).isNotNull();
        assertThat(page.getContent()).hasSize(expectedSize);
        assertThat(page.getTotalElements()).isEqualTo(expectedTotal);
        assertThat(page.getNumber()).isEqualTo(expectedPage);
        if (expectedTotal > 0) {
            assertThat(page.getTotalPages()).isGreaterThanOrEqualTo(1);
        }
    }

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        // Clear Elasticsearch index and JPA repository before each test
        searchRepository.deleteAll();
        opportunityRepository.deleteAll();

        // Force Elasticsearch to refresh index to ensure deletes are visible
        refreshIndex();
    }

    @Nested
    @DisplayName("Index Operations")
    class IndexOperationsTests {

        @Test
        @DisplayName("should index a single opportunity")
        void shouldIndexSingleOpportunity() {
            // Given
            Opportunity opportunity = opportunityRepository.save(
                anActiveOpportunity()
                    .withTitle("Cloud Migration Services")
                    .withDescription("Enterprise cloud migration project")
                    .build()
            );

            // When
            OpportunityDocument indexed = elasticsearchService.indexOpportunity(opportunity);
            refreshIndex();

            // Then
            assertThat(indexed).isNotNull();
            assertThat(indexed.getId()).isEqualTo(opportunity.getId());
            assertThat(indexed.getTitle()).isEqualTo("Cloud Migration Services");
            assertThat(indexed.getDescription()).isEqualTo("Enterprise cloud migration project");

            // Verify the document is searchable
            assertThat(searchRepository.count()).isEqualTo(1);
        }

        @Test
        @DisplayName("should handle null opportunity gracefully")
        void shouldHandleNullOpportunity() {
            // When
            OpportunityDocument indexed = elasticsearchService.indexOpportunity(null);

            // Then
            assertThat(indexed).isNull();
            assertThat(searchRepository.count()).isEqualTo(0);
        }

        @Test
        @DisplayName("should bulk index multiple opportunities")
        void shouldBulkIndexOpportunities() {
            // Given
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity().withTitle("Project A").build()),
                opportunityRepository.save(anActiveOpportunity().withTitle("Project B").build()),
                opportunityRepository.save(anActiveOpportunity().withTitle("Project C").build())
            );

            // When
            List<OpportunityDocument> indexed = elasticsearchService.indexOpportunities(opportunities);
            refreshIndex();

            // Then
            assertThat(indexed).hasSize(3);
            assertThat(indexed).extracting(OpportunityDocument::getTitle)
                .containsExactlyInAnyOrder("Project A", "Project B", "Project C");
            assertThat(searchRepository.count()).isEqualTo(3);
        }

        @Test
        @DisplayName("should handle empty list for bulk index")
        void shouldHandleEmptyListForBulkIndex() {
            // When
            List<OpportunityDocument> indexed = elasticsearchService.indexOpportunities(List.of());

            // Then
            assertThat(indexed).isEmpty();
            assertThat(searchRepository.count()).isEqualTo(0);
        }

        @Test
        @DisplayName("should delete opportunity from index")
        void shouldDeleteOpportunityFromIndex() {
            // Given
            Opportunity opportunity = opportunityRepository.save(
                anActiveOpportunity().withTitle("To Be Deleted").build()
            );
            elasticsearchService.indexOpportunity(opportunity);
            refreshIndex();
            assertThat(searchRepository.count()).isEqualTo(1);

            // When
            elasticsearchService.deleteOpportunity(opportunity.getId());
            refreshIndex();

            // Then
            assertThat(searchRepository.count()).isEqualTo(0);
            assertThat(searchRepository.findById(opportunity.getId())).isEmpty();
        }

        @Test
        @DisplayName("should handle deleting non-existent opportunity")
        void shouldHandleDeleteNonExistent() {
            // When/Then - should not throw
            elasticsearchService.deleteOpportunity("non-existent-id");
            assertThat(searchRepository.count()).isEqualTo(0);
        }

        @Test
        @DisplayName("should bulk delete opportunities")
        void shouldBulkDeleteOpportunities() {
            // Given
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity().build()),
                opportunityRepository.save(anActiveOpportunity().build()),
                opportunityRepository.save(anActiveOpportunity().build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            refreshIndex();
            assertThat(searchRepository.count()).isEqualTo(3);

            // When - delete first two
            List<String> idsToDelete = opportunities.stream()
                .limit(2)
                .map(Opportunity::getId)
                .toList();
            elasticsearchService.deleteOpportunities(idsToDelete);
            refreshIndex();

            // Then
            assertThat(searchRepository.count()).isEqualTo(1);
            // Verify the remaining one is the third opportunity
            String remainingId = opportunities.get(2).getId();
            assertThat(searchRepository.findById(remainingId)).isPresent();
        }
    }

    @Nested
    @DisplayName("Reindex Operations")
    class ReindexOperationsTests {

        @Test
        @DisplayName("should reindex opportunities by status using synchronous method")
        void shouldReindexByStatus() {
            // Given - create opportunities
            opportunityRepository.save(anActiveOpportunity().withTitle("Active 1").build());
            opportunityRepository.save(anActiveOpportunity().withTitle("Active 2").build());
            opportunityRepository.save(aClosedOpportunity().withTitle("Closed 1").build());

            // When - reindex only ACTIVE status
            long count = elasticsearchService.reindexByStatus(OpportunityStatus.ACTIVE);
            refreshIndex();

            // Then
            assertThat(count).isEqualTo(2);

            // Verify only active opportunities are indexed
            Page<OpportunityDocument> results = elasticsearchService.searchOpportunities(
                "", OpportunityStatus.ACTIVE, PageRequest.of(0, 10));
            assertPageMetadata(results, 2, 2, 0);
            assertThat(results.getContent())
                .extracting(OpportunityDocument::getTitle)
                .containsExactlyInAnyOrder("Active 1", "Active 2");
        }

        @Test
        @DisplayName("should index and count opportunities correctly")
        void shouldIndexAndCountCorrectly() {
            // Given - create 5 opportunities
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity().withTitle("Opportunity 1").build()),
                opportunityRepository.save(anActiveOpportunity().withTitle("Opportunity 2").build()),
                opportunityRepository.save(anActiveOpportunity().withTitle("Opportunity 3").build()),
                opportunityRepository.save(anActiveOpportunity().withTitle("Opportunity 4").build()),
                opportunityRepository.save(anActiveOpportunity().withTitle("Opportunity 5").build())
            );

            // When - bulk index
            List<OpportunityDocument> indexed = elasticsearchService.indexOpportunities(opportunities);
            refreshIndex();

            // Then
            assertThat(indexed).hasSize(5);
            assertThat(searchRepository.count()).isEqualTo(5);
            assertThat(opportunityRepository.count()).isEqualTo(5);

            // Verify through search
            Page<OpportunityDocument> results = elasticsearchService.searchOpportunities(
                "", PageRequest.of(0, 10));
            assertPageMetadata(results, 5, 5, 0);
        }
    }

    @Nested
    @DisplayName("Search Operations")
    class SearchOperationsTests {

        @BeforeEach
        void setUpSearchData() {
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Cloud Migration Services")
                    .withDescription("Enterprise cloud infrastructure")
                    .withAgency("Department of Defense")
                    .build()),
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Cybersecurity Assessment")
                    .withDescription("Security evaluation services")
                    .withAgency("NASA")
                    .build()),
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Software Development")
                    .withDescription("Custom software solutions for cloud platforms")
                    .withAgency("Department of Defense")
                    .build()),
                opportunityRepository.save(aClosedOpportunity()
                    .withTitle("Legacy System Support")
                    .withDescription("Cloud migration assistance")
                    .withAgency("General Services Administration")
                    .build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            refreshIndex();
        }

        @Test
        @DisplayName("should search by keyword across multiple fields")
        void shouldSearchByKeyword() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.searchOpportunities(
                "cloud", PageRequest.of(0, 10));

            // Then - "cloud" appears in multiple documents
            assertThat(results).isNotNull();
            assertThat(results.getContent()).hasSizeGreaterThanOrEqualTo(2);
            assertThat(results.getTotalElements()).isGreaterThanOrEqualTo(2);
            assertThat(results.getNumber()).isEqualTo(0);

            // Verify at least one title contains "cloud"
            assertThat(results.getContent())
                .extracting(OpportunityDocument::getTitle)
                .anyMatch(title -> title.toLowerCase().contains("cloud"));
        }

        @Test
        @DisplayName("should return all active when keyword is empty")
        void shouldReturnAllActiveWhenKeywordEmpty() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.searchOpportunities(
                "", PageRequest.of(0, 10));

            // Then - only 3 active opportunities (closed excluded)
            assertPageMetadata(results, 3, 3, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getStatus()).isEqualTo(OpportunityStatus.ACTIVE));
        }

        @Test
        @DisplayName("should search with status filter")
        void shouldSearchWithStatusFilter() {
            // When - search for "cloud" in CLOSED opportunities
            Page<OpportunityDocument> results = elasticsearchService.searchOpportunities(
                "cloud", OpportunityStatus.CLOSED, PageRequest.of(0, 10));

            // Then - only 1 closed opportunity has "cloud" in description
            assertPageMetadata(results, 1, 1, 0);
            assertThat(results.getContent().get(0))
                .satisfies(doc -> {
                    assertThat(doc.getTitle()).isEqualTo("Legacy System Support");
                    assertThat(doc.getStatus()).isEqualTo(OpportunityStatus.CLOSED);
                });
        }

        @Test
        @DisplayName("should search by agency")
        void shouldSearchByAgency() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.searchByAgency(
                "Defense", PageRequest.of(0, 10));

            // Then - 2 opportunities from Department of Defense
            assertPageMetadata(results, 2, 2, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getAgency()).contains("Defense"));
        }
    }

    @Nested
    @DisplayName("Filter Operations")
    class FilterOperationsTests {

        @BeforeEach
        void setUpFilterData() {
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity()
                    .withNaicsCode("541511")
                    .withSetAsideType("SBA")
                    .withPlaceOfPerformanceState("CA")
                    .build()),
                opportunityRepository.save(anActiveOpportunity()
                    .withNaicsCode("541512")
                    .withSetAsideType("8(a)")
                    .withPlaceOfPerformanceState("TX")
                    .build()),
                opportunityRepository.save(anSbirOpportunity()
                    .withSbirPhase("Phase I")
                    .build()),
                opportunityRepository.save(anSttrOpportunity()
                    .withSbirPhase("Phase II")
                    .build()),
                opportunityRepository.save(aDodOpportunity()
                    .withClearanceRequired("Secret")
                    .withItarControlled(true)
                    .build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            refreshIndex();
        }

        @Test
        @DisplayName("should find by NAICS code")
        void shouldFindByNaicsCode() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findByNaicsCode(
                "541511", PageRequest.of(0, 10));

            // Then
            assertPageMetadata(results, 1, 1, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getNaicsCode()).isEqualTo("541511"));
        }

        @Test
        @DisplayName("should find by set-aside type")
        void shouldFindBySetAsideType() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findBySetAsideType(
                "SBA", PageRequest.of(0, 10));

            // Then
            assertPageMetadata(results, 1, 1, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getSetAsideType()).isEqualTo("SBA"));
        }

        @Test
        @DisplayName("should find by state")
        void shouldFindByState() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findByState(
                "CA", PageRequest.of(0, 10));

            // Then
            assertPageMetadata(results, 1, 1, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getPlaceOfPerformanceState()).isEqualTo("CA"));
        }

        @Test
        @DisplayName("should find SBIR/STTR opportunities")
        void shouldFindSbirSttr() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findSbirSttr(
                PageRequest.of(0, 10));

            // Then - 1 SBIR + 1 STTR = 2
            assertPageMetadata(results, 2, 2, 0);
            assertThat(results.getContent())
                .allSatisfy(doc ->
                    assertThat(doc.getIsSbir() || doc.getIsSttr()).isTrue());
        }

        @Test
        @DisplayName("should find by SBIR phase")
        void shouldFindByPhase() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findByPhase(
                "Phase I", PageRequest.of(0, 10));

            // Then
            assertPageMetadata(results, 1, 1, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getSbirPhase()).isEqualTo("Phase I"));
        }

        @Test
        @DisplayName("should find DoD opportunities")
        void shouldFindDodOpportunities() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findDodOpportunities(
                PageRequest.of(0, 10));

            // Then
            assertPageMetadata(results, 1, 1, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getIsDod()).isTrue());
        }

        @Test
        @DisplayName("should find clearance required opportunities")
        void shouldFindClearanceRequired() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findClearanceRequired(
                PageRequest.of(0, 10));

            // Then
            assertPageMetadata(results, 1, 1, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getClearanceRequired()).isNotNull());
        }

        @Test
        @DisplayName("should find ITAR controlled opportunities")
        void shouldFindItarControlled() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findItarControlled(
                PageRequest.of(0, 10));

            // Then
            assertPageMetadata(results, 1, 1, 0);
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getItarControlled()).isTrue());
        }
    }

    @Nested
    @DisplayName("Date-Based Queries")
    class DateBasedQueriesTests {

        @BeforeEach
        void setUpDateData() {
            LocalDate today = LocalDate.now();
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Closing in 3 days")
                    .withResponseDeadLine(today.plusDays(3))
                    .withPostedDate(today.minusDays(2))
                    .build()),
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Closing in 5 days")
                    .withResponseDeadLine(today.plusDays(5))
                    .withPostedDate(today.minusDays(5))
                    .build()),
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Closing in 30 days")
                    .withResponseDeadLine(today.plusDays(30))
                    .withPostedDate(today.minusDays(20))
                    .build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            refreshIndex();
        }

        @Test
        @DisplayName("should find opportunities closing soon")
        void shouldFindClosingSoon() {
            // When - find opportunities closing within 7 days
            Page<OpportunityDocument> results = elasticsearchService.findClosingSoon(
                7, PageRequest.of(0, 10));

            // Then - 2 opportunities close within 7 days
            assertPageMetadata(results, 2, 2, 0);
            assertThat(results.getContent())
                .extracting(OpportunityDocument::getTitle)
                .containsExactlyInAnyOrder("Closing in 3 days", "Closing in 5 days");
        }

        @Test
        @DisplayName("should find recently posted opportunities")
        void shouldFindRecentlyPosted() {
            // When - find opportunities posted within 7 days
            Page<OpportunityDocument> results = elasticsearchService.findRecentlyPosted(
                7, PageRequest.of(0, 10));

            // Then - 2 opportunities posted within 7 days
            assertPageMetadata(results, 2, 2, 0);
            assertThat(results.getContent())
                .extracting(OpportunityDocument::getTitle)
                .containsExactlyInAnyOrder("Closing in 3 days", "Closing in 5 days");
        }
    }

    @Nested
    @DisplayName("Statistics")
    class StatisticsTests {

        @BeforeEach
        void setUpStatsData() {
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity().withTitle("Active 1").build()),
                opportunityRepository.save(anActiveOpportunity().withTitle("Active 2").build()),
                opportunityRepository.save(anSbirOpportunity().withTitle("SBIR 1").build()),
                opportunityRepository.save(anSttrOpportunity().withTitle("STTR 1").build()),
                opportunityRepository.save(aClosedOpportunity().withTitle("Closed 1").build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            refreshIndex();
        }

        @Test
        @DisplayName("should return accurate search statistics")
        void shouldReturnSearchStats() {
            // When
            SearchStats stats = elasticsearchService.getSearchStats();

            // Then
            assertThat(stats).isNotNull();
            assertThat(stats.totalDocuments()).isEqualTo(5);
            assertThat(stats.activeOpportunities()).isEqualTo(4); // Active includes SBIR/STTR
            assertThat(stats.sbirOpportunities()).isEqualTo(1);
            assertThat(stats.sttrOpportunities()).isEqualTo(1);
        }

        @Test
        @DisplayName("should report healthy index")
        void shouldReportHealthyIndex() {
            // When
            boolean healthy = elasticsearchService.isIndexHealthy();

            // Then
            assertThat(healthy).isTrue();
        }
    }

    @Nested
    @DisplayName("Contract Level Filtering")
    class ContractLevelFilteringTests {

        @BeforeEach
        void setUpContractLevelData() {
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Federal Opportunity")
                    .withContractLevel(ContractLevel.FEDERAL).build()),
                opportunityRepository.save(aDodOpportunity()
                    .withTitle("DoD Opportunity").build()),
                opportunityRepository.save(aStateOpportunity()
                    .withTitle("State Opportunity").build()),
                opportunityRepository.save(aLocalOpportunity()
                    .withTitle("Local Opportunity").build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            refreshIndex();
        }

        @ParameterizedTest(name = "should find {0} opportunities")
        @EnumSource(value = ContractLevel.class, names = {"FEDERAL", "DOD", "STATE", "LOCAL"})
        @DisplayName("should find opportunities by contract level")
        void shouldFindByContractLevel(ContractLevel contractLevel) {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findByContractLevel(
                contractLevel, PageRequest.of(0, 10));

            // Then
            assertThat(results).isNotNull();
            assertThat(results.getContent()).hasSize(1);
            assertThat(results.getTotalElements()).isEqualTo(1);
            assertThat(results.getTotalPages()).isEqualTo(1);
            assertThat(results.getNumber()).isEqualTo(0);
            assertThat(results.isFirst()).isTrue();

            // Verify the returned document matches the filter
            assertThat(results.getContent())
                .allSatisfy(doc -> assertThat(doc.getContractLevel()).isEqualTo(contractLevel));
        }
    }
}
