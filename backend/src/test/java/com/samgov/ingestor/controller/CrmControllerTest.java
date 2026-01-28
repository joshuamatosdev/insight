package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for CrmController endpoints.
 */
@DisplayName("CrmController")
class CrmControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/crm";

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
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Test Tenant " + UUID.randomUUID())
            .slug("test-tenant-" + UUID.randomUUID())
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("crm-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .tenantId(testTenantId)
            .build());
        testUserId = testUser.getId();
    }

    // Contact Endpoints

    @Nested
    @DisplayName("GET /api/crm/contacts")
    class ListContacts {

        @Test
        @DisplayName("should return paginated contacts")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnPaginatedContacts() throws Exception {
            performGet(BASE_URL + "/contacts")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/contacts/{id}")
    class GetContact {

        @Test
        @DisplayName("should return 404 when contact not found")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/contacts/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/contacts/search")
    class SearchContacts {

        @Test
        @DisplayName("should search contacts by keyword")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_SearchContacts() throws Exception {
            performGet(BASE_URL + "/contacts/search?keyword=test")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/contacts/government")
    class GetGovernmentContacts {

        @Test
        @DisplayName("should return government contacts")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnGovernmentContacts() throws Exception {
            performGet(BASE_URL + "/contacts/government")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/contacts/followup-needed")
    class GetFollowupNeeded {

        @Test
        @DisplayName("should return contacts needing followup")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnFollowupNeeded() throws Exception {
            performGet(BASE_URL + "/contacts/followup-needed")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    // Organization Endpoints

    @Nested
    @DisplayName("GET /api/crm/organizations")
    class ListOrganizations {

        @Test
        @DisplayName("should return paginated organizations")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnPaginatedOrganizations() throws Exception {
            performGet(BASE_URL + "/organizations")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/organizations/{id}")
    class GetOrganization {

        @Test
        @DisplayName("should return 404 when organization not found")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/organizations/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/organizations/agencies")
    class GetGovernmentAgencies {

        @Test
        @DisplayName("should return government agencies")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnAgencies() throws Exception {
            performGet(BASE_URL + "/organizations/agencies")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/organizations/competitors")
    class GetCompetitors {

        @Test
        @DisplayName("should return competitors")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnCompetitors() throws Exception {
            performGet(BASE_URL + "/organizations/competitors")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    // Interaction Endpoints

    @Nested
    @DisplayName("GET /api/crm/interactions")
    class ListInteractions {

        @Test
        @DisplayName("should return paginated interactions")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnPaginatedInteractions() throws Exception {
            performGet(BASE_URL + "/interactions")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/interactions/{id}")
    class GetInteraction {

        @Test
        @DisplayName("should return 404 when interaction not found")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/interactions/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/interactions/followups/pending")
    class GetPendingFollowups {

        @Test
        @DisplayName("should return pending followups")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnPendingFollowups() throws Exception {
            performGet(BASE_URL + "/interactions/followups/pending")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/interactions/followups/overdue")
    class GetOverdueFollowups {

        @Test
        @DisplayName("should return overdue followups")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnOverdueFollowups() throws Exception {
            performGet(BASE_URL + "/interactions/followups/overdue")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/summary")
    class GetCrmSummary {

        @Test
        @DisplayName("should return CRM summary")
        @WithMockUser(username = "user", roles = {"BD_MANAGER"})
        void should_ReturnCrmSummary() throws Exception {
            performGet(BASE_URL + "/summary")
                .andExpect(status().isOk());
        }
    }
}
