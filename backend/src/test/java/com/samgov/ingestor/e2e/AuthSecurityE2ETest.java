package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Authentication and Security flows.
 * Tests complete user journeys through authentication endpoints.
 */
class AuthSecurityE2ETest extends BaseControllerTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;

    @BeforeEach
    @Override
    protected void setUp() {
        // Create test tenant
        testTenant = tenantRepository.save(Tenant.builder()
            .name("E2E Test Tenant")
            .slug("e2e-test-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();
    }

    @Nested
    @DisplayName("User Registration Flow")
    class RegistrationFlow {

        @Test
        @DisplayName("should register new user with email and password")
        void shouldRegisterNewUser() throws Exception {
            Map<String, Object> request = Map.of(
                "email", "newuser-" + UUID.randomUUID() + "@example.com",
                "password", "SecurePass123!",
                "firstName", "Test",
                "lastName", "User"
            );

            performPost("/auth/register", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(request.get("email")));
        }

        @Test
        @DisplayName("should reject registration with existing email")
        void shouldRejectDuplicateEmail() throws Exception {
            String email = "duplicate-" + UUID.randomUUID() + "@example.com";
            
            // Create existing user
            userRepository.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode("password"))
                .firstName("Existing")
                .lastName("User")
                .tenant(testTenant)
                .build());

            Map<String, Object> request = Map.of(
                "email", email,
                "password", "SecurePass123!",
                "firstName", "New",
                "lastName", "User"
            );

            performPost("/auth/register", request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should reject registration with weak password")
        void shouldRejectWeakPassword() throws Exception {
            Map<String, Object> request = Map.of(
                "email", "user-" + UUID.randomUUID() + "@example.com",
                "password", "weak",
                "firstName", "Test",
                "lastName", "User"
            );

            performPost("/auth/register", request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should reject registration with invalid email")
        void shouldRejectInvalidEmail() throws Exception {
            Map<String, Object> request = Map.of(
                "email", "not-an-email",
                "password", "SecurePass123!",
                "firstName", "Test",
                "lastName", "User"
            );

            performPost("/auth/register", request)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Login Flow")
    class LoginFlow {

        private String testEmail;
        private String testPassword = "TestPass123!";

        @BeforeEach
        void createTestUser() {
            testEmail = "login-test-" + UUID.randomUUID() + "@example.com";
            userRepository.save(User.builder()
                .email(testEmail)
                .passwordHash(passwordEncoder.encode(testPassword))
                .firstName("Login")
                .lastName("Tester")
                .tenant(testTenant)
                .status(User.UserStatus.ACTIVE)
                .build());
        }

        @Test
        @DisplayName("should login with valid credentials")
        void shouldLoginWithValidCredentials() throws Exception {
            Map<String, Object> request = Map.of(
                "email", testEmail,
                "password", testPassword
            );

            performPost("/auth/login", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(testEmail));
        }

        @Test
        @DisplayName("should reject login with wrong password")
        void shouldRejectWrongPassword() throws Exception {
            Map<String, Object> request = Map.of(
                "email", testEmail,
                "password", "WrongPassword123!"
            );

            performPost("/auth/login", request)
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should reject login with non-existent email")
        void shouldRejectNonExistentEmail() throws Exception {
            Map<String, Object> request = Map.of(
                "email", "nonexistent@example.com",
                "password", testPassword
            );

            performPost("/auth/login", request)
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should handle case-insensitive email")
        void shouldHandleCaseInsensitiveEmail() throws Exception {
            Map<String, Object> request = Map.of(
                "email", testEmail.toUpperCase(),
                "password", testPassword
            );

            performPost("/auth/login", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
        }
    }

    @Nested
    @DisplayName("Password Reset Flow")
    class PasswordResetFlow {

        @Test
        @DisplayName("should accept forgot password request")
        void shouldAcceptForgotPasswordRequest() throws Exception {
            String email = "forgot-" + UUID.randomUUID() + "@example.com";
            userRepository.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode("password"))
                .firstName("Forgot")
                .lastName("Password")
                .tenant(testTenant)
                .build());

            Map<String, Object> request = Map.of("email", email);

            performPost("/auth/forgot-password", request)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should not reveal if email exists")
        void shouldNotRevealEmailExistence() throws Exception {
            Map<String, Object> request = Map.of(
                "email", "nonexistent-" + UUID.randomUUID() + "@example.com"
            );

            // Should return success even for non-existent email (security)
            performPost("/auth/forgot-password", request)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should reject invalid reset token")
        void shouldRejectInvalidResetToken() throws Exception {
            Map<String, Object> request = Map.of(
                "token", "invalid-token",
                "newPassword", "NewSecurePass123!"
            );

            performPost("/auth/reset-password", request)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Token Refresh Flow")
    class TokenRefreshFlow {

        @Test
        @DisplayName("should reject refresh without token")
        void shouldRejectRefreshWithoutToken() throws Exception {
            performPost("/auth/refresh")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Email Verification Flow")
    class EmailVerificationFlow {

        @Test
        @DisplayName("should reject invalid verification token")
        void shouldRejectInvalidVerificationToken() throws Exception {
            performGet("/auth/verify-email?token=invalid-token")
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should reject resend for non-existent email")
        void shouldRejectResendForNonExistentEmail() throws Exception {
            Map<String, Object> request = Map.of(
                "email", "nonexistent@example.com"
            );

            performPost("/auth/resend-verification", request)
                .andExpect(status().isNotFound());
        }
    }
}
