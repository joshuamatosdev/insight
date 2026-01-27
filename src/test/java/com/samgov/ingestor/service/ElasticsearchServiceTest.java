package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.builder.OpportunityTestBuilder;
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
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.elasticsearch.ElasticsearchContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static com.samgov.ingestor.builder.OpportunityTestBuilder.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for ElasticsearchService.
 *
 * Uses Testcontainers to spin up an Elasticsearch instance for testing.
 * Tests verify indexing, search, and query functionality.
 */
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
@DisplayName("Elasticsearch Service Integration Tests")
class ElasticsearchServiceTest extends BaseServiceTest {

    @Container
    static ElasticsearchContainer elasticsearch =
        new ElasticsearchContainer("docker.elastic.co/elasticsearch/elasticsearch:8.11.3")
            .withEnv("xpack.security.enabled", "false")
            .withEnv("discovery.type", "single-node");

    @DynamicPropertySource
    static void elasticsearchProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.elasticsearch.uris", elasticsearch::getHttpHostAddress);
    }

    @Autowired
    private ElasticsearchService elasticsearchService;

    @Autowired
    private OpportunitySearchRepository searchRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        // Clear Elasticsearch index before each test
        searchRepository.deleteAll();
        opportunityRepository.deleteAll();
    }

    @Nested
    @DisplayName("Index Operations")
    class IndexOperations {

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

            // Then
            assertThat(indexed).isNotNull();
            assertThat(indexed.getId()).isEqualTo(opportunity.getId());
            assertThat(indexed.getTitle()).isEqualTo("Cloud Migration Services");
            assertThat(indexed.getDescription()).isEqualTo("Enterprise cloud migration project");
        }

        @Test
        @DisplayName("should handle null opportunity gracefully")
        void shouldHandleNullOpportunity() {
            // When
            OpportunityDocument indexed = elasticsearchService.indexOpportunity(null);

            // Then
            assertThat(indexed).isNull();
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

            // Then
            assertThat(indexed).hasSize(3);
            assertThat(searchRepository.count()).isEqualTo(3);
        }

        @Test
        @DisplayName("should handle empty list for bulk index")
        void shouldHandleEmptyListForBulkIndex() {
            // When
            List<OpportunityDocument> indexed = elasticsearchService.indexOpportunities(List.of());

            // Then
            assertThat(indexed).isEmpty();
        }

        @Test
        @DisplayName("should delete opportunity from index")
        void shouldDeleteOpportunityFromIndex() {
            // Given
            Opportunity opportunity = opportunityRepository.save(
                anActiveOpportunity().withTitle("To Be Deleted").build()
            );
            elasticsearchService.indexOpportunity(opportunity);
            assertThat(searchRepository.count()).isEqualTo(1);

            // When
            elasticsearchService.deleteOpportunity(opportunity.getId());

            // Then
            assertThat(searchRepository.count()).isEqualTo(0);
        }

        @Test
        @DisplayName("should handle deleting non-existent opportunity")
        void shouldHandleDeleteNonExistent() {
            // When/Then - should not throw
            elasticsearchService.deleteOpportunity("non-existent-id");
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
            assertThat(searchRepository.count()).isEqualTo(3);

            // When
            List<String> idsToDelete = opportunities.stream()
                .limit(2)
                .map(Opportunity::getId)
                .toList();
            elasticsearchService.deleteOpportunities(idsToDelete);

            // Then
            assertThat(searchRepository.count()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Reindex Operations")
    class ReindexOperations {

        @Test
        @DisplayName("should reindex all opportunities from database")
        void shouldReindexAllOpportunities() throws Exception {
            // Given
            for (int i = 0; i < 5; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity " + i).build());
            }
            assertThat(searchRepository.count()).isEqualTo(0);

            // When
            CompletableFuture<Long> future = elasticsearchService.reindexAll();
            Long count = future.get(30, TimeUnit.SECONDS);

            // Then
            assertThat(count).isEqualTo(5);
            assertThat(searchRepository.count()).isEqualTo(5);
        }

        @Test
        @DisplayName("should reindex opportunities by status")
        void shouldReindexByStatus() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            // When
            long count = elasticsearchService.reindexByStatus(OpportunityStatus.ACTIVE);

            // Then
            assertThat(count).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("Search Operations")
    class SearchOperations {

        @BeforeEach
        void setUpSearchData() throws InterruptedException {
            // Index test data
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
                    .build())
            );
            elasticsearchService.indexOpportunities(opportunities);

            // Wait for Elasticsearch to index
            Thread.sleep(1000);
        }

        @Test
        @DisplayName("should search by keyword across multiple fields")
        void shouldSearchByKeyword() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.searchOpportunities(
                "cloud", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSizeGreaterThanOrEqualTo(2);
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

            // Then
            assertThat(results.getContent()).hasSize(3); // Only active ones
        }

        @Test
        @DisplayName("should search with status filter")
        void shouldSearchWithStatusFilter() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.searchOpportunities(
                "cloud", OpportunityStatus.CLOSED, PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(1);
            assertThat(results.getContent().get(0).getTitle()).isEqualTo("Legacy System Support");
        }

        @Test
        @DisplayName("should search by agency")
        void shouldSearchByAgency() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.searchByAgency(
                "Defense", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Filter Operations")
    class FilterOperations {

        @BeforeEach
        void setUpFilterData() throws InterruptedException {
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
            Thread.sleep(1000);
        }

        @Test
        @DisplayName("should find by NAICS code")
        void shouldFindByNaicsCode() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findByNaicsCode(
                "541511", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(1);
            assertThat(results.getContent().get(0).getNaicsCode()).isEqualTo("541511");
        }

        @Test
        @DisplayName("should find by set-aside type")
        void shouldFindBySetAsideType() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findBySetAsideType(
                "SBA", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should find by state")
        void shouldFindByState() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findByState(
                "CA", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should find SBIR/STTR opportunities")
        void shouldFindSbirSttr() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findSbirSttr(
                PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should find by SBIR phase")
        void shouldFindByPhase() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findByPhase(
                "Phase I", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should find DoD opportunities")
        void shouldFindDodOpportunities() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findDodOpportunities(
                PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should find clearance required opportunities")
        void shouldFindClearanceRequired() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findClearanceRequired(
                PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should find ITAR controlled opportunities")
        void shouldFindItarControlled() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findItarControlled(
                PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Date-Based Queries")
    class DateBasedQueries {

        @BeforeEach
        void setUpDateData() throws InterruptedException {
            LocalDate today = LocalDate.now();
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity()
                    .withResponseDeadLine(today.plusDays(3))
                    .withPostedDate(today.minusDays(2))
                    .build()),
                opportunityRepository.save(anActiveOpportunity()
                    .withResponseDeadLine(today.plusDays(5))
                    .withPostedDate(today.minusDays(5))
                    .build()),
                opportunityRepository.save(anActiveOpportunity()
                    .withResponseDeadLine(today.plusDays(30))
                    .withPostedDate(today.minusDays(20))
                    .build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            Thread.sleep(1000);
        }

        @Test
        @DisplayName("should find opportunities closing soon")
        void shouldFindClosingSoon() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findClosingSoon(
                7, PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should find recently posted opportunities")
        void shouldFindRecentlyPosted() {
            // When
            Page<OpportunityDocument> results = elasticsearchService.findRecentlyPosted(
                7, PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Statistics")
    class Statistics {

        @BeforeEach
        void setUpStatsData() throws InterruptedException {
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity().build()),
                opportunityRepository.save(anActiveOpportunity().build()),
                opportunityRepository.save(anSbirOpportunity().build()),
                opportunityRepository.save(anSttrOpportunity().build()),
                opportunityRepository.save(aClosedOpportunity().build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            Thread.sleep(1000);
        }

        @Test
        @DisplayName("should return accurate search statistics")
        void shouldReturnSearchStats() {
            // When
            SearchStats stats = elasticsearchService.getSearchStats();

            // Then
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
    class ContractLevelFiltering {

        @BeforeEach
        void setUpContractLevelData() throws InterruptedException {
            List<Opportunity> opportunities = List.of(
                opportunityRepository.save(anActiveOpportunity()
                    .withContractLevel(ContractLevel.FEDERAL).build()),
                opportunityRepository.save(aDodOpportunity().build()),
                opportunityRepository.save(aStateOpportunity().build()),
                opportunityRepository.save(aLocalOpportunity().build())
            );
            elasticsearchService.indexOpportunities(opportunities);
            Thread.sleep(1000);
        }

        @Test
        @DisplayName("should find by contract level")
        void shouldFindByContractLevel() {
            // When
            Page<OpportunityDocument> federalResults = elasticsearchService.findByContractLevel(
                ContractLevel.FEDERAL, PageRequest.of(0, 10));
            Page<OpportunityDocument> dodResults = elasticsearchService.findByContractLevel(
                ContractLevel.DOD, PageRequest.of(0, 10));
            Page<OpportunityDocument> stateResults = elasticsearchService.findByContractLevel(
                ContractLevel.STATE, PageRequest.of(0, 10));
            Page<OpportunityDocument> localResults = elasticsearchService.findByContractLevel(
                ContractLevel.LOCAL, PageRequest.of(0, 10));

            // Then
            assertThat(federalResults.getContent()).hasSize(1);
            assertThat(dodResults.getContent()).hasSize(1);
            assertThat(stateResults.getContent()).hasSize(1);
            assertThat(localResults.getContent()).hasSize(1);
        }
    }
}
