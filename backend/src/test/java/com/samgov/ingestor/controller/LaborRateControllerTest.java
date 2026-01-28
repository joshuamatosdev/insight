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
 * E2E tests for LaborRateController endpoints.
 */
@DisplayName("LaborRateController")
class LaborRateControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/labor-rates";

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
    @DisplayName("GET /labor-rates")
    class GetLaborRates {

        @Test
        @DisplayName("should return paginated labor rates")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedRates() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /labor-rates/{id}")
    class GetLaborRateById {

        @Test
        @DisplayName("should return 404 when rate not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /labor-rates")
    class CreateLaborRate {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_Invalid() throws Exception {
            performPost(BASE_URL, "{}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /labor-rates/{id}")
    class DeleteLaborRate {

        @Test
        @DisplayName("should return 404 when rate not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performDelete(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }
}
