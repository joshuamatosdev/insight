package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.OpportunityRepository;
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
 * E2E tests for AIAnalysisController endpoints.
 */
@DisplayName("AIAnalysisController")
class AIAnalysisControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/ai";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

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
    @DisplayName("GET /ai/opportunities/{id}/summary")
    class GetOpportunitySummary {

        @Test
        @DisplayName("should return 404 when opportunity not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/opportunities/" + UUID.randomUUID() + "/summary")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /ai/opportunities/{id}/fit-score")
    class GetFitScore {

        @Test
        @DisplayName("should return 404 when opportunity not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/opportunities/" + UUID.randomUUID() + "/fit-score")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /ai/opportunities/{id}/risk-assessment")
    class GetRiskAssessment {

        @Test
        @DisplayName("should return 404 when opportunity not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/opportunities/" + UUID.randomUUID() + "/risk-assessment")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /ai/opportunities/{id}/proposal-suggestions")
    class GetProposalSuggestions {

        @Test
        @DisplayName("should return 404 when opportunity not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/opportunities/" + UUID.randomUUID() + "/proposal-suggestions")
                .andExpect(status().isNotFound());
        }
    }
}
