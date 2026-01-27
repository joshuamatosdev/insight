package com.samgov.ingestor.repository;

import com.samgov.ingestor.builder.OpportunityTestBuilder;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.ContractLevel;
import com.samgov.ingestor.model.Opportunity.DataSource;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.samgov.ingestor.builder.OpportunityTestBuilder.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository tests for Opportunity entity using real PostgreSQL (dev server).
 * Tests custom queries and index performance with realistic government contracting data.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class OpportunityRepositoryTest {

    @Autowired
    private OpportunityRepository opportunityRepository;

    @BeforeEach
    void setUp() {
        opportunityRepository.deleteAll();
    }

    @Nested
    @DisplayName("Basic CRUD Operations")
    class BasicCrudOperations {

        @Test
        @DisplayName("should save and retrieve opportunity by ID")
        void shouldSaveAndRetrieveById() {
            // Given
            Opportunity opportunity = anActiveOpportunity().build();

            // When
            Opportunity saved = opportunityRepository.save(opportunity);
            Optional<Opportunity> found = opportunityRepository.findById(saved.getId());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getTitle()).isEqualTo(opportunity.getTitle());
            assertThat(found.get().getStatus()).isEqualTo(OpportunityStatus.ACTIVE);
        }

        @Test
        @DisplayName("should find opportunity by solicitation number")
        void shouldFindBySolicitationNumber() {
            // Given
            String solNum = "SOL-TEST-12345";
            Opportunity opportunity = anActiveOpportunity()
                .withSolicitationNumber(solNum)
                .build();
            opportunityRepository.save(opportunity);

            // When
            Optional<Opportunity> found = opportunityRepository.findBySolicitationNumber(solNum);

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getSolicitationNumber()).isEqualTo(solNum);
        }

        @Test
        @DisplayName("should return empty when solicitation number not found")
        void shouldReturnEmptyWhenSolicitationNotFound() {
            // When
            Optional<Opportunity> found = opportunityRepository.findBySolicitationNumber("NONEXISTENT");

            // Then
            assertThat(found).isEmpty();
        }
    }

    @Nested
    @DisplayName("Filter by Status")
    class FilterByStatus {

        @Test
        @DisplayName("should find opportunities by ACTIVE status")
        void shouldFindByActiveStatus() {
            // Given
            opportunityRepository.save(anActiveOpportunity().withTitle("Active 1").build());
            opportunityRepository.save(anActiveOpportunity().withTitle("Active 2").build());
            opportunityRepository.save(aClosedOpportunity().withTitle("Closed 1").build());

            // When
            Page<Opportunity> result = opportunityRepository.findByStatus(
                OpportunityStatus.ACTIVE, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> o.getStatus() == OpportunityStatus.ACTIVE);
        }

        @Test
        @DisplayName("should find opportunities by CLOSED status")
        void shouldFindByClosedStatus() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().withTitle("Closed 1").build());
            opportunityRepository.save(aClosedOpportunity().withTitle("Closed 2").build());

            // When
            Page<Opportunity> result = opportunityRepository.findByStatus(
                OpportunityStatus.CLOSED, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> o.getStatus() == OpportunityStatus.CLOSED);
        }
    }

    @Nested
    @DisplayName("Filter by NAICS Code")
    class FilterByNaicsCode {

        @Test
        @DisplayName("should find opportunities by exact NAICS code")
        void shouldFindByNaicsCode() {
            // Given
            String targetNaics = "541511"; // Custom Computer Programming
            opportunityRepository.save(anActiveOpportunity().withNaicsCode(targetNaics).build());
            opportunityRepository.save(anActiveOpportunity().withNaicsCode(targetNaics).build());
            opportunityRepository.save(anActiveOpportunity().withNaicsCode("541512").build()); // Different NAICS

            // When
            Page<Opportunity> result = opportunityRepository.findByNaicsCode(
                targetNaics, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> targetNaics.equals(o.getNaicsCode()));
        }

        @Test
        @DisplayName("should return empty page when NAICS code not found")
        void shouldReturnEmptyWhenNaicsNotFound() {
            // Given
            opportunityRepository.save(anActiveOpportunity().withNaicsCode("541511").build());

            // When
            Page<Opportunity> result = opportunityRepository.findByNaicsCode(
                "999999", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Filter by Agency")
    class FilterByAgency {

        @Test
        @DisplayName("should find opportunities by agency containing text (case insensitive)")
        void shouldFindByAgencyContaining() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("DEPARTMENT OF DEFENSE - NAVY").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Energy").build());

            // When
            Page<Opportunity> result = opportunityRepository.findByAgencyContainingIgnoreCase(
                "defense", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o ->
                o.getAgency().toLowerCase().contains("defense"));
        }

        @Test
        @DisplayName("should return empty when agency not found")
        void shouldReturnEmptyWhenAgencyNotFound() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense").build());

            // When
            Page<Opportunity> result = opportunityRepository.findByAgencyContainingIgnoreCase(
                "NASA", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Filter by Set-Aside Type")
    class FilterBySetAsideType {

        @Test
        @DisplayName("should find opportunities by set-aside type")
        void shouldFindBySetAsideType() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("8(a)").build());

            // When
            Page<Opportunity> result = opportunityRepository.findBySetAsideType(
                "SBA", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> "SBA".equals(o.getSetAsideType()));
        }
    }

    @Nested
    @DisplayName("SBIR/STTR Queries")
    class SbirSttrQueries {

        @Test
        @DisplayName("should find all SBIR opportunities")
        void shouldFindSbirOpportunities() {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            // When
            Page<Opportunity> result = opportunityRepository.findByIsSbirTrue(PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> Boolean.TRUE.equals(o.getIsSbir()));
        }

        @Test
        @DisplayName("should find all STTR opportunities")
        void shouldFindSttrOpportunities() {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());

            // When
            Page<Opportunity> result = opportunityRepository.findByIsSttrTrue(PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> Boolean.TRUE.equals(o.getIsSttr()));
        }

        @Test
        @DisplayName("should find all SBIR or STTR opportunities")
        void shouldFindAllSbirSttr() {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            // When
            Page<Opportunity> result = opportunityRepository.findAllSbirSttr(PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o ->
                Boolean.TRUE.equals(o.getIsSbir()) || Boolean.TRUE.equals(o.getIsSttr()));
        }

        @Test
        @DisplayName("should find SBIR/STTR by phase")
        void shouldFindSbirSttrByPhase() {
            // Given
            opportunityRepository.save(anSbirOpportunity().withSbirPhase("Phase I").build());
            opportunityRepository.save(anSbirOpportunity().withSbirPhase("Phase II").build());
            opportunityRepository.save(anSttrOpportunity().withSbirPhase("Phase I").build());

            // When
            Page<Opportunity> result = opportunityRepository.findSbirSttrByPhase(
                "Phase I", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> "Phase I".equals(o.getSbirPhase()));
        }
    }

    @Nested
    @DisplayName("Date Range Queries")
    class DateRangeQueries {

        @Test
        @DisplayName("should find opportunities closing soon")
        void shouldFindClosingSoon() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anOpportunityClosingSoon()
                .withResponseDeadLine(today.plusDays(2)).build());
            opportunityRepository.save(anOpportunityClosingSoon()
                .withResponseDeadLine(today.plusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(30)).build());
            opportunityRepository.save(aClosedOpportunity()
                .withResponseDeadLine(today.minusDays(5)).build());

            // When
            List<Opportunity> result = opportunityRepository.findClosingSoon(today, today.plusDays(7));

            // Then
            assertThat(result).hasSize(2);
            assertThat(result).allMatch(o ->
                o.getResponseDeadLine() != null &&
                !o.getResponseDeadLine().isBefore(today) &&
                !o.getResponseDeadLine().isAfter(today.plusDays(7)));
        }

        @Test
        @DisplayName("should find recently posted opportunities")
        void shouldFindRecentlyPosted() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(2)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(30)).build());

            // When
            Page<Opportunity> result = opportunityRepository.findRecentlyPosted(
                today.minusDays(7), PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o ->
                o.getPostedDate() != null &&
                !o.getPostedDate().isBefore(today.minusDays(7)));
        }
    }

    @Nested
    @DisplayName("Keyword Search")
    class KeywordSearch {

        @Test
        @DisplayName("should search by keyword in title")
        void shouldSearchByKeywordInTitle() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment Services").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Infrastructure Support").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Advanced Cyber Defense Systems").build());

            // When
            Page<Opportunity> result = opportunityRepository.searchByKeyword(
                "cyber", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should search by keyword in description")
        void shouldSearchByKeywordInDescription() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Services")
                .withDescription("Requires cloud migration expertise").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Support Services")
                .withDescription("General IT support").build());

            // When
            Page<Opportunity> result = opportunityRepository.searchByKeyword(
                "cloud", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should search case-insensitively")
        void shouldSearchCaseInsensitively() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("MACHINE LEARNING PROJECT").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Machine Learning Initiative").build());

            // When
            Page<Opportunity> result = opportunityRepository.searchByKeyword(
                "Machine Learning", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Full Text Search")
    class FullTextSearch {

        @Test
        @DisplayName("should search across multiple fields")
        void shouldSearchAcrossMultipleFields() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Standard IT Services")
                .withAgency("NASA")
                .withDescription("General support").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("NASA Space Technology Project")
                .withAgency("Department of Energy")
                .withDescription("Space research").build());

            // When
            Page<Opportunity> result = opportunityRepository.fullTextSearch(
                "NASA", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should find by solicitation number in full text search")
        void shouldFindBySolicitationNumberInFullTextSearch() {
            // Given
            String solNum = "SOL-UNIQUE-789";
            opportunityRepository.save(anActiveOpportunity()
                .withSolicitationNumber(solNum).build());
            opportunityRepository.save(anActiveOpportunity()
                .withSolicitationNumber("SOL-OTHER-123").build());

            // When
            Page<Opportunity> result = opportunityRepository.fullTextSearch(
                "UNIQUE-789", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getSolicitationNumber()).isEqualTo(solNum);
        }
    }

    @Nested
    @DisplayName("Contract Level Queries")
    class ContractLevelQueries {

        @Test
        @DisplayName("should find opportunities by contract level")
        void shouldFindByContractLevel() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withContractLevel(ContractLevel.FEDERAL).build());
            opportunityRepository.save(aDodOpportunity().build());
            opportunityRepository.save(aStateOpportunity().build());

            // When
            Page<Opportunity> federalResult = opportunityRepository.findByContractLevel(
                ContractLevel.FEDERAL, PageRequest.of(0, 10));
            Page<Opportunity> dodResult = opportunityRepository.findByContractLevel(
                ContractLevel.DOD, PageRequest.of(0, 10));
            Page<Opportunity> stateResult = opportunityRepository.findByContractLevel(
                ContractLevel.STATE, PageRequest.of(0, 10));

            // Then
            assertThat(federalResult.getContent()).hasSize(1);
            assertThat(dodResult.getContent()).hasSize(1);
            assertThat(stateResult.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should find DoD opportunities by level or flag")
        void shouldFindDodOpportunities() {
            // Given
            opportunityRepository.save(aDodOpportunity().build());
            opportunityRepository.save(anActiveOpportunity()
                .withContractLevel(ContractLevel.FEDERAL)
                .withIsDod(true).build()); // Federal but DoD flag
            opportunityRepository.save(anActiveOpportunity()
                .withContractLevel(ContractLevel.FEDERAL)
                .withIsDod(false).build());

            // When
            Page<Opportunity> result = opportunityRepository.findByContractLevelOrIsDodTrue(
                ContractLevel.DOD, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("State and Local Queries")
    class StateAndLocalQueries {

        @Test
        @DisplayName("should find opportunities by place of performance state")
        void shouldFindByState() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("CA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("CA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("TX").build());

            // When
            Page<Opportunity> result = opportunityRepository.findByPlaceOfPerformanceState(
                "CA", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should find opportunities by state agency")
        void shouldFindByStateAgency() {
            // Given
            opportunityRepository.save(aStateOpportunity()
                .withStateAgency("California Department of Technology").build());
            opportunityRepository.save(aStateOpportunity()
                .withStateAgency("California Department of Transportation").build());
            opportunityRepository.save(aStateOpportunity()
                .withStateAgency("Texas Department of IT").build());

            // When
            Page<Opportunity> result = opportunityRepository.findByStateAgencyContainingIgnoreCase(
                "California", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should find opportunities by local entity")
        void shouldFindByLocalEntity() {
            // Given
            opportunityRepository.save(aLocalOpportunity()
                .withLocalEntity("City of Los Angeles").build());
            opportunityRepository.save(aLocalOpportunity()
                .withLocalEntity("County of Los Angeles").build());
            opportunityRepository.save(aLocalOpportunity()
                .withLocalEntity("City of San Francisco").build());

            // When
            Page<Opportunity> result = opportunityRepository.findByLocalEntityContainingIgnoreCase(
                "los angeles", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Security Classification Queries")
    class SecurityClassificationQueries {

        @Test
        @DisplayName("should find opportunities requiring clearance")
        void shouldFindClearanceRequired() {
            // Given
            opportunityRepository.save(aDodOpportunity()
                .withClearanceRequired("Secret").build());
            opportunityRepository.save(aDodOpportunity()
                .withClearanceRequired("Top Secret").build());
            opportunityRepository.save(anActiveOpportunity()
                .withClearanceRequired(null).build());

            // When
            Page<Opportunity> result = opportunityRepository.findByClearanceRequiredIsNotNull(
                PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should find ITAR controlled opportunities")
        void shouldFindItarControlled() {
            // Given
            opportunityRepository.save(aDodOpportunity()
                .withItarControlled(true).build());
            opportunityRepository.save(aDodOpportunity()
                .withItarControlled(false).build());

            // When
            Page<Opportunity> result = opportunityRepository.findByItarControlledTrue(
                PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should find CUI required opportunities")
        void shouldFindCuiRequired() {
            // Given
            opportunityRepository.save(aDodOpportunity()
                .withCuiRequired(true).build());
            opportunityRepository.save(aDodOpportunity()
                .withCuiRequired(false).build());

            // When
            Page<Opportunity> result = opportunityRepository.findByCuiRequiredTrue(
                PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Distinct Value Queries")
    class DistinctValueQueries {

        @Test
        @DisplayName("should get distinct agencies")
        void shouldGetDistinctAgencies() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("NASA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency(null).build());

            // When
            List<String> agencies = opportunityRepository.findDistinctAgencies();

            // Then
            assertThat(agencies).hasSize(2);
            assertThat(agencies).contains("Department of Defense", "NASA");
        }

        @Test
        @DisplayName("should get distinct set-aside types")
        void shouldGetDistinctSetAsideTypes() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("8(a)").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());

            // When
            List<String> types = opportunityRepository.findDistinctSetAsideTypes();

            // Then
            assertThat(types).hasSize(2);
        }

        @Test
        @DisplayName("should get distinct NAICS codes")
        void shouldGetDistinctNaicsCodes() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541512").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());

            // When
            List<String> codes = opportunityRepository.findDistinctNaicsCodes();

            // Then
            assertThat(codes).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Count Queries")
    class CountQueries {

        @Test
        @DisplayName("should count active opportunities")
        void shouldCountActiveOpportunities() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(10)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.minusDays(5)).build()); // Past deadline

            // When
            long count = opportunityRepository.countActiveOpportunities(today);

            // Then
            assertThat(count).isEqualTo(2);
        }

        @Test
        @DisplayName("should count by status")
        void shouldCountByStatus() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            // When
            long activeCount = opportunityRepository.countByStatus(OpportunityStatus.ACTIVE);
            long closedCount = opportunityRepository.countByStatus(OpportunityStatus.CLOSED);

            // Then
            assertThat(activeCount).isEqualTo(2);
            assertThat(closedCount).isEqualTo(1);
        }

        @Test
        @DisplayName("should count SBIR and STTR opportunities")
        void shouldCountSbirSttr() {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());

            // When
            long sbirCount = opportunityRepository.countByIsSbirTrue();
            long sttrCount = opportunityRepository.countByIsSttrTrue();

            // Then
            assertThat(sbirCount).isEqualTo(2);
            assertThat(sttrCount).isEqualTo(1);
        }

        @Test
        @DisplayName("should count by NAICS code")
        void shouldCountByNaicsCode() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541512").build());

            // When
            long count = opportunityRepository.countByNaicsCode("541511");

            // Then
            assertThat(count).isEqualTo(2);
        }

        @Test
        @DisplayName("should count by contract level")
        void shouldCountByContractLevel() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withContractLevel(ContractLevel.FEDERAL).build());
            opportunityRepository.save(aDodOpportunity().build());
            opportunityRepository.save(aStateOpportunity().build());

            // When
            long federalCount = opportunityRepository.countByContractLevel(ContractLevel.FEDERAL);
            long dodCount = opportunityRepository.countByContractLevel(ContractLevel.DOD);
            long stateCount = opportunityRepository.countByContractLevel(ContractLevel.STATE);

            // Then
            assertThat(federalCount).isEqualTo(1);
            assertThat(dodCount).isEqualTo(1);
            assertThat(stateCount).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Pagination and Sorting")
    class PaginationAndSorting {

        @Test
        @DisplayName("should paginate results correctly")
        void shouldPaginateCorrectly() {
            // Given - Create 15 opportunities
            for (int i = 0; i < 15; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity " + i).build());
            }

            // When
            Page<Opportunity> page0 = opportunityRepository.findByStatus(
                OpportunityStatus.ACTIVE, PageRequest.of(0, 5));
            Page<Opportunity> page1 = opportunityRepository.findByStatus(
                OpportunityStatus.ACTIVE, PageRequest.of(1, 5));
            Page<Opportunity> page2 = opportunityRepository.findByStatus(
                OpportunityStatus.ACTIVE, PageRequest.of(2, 5));

            // Then
            assertThat(page0.getContent()).hasSize(5);
            assertThat(page0.getTotalElements()).isEqualTo(15);
            assertThat(page0.getTotalPages()).isEqualTo(3);
            assertThat(page0.isFirst()).isTrue();
            assertThat(page0.hasNext()).isTrue();

            assertThat(page1.getContent()).hasSize(5);
            assertThat(page1.hasNext()).isTrue();
            assertThat(page1.hasPrevious()).isTrue();

            assertThat(page2.getContent()).hasSize(5);
            assertThat(page2.isLast()).isTrue();
            assertThat(page2.hasNext()).isFalse();
        }

        @Test
        @DisplayName("should return empty page when page number exceeds total")
        void shouldReturnEmptyPageWhenExceedingTotal() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            // When
            Page<Opportunity> result = opportunityRepository.findByStatus(
                OpportunityStatus.ACTIVE, PageRequest.of(10, 5));

            // Then
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("should sort by response deadline ascending")
        void shouldSortByDeadlineAscending() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Far deadline")
                .withResponseDeadLine(today.plusDays(30)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Near deadline")
                .withResponseDeadLine(today.plusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Medium deadline")
                .withResponseDeadLine(today.plusDays(15)).build());

            // When
            Page<Opportunity> result = opportunityRepository.findByStatus(
                OpportunityStatus.ACTIVE,
                PageRequest.of(0, 10, Sort.by("responseDeadLine").ascending()));

            // Then
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getContent().get(0).getTitle()).isEqualTo("Near deadline");
            assertThat(result.getContent().get(1).getTitle()).isEqualTo("Medium deadline");
            assertThat(result.getContent().get(2).getTitle()).isEqualTo("Far deadline");
        }

        @Test
        @DisplayName("should sort by posted date descending")
        void shouldSortByPostedDateDescending() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Old")
                .withPostedDate(today.minusDays(30)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("New")
                .withPostedDate(today.minusDays(1)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Medium")
                .withPostedDate(today.minusDays(15)).build());

            // When
            Page<Opportunity> result = opportunityRepository.findByStatus(
                OpportunityStatus.ACTIVE,
                PageRequest.of(0, 10, Sort.by("postedDate").descending()));

            // Then
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getContent().get(0).getTitle()).isEqualTo("New");
            assertThat(result.getContent().get(1).getTitle()).isEqualTo("Medium");
            assertThat(result.getContent().get(2).getTitle()).isEqualTo("Old");
        }
    }

    @Nested
    @DisplayName("Data Source Queries")
    class DataSourceQueries {

        @Test
        @DisplayName("should find opportunities by data source")
        void shouldFindByDataSource() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withDataSource(DataSource.SAM_GOV).build());
            opportunityRepository.save(anSbirOpportunity()
                .withDataSource(DataSource.SBIR_GOV).build());
            opportunityRepository.save(aStateOpportunity()
                .withDataSource(DataSource.STATE_PORTAL).build());

            // When
            Page<Opportunity> samResult = opportunityRepository.findByDataSource(
                DataSource.SAM_GOV, PageRequest.of(0, 10));
            Page<Opportunity> sbirResult = opportunityRepository.findByDataSource(
                DataSource.SBIR_GOV, PageRequest.of(0, 10));

            // Then
            assertThat(samResult.getContent()).hasSize(1);
            assertThat(sbirResult.getContent()).hasSize(1);
        }
    }
}
