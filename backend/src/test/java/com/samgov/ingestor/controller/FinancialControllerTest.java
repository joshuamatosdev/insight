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
 * E2E tests for FinancialController endpoints.
 */
@DisplayName("FinancialController")
class FinancialControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/portal/financial";

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
    @DisplayName("GET /financials/summary")
    class GetFinancialSummary {

        @Test
        @DisplayName("should return financial summary")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnSummary() throws Exception {
            performGet(BASE_URL + "/summary")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /financials/contract/{contractId}")
    class GetContractFinancials {

        @Test
        @DisplayName("should return 404 when contract not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/contract/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /financials/revenue")
    class GetRevenue {

        @Test
        @DisplayName("should return revenue data")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnRevenue() throws Exception {
            performGet(BASE_URL + "/revenue")
                .andExpect(status().isOk());
        }
    }
}
