package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.dto.AuthenticationRequest;
import com.samgov.ingestor.dto.AuthenticationResponse;
import com.samgov.ingestor.dto.RegisterRequest;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for AuthenticationService.
 * Tests the authentication service behavior, not internal implementation.
 */
@DisplayName("AuthenticationService")
class AuthenticationServiceTest extends BaseServiceTest {

    private static final String VALID_PASSWORD = "SecurePass123!";

    @Autowired
    private AuthenticationService authenticationService;

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
    @DisplayName("authenticate")
    class AuthenticateMethod {

        @Test
        @DisplayName("should return tokens and user data when credentials are valid")
        void should_ReturnTokensAndUserData_When_CredentialsValid() {
            // Arrange
            String email = "auth-valid-" + UUID.randomUUID() + "@example.com";
            User user = createActiveUser(email, VALID_PASSWORD);

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .build();

            // Act
            AuthenticationResponse response = authenticationService.authenticate(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isNotBlank();
            assertThat(response.getRefreshToken()).isNotBlank();
            assertThat(response.getTokenType()).isEqualTo("Bearer");
            assertThat(response.getUser()).isNotNull();
            assertThat(response.getUser().getEmail()).isEqualTo(email.toLowerCase());
            assertThat(response.getMfaRequired()).isFalse();
        }

        @Test
        @DisplayName("should throw exception when password is incorrect")
        void should_ThrowException_When_PasswordIncorrect() {
            // Arrange
            String email = "auth-bad-pw-" + UUID.randomUUID() + "@example.com";
            createActiveUser(email, VALID_PASSWORD);

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email)
                .password("WrongPassword123!")
                .build();

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.authenticate(request))
                .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("should throw exception when user does not exist")
        void should_ThrowException_When_UserNotFound() {
            // Arrange
            AuthenticationRequest request = AuthenticationRequest.builder()
                .email("nonexistent@example.com")
                .password(VALID_PASSWORD)
                .build();

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.authenticate(request))
                .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("should throw exception when account is not active")
        void should_ThrowException_When_AccountNotActive() {
            // Arrange
            String email = "auth-suspended-" + UUID.randomUUID() + "@example.com";
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
            // Spring Security throws LockedException for suspended accounts
            assertThatThrownBy(() -> authenticationService.authenticate(request))
                .isInstanceOf(LockedException.class);
        }

        @Test
        @DisplayName("should update last login timestamp on successful authentication")
        void should_UpdateLastLoginTimestamp_When_AuthenticationSuccessful() {
            // Arrange
            String email = "auth-timestamp-" + UUID.randomUUID() + "@example.com";
            User user = createActiveUser(email, VALID_PASSWORD);
            assertThat(user.getLastLoginAt()).isNull();

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .build();

            // Act
            authenticationService.authenticate(request);

            // Assert
            User updatedUser = userRepository.findByEmail(email.toLowerCase()).orElseThrow();
            assertThat(updatedUser.getLastLoginAt()).isNotNull();
        }

        @Test
        @DisplayName("should normalize email to lowercase during authentication")
        void should_NormalizeEmail_When_Authenticating() {
            // Arrange
            String email = "UPPERCASE-AUTH-" + UUID.randomUUID() + "@EXAMPLE.COM";
            createActiveUser(email.toLowerCase(), VALID_PASSWORD);

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email) // Keep uppercase
                .password(VALID_PASSWORD)
                .build();

            // Act
            AuthenticationResponse response = authenticationService.authenticate(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isNotBlank();
            assertThat(response.getUser().getEmail()).isEqualTo(email.toLowerCase());
        }

        @Test
        @DisplayName("should return mfaRequired when MFA is enabled and no code provided")
        void should_ReturnMfaRequired_When_MfaEnabledAndNoCodeProvided() {
            // Arrange
            String email = "mfa-user-" + UUID.randomUUID() + "@example.com";
            User user = User.builder()
                .email(email.toLowerCase())
                .passwordHash(passwordEncoder.encode(VALID_PASSWORD))
                .firstName("MFA")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(true)
                .mfaSecret("JBSWY3DPEHPK3PXP") // Sample secret
                .build();
            userRepository.save(user);

            AuthenticationRequest request = AuthenticationRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                // No MFA code provided
                .build();

            // Act
            AuthenticationResponse response = authenticationService.authenticate(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getMfaRequired()).isTrue();
            assertThat(response.getAccessToken()).isNull();
        }
    }

    @Nested
    @DisplayName("register")
    class RegisterMethod {

