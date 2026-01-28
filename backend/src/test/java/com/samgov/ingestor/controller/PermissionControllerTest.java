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
 * E2E tests for PermissionController endpoints.
 */
@DisplayName("PermissionController")
class PermissionControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/permissions";

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
    @DisplayName("GET /permissions")
    class GetPermissions {

        @Test
        @DisplayName("should return all permissions")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnPermissions() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /permissions/{id}")
    class GetPermissionById {

        @Test
        @DisplayName("should return 404 when permission not found")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /permissions/categories")
    class GetCategories {

        @Test
        @DisplayName("should return permission categories")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnCategories() throws Exception {
            performGet(BASE_URL + "/categories")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }
}
