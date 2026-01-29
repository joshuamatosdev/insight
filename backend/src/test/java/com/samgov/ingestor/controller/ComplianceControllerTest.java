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
 * E2E tests for ComplianceController endpoints.
 */
@DisplayName("ComplianceController")
class ComplianceControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/portal/compliance";

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
    @DisplayName("GET /compliance/summary")
    class GetComplianceSummary {

        @Test
        @DisplayName("should return compliance summary")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnSummary() throws Exception {
            performGet(BASE_URL + "/summary")
                .andExpect(status().isOk());
        }
    }

    // Certification Tests

    @Nested
    @DisplayName("GET /compliance/certifications")
    class GetCertifications {

        @Test
        @DisplayName("should return paginated certifications")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedCertifications() throws Exception {
            performGet(BASE_URL + "/certifications")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /compliance/certifications/active")
    class GetActiveCertifications {

        @Test
        @DisplayName("should return active certifications")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnActiveCertifications() throws Exception {
            performGet(BASE_URL + "/certifications/active")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /compliance/certifications/expiring")
    class GetExpiringCertifications {

        @Test
        @DisplayName("should return expiring certifications")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnExpiringCertifications() throws Exception {
            performGet(BASE_URL + "/certifications/expiring?daysAhead=90")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /compliance/certifications/{certId}")
    class GetCertification {

        @Test
        @DisplayName("should return 404 when certification not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/certifications/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    // Clearance Tests

    @Nested
    @DisplayName("GET /compliance/clearances")
    class GetClearances {

        @Test
        @DisplayName("should return paginated clearances")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedClearances() throws Exception {
            performGet(BASE_URL + "/clearances")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /compliance/clearances/active")
    class GetActiveClearances {

        @Test
        @DisplayName("should return active clearances")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnActiveClearances() throws Exception {
            performGet(BASE_URL + "/clearances/active")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /compliance/clearances/facility")
    class GetFacilityClearance {

        @Test
        @DisplayName("should return 404 when no facility clearance")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NoFacilityClearance() throws Exception {
            performGet(BASE_URL + "/clearances/facility")
                .andExpect(status().isNotFound());
        }
    }

    // Compliance Item Tests

    @Nested
    @DisplayName("GET /compliance/items")
    class GetComplianceItems {

        @Test
        @DisplayName("should return paginated compliance items")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedItems() throws Exception {
            performGet(BASE_URL + "/items")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /compliance/items/pending")
    class GetPendingItems {

        @Test
        @DisplayName("should return pending compliance items")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPendingItems() throws Exception {
            performGet(BASE_URL + "/items/pending")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /compliance/items/overdue")
    class GetOverdueItems {

        @Test
        @DisplayName("should return overdue compliance items")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnOverdueItems() throws Exception {
            performGet(BASE_URL + "/items/overdue")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /compliance/items/{itemId}")
    class GetComplianceItem {

        @Test
        @DisplayName("should return 404 when item not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/items/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }
}
