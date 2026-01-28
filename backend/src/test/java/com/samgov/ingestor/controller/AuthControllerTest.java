package com.samgov.ingestor.controller;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for AuthController endpoints.
 * Tests the public authentication API behavior, not internal implementation.
 */
@DisplayName("AuthController")
class AuthControllerTest extends BaseControllerTest {

    private static final String AUTH_BASE_URL = "/auth";
    private static final String LOGIN_URL = AUTH_BASE_URL + "/login";
    private static final String REGISTER_URL = AUTH_BASE_URL + "/register";
    private static final String REFRESH_URL = AUTH_BASE_URL + "/refresh";
    private static final String FORGOT_PASSWORD_URL = AUTH_BASE_URL + "/forgot-password";
    private static final String RESET_PASSWORD_URL = AUTH_BASE_URL + "/reset-password";
    private static final String VALIDATE_RESET_TOKEN_URL = AUTH_BASE_URL + "/validate-reset-token";

    private static final String VALID_PASSWORD = "SecurePass123!";
    private static final String TEST_EMAIL = "testuser@example.com";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Creates an active user in the database with the given email and password.
     */
    private User createActiveUser(String email, String password) {
        User user = User.builder()
            .email(email.toLowerCase())
            .passwordHash(passwordEncoder.encode(password))
            .firstName("Test")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .build();
        return userRepository.save(user);
    }

    @Nested
    @DisplayName("POST /auth/login")
    class LoginEndpoint {

        @Test
        @DisplayName("should return token when credentials are valid")
        void should_ReturnToken_When_CredentialsValid() throws Exception {
            // Arrange: Create an active user
            String email = "login-valid-" + UUID.randomUUID() + "@example.com";
            createActiveUser(email, VALID_PASSWORD);

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .build();

            // Act & Assert
            performPost(LOGIN_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()))
                .andExpect(jsonPath("$.mfaRequired").value(false));
        }

        @Test
        @DisplayName("should return 401 when password is incorrect")
        void should_Return401_When_PasswordIncorrect() throws Exception {
            // Arrange: Create an active user
            String email = "login-bad-pw-" + UUID.randomUUID() + "@example.com";
            createActiveUser(email, VALID_PASSWORD);

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email)
                .password("WrongPassword123!")
                .build();

