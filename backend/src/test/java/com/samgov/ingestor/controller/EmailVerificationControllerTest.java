package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for EmailVerificationController endpoints.
 */
@DisplayName("EmailVerificationController")
class EmailVerificationControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/auth/email";

    @Nested
    @DisplayName("GET /api/v1/auth/email/verify")
    class VerifyEmail {

        @Test
        @DisplayName("should return 400 when token is invalid")
        void should_Return400_When_TokenInvalid() throws Exception {
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(BASE_URL + "/verify")
                    .param("token", "invalid-token")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when token is missing")
        void should_Return400_When_TokenMissing() throws Exception {
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(BASE_URL + "/verify")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/email/resend")
    class ResendVerification {

        @Test
        @DisplayName("should resend verification email")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ResendEmail() throws Exception {
            performPost(BASE_URL + "/resend")
                .andExpect(status().isOk());
        }
    }
}
