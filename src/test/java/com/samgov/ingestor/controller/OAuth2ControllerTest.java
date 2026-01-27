package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for OAuth2Controller endpoints.
 */
@DisplayName("OAuth2Controller")
class OAuth2ControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/oauth2";

    @Nested
    @DisplayName("GET /api/v1/oauth2/providers")
    class GetProviders {

        @Test
        @DisplayName("should return OAuth providers")
        void should_ReturnProviders() throws Exception {
            performGet(BASE_URL + "/providers")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/oauth2/connections")
    class GetConnections {

        @Test
        @DisplayName("should return user OAuth connections")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnConnections() throws Exception {
            performGet(BASE_URL + "/connections")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/oauth2/connections/{provider}")
    class DisconnectProvider {

        @Test
        @DisplayName("should return 404 when connection not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotConnected() throws Exception {
            performDelete(BASE_URL + "/connections/google")
                .andExpect(status().isNotFound());
        }
    }
}
