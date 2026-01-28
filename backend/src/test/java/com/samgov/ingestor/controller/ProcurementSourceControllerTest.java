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
 * E2E tests for ProcurementSourceController endpoints.
 */
@DisplayName("ProcurementSourceController")
class ProcurementSourceControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/procurement-sources";

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
    @DisplayName("GET /procurement-sources")
    class GetSources {

        @Test
        @DisplayName("should return paginated procurement sources")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedSources() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /procurement-sources/{id}")
    class GetSourceById {

        @Test
        @DisplayName("should return 404 when source not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /procurement-sources/active")
    class GetActiveSources {

        @Test
        @DisplayName("should return active sources")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnActiveSources() throws Exception {
            performGet(BASE_URL + "/active")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("POST /procurement-sources")
    class CreateSource {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_Return400_When_Invalid() throws Exception {
            performPost(BASE_URL, "{}")
                .andExpect(status().isBadRequest());
        }
    }
}
