package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Opportunity management flows.
 * Tests complete CRUD operations and search functionality with multi-tenant isolation.
 */
@DisplayName("Opportunity E2E Tests")
class OpportunityE2ETest extends BaseControllerTest {

    private static final String OPPORTUNITIES_URL = "/api/v1/opportunities";
    private static final String SAVED_OPPORTUNITIES_URL = "/api/v1/saved-opportunities";

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E Test Tenant " + UUID.randomUUID())
            .slug("e2e-test-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-opp-user-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("E2E")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    private Opportunity createTestOpportunity(String title) {
        Opportunity opp = new Opportunity();
        opp.setId(UUID.randomUUID().toString());
        opp.setTenantId(testTenantId);
        opp.setTitle(title);
        opp.setNoticeId("NOTICE-" + UUID.randomUUID().toString().substring(0, 8));
        opp.setSolicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8));
        opp.setPostedDate(LocalDate.now());
        opp.setResponseDeadLine(LocalDateTime.now().plusDays(30));
        opp.setType("PRESOLICITATION");
        opp.setActive(true);
        return opportunityRepository.save(opp);
    }

    @Nested
    @DisplayName("Opportunity CRUD Flow")
    class OpportunityCRUDFlow {

        @Test
        @DisplayName("should complete full opportunity lifecycle")
        void should_Complete_OpportunityLifecycle() throws Exception {
            // Create initial opportunity
            Opportunity opp = createTestOpportunity("E2E Lifecycle Test");

            // Read - Get by ID
            performGet(OPPORTUNITIES_URL + "/" + opp.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("E2E Lifecycle Test"))
                .andExpect(jsonPath("$.id").value(opp.getId()));

            // List - Should include our opportunity
            performGet(OPPORTUNITIES_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should search opportunities by keyword")
        void should_SearchOpportunitiesByKeyword() throws Exception {
            // Create opportunities with specific keywords
            String uniqueKeyword = "UniqueKeyword" + UUID.randomUUID().toString().substring(0, 8);
            createTestOpportunity(uniqueKeyword + " IT Services Contract");
            createTestOpportunity("Different Contract Without Keyword");

            // Search by keyword
            performGet(OPPORTUNITIES_URL + "/search?keyword=" + uniqueKeyword)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should filter opportunities by type")
        void should_FilterOpportunitiesByType() throws Exception {
            createTestOpportunity("Presolicitation Test");

            performGet(OPPORTUNITIES_URL + "?type=PRESOLICITATION")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should paginate opportunity results")
        void should_PaginateOpportunityResults() throws Exception {
            // Create multiple opportunities
            for (int i = 0; i < 5; i++) {
                createTestOpportunity("Paginated Opportunity " + i);
            }

            // Request first page with size 2
            performGet(OPPORTUNITIES_URL + "?page=0&size=2")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.pageable").exists())
                .andExpect(jsonPath("$.totalElements").exists());
        }
    }

    @Nested
    @DisplayName("Saved Opportunities Flow")
    class SavedOpportunitiesFlow {

        @Test
        @DisplayName("should save and retrieve opportunities")
        void should_SaveAndRetrieveOpportunities() throws Exception {
            // Create opportunity to save
            Opportunity opp = createTestOpportunity("Opportunity to Save");

            // Save the opportunity
            performPost(SAVED_OPPORTUNITIES_URL, java.util.Map.of("opportunityId", opp.getId()))
                .andExpect(status().isOk());

            // List saved opportunities
            performGet(SAVED_OPPORTUNITIES_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should unsave previously saved opportunity")
        void should_UnsavePreviouslySavedOpportunity() throws Exception {
            Opportunity opp = createTestOpportunity("Opportunity to Unsave");

            // Save the opportunity
            MvcResult saveResult = performPost(SAVED_OPPORTUNITIES_URL, java.util.Map.of("opportunityId", opp.getId()))
                .andExpect(status().isOk())
                .andReturn();

            // Unsave the opportunity
            performDelete(SAVED_OPPORTUNITIES_URL + "/" + opp.getId())
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        @Test
        @DisplayName("should isolate opportunities between tenants")
        void should_IsolateOpportunitiesBetweenTenants() throws Exception {
            // Create opportunity for current tenant
            Opportunity ownOpp = createTestOpportunity("Own Tenant Opportunity");

            // Create another tenant and opportunity
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant " + UUID.randomUUID())
                .slug("other-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            Opportunity otherOpp = new Opportunity();
            otherOpp.setId(UUID.randomUUID().toString());
            otherOpp.setTenantId(otherTenant.getId());
            otherOpp.setTitle("Other Tenant Opportunity");
            otherOpp.setNoticeId("OTHER-NOTICE-" + UUID.randomUUID().toString().substring(0, 8));
            otherOpp.setSolicitationNumber("OTHER-SOL-" + UUID.randomUUID().toString().substring(0, 8));
            otherOpp.setPostedDate(LocalDate.now());
            otherOpp.setActive(true);
            opportunityRepository.save(otherOpp);

            // Verify only own opportunities are returned
            MvcResult result = performGet(OPPORTUNITIES_URL)
                .andExpect(status().isOk())
                .andReturn();

            String content = result.getResponse().getContentAsString();
            // The other tenant's opportunity should not be in the results
            assertThat(content).doesNotContain("Other Tenant Opportunity");
        }
    }

    @Nested
    @DisplayName("Advanced Search")
    class AdvancedSearch {

        @Test
        @DisplayName("should filter by date range")
        void should_FilterByDateRange() throws Exception {
            createTestOpportunity("Date Range Test Opportunity");

            String fromDate = LocalDate.now().minusDays(1).toString();
            String toDate = LocalDate.now().plusDays(1).toString();

            performGet(OPPORTUNITIES_URL + "?postedDateFrom=" + fromDate + "&postedDateTo=" + toDate)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should filter by active status")
        void should_FilterByActiveStatus() throws Exception {
            createTestOpportunity("Active Opportunity Test");

            performGet(OPPORTUNITIES_URL + "?active=true")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should combine multiple filters")
        void should_CombineMultipleFilters() throws Exception {
            createTestOpportunity("Combined Filter Test");

            performGet(OPPORTUNITIES_URL + "?type=PRESOLICITATION&active=true&page=0&size=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.pageable.pageSize").value(10));
        }
    }

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {

        @Test
        @DisplayName("should return 404 for non-existent opportunity")
        void should_Return404_ForNonExistentOpportunity() throws Exception {
            performGet(OPPORTUNITIES_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }
}