            // Act & Assert
            performPost(LOGIN_URL, request)
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 401 when user does not exist")
        void should_Return401_When_UserNotFound() throws Exception {
            // Arrange: Use an email that does not exist
            AuthenticationRequest request = AuthenticationRequest.builder()
                .email("nonexistent@example.com")
                .password(VALID_PASSWORD)
                .build();

            // Act & Assert
            performPost(LOGIN_URL, request)
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 400 when email is missing")
        void should_Return400_When_EmailMissing() throws Exception {
            // Arrange: Request with no email
            AuthenticationRequest request = AuthenticationRequest.builder()
                .password(VALID_PASSWORD)
                .build();

            // Act & Assert
            performPost(LOGIN_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when password is missing")
        void should_Return400_When_PasswordMissing() throws Exception {
            // Arrange: Request with no password
            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(TEST_EMAIL)
                .build();

            // Act & Assert
            performPost(LOGIN_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when email format is invalid")
        void should_Return400_When_EmailFormatInvalid() throws Exception {
            // Arrange: Request with invalid email format
            AuthenticationRequest request = AuthenticationRequest.builder()
                .email("not-an-email")
                .password(VALID_PASSWORD)
                .build();

            // Act & Assert
            performPost(LOGIN_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 401 when user account is suspended")
        void should_Return401_When_AccountSuspended() throws Exception {
            // Arrange: Create a suspended user
            String email = "suspended-" + UUID.randomUUID() + "@example.com";
            User user = User.builder()
                .email(email.toLowerCase())
                .passwordHash(passwordEncoder.encode(VALID_PASSWORD))
                .firstName("Test")
                .lastName("User")
                .status(UserStatus.SUSPENDED)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            userRepository.save(user);

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .build();

            // Act & Assert
            performPost(LOGIN_URL, request)
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should treat email as case-insensitive")
        void should_TreatEmailCaseInsensitive() throws Exception {
            // Arrange: Create user with lowercase email
            String email = "CaSeInSeNsItIvE@example.com";
            createActiveUser(email.toLowerCase(), VALID_PASSWORD);

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email.toUpperCase())
                .password(VALID_PASSWORD)
                .build();

            // Act & Assert
            performPost(LOGIN_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
        }
    }

    @Nested
    @DisplayName("POST /auth/register")
    class RegisterEndpoint {

        @Test
        @DisplayName("should create user and return token on valid registration")
        void should_CreateUserAndReturnToken_When_RegistrationValid() throws Exception {
            // Arrange
            String email = "newuser-" + UUID.randomUUID() + "@example.com";
            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("New")
                .lastName("User")
                .build();

            // Act & Assert
            performPost(REGISTER_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()))
                .andExpect(jsonPath("$.user.firstName").value("New"))
                .andExpect(jsonPath("$.user.lastName").value("User"));

            // Verify user was created in database
            assertThat(userRepository.existsByEmail(email.toLowerCase())).isTrue();
        }

        @Test
        @DisplayName("should return 400 when email already exists")
        void should_Return400_When_EmailAlreadyExists() throws Exception {
            // Arrange: Create an existing user
            String email = "existing-" + UUID.randomUUID() + "@example.com";
            createActiveUser(email, VALID_PASSWORD);

            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Duplicate")
                .lastName("User")
                .build();

            // Act & Assert - IllegalArgumentException returns 400 per GlobalExceptionHandler
            performPost(REGISTER_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when email is missing")
        void should_Return400_When_EmailMissing() throws Exception {
            // Arrange
            RegisterRequest request = RegisterRequest.builder()
                .password(VALID_PASSWORD)
                .firstName("No")
                .lastName("Email")
                .build();

            // Act & Assert
            performPost(REGISTER_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when password is missing")
        void should_Return400_When_PasswordMissing() throws Exception {
            // Arrange
            RegisterRequest request = RegisterRequest.builder()
                .email("nopassword@example.com")
                .firstName("No")
                .lastName("Password")
                .build();

            // Act & Assert
            performPost(REGISTER_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when password is too short")
        void should_Return400_When_PasswordTooShort() throws Exception {
            // Arrange: Password less than 8 characters
            RegisterRequest request = RegisterRequest.builder()
                .email("shortpw@example.com")
                .password("Short1!")
                .firstName("Short")
                .lastName("Password")
                .build();

            // Act & Assert
            performPost(REGISTER_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when email format is invalid")
        void should_Return400_When_EmailFormatInvalid() throws Exception {
            // Arrange
            RegisterRequest request = RegisterRequest.builder()
                .email("invalid-email-format")
                .password(VALID_PASSWORD)
                .firstName("Invalid")
                .lastName("Email")
                .build();

            // Act & Assert
            performPost(REGISTER_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should create tenant when organization name is provided")
        void should_CreateTenant_When_OrganizationNameProvided() throws Exception {
            // Arrange
            String email = "orguser-" + UUID.randomUUID() + "@example.com";
            String orgName = "Test Organization " + UUID.randomUUID();
            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Org")
                .lastName("Admin")
                .organizationName(orgName)
                .build();

            // Act & Assert
            performPost(REGISTER_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()));

            // User should exist
            assertThat(userRepository.existsByEmail(email.toLowerCase())).isTrue();
        }

        @Test
        @DisplayName("should normalize email to lowercase")
        void should_NormalizeEmailToLowercase() throws Exception {
            // Arrange
            String email = "UPPERCASE-" + UUID.randomUUID() + "@EXAMPLE.COM";
            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Upper")
                .lastName("Case")
                .build();

            // Act & Assert
            performPost(REGISTER_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()));

            // Verify email is stored in lowercase
            assertThat(userRepository.existsByEmail(email.toLowerCase())).isTrue();
        }
    }

    @Nested
    @DisplayName("POST /auth/refresh")
    class RefreshTokenEndpoint {

        @Test
        @DisplayName("should return new tokens when refresh token is valid")
        void should_ReturnNewTokens_When_RefreshTokenValid() throws Exception {
            // Arrange: Login to get tokens
            String email = "refresh-valid-" + UUID.randomUUID() + "@example.com";
            createActiveUser(email, VALID_PASSWORD);

            AuthenticationRequest loginRequest = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .build();

            // Get initial tokens
            MvcResult loginResult = performPost(LOGIN_URL, loginRequest)
                .andExpect(status().isOk())
                .andReturn();

            String refreshToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("refreshToken").asText();

            // Act & Assert: Use refresh token
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(REFRESH_URL)
                    .header("Authorization", "Bearer " + refreshToken)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());
        }

        @Test
        @DisplayName("should return 400 when authorization header is missing")
        void should_Return400_When_AuthorizationHeaderMissing() throws Exception {
            // Act & Assert - Missing required header returns 400 (Bad Request)
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(REFRESH_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when authorization header format is invalid")
        void should_Return400_When_AuthorizationHeaderFormatInvalid() throws Exception {
            // Act & Assert: Missing "Bearer " prefix
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(REFRESH_URL)
                    .header("Authorization", "InvalidFormat token123")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 401 when refresh token is invalid")
        void should_Return401_When_RefreshTokenInvalid() throws Exception {
            // Act & Assert - Invalid JWT token returns 401 (Unauthorized)
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(REFRESH_URL)
                    .header("Authorization", "Bearer invalid.refresh.token")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /auth/forgot-password")
    class ForgotPasswordEndpoint {

        @Test
        @DisplayName("should return success message regardless of whether email exists")
        void should_ReturnSuccessMessage_AlwaysToPreventEnumeration() throws Exception {
            // Arrange: Use an email that does not exist
            AuthController.ForgotPasswordRequest request =
                new AuthController.ForgotPasswordRequest("nonexistent@example.com");

            // Act & Assert: Should always return 200 to prevent user enumeration
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(FORGOT_PASSWORD_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(toJson(request))
            )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("should return success message for existing user")
        void should_ReturnSuccessMessage_When_UserExists() throws Exception {
            // Arrange: Create an active user
            String email = "forgot-pw-" + UUID.randomUUID() + "@example.com";
            createActiveUser(email, VALID_PASSWORD);

            AuthController.ForgotPasswordRequest request =
                new AuthController.ForgotPasswordRequest(email);

            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(FORGOT_PASSWORD_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(toJson(request))
            )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("should return 400 when email is missing")
        void should_Return400_When_EmailMissing() throws Exception {
            // Arrange: Empty JSON body
            String emptyRequest = "{}";

            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(FORGOT_PASSWORD_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(emptyRequest)
            )
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when email format is invalid")
        void should_Return400_When_EmailFormatInvalid() throws Exception {
            // Arrange
            AuthController.ForgotPasswordRequest request =
                new AuthController.ForgotPasswordRequest("not-an-email");

            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(FORGOT_PASSWORD_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(toJson(request))
            )
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /auth/reset-password")
    class ResetPasswordEndpoint {

        @Test
        @DisplayName("should return 400 when token is missing")
        void should_Return400_When_TokenMissing() throws Exception {
            // Arrange: Request without token
            AuthController.ResetPasswordRequest request =
                new AuthController.ResetPasswordRequest(null, "NewPassword123!");

            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(RESET_PASSWORD_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(toJson(request))
            )
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when new password is missing")
        void should_Return400_When_NewPasswordMissing() throws Exception {
            // Arrange: Request without new password
            AuthController.ResetPasswordRequest request =
                new AuthController.ResetPasswordRequest("some-token", null);

            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(RESET_PASSWORD_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(toJson(request))
            )
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when new password is too short")
        void should_Return400_When_NewPasswordTooShort() throws Exception {
            // Arrange: Password less than 8 characters
            AuthController.ResetPasswordRequest request =
                new AuthController.ResetPasswordRequest("some-token", "Short1!");

            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(RESET_PASSWORD_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(toJson(request))
            )
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when token is invalid")
        void should_Return400_When_TokenInvalid() throws Exception {
            // Arrange: Invalid token
            AuthController.ResetPasswordRequest request =
                new AuthController.ResetPasswordRequest("invalid-token-123", "NewPassword123!");

            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(RESET_PASSWORD_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(toJson(request))
            )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("GET /auth/validate-reset-token")
    class ValidateResetTokenEndpoint {

        @Test
        @DisplayName("should return valid=false for invalid token")
        void should_ReturnValidFalse_When_TokenInvalid() throws Exception {
            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(VALIDATE_RESET_TOKEN_URL)
                    .param("token", "invalid-token-value")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
        }

        @Test
        @DisplayName("should return 400 when token parameter is missing")
        void should_Return400_When_TokenMissing() throws Exception {
            // Act & Assert
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(VALIDATE_RESET_TOKEN_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isBadRequest());
        }
    }
}
