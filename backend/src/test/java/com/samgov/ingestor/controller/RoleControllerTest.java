package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for RoleController endpoints.
 */
@DisplayName("RoleController")
class RoleControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/roles";

    @Autowired
    private TenantRepository tenantRepository;

    private Tenant testTenant;

    @Override
    @BeforeEach
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Test Tenant " + UUID.randomUUID())
            .slug("test-tenant-" + UUID.randomUUID())
            .build());
        testTenantId = testTenant.getId();
    }

    @Nested
    @DisplayName("GET /roles")
    class GetRoles {

        @Test
        @DisplayName("should return roles")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnRoles() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /roles/{id}")
    class GetRoleById {

        @Test
        @DisplayName("should return 404 when role not found")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /roles")
    class CreateRole {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_Return400_When_Invalid() throws Exception {
            performPost(BASE_URL, "{}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /roles/{id}")
    class DeleteRole {

        @Test
        @DisplayName("should return 404 when role not found")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performDelete(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }
}
