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
 * E2E tests for AnalyticsController endpoints.
 */
@DisplayName("AnalyticsController")
class AnalyticsControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/analytics";

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
    @DisplayName("GET /analytics/overview")
    class GetAnalyticsOverview {

        @Test
        @DisplayName("should return analytics overview")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnOverview() throws Exception {
            performGet(BASE_URL + "/overview")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /analytics/trends")
    class GetTrends {

        @Test
        @DisplayName("should return trend data")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnTrends() throws Exception {
            performGet(BASE_URL + "/trends")
                .andExpect(status().isOk());
        }
    }
}
