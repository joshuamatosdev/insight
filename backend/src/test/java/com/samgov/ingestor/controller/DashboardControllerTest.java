package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.DashboardService.CreateDashboardRequest;
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
 * E2E tests for DashboardController endpoints.
 */
@DisplayName("DashboardController")
class DashboardControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/dashboards";

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
            .email("dashboard-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .tenantId(testTenantId)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /api/v1/dashboards")
    class GetDashboards {

        @Test
        @DisplayName("should return paginated list of dashboards")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedDashboards() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/dashboards/{id}")
    class GetDashboardById {

        @Test
        @DisplayName("should return 404 when dashboard not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/dashboards/default")
    class GetDefaultDashboard {

        @Test
        @DisplayName("should return 404 when no default dashboard exists")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NoDefault() throws Exception {
            performGet(BASE_URL + "/default")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/dashboards")
    class CreateDashboard {

        @Test
        @DisplayName("should return 400 when request body is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_RequestInvalid() throws Exception {
            performPost(BASE_URL, new CreateDashboardRequest(null, null, false))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/dashboards/{id}/widgets")
    class AddWidget {

        @Test
        @DisplayName("should return 404 when dashboard not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_DashboardNotFound() throws Exception {
            performPost(BASE_URL + "/" + UUID.randomUUID() + "/widgets", "{}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/dashboards/{id}")
    class DeleteDashboard {

        @Test
        @DisplayName("should return 404 when deleting non-existent dashboard")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performDelete(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/dashboards/widgets/{widgetId}")
    class DeleteWidget {

        @Test
        @DisplayName("should return 404 when deleting non-existent widget")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performDelete(BASE_URL + "/widgets/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }
}
