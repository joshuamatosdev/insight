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

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for TenantAdminController endpoints.
 */
@DisplayName("TenantAdminController")
class TenantAdminControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/tenant-admin";

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
    @DisplayName("GET /tenant-admin/settings")
    class GetSettings {

        @Test
        @DisplayName("should return tenant settings")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnSettings() throws Exception {
            performGet(BASE_URL + "/settings")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("PUT /tenant-admin/settings")
    class UpdateSettings {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return400_When_Invalid() throws Exception {
            performPut(BASE_URL + "/settings", "{}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /tenant-admin/branding")
    class GetBranding {

        @Test
        @DisplayName("should return tenant branding")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnBranding() throws Exception {
            performGet(BASE_URL + "/branding")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("PUT /tenant-admin/branding")
    class UpdateBranding {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return400_When_Invalid() throws Exception {
            performPut(BASE_URL + "/branding", "{}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /tenant-admin/usage")
    class GetUsage {

        @Test
        @DisplayName("should return usage statistics")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnUsage() throws Exception {
            performGet(BASE_URL + "/usage")
                .andExpect(status().isOk());
        }
    }
}
