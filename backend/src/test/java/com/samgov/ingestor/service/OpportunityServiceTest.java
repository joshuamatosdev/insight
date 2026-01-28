package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.builder.OpportunityTestBuilder;
import com.samgov.ingestor.dto.OpportunityDto;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.ContractLevel;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.service.OpportunityService.DashboardStats;
import com.samgov.ingestor.service.OpportunityService.FilterOptions;
import com.samgov.ingestor.service.OpportunityService.OpportunitySearchRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static com.samgov.ingestor.builder.OpportunityTestBuilder.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Service layer tests for OpportunityService.
 * Tests business logic, specification-based filtering, and data transformation.
 */
class OpportunityServiceTest extends BaseServiceTest {

    @Autowired
    private OpportunityService opportunityService;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        opportunityRepository.deleteAll();
    }

    @Nested
    @DisplayName("Get by ID")
    class GetById {

        @Test
        @DisplayName("should return opportunity DTO when found")
        void shouldReturnOpportunityWhenFound() {
            // Given
            Opportunity opportunity = anActiveOpportunity()
                .withTitle("Test Opportunity")
                .build();
            opportunity = opportunityRepository.save(opportunity);

            // When
            Optional<OpportunityDto> result = opportunityService.getById(opportunity.getId());

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().title()).isEqualTo("Test Opportunity");
            assertThat(result.get().id()).isEqualTo(opportunity.getId());
        }

        @Test
        @DisplayName("should return empty when not found")
        void shouldReturnEmptyWhenNotFound() {
            // When
            Optional<OpportunityDto> result = opportunityService.getById("nonexistent-id");

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should include computed fields in DTO")
        void shouldIncludeComputedFields() {
            // Given
            Opportunity opportunity = anActiveOpportunity()
                .withResponseDeadLine(LocalDate.now().plusDays(3))
                .build();
            opportunity = opportunityRepository.save(opportunity);

            // When
            Optional<OpportunityDto> result = opportunityService.getById(opportunity.getId());

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().isClosingSoon()).isTrue();
            assertThat(result.get().isPastDeadline()).isFalse();
            assertThat(result.get().daysUntilDeadline()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Get by Solicitation Number")
    class GetBySolicitationNumber {

        @Test
        @DisplayName("should return opportunity DTO when found by solicitation number")
        void shouldReturnWhenFoundBySolicitationNumber() {
            // Given
            String solNum = "SOL-TEST-54321";
            Opportunity opportunity = anActiveOpportunity()
                .withSolicitationNumber(solNum)
                .build();
            opportunityRepository.save(opportunity);

            // When
            Optional<OpportunityDto> result = opportunityService.getBySolicitationNumber(solNum);

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().solicitationNumber()).isEqualTo(solNum);
        }

        @Test
        @DisplayName("should return empty when solicitation number not found")
        void shouldReturnEmptyWhenSolicitationNotFound() {
            // When
            Optional<OpportunityDto> result = opportunityService.getBySolicitationNumber("NONEXISTENT");

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Search with Specification Filters")
    class SearchWithFilters {

        @Test
        @DisplayName("should filter by keyword in title and description")
        void shouldFilterByKeyword() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support")
                .withDescription("Includes cybersecurity monitoring").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Network Installation").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                "cybersecurity", null, null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by NAICS code")
        void shouldFilterByNaicsCode() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541512").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, "541511", null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> "541511".equals(o.naicsCode()));
        }

        @Test
        @DisplayName("should filter by agency (case insensitive, partial match)")
        void shouldFilterByAgency() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("DEFENSE INFORMATION SYSTEMS AGENCY").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("NASA").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, "defense", null, null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by set-aside type")
        void shouldFilterBySetAsideType() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("8(a)").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, "SBA", null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by opportunity type")
        void shouldFilterByType() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withType("o").build()); // Solicitation
            opportunityRepository.save(anActiveOpportunity()
                .withType("k").build()); // Combined synopsis/solicitation
            opportunityRepository.save(anActiveOpportunity()
                .withType("o").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, "o",
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by SBIR flag")
        void shouldFilterBySbir() {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                true, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> Boolean.TRUE.equals(o.isSbir()));
        }

        @Test
        @DisplayName("should filter by STTR flag")
        void shouldFilterBySttr() {
            // Given
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anSbirOpportunity().build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, true, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> Boolean.TRUE.equals(o.isSttr()));
        }

        @Test
        @DisplayName("should filter by SBIR or STTR combined")
        void shouldFilterBySbirOrSttr() {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, true, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by SBIR phase")
        void shouldFilterByPhase() {
            // Given
            opportunityRepository.save(anSbirOpportunity()
                .withSbirPhase("Phase I").build());
            opportunityRepository.save(anSbirOpportunity()
                .withSbirPhase("Phase II").build());
            opportunityRepository.save(anSttrOpportunity()
                .withSbirPhase("Phase I").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, "Phase I", null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by state (place of performance)")
        void shouldFilterByState() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("CA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("CA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("TX").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, null, "CA",
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by posted date range")
        void shouldFilterByPostedDateRange() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(3)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(10)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(30)).build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, null, null,
                today.minusDays(14), today,
                null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by response deadline range")
        void shouldFilterByDeadlineRange() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(10)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(30)).build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, null, null,
                null, null,
                today, today.plusDays(14),
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by status")
        void shouldFilterByStatus() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.CLOSED, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).status()).isEqualTo(OpportunityStatus.CLOSED);
        }

        @Test
        @DisplayName("should filter active only (not past deadline)")
        void shouldFilterActiveOnly() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(10)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.minusDays(5)).build()); // Past deadline but ACTIVE status

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, true
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should combine multiple filters")
        void shouldCombineMultipleFilters() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511")
                .withAgency("Department of Defense")
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511")
                .withAgency("Department of Defense")
                .withSetAsideType("8(a)").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541512")
                .withAgency("Department of Defense")
                .withSetAsideType("SBA").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, "541511", "defense", "SBA", null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should default to ACTIVE status when no status specified")
        void shouldDefaultToActiveStatus() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                null, null  // No status specified
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).status()).isEqualTo(OpportunityStatus.ACTIVE);
        }
    }

    @Nested
    @DisplayName("Keyword Search")
    class KeywordSearch {

        @Test
        @DisplayName("should search by keyword using repository method")
        void shouldSearchByKeyword() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cloud Migration Project").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support Services").build());

            // When
            Page<OpportunityDto> result = opportunityService.searchByKeyword(
                "cloud", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).title()).contains("Cloud");
        }
    }

    @Nested
    @DisplayName("Get Active Opportunities")
    class GetActiveOpportunities {

        @Test
        @DisplayName("should return only active opportunities")
        void shouldReturnOnlyActive() {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            // When
            Page<OpportunityDto> result = opportunityService.getActiveOpportunities(
                PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(o -> o.status() == OpportunityStatus.ACTIVE);
        }
    }

    @Nested
    @DisplayName("Get Closing Soon")
    class GetClosingSoon {

        @Test
        @DisplayName("should return opportunities closing within specified days")
        void shouldReturnClosingSoon() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(3)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(30)).build());

            // When
            List<OpportunityDto> result = opportunityService.getClosingSoon(7);

            // Then
            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("should not include past deadlines")
        void shouldNotIncludePastDeadlines() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(3)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.minusDays(2)).build()); // Past

            // When
            List<OpportunityDto> result = opportunityService.getClosingSoon(7);

            // Then
            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get Recently Posted")
    class GetRecentlyPosted {

        @Test
        @DisplayName("should return opportunities posted within specified days")
        void shouldReturnRecentlyPosted() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(2)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(20)).build());

            // When
            Page<OpportunityDto> result = opportunityService.getRecentlyPosted(
                7, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Get by NAICS Code")
    class GetByNaicsCode {

        @Test
        @DisplayName("should return opportunities by NAICS code")
        void shouldReturnByNaicsCode() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541512").build());

            // When
            Page<OpportunityDto> result = opportunityService.getByNaicsCode(
                "541511", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).naicsCode()).isEqualTo("541511");
        }
    }

    @Nested
    @DisplayName("Get by Agency")
    class GetByAgency {

        @Test
        @DisplayName("should return opportunities by agency (partial match)")
        void shouldReturnByAgency() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("NASA").build());

            // When
            Page<OpportunityDto> result = opportunityService.getByAgency(
                "Defense", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get by Set-Aside Type")
    class GetBySetAsideType {

        @Test
        @DisplayName("should return opportunities by set-aside type")
        void shouldReturnBySetAsideType() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("8(a)").build());

            // When
            Page<OpportunityDto> result = opportunityService.getBySetAsideType(
                "SBA", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("SBIR/STTR Queries")
    class SbirSttrQueries {

        @Test
        @DisplayName("should return all SBIR/STTR opportunities")
        void shouldReturnSbirSttr() {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            // When
            Page<OpportunityDto> result = opportunityService.getSbirSttr(PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("should return SBIR/STTR by phase")
        void shouldReturnSbirSttrByPhase() {
            // Given
            opportunityRepository.save(anSbirOpportunity()
                .withSbirPhase("Phase I").build());
            opportunityRepository.save(anSbirOpportunity()
                .withSbirPhase("Phase II").build());

            // When
            Page<OpportunityDto> result = opportunityService.getSbirSttrByPhase(
                "Phase I", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get by State")
    class GetByState {

        @Test
        @DisplayName("should return opportunities by place of performance state")
        void shouldReturnByState() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("CA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("TX").build());

            // When
            Page<OpportunityDto> result = opportunityService.getByState(
                "CA", PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Contract Level Queries")
    class ContractLevelQueries {

        @Test
        @DisplayName("should return opportunities by contract level")
        void shouldReturnByContractLevel() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withContractLevel(ContractLevel.FEDERAL).build());
            opportunityRepository.save(aDodOpportunity().build());
            opportunityRepository.save(aStateOpportunity().build());

            // When
            Page<OpportunityDto> federalResult = opportunityService.getByContractLevel(
                ContractLevel.FEDERAL, PageRequest.of(0, 10));
            Page<OpportunityDto> dodResult = opportunityService.getDodOpportunities(
                PageRequest.of(0, 10));
            Page<OpportunityDto> stateResult = opportunityService.getStateOpportunities(
                PageRequest.of(0, 10));

            // Then
            assertThat(federalResult.getContent()).hasSize(1);
            assertThat(dodResult.getContent()).hasSize(1);
            assertThat(stateResult.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should return federal opportunities")
        void shouldReturnFederalOpportunities() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withContractLevel(ContractLevel.FEDERAL).build());
            opportunityRepository.save(aStateOpportunity().build());

            // When
            Page<OpportunityDto> result = opportunityService.getFederalOpportunities(
                PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should return local opportunities")
        void shouldReturnLocalOpportunities() {
            // Given
            opportunityRepository.save(aLocalOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            // When
            Page<OpportunityDto> result = opportunityService.getLocalOpportunities(
                PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Security Classification Queries")
    class SecurityClassificationQueries {

        @Test
        @DisplayName("should return clearance required opportunities")
        void shouldReturnClearanceRequired() {
            // Given
            opportunityRepository.save(aDodOpportunity()
                .withClearanceRequired("Secret").build());
            opportunityRepository.save(anActiveOpportunity()
                .withClearanceRequired(null).build());

            // When
            Page<OpportunityDto> result = opportunityService.getClearanceRequiredOpportunities(
                PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("should return ITAR controlled opportunities")
        void shouldReturnItarControlled() {
            // Given
            opportunityRepository.save(aDodOpportunity()
                .withItarControlled(true).build());
            opportunityRepository.save(aDodOpportunity()
                .withItarControlled(false).build());

            // When
            Page<OpportunityDto> result = opportunityService.getItarControlledOpportunities(
                PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Dashboard Stats")
    class DashboardStatsTests {

        @Test
        @DisplayName("should return accurate dashboard statistics")
        void shouldReturnDashboardStats() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(10)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(3)).build()); // Closing soon
            opportunityRepository.save(anSbirOpportunity()
                .withResponseDeadLine(today.plusDays(20)).build());
            opportunityRepository.save(anSttrOpportunity()
                .withResponseDeadLine(today.plusDays(15)).build());
            opportunityRepository.save(aClosedOpportunity().build());

            // When
            DashboardStats stats = opportunityService.getDashboardStats();

            // Then
            assertThat(stats.activeOpportunities()).isEqualTo(4);
            assertThat(stats.sbirOpportunities()).isEqualTo(1);
            assertThat(stats.sttrOpportunities()).isEqualTo(1);
            assertThat(stats.closingSoonOpportunities()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Filter Options")
    class FilterOptionsTests {

        @Test
        @DisplayName("should return distinct filter options")
        void shouldReturnFilterOptions() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense")
                .withSetAsideType("SBA")
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("NASA")
                .withSetAsideType("8(a)")
                .withNaicsCode("541512").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense")
                .withSetAsideType("SBA")
                .withNaicsCode("541511").build());

            // When
            FilterOptions options = opportunityService.getFilterOptions();

            // Then
            assertThat(options.agencies()).hasSize(2);
            assertThat(options.setAsideTypes()).hasSize(2);
            assertThat(options.naicsCodes()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Pagination")
    class Pagination {

        @Test
        @DisplayName("should paginate search results correctly")
        void shouldPaginateCorrectly() {
            // Given - Create 15 opportunities
            for (int i = 0; i < 15; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity " + i).build());
            }

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> page0 = opportunityService.search(
                request, PageRequest.of(0, 5));
            Page<OpportunityDto> page1 = opportunityService.search(
                request, PageRequest.of(1, 5));

            // Then
            assertThat(page0.getContent()).hasSize(5);
            assertThat(page0.getTotalElements()).isEqualTo(15);
            assertThat(page0.getTotalPages()).isEqualTo(3);
            assertThat(page0.isFirst()).isTrue();

            assertThat(page1.getContent()).hasSize(5);
            assertThat(page1.hasPrevious()).isTrue();
            assertThat(page1.hasNext()).isTrue();
        }

        @Test
        @DisplayName("should return empty page when no results match filters")
        void shouldReturnEmptyPage() {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, "999999", null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }
    }

    @Nested
    @DisplayName("Sorting")
    class Sorting {

        @Test
        @DisplayName("should sort by deadline ascending")
        void shouldSortByDeadline() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Far")
                .withResponseDeadLine(today.plusDays(30)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Near")
                .withResponseDeadLine(today.plusDays(5)).build());

            OpportunitySearchRequest request = new OpportunitySearchRequest(
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                OpportunityStatus.ACTIVE, null
            );

            // When
            Page<OpportunityDto> result = opportunityService.search(
                request, PageRequest.of(0, 10, Sort.by("responseDeadLine").ascending()));

            // Then
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent().get(0).title()).isEqualTo("Near");
            assertThat(result.getContent().get(1).title()).isEqualTo("Far");
        }
    }

    @Nested
    @DisplayName("Maintenance Operations")
    class MaintenanceOperations {

        @Test
        @DisplayName("should update expired opportunities to CLOSED status")
        void shouldUpdateExpiredOpportunities() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.minusDays(5)).build()); // Expired
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.minusDays(2)).build()); // Expired
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(10)).build()); // Still active

            // When
            int updated = opportunityService.updateExpiredOpportunities();

            // Then
            assertThat(updated).isEqualTo(2);
            long activeCount = opportunityRepository.countByStatus(OpportunityStatus.ACTIVE);
            long closedCount = opportunityRepository.countByStatus(OpportunityStatus.CLOSED);
            assertThat(activeCount).isEqualTo(1);
            assertThat(closedCount).isEqualTo(2);
        }

        @Test
        @DisplayName("should archive old closed opportunities")
        void shouldArchiveOldOpportunities() {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(aClosedOpportunity()
                .withResponseDeadLine(today.minusDays(100)).build()); // Old closed
            opportunityRepository.save(aClosedOpportunity()
                .withResponseDeadLine(today.minusDays(95)).build()); // Old closed
            opportunityRepository.save(aClosedOpportunity()
                .withResponseDeadLine(today.minusDays(30)).build()); // Recent closed

            // When
            int archived = opportunityService.archiveOldOpportunities(90);

            // Then
            assertThat(archived).isEqualTo(2);
            long archivedCount = opportunityRepository.countByStatus(OpportunityStatus.ARCHIVED);
            assertThat(archivedCount).isEqualTo(2);
        }
    }
}
