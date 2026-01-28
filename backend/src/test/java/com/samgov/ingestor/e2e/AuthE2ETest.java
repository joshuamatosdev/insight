package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.dto.AuthenticationRequest;
import com.samgov.ingestor.dto.RegisterRequest;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for complete authentication flows.
 * Tests full user journeys from registration through protected resource access.
 */
@DisplayName("Authentication E2E Tests")
class AuthE2ETest extends BaseControllerTest {

    private static final String AUTH_BASE = "/api/v1/auth";
    private static final String VALID_PASSWORD = "SecurePass123!";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Nested
    @DisplayName("Complete Registration to Login Flow")
    class RegistrationToLoginFlow {

        @Test
        @DisplayName("should complete full registration then login flow")
        void should_Complete_FullRegistrationThenLoginFlow() throws Exception {
            String email = "e2e-reg-login-" + UUID.randomUUID() + "@example.com";
            
            // Step 1: Register new user
            RegisterRequest registerRequest = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("E2E")
                .lastName("User")
                .build();

            MvcResult registerResult = performPost(AUTH_BASE + "/register", registerRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()))
                .andReturn();

            String accessToken = objectMapper.readTree(registerResult.getResponse().getContentAsString())
                .get("accessToken").asText();
            assertThat(accessToken).isNotEmpty();

            // Step 2: Login with same credentials
            AuthenticationRequest loginRequest = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .build();

            MvcResult loginResult = performPost(AUTH_BASE + "/login", loginRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn();

            String loginAccessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken").asText();
            assertThat(loginAccessToken).isNotEmpty();

            // Step 3: Access protected endpoint with token
            mockMvc.perform(get("/api/v1/users/me")
                    .header("Authorization", "Bearer " + loginAccessToken)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email.toLowerCase()));
        }

        @Test
        @DisplayName("should complete registration with organization creation")
        void should_Complete_RegistrationWithOrganization() throws Exception {
            String email = "e2e-org-" + UUID.randomUUID() + "@example.com";
            String orgName = "E2E Test Org " + UUID.randomUUID();

            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Org")
                .lastName("Admin")
                .organizationName(orgName)
                .build();

            MvcResult result = performPost(AUTH_BASE + "/register", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()))
                .andReturn();

            // Verify user was created in database
            assertThat(userRepository.existsByEmail(email.toLowerCase())).isTrue();
        }
    }

    @Nested
    @DisplayName("Token Refresh Flow")
    class TokenRefreshFlow {

        @Test
        @DisplayName("should complete login and token refresh cycle")
        void should_Complete_LoginAndRefreshCycle() throws Exception {
            // Setup: Create active user
            String email = "e2e-refresh-" + UUID.randomUUID() + "@example.com";
            User user = User.builder()
                .email(email.toLowerCase())
                .passwordHash(passwordEncoder.encode(VALID_PASSWORD))
                .firstName("Refresh")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            userRepository.save(user);

            // Step 1: Login to get initial tokens
            AuthenticationRequest loginRequest = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .build();

            MvcResult loginResult = performPost(AUTH_BASE + "/login", loginRequest)
                .andExpect(status().isOk())
                .andReturn();

            String initialAccessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken").asText();
            String refreshToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("refreshToken").asText();

            // Step 2: Use refresh token to get new access token
            MvcResult refreshResult = mockMvc.perform(post(AUTH_BASE + "/refresh")
                    .header("Authorization", "Bearer " + refreshToken)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn();

            String newAccessToken = objectMapper.readTree(refreshResult.getResponse().getContentAsString())
                .get("accessToken").asText();

            // Step 3: Verify new token works for protected resources
            mockMvc.perform(get("/api/v1/users/me")
                    .header("Authorization", "Bearer " + newAccessToken)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email.toLowerCase()));
        }
    }

    @Nested
    @DisplayName("Password Reset Flow")
    class PasswordResetFlow {

        @Test
        @DisplayName("should initiate password reset for existing user")
        void should_Initiate_PasswordResetForExistingUser() throws Exception {
            // Setup: Create active user
            String email = "e2e-pw-reset-" + UUID.randomUUID() + "@example.com";
            User user = User.builder()
                .email(email.toLowerCase())
                .passwordHash(passwordEncoder.encode(VALID_PASSWORD))
                .firstName("Reset")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            userRepository.save(user);

            // Step 1: Request password reset (should always return 200 to prevent enumeration)
            mockMvc.perform(post(AUTH_BASE + "/forgot-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("should return same response for non-existent email to prevent enumeration")
        void should_PreventEmailEnumeration() throws Exception {
            // Request reset for non-existent email
            mockMvc.perform(post(AUTH_BASE + "/forgot-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"nonexistent-" + UUID.randomUUID() + "@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        }
    }

    @Nested
    @DisplayName("Account Status Flows")
    class AccountStatusFlows {

        @Test
        @DisplayName("should prevent login for suspended account")
        void should_PreventLogin_ForSuspendedAccount() throws Exception {
            // Setup: Create suspended user
            String email = "e2e-suspended-" + UUID.randomUUID() + "@example.com";
            User user = User.builder()
                .email(email.toLowerCase())
                .passwordHash(passwordEncoder.encode(VALID_PASSWORD))
                .firstName("Suspended")
                .lastName("User")
                .status(UserStatus.SUSPENDED)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            userRepository.save(user);

            // Attempt login
            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .build();

            performPost(AUTH_BASE + "/login", request)
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should handle case-insensitive email during authentication")
        void should_HandleCaseInsensitiveEmail() throws Exception {
            // Setup: Create user with lowercase email
            String email = "E2E-CasE-" + UUID.randomUUID() + "@ExAmPlE.cOm";
            User user = User.builder()
                .email(email.toLowerCase())
                .passwordHash(passwordEncoder.encode(VALID_PASSWORD))
                .firstName("Case")
                .lastName("Test")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            userRepository.save(user);

            // Login with uppercase email
            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email.toUpperCase())
                .password(VALID_PASSWORD)
                .build();

            performPost(AUTH_BASE + "/login", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
        }
    }

    @Nested
    @DisplayName("Protected Resource Access")
    class ProtectedResourceAccess {

        @Test
        @DisplayName("should deny access to protected resources without token")
        void should_DenyAccess_WithoutToken() throws Exception {
            mockMvc.perform(get("/api/v1/users/me")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should deny access with invalid token")
        void should_DenyAccess_WithInvalidToken() throws Exception {
            mockMvc.perform(get("/api/v1/users/me")
                    .header("Authorization", "Bearer invalid.token.here")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should allow access with valid token")
        void should_AllowAccess_WithValidToken() throws Exception {
            // Setup: Register user and get token
            String email = "e2e-access-" + UUID.randomUUID() + "@example.com";
            RegisterRequest registerRequest = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Access")
                .lastName("Test")
                .build();

            MvcResult result = performPost(AUTH_BASE + "/register", registerRequest)
                .andExpect(status().isCreated())
                .andReturn();

            String accessToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken").asText();

            // Access protected resource
            mockMvc.perform(get("/api/v1/users/me")
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email.toLowerCase()));
        }
    }
}
