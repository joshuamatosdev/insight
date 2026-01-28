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
 * E2E tests for UsageController endpoints.
 */
@DisplayName("UsageController")
class UsageControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/usage";

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
    @DisplayName("GET /api/v1/usage")
    class GetUsage {

        @Test
        @DisplayName("should return usage metrics")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnUsageMetrics() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/usage/api-calls")
    class GetApiCallUsage {

        @Test
        @DisplayName("should return API call usage")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnApiCallUsage() throws Exception {
            performGet(BASE_URL + "/api-calls")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/usage/storage")
    class GetStorageUsage {

        @Test
        @DisplayName("should return storage usage")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnStorageUsage() throws Exception {
            performGet(BASE_URL + "/storage")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/usage/limits")
    class GetLimits {

        @Test
        @DisplayName("should return usage limits")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnLimits() throws Exception {
            performGet(BASE_URL + "/limits")
                .andExpect(status().isOk());
        }
    }
}
