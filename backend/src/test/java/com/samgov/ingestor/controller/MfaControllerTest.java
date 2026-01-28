package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.dto.MfaVerifyRequest;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for MfaController endpoints.
 */
@DisplayName("MfaController")
class MfaControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/mfa";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        testUser = userRepository.save(User.builder()
            .email("mfa-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /api/v1/mfa/status")
    class GetMfaStatus {

        @Test
        @DisplayName("should return MFA status for authenticated user")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnMfaStatus_When_Authenticated() throws Exception {
            performGet(BASE_URL + "/status")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should return 403 when not authenticated")
        void should_Return403_When_NotAuthenticated() throws Exception {
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(BASE_URL + "/status")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/mfa/setup")
    class StartMfaSetup {

        @Test
        @DisplayName("should initiate MFA setup for authenticated user")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_InitiateSetup_When_Authenticated() throws Exception {
            performPost(BASE_URL + "/setup")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/mfa/verify-setup")
    class VerifyMfaSetup {

        @Test
        @DisplayName("should return 400 when code is missing")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_CodeMissing() throws Exception {
            MfaVerifyRequest request = new MfaVerifyRequest();
            performPost(BASE_URL + "/verify-setup", request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return error when code is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnError_When_CodeInvalid() throws Exception {
            MfaVerifyRequest request = new MfaVerifyRequest();
            request.setCode("000000");
            // Should fail verification with invalid code
            performPost(BASE_URL + "/verify-setup", request)
                .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/mfa/verify")
    class VerifyMfaCode {

        @Test
        @DisplayName("should verify MFA code")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_VerifyCode() throws Exception {
            MfaVerifyRequest request = new MfaVerifyRequest();
            request.setCode("123456");
            request.setBackupCode(false);
            performPost(BASE_URL + "/verify", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").exists());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/mfa/backup-codes")
    class GenerateBackupCodes {

        @Test
        @DisplayName("should return 400 when MFA code is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_CodeInvalid() throws Exception {
            MfaVerifyRequest request = new MfaVerifyRequest();
            request.setCode("invalid");
            performPost(BASE_URL + "/backup-codes", request)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/mfa")
    class DisableMfa {

        @Test
        @DisplayName("should return 400 when code is missing")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_CodeMissing() throws Exception {
            MfaVerifyRequest request = new MfaVerifyRequest();
            performDelete(BASE_URL)
                .andExpect(status().isBadRequest());
        }
    }
}
