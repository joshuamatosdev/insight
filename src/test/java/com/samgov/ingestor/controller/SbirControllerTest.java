package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for SbirController endpoints.
 */
@DisplayName("SbirController")
class SbirControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/sbir";

    @Nested
    @DisplayName("GET /api/v1/sbir/opportunities")
    class GetSbirOpportunities {

        @Test
        @DisplayName("should return SBIR opportunities")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnOpportunities() throws Exception {
            performGet(BASE_URL + "/opportunities")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/sbir/opportunities/{id}")
    class GetSbirOpportunityById {

        @Test
        @DisplayName("should return 404 when opportunity not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/opportunities/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/sbir/agencies")
    class GetAgencies {

        @Test
        @DisplayName("should return SBIR agencies")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnAgencies() throws Exception {
            performGet(BASE_URL + "/agencies")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/sbir/ingest")
    class TriggerIngestion {

        @Test
        @DisplayName("should trigger SBIR ingestion")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_TriggerIngestion() throws Exception {
            performPost(BASE_URL + "/ingest")
                .andExpect(status().isOk());
        }
    }
}
