package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for IngestController endpoints.
 */
@DisplayName("IngestController")
class IngestControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/ingest";

    @Nested
    @DisplayName("POST /api/v1/ingest/sam")
    class IngestSam {

        @Test
        @DisplayName("should trigger SAM ingestion")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_TriggerIngestion() throws Exception {
            performPost(BASE_URL + "/sam")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/ingest/status")
    class GetIngestionStatus {

        @Test
        @DisplayName("should return ingestion status")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnStatus() throws Exception {
            performGet(BASE_URL + "/status")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/ingest/history")
    class GetIngestionHistory {

        @Test
        @DisplayName("should return ingestion history")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnHistory() throws Exception {
            performGet(BASE_URL + "/history")
                .andExpect(status().isOk());
        }
    }
}
