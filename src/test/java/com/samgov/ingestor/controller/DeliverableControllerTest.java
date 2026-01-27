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
 * E2E tests for DeliverableController endpoints.
 */
@DisplayName("DeliverableController")
class DeliverableControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/deliverables";

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
    @DisplayName("GET /api/v1/deliverables")
    class GetDeliverables {

        @Test
        @DisplayName("should return paginated deliverables")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedDeliverables() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/deliverables/{id}")
    class GetDeliverableById {

        @Test
        @DisplayName("should return 404 when deliverable not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/deliverables/contract/{contractId}")
    class GetDeliverablesByContract {

        @Test
        @DisplayName("should return deliverables for contract")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnDeliverables() throws Exception {
            performGet(BASE_URL + "/contract/" + UUID.randomUUID())
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/deliverables/upcoming")
    class GetUpcomingDeliverables {

        @Test
        @DisplayName("should return upcoming deliverables")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnUpcoming() throws Exception {
            performGet(BASE_URL + "/upcoming")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/deliverables")
    class CreateDeliverable {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_Invalid() throws Exception {
            performPost(BASE_URL, "{}")
                .andExpect(status().isBadRequest());
        }
    }
}