        @Test
        @DisplayName("should create user and return tokens on valid registration")
        void should_CreateUserAndReturnTokens_When_RegistrationValid() {
            // Arrange
            String email = "reg-valid-" + UUID.randomUUID() + "@example.com";
            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("New")
                .lastName("User")
                .build();

            // Act
            AuthenticationResponse response = authenticationService.register(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isNotBlank();
            assertThat(response.getRefreshToken()).isNotBlank();
            assertThat(response.getUser()).isNotNull();
            assertThat(response.getUser().getEmail()).isEqualTo(email.toLowerCase());
            assertThat(response.getUser().getFirstName()).isEqualTo("New");
            assertThat(response.getUser().getLastName()).isEqualTo("User");

            // Verify user exists in database
            assertThat(userRepository.existsByEmail(email.toLowerCase())).isTrue();
        }

        @Test
        @DisplayName("should throw exception when email already exists")
        void should_ThrowException_When_EmailExists() {
            // Arrange
            String email = "reg-dup-" + UUID.randomUUID() + "@example.com";
            createActiveUser(email, VALID_PASSWORD);

            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Duplicate")
                .lastName("User")
                .build();

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("should normalize email to lowercase during registration")
        void should_NormalizeEmail_When_Registering() {
            // Arrange
            String email = "UPPERCASE-REG-" + UUID.randomUUID() + "@EXAMPLE.COM";
            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Upper")
                .lastName("Case")
                .build();

            // Act
            AuthenticationResponse response = authenticationService.register(request);

            // Assert
            assertThat(response.getUser().getEmail()).isEqualTo(email.toLowerCase());
            assertThat(userRepository.existsByEmail(email.toLowerCase())).isTrue();
        }

        @Test
        @DisplayName("should create user with ACTIVE status")
        void should_CreateUserWithActiveStatus() {
            // Arrange
            String email = "reg-status-" + UUID.randomUUID() + "@example.com";
            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Active")
                .lastName("User")
                .build();

            // Act
            authenticationService.register(request);

            // Assert
            User createdUser = userRepository.findByEmail(email.toLowerCase()).orElseThrow();
            assertThat(createdUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        }

        @Test
        @DisplayName("should hash password during registration")
        void should_HashPassword_When_Registering() {
            // Arrange
            String email = "reg-hash-" + UUID.randomUUID() + "@example.com";
            RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Hashed")
                .lastName("Password")
                .build();

            // Act
            authenticationService.register(request);

            // Assert
            User createdUser = userRepository.findByEmail(email.toLowerCase()).orElseThrow();
            // Password should be hashed, not plain text
            assertThat(createdUser.getPasswordHash()).isNotEqualTo(VALID_PASSWORD);
            // Should be able to verify the password
            assertThat(passwordEncoder.matches(VALID_PASSWORD, createdUser.getPasswordHash())).isTrue();
        }
    }

    @Nested
    @DisplayName("refreshToken")
    class RefreshTokenMethod {

        @Test
        @DisplayName("should return new tokens when refresh token is valid")
        void should_ReturnNewTokens_When_RefreshTokenValid() {
            // Arrange: Register a user to get valid tokens
            String email = "refresh-valid-" + UUID.randomUUID() + "@example.com";
            RegisterRequest registerRequest = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Refresh")
                .lastName("Test")
                .build();

            AuthenticationResponse initialResponse = authenticationService.register(registerRequest);
            String refreshToken = initialResponse.getRefreshToken();

            // Act
            AuthenticationResponse refreshedResponse = authenticationService.refreshToken(refreshToken);

            // Assert
            assertThat(refreshedResponse).isNotNull();
            assertThat(refreshedResponse.getAccessToken()).isNotBlank();
            assertThat(refreshedResponse.getRefreshToken()).isNotBlank();
            assertThat(refreshedResponse.getUser()).isNotNull();
            assertThat(refreshedResponse.getUser().getEmail()).isEqualTo(email.toLowerCase());
        }

        @Test
        @DisplayName("should throw exception when refresh token is invalid")
        void should_ThrowException_When_RefreshTokenInvalid() {
            // Arrange: Invalid token
            String invalidToken = "invalid.refresh.token";

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.refreshToken(invalidToken))
                .isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("should return different access token each time")
        void should_ReturnDifferentAccessToken_When_Refreshed() {
            // Arrange
            String email = "refresh-diff-" + UUID.randomUUID() + "@example.com";
            RegisterRequest registerRequest = RegisterRequest.builder()
                .email(email)
                .password(VALID_PASSWORD)
                .firstName("Refresh")
                .lastName("Different")
                .build();

            AuthenticationResponse initialResponse = authenticationService.register(registerRequest);
            String originalAccessToken = initialResponse.getAccessToken();
            String refreshToken = initialResponse.getRefreshToken();

            // Wait a bit to ensure different iat claim
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Act
            AuthenticationResponse refreshedResponse = authenticationService.refreshToken(refreshToken);

            // Assert: New access token should be different
            assertThat(refreshedResponse.getAccessToken()).isNotEqualTo(originalAccessToken);
        }
    }
}
