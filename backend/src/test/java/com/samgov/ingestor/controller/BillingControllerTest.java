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
 * E2E tests for BillingController endpoints.
 */
@DisplayName("BillingController")
class BillingControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/billing";

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
    @DisplayName("GET /api/v1/billing/subscription")
    class GetSubscription {

        @Test
        @DisplayName("should return subscription info")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnSubscriptionInfo() throws Exception {
            performGet(BASE_URL + "/subscription")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/billing/invoices")
    class GetInvoices {

        @Test
        @DisplayName("should return billing invoices")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnInvoices() throws Exception {
            performGet(BASE_URL + "/invoices")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/billing/usage")
    class GetUsage {

        @Test
        @DisplayName("should return usage data")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnUsageData() throws Exception {
            performGet(BASE_URL + "/usage")
                .andExpect(status().isOk());
        }
    }
}
