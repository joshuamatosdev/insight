package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.dto.FacetedSearchRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for SearchController endpoints.
 */
@DisplayName("SearchController")
class SearchControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/search";

    @Nested
    @DisplayName("GET /api/v1/search/suggestions")
    class GetSuggestions {

        @Test
        @DisplayName("should return search suggestions")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnSuggestions() throws Exception {
            performGet(BASE_URL + "/suggestions?q=test")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should limit suggestions")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_LimitSuggestions() throws Exception {
            performGet(BASE_URL + "/suggestions?q=test&limit=5")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should return 400 when query is missing")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_QueryMissing() throws Exception {
            performGet(BASE_URL + "/suggestions")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/search/faceted")
    class FacetedSearch {

        @Test
        @DisplayName("should perform faceted search")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_PerformFacetedSearch() throws Exception {
            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("test")
                .page(0)
                .size(10)
                .build();
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should search with filters")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_SearchWithFilters() throws Exception {
            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("contract")
                .filters(Map.of("status", List.of("ACTIVE")))
                .page(0)
                .size(10)
                .build();
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk());
        }
    }
}
