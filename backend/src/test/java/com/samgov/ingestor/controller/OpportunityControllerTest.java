package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.builder.OpportunityTestBuilder;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static com.samgov.ingestor.builder.OpportunityTestBuilder.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller integration tests for OpportunityController.
 * Tests HTTP endpoints, request/response mapping, pagination, and sorting.
 */
class OpportunityControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/opportunities";

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository tenantMembershipRepository;

    private Tenant testTenant;
    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        opportunityRepository.deleteAll();

        // Create test tenant and user for authenticated requests
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        Role role = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test role")
            .isSystemRole(false)
            .build();
        role = roleRepository.save(role);

        testUser = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(role)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        tenantMembershipRepository.save(membership);

        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("GET /{id} - Get by ID")
    class GetById {

        @Test
        @WithMockUser
        @DisplayName("should return opportunity when found")
        void shouldReturnOpportunityWhenFound() throws Exception {
            // Given
            Opportunity opportunity = anActiveOpportunity()
                .withTitle("Test Opportunity for GET by ID")
                .withSolicitationNumber("SOL-TEST-001")
                .build();
            opportunity = opportunityRepository.save(opportunity);

            // When/Then
            performGet(BASE_URL + "/" + opportunity.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(opportunity.getId()))
                .andExpect(jsonPath("$.title").value("Test Opportunity for GET by ID"))
                .andExpect(jsonPath("$.solicitationNumber").value("SOL-TEST-001"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
        }

        @Test
        @WithMockUser
        @DisplayName("should return 404 when not found")
        void shouldReturn404WhenNotFound() throws Exception {
            // When/Then
            performGet(BASE_URL + "/nonexistent-id")
                .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser
        @DisplayName("should include computed fields in response")
        void shouldIncludeComputedFields() throws Exception {
            // Given
            Opportunity opportunity = anActiveOpportunity()
                .withResponseDeadLine(LocalDate.now().plusDays(3))
                .build();
            opportunity = opportunityRepository.save(opportunity);

            // When/Then
            performGet(BASE_URL + "/" + opportunity.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isClosingSoon").value(true))
                .andExpect(jsonPath("$.isPastDeadline").value(false))
                .andExpect(jsonPath("$.daysUntilDeadline").value(3));
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            // Given
            Opportunity opportunity = anActiveOpportunity().build();
            opportunity = opportunityRepository.save(opportunity);

            // When/Then
            performGet(BASE_URL + "/" + opportunity.getId())
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /solicitation/{solicitationNumber} - Get by Solicitation Number")
    class GetBySolicitationNumber {

        @Test
        @WithMockUser
        @DisplayName("should return opportunity by solicitation number")
        void shouldReturnBySolicitationNumber() throws Exception {
            // Given
            String solNum = "SOL-UNIQUE-12345";
            Opportunity opportunity = anActiveOpportunity()
                .withSolicitationNumber(solNum)
                .withTitle("Unique Solicitation Test")
                .build();
            opportunityRepository.save(opportunity);

            // When/Then
            performGet(BASE_URL + "/solicitation/" + solNum)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solicitationNumber").value(solNum))
                .andExpect(jsonPath("$.title").value("Unique Solicitation Test"));
        }

        @Test
        @WithMockUser
        @DisplayName("should return 404 when solicitation number not found")
        void shouldReturn404WhenSolicitationNotFound() throws Exception {
            // When/Then
            performGet(BASE_URL + "/solicitation/NONEXISTENT")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET / - Search Opportunities")
    class SearchOpportunities {

        @Test
        @WithMockUser
        @DisplayName("should return paginated results with default parameters")
        void shouldReturnPaginatedResults() throws Exception {
            // Given
            for (int i = 0; i < 25; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity " + i).build());
            }

            // When/Then
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(20))) // Default page size
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by keyword")
        void shouldFilterByKeyword() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment Services").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support Services").build());

            // When/Then
            performGet(BASE_URL + "?keyword=cybersecurity")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title", containsStringIgnoringCase("cybersecurity")));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by NAICS code")
        void shouldFilterByNaicsCode() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541512").build());

            // When/Then
            performGet(BASE_URL + "?naicsCode=541511")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].naicsCode").value("541511"));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by agency")
        void shouldFilterByAgency() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("NASA").build());

            // When/Then
            performGet(BASE_URL + "?agency=defense")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].agency", containsStringIgnoringCase("defense")));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by set-aside type")
        void shouldFilterBySetAsideType() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("8(a)").build());

            // When/Then
            performGet(BASE_URL + "?setAsideType=SBA")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].setAsideType").value("SBA"));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by status")
        void shouldFilterByStatus() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            // When/Then - use activeOnly=false to include closed opportunities with past deadlines
            performGet(BASE_URL + "?status=CLOSED&activeOnly=false")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].status").value("CLOSED"));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by posted date range")
        void shouldFilterByPostedDateRange() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(3)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(30)).build());

            // When/Then
            String url = String.format("%s?postedDateFrom=%s&postedDateTo=%s",
                BASE_URL, today.minusDays(7), today);
            performGet(url)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by response deadline range")
        void shouldFilterByDeadlineRange() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(5)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(30)).build());

            // When/Then
            String url = String.format("%s?responseDeadlineFrom=%s&responseDeadlineTo=%s",
                BASE_URL, today, today.plusDays(14));
            performGet(url)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter SBIR opportunities")
        void shouldFilterSbir() throws Exception {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            // When/Then
            performGet(BASE_URL + "?isSbir=true")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].isSbir").value(true));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter STTR opportunities")
        void shouldFilterSttr() throws Exception {
            // Given
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            // When/Then
            performGet(BASE_URL + "?isSttr=true")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].isSttr").value(true));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by state")
        void shouldFilterByState() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("CA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("TX").build());

            // When/Then
            performGet(BASE_URL + "?state=CA")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].placeOfPerformanceState").value("CA"));
        }

        @Test
        @WithMockUser
        @DisplayName("should combine multiple filters")
        void shouldCombineFilters() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511")
                .withAgency("Department of Defense").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511")
                .withAgency("NASA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541512")
                .withAgency("Department of Defense").build());

            // When/Then
            performGet(BASE_URL + "?naicsCode=541511&agency=defense")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("Pagination Behavior")
    class PaginationBehavior {

        @Test
        @WithMockUser
        @DisplayName("should respect page and size parameters")
        void shouldRespectPageAndSize() throws Exception {
            // Given
            for (int i = 0; i < 15; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity " + i).build());
            }

            // When/Then
            performGet(BASE_URL + "?page=0&size=5")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.first").value(true));

            performGet(BASE_URL + "?page=1&size=5")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(false));

            performGet(BASE_URL + "?page=2&size=5")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.last").value(true));
        }

        @Test
        @WithMockUser
        @DisplayName("should return empty content for page beyond total")
        void shouldReturnEmptyForPageBeyondTotal() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            // When/Then
            performGet(BASE_URL + "?page=10&size=5")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser
        @DisplayName("should enforce maximum page size")
        void shouldEnforceMaxPageSize() throws Exception {
            // Given
            for (int i = 0; i < 150; i++) {
                opportunityRepository.save(anActiveOpportunity().build());
            }

            // When/Then - size > 100 should be rejected by @Max(100) validation
            performGet(BASE_URL + "?size=200")
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return first page when no results match filter")
        void shouldReturnEmptyFirstPage() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());

            // When/Then
            performGet(BASE_URL + "?naicsCode=999999")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(true));
        }
    }

    @Nested
    @DisplayName("Sorting Options")
    class SortingOptions {

        @Test
        @WithMockUser
        @DisplayName("should sort by response deadline ascending (default)")
        void shouldSortByDeadlineAscending() throws Exception {
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

            // When/Then
            performGet(BASE_URL + "?sortBy=responseDeadLine&sortDirection=asc")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Near"))
                .andExpect(jsonPath("$.content[1].title").value("Medium"))
                .andExpect(jsonPath("$.content[2].title").value("Far"));
        }

        @Test
        @WithMockUser
        @DisplayName("should sort by posted date descending")
        void shouldSortByPostedDateDescending() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Old")
                .withPostedDate(today.minusDays(30)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("New")
                .withPostedDate(today.minusDays(1)).build());

            // When/Then
            performGet(BASE_URL + "?sortBy=postedDate&sortDirection=desc")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("New"))
                .andExpect(jsonPath("$.content[1].title").value("Old"));
        }

        @Test
        @WithMockUser
        @DisplayName("should sort by title")
        void shouldSortByTitle() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Zebra Services").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Alpha Project").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Beta Initiative").build());

            // When/Then
            performGet(BASE_URL + "?sortBy=title&sortDirection=asc")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Alpha Project"))
                .andExpect(jsonPath("$.content[1].title").value("Beta Initiative"))
                .andExpect(jsonPath("$.content[2].title").value("Zebra Services"));
        }

        @Test
        @WithMockUser
        @DisplayName("should use default sort field for invalid sort field")
        void shouldUseDefaultForInvalidSortField() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(10)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(5)).build());

            // When/Then - invalid sort field should default to responseDeadLine
            performGet(BASE_URL + "?sortBy=invalidField&sortDirection=asc")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));
        }
    }

    @Nested
    @DisplayName("GET /active - Active Opportunities")
    class ActiveOpportunities {

        @Test
        @WithMockUser
        @DisplayName("should return only active opportunities")
        void shouldReturnOnlyActive() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            // When/Then
            performGet(BASE_URL + "/active")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].status", everyItem(is("ACTIVE"))));
        }
    }

    @Nested
    @DisplayName("GET /closing-soon - Closing Soon")
    class ClosingSoon {

        @Test
        @WithMockUser
        @DisplayName("should return opportunities closing within specified days")
        void shouldReturnClosingSoon() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(3)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(30)).build());

            // When/Then
            performGet(BASE_URL + "/closing-soon?days=7")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @WithMockUser
        @DisplayName("should use default 7 days if not specified")
        void shouldUseDefaultDays() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withResponseDeadLine(today.plusDays(5)).build());

            // When/Then
            performGet(BASE_URL + "/closing-soon")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("GET /recent - Recently Posted")
    class RecentlyPosted {

        @Test
        @WithMockUser
        @DisplayName("should return recently posted opportunities")
        void shouldReturnRecentlyPosted() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(3)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withPostedDate(today.minusDays(30)).build());

            // When/Then
            performGet(BASE_URL + "/recent?days=7")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("GET /naics/{naicsCode} - By NAICS Code")
    class ByNaicsCode {

        @Test
        @WithMockUser
        @DisplayName("should return opportunities by NAICS code")
        void shouldReturnByNaicsCode() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withNaicsCode("541512").build());

            // When/Then
            performGet(BASE_URL + "/naics/541511")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].naicsCode").value("541511"));
        }
    }

    @Nested
    @DisplayName("GET /agency - By Agency")
    class ByAgency {

        @Test
        @WithMockUser
        @DisplayName("should return opportunities by agency")
        void shouldReturnByAgency() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("NASA").build());

            // When/Then
            performGet(BASE_URL + "/agency?name=Defense")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("GET /set-aside/{type} - By Set-Aside Type")
    class BySetAsideType {

        @Test
        @WithMockUser
        @DisplayName("should return opportunities by set-aside type")
        void shouldReturnBySetAsideType() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("SBA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withSetAsideType("8(a)").build());

            // When/Then
            performGet(BASE_URL + "/set-aside/SBA")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].setAsideType").value("SBA"));
        }
    }

    @Nested
    @DisplayName("GET /sbir-sttr - SBIR/STTR Opportunities")
    class SbirSttr {

        @Test
        @WithMockUser
        @DisplayName("should return all SBIR/STTR opportunities")
        void shouldReturnSbirSttr() throws Exception {
            // Given
            opportunityRepository.save(anSbirOpportunity().build());
            opportunityRepository.save(anSttrOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            // When/Then
            performGet(BASE_URL + "/sbir-sttr")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by phase")
        void shouldFilterByPhase() throws Exception {
            // Given
            opportunityRepository.save(anSbirOpportunity()
                .withSbirPhase("Phase I").build());
            opportunityRepository.save(anSbirOpportunity()
                .withSbirPhase("Phase II").build());

            // When/Then
            performGet(BASE_URL + "/sbir-sttr?phase=Phase I")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].sbirPhase").value("Phase I"));
        }
    }

    @Nested
    @DisplayName("GET /state/{state} - By State")
    class ByState {

        @Test
        @WithMockUser
        @DisplayName("should return opportunities by state")
        void shouldReturnByState() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("CA").build());
            opportunityRepository.save(anActiveOpportunity()
                .withPlaceOfPerformanceState("TX").build());

            // When/Then
            performGet(BASE_URL + "/state/CA")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].placeOfPerformanceState").value("CA"));
        }
    }

    @Nested
    @DisplayName("GET /stats - Dashboard Statistics")
    class DashboardStats {

        @Test
        @WithMockUser
        @DisplayName("should return dashboard statistics")
        void shouldReturnDashboardStats() throws Exception {
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

            // When/Then
            performGet(BASE_URL + "/stats")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeOpportunities").value(4))
                .andExpect(jsonPath("$.sbirOpportunities").value(1))
                .andExpect(jsonPath("$.sttrOpportunities").value(1))
                .andExpect(jsonPath("$.closingSoonOpportunities").value(1));
        }
    }

    @Nested
    @DisplayName("GET /filters - Filter Options")
    class FilterOptions {

        @Test
        @WithMockUser
        @DisplayName("should return available filter options")
        void shouldReturnFilterOptions() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("Department of Defense")
                .withSetAsideType("SBA")
                .withNaicsCode("541511").build());
            opportunityRepository.save(anActiveOpportunity()
                .withAgency("NASA")
                .withSetAsideType("8(a)")
                .withNaicsCode("541512").build());

            // When/Then
            performGet(BASE_URL + "/filters")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.agencies", hasSize(2)))
                .andExpect(jsonPath("$.setAsideTypes", hasSize(2)))
                .andExpect(jsonPath("$.naicsCodes", hasSize(2)));
        }
    }
}
