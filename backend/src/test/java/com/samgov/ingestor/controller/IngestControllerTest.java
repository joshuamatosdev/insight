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

    // ============================================
    // USAspending.gov Endpoints
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/ingest/usa-spending")
    class IngestUsaSpending {

        @Test
        @DisplayName("should trigger USAspending ingestion for super admin")
        @WithMockUser(username = "superadmin", roles = {"SUPER_ADMIN"})
        void should_TriggerUsaSpendingIngestion() throws Exception {
            performPost("/api/v1/ingest/usa-spending")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should reject non-super-admin users")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_RejectNonSuperAdmin() throws Exception {
            performPost("/api/v1/ingest/usa-spending")
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/ingest/usa-spending/stats")
    class GetUsaSpendingStats {

        @Test
        @DisplayName("should return USAspending statistics")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnStats() throws Exception {
            performGet("/api/v1/ingest/usa-spending/stats")
                .andExpect(status().isOk());
        }
    }

    // ============================================
    // Geocoding Endpoints
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/ingest/geocode")
    class TriggerGeocoding {

        @Test
        @DisplayName("should trigger geocoding for super admin")
        @WithMockUser(username = "superadmin", roles = {"SUPER_ADMIN"})
        void should_TriggerGeocoding() throws Exception {
            performPost("/api/v1/ingest/geocode")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should accept limit parameter")
        @WithMockUser(username = "superadmin", roles = {"SUPER_ADMIN"})
        void should_AcceptLimitParameter() throws Exception {
            performPost("/api/v1/ingest/geocode?limit=50")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should reject non-super-admin users")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_RejectNonSuperAdmin() throws Exception {
            performPost("/api/v1/ingest/geocode")
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/ingest/geocode/stats")
    class GetGeocodingStats {

        @Test
        @DisplayName("should return geocoding statistics")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnGeocodingStats() throws Exception {
            performGet("/api/v1/ingest/geocode/stats")
                .andExpect(status().isOk());
        }
    }

    // ============================================
    // Geographic Query Endpoints
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/opportunities/geocoded")
    class GetGeocodedOpportunities {

        @Test
        @DisplayName("should return geocoded opportunities")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnGeocodedOpportunities() throws Exception {
            performGet("/api/v1/opportunities/geocoded")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/opportunities/by-state")
    class GetOpportunitiesByState {

        @Test
        @DisplayName("should return opportunity counts by state")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnOpportunitiesByState() throws Exception {
            performGet("/api/v1/opportunities/by-state")
                .andExpect(status().isOk());
        }
    }
}
