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
 * E2E tests for OpportunityMatchController endpoints.
 */
@DisplayName("OpportunityMatchController")
class OpportunityMatchControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/opportunity-matches";

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
    @DisplayName("GET /api/v1/opportunity-matches")
    class GetMatches {

        @Test
        @DisplayName("should return opportunity matches")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnMatches() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/opportunity-matches/top")
    class GetTopMatches {

        @Test
        @DisplayName("should return top matches")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnTopMatches() throws Exception {
            performGet(BASE_URL + "/top?limit=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/opportunity-matches/refresh")
    class RefreshMatches {

        @Test
        @DisplayName("should refresh opportunity matches")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_RefreshMatches() throws Exception {
            performPost(BASE_URL + "/refresh")
                .andExpect(status().isOk());
        }
    }
}
