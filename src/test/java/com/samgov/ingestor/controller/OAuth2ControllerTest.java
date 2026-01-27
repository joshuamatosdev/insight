package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.OAuth2Properties;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.controller.OAuth2Controller.OAuthCallbackRequest;
import com.samgov.ingestor.controller.OAuth2Controller.OAuthLinkRequest;
import com.samgov.ingestor.model.OAuthConnection;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.OAuthConnectionRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for OAuth2Controller endpoints.
 * Tests the OAuth2 authentication API behavior including:
 * - Provider listing
 * - OAuth callback handling
 * - Account linking/unlinking
 * - Error scenarios
 */
@DisplayName("OAuth2Controller")
class OAuth2ControllerTest extends BaseControllerTest {

    private static final String OAUTH_BASE_URL = "/api/v1/oauth";
    private static final String PROVIDERS_URL = OAUTH_BASE_URL + "/providers";
    private static final String CALLBACK_URL = OAUTH_BASE_URL + "/callback";
    private static final String CONNECTIONS_URL = OAUTH_BASE_URL + "/connections";
    private static final String LINK_URL = OAUTH_BASE_URL + "/link";

    private static final String GOOGLE_PROVIDER = "google";
    private static final String MICROSOFT_PROVIDER = "microsoft";
    private static final String SAML_PROVIDER = "saml";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    @Autowired
    private OAuthConnectionRepository oauthConnectionRepository;

    @Autowired
    private OAuth2Properties oauth2Properties;

    private Tenant testTenant;
    private User testUser;
    private Role testUserRole;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();

        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testUserRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .isSystemRole(false)
            .build();
        testUserRole = roleRepository.save(testUserRole);

        // Create test user WITH password (for unlink tests)
        testUser = User.builder()
            .email("testuser-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .build();
        testUser = userRepository.save(testUser);

        // Create membership
        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testUserRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(membership);

        // Set tenant context for tests
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    /**
     * Helper to create an OAuth connection for the test user.
     */
    private OAuthConnection createOAuthConnection(String provider, String providerUserId, String email) {
        OAuthConnection connection = OAuthConnection.builder()
            .user(testUser)
            .provider(provider)
            .providerUserId(providerUserId)
            .email(email)
            .accessToken("test-access-token")
            .refreshToken("test-refresh-token")
            .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
            .lastLoginAt(Instant.now())
            .build();
        return oauthConnectionRepository.save(connection);
    }

    /**
     * Helper to create an OAuth connection for a specific user.
     */
    private OAuthConnection createOAuthConnectionForUser(User user, String provider, String providerUserId, String email) {
        OAuthConnection connection = OAuthConnection.builder()
            .user(user)
            .provider(provider)
            .providerUserId(providerUserId)
            .email(email)
            .accessToken("test-access-token")
            .refreshToken("test-refresh-token")
            .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
            .lastLoginAt(Instant.now())
            .build();
        return oauthConnectionRepository.save(connection);
    }

    @Nested
    @DisplayName("GET /api/v1/oauth/providers")
    class GetProvidersEndpoint {

        @Test
        @DisplayName("should return providers list with enabled status")
        void should_ReturnProvidersList_When_OAuthConfigured() throws Exception {
            // Act & Assert
            performGet(PROVIDERS_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providers").isArray())
                .andExpect(jsonPath("$.enabled").exists());
        }

        @Test
        @DisplayName("should return providers list without authentication")
        void should_ReturnProviders_When_NotAuthenticated() throws Exception {
            // Clear tenant context
            TenantContext.clear();

            // Act & Assert - providers endpoint is public
            mockMvc.perform(get(PROVIDERS_URL)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providers").exists());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/oauth/callback")
    class CallbackEndpoint {

        @Test
        @DisplayName("should return authentication tokens for valid Google callback")
        void should_ReturnTokens_When_GoogleCallbackValid() throws Exception {
            // Arrange
            String email = "newuser-" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
            Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);

            OAuthCallbackRequest request = new OAuthCallbackRequest(
                GOOGLE_PROVIDER,
                "google-user-" + UUID.randomUUID(),
                email,
                "John",
                "Doe",
                "oauth-access-token",
                "oauth-refresh-token",
                expiresAt
            );

            // Act & Assert
            performPost(CALLBACK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()));

            // Verify user was created
            assertThat(userRepository.existsByEmail(email.toLowerCase())).isTrue();
        }

        @Test
        @DisplayName("should return authentication tokens for valid Microsoft callback")
        void should_ReturnTokens_When_MicrosoftCallbackValid() throws Exception {
            // Arrange
            String email = "msuser-" + UUID.randomUUID().toString().substring(0, 8) + "@outlook.com";

            OAuthCallbackRequest request = new OAuthCallbackRequest(
                MICROSOFT_PROVIDER,
                "ms-user-" + UUID.randomUUID(),
                email,
                "Jane",
                "Smith",
                "ms-access-token",
                "ms-refresh-token",
                null
            );

            // Act & Assert
            performPost(CALLBACK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()));
        }

        @Test
        @DisplayName("should link to existing user when email matches")
        void should_LinkToExistingUser_When_EmailMatches() throws Exception {
            // Arrange - use existing test user's email
            String existingEmail = testUser.getEmail();

            OAuthCallbackRequest request = new OAuthCallbackRequest(
                GOOGLE_PROVIDER,
                "google-new-connection-" + UUID.randomUUID(),
                existingEmail,
                testUser.getFirstName(),
                testUser.getLastName(),
                "oauth-access-token",
                "oauth-refresh-token",
                null
            );

            // Act & Assert
            performPost(CALLBACK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(testUser.getId().toString()))
                .andExpect(jsonPath("$.user.email").value(existingEmail));

            // Verify OAuth connection was created
            assertThat(oauthConnectionRepository.existsByUserIdAndProvider(testUser.getId(), GOOGLE_PROVIDER)).isTrue();
        }

        @Test
        @DisplayName("should update tokens for existing OAuth connection")
        void should_UpdateTokens_When_ExistingConnection() throws Exception {
            // Arrange - create existing connection
            String providerUserId = "google-existing-" + UUID.randomUUID();
            OAuthConnection existingConnection = createOAuthConnection(
                GOOGLE_PROVIDER,
                providerUserId,
                testUser.getEmail()
            );

            OAuthCallbackRequest request = new OAuthCallbackRequest(
                GOOGLE_PROVIDER,
                providerUserId,
                testUser.getEmail(),
                testUser.getFirstName(),
                testUser.getLastName(),
                "new-access-token",
                "new-refresh-token",
                Instant.now().plus(2, ChronoUnit.HOURS)
            );

            // Act & Assert
            performPost(CALLBACK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(testUser.getId().toString()));

            // Verify token was updated
            OAuthConnection updatedConnection = oauthConnectionRepository
                .findByProviderAndProviderUserId(GOOGLE_PROVIDER, providerUserId)
                .orElseThrow();
            assertThat(updatedConnection.getAccessToken()).isEqualTo("new-access-token");
        }

        @Test
        @DisplayName("should return 400 when provider is missing")
        void should_Return400_When_ProviderMissing() throws Exception {
            // Arrange - provider is blank/null
            String requestBody = """
                {
                    "providerUserId": "user-123",
                    "email": "user@example.com",
                    "firstName": "John",
                    "lastName": "Doe"
                }
                """;

            // Act & Assert
            mockMvc.perform(withTenantContext(post(CALLBACK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when provider is blank")
        void should_Return400_When_ProviderBlank() throws Exception {
            // Arrange
            String requestBody = """
                {
                    "provider": "",
                    "providerUserId": "user-123",
                    "email": "user@example.com"
                }
                """;

            // Act & Assert
            mockMvc.perform(withTenantContext(post(CALLBACK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when providerUserId is missing")
        void should_Return400_When_ProviderUserIdMissing() throws Exception {
            // Arrange
            String requestBody = """
                {
                    "provider": "google",
                    "email": "user@example.com"
                }
                """;

            // Act & Assert
            mockMvc.perform(withTenantContext(post(CALLBACK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when email is missing")
        void should_Return400_When_EmailMissing() throws Exception {
            // Arrange
            String requestBody = """
                {
                    "provider": "google",
                    "providerUserId": "user-123"
                }
                """;

            // Act & Assert
            mockMvc.perform(withTenantContext(post(CALLBACK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should handle callback with optional fields null")
        void should_HandleCallback_When_OptionalFieldsNull() throws Exception {
            // Arrange
            String email = "minimaluser-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";

            OAuthCallbackRequest request = new OAuthCallbackRequest(
                GOOGLE_PROVIDER,
                "google-user-" + UUID.randomUUID(),
                email,
                null,  // firstName is optional
                null,  // lastName is optional
                null,  // accessToken is optional
                null,  // refreshToken is optional
                null   // expiresAt is optional
            );

            // Act & Assert
            performPost(CALLBACK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
        }

        @Test
        @DisplayName("should handle SAML callback successfully")
        void should_HandleSamlCallback_When_Valid() throws Exception {
            // Arrange
            String email = "samluser-" + UUID.randomUUID().toString().substring(0, 8) + "@enterprise.com";

            OAuthCallbackRequest request = new OAuthCallbackRequest(
                SAML_PROVIDER,
                "saml-user-" + UUID.randomUUID(),
                email,
                "Enterprise",
                "User",
                null,  // SAML typically doesn't use access tokens the same way
                null,
                null
            );

            // Act & Assert
            performPost(CALLBACK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/oauth/connections")
    class GetConnectionsEndpoint {

        @Test
        @DisplayName("should return user's OAuth connections when authenticated")
        void should_ReturnConnections_When_Authenticated() throws Exception {
            // Arrange - create OAuth connections for test user
            OAuthConnection googleConnection = createOAuthConnection(
                GOOGLE_PROVIDER,
                "google-user-" + UUID.randomUUID(),
                "user@gmail.com"
            );
            OAuthConnection msConnection = createOAuthConnection(
                MICROSOFT_PROVIDER,
                "ms-user-" + UUID.randomUUID(),
                "user@outlook.com"
            );

            // Act & Assert
            performGet(CONNECTIONS_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].provider").exists())
                .andExpect(jsonPath("$[0].email").exists())
                .andExpect(jsonPath("$[1].provider").exists());
        }

        @Test
        @DisplayName("should return empty list when user has no connections")
        void should_ReturnEmptyList_When_NoConnections() throws Exception {
            // Act & Assert - testUser has no OAuth connections by default
            performGet(CONNECTIONS_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("should return connection details with correct fields")
        void should_ReturnConnectionDetails_When_Valid() throws Exception {
            // Arrange
            String connectionEmail = "oauth-" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
            OAuthConnection connection = createOAuthConnection(
                GOOGLE_PROVIDER,
                "google-unique-" + UUID.randomUUID(),
                connectionEmail
            );

            // Act & Assert
            performGet(CONNECTIONS_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(connection.getId().toString()))
                .andExpect(jsonPath("$[0].provider").value(GOOGLE_PROVIDER))
                .andExpect(jsonPath("$[0].email").value(connectionEmail))
                .andExpect(jsonPath("$[0].connectedAt").exists());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/oauth/link")
    class LinkProviderEndpoint {

        @Test
        @DisplayName("should link OAuth provider to authenticated user")
        void should_LinkProvider_When_Authenticated() throws Exception {
            // Arrange
            String connectionEmail = "link-" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
            Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);

            OAuthLinkRequest request = new OAuthLinkRequest(
                GOOGLE_PROVIDER,
                "google-link-" + UUID.randomUUID(),
                connectionEmail,
                "oauth-access-token",
                "oauth-refresh-token",
                expiresAt
            );

            // Act & Assert
            performPost(LINK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value(GOOGLE_PROVIDER))
                .andExpect(jsonPath("$.email").value(connectionEmail));

            // Verify connection was created
            assertThat(oauthConnectionRepository.existsByUserIdAndProvider(testUser.getId(), GOOGLE_PROVIDER)).isTrue();
        }

        @Test
        @DisplayName("should return 400 when provider already linked")
        void should_Return400_When_ProviderAlreadyLinked() throws Exception {
            // Arrange - create existing connection
            createOAuthConnection(
                GOOGLE_PROVIDER,
                "google-existing-" + UUID.randomUUID(),
                "existing@gmail.com"
            );

            OAuthLinkRequest request = new OAuthLinkRequest(
                GOOGLE_PROVIDER,
                "google-new-" + UUID.randomUUID(),
                "new@gmail.com",
                null,
                null,
                null
            );

            // Act & Assert
            performPost(LINK_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when provider account already linked to another user")
        void should_Return400_When_ProviderAccountLinkedToAnotherUser() throws Exception {
            // Arrange - create another user with the OAuth connection
            User otherUser = User.builder()
                .email("other-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            otherUser = userRepository.save(otherUser);

            String sharedProviderUserId = "google-shared-" + UUID.randomUUID();
            createOAuthConnectionForUser(otherUser, GOOGLE_PROVIDER, sharedProviderUserId, "other@gmail.com");

            // Try to link the same provider account to testUser
            OAuthLinkRequest request = new OAuthLinkRequest(
                GOOGLE_PROVIDER,
                sharedProviderUserId,
                "testuser@gmail.com",
                null,
                null,
                null
            );

            // Act & Assert
            performPost(LINK_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when provider is missing in link request")
        void should_Return400_When_ProviderMissingInLinkRequest() throws Exception {
            // Arrange
            String requestBody = """
                {
                    "providerUserId": "user-123",
                    "email": "user@example.com"
                }
                """;

            // Act & Assert
            mockMvc.perform(withTenantContext(post(LINK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when email is missing in link request")
        void should_Return400_When_EmailMissingInLinkRequest() throws Exception {
            // Arrange
            String requestBody = """
                {
                    "provider": "google",
                    "providerUserId": "user-123"
                }
                """;

            // Act & Assert
            mockMvc.perform(withTenantContext(post(LINK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should link Microsoft provider with all optional fields null")
        void should_LinkMicrosoft_When_OptionalFieldsNull() throws Exception {
            // Arrange
            String connectionEmail = "ms-link-" + UUID.randomUUID().toString().substring(0, 8) + "@outlook.com";

            OAuthLinkRequest request = new OAuthLinkRequest(
                MICROSOFT_PROVIDER,
                "ms-link-" + UUID.randomUUID(),
                connectionEmail,
                null,
                null,
                null
            );

            // Act & Assert
            performPost(LINK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value(MICROSOFT_PROVIDER));
        }

        @Test
        @DisplayName("should link SAML provider to existing user")
        void should_LinkSamlProvider_When_Valid() throws Exception {
            // Arrange
            String connectionEmail = "saml-" + UUID.randomUUID().toString().substring(0, 8) + "@enterprise.com";

            OAuthLinkRequest request = new OAuthLinkRequest(
                SAML_PROVIDER,
                "saml-link-" + UUID.randomUUID(),
                connectionEmail,
                null,
                null,
                null
            );

            // Act & Assert
            performPost(LINK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value(SAML_PROVIDER));
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/oauth/connections/{provider}")
    class UnlinkProviderEndpoint {

        @Test
        @DisplayName("should unlink OAuth provider when user has password")
        void should_UnlinkProvider_When_UserHasPassword() throws Exception {
            // Arrange - testUser already has password, create connection
            createOAuthConnection(
                GOOGLE_PROVIDER,
                "google-unlink-" + UUID.randomUUID(),
                "unlink@gmail.com"
            );

            // Act & Assert
            performDelete(CONNECTIONS_URL + "/" + GOOGLE_PROVIDER)
                .andExpect(status().isOk());

            // Verify connection was removed
            assertThat(oauthConnectionRepository.existsByUserIdAndProvider(testUser.getId(), GOOGLE_PROVIDER)).isFalse();
        }

        @Test
        @DisplayName("should unlink OAuth provider when user has multiple OAuth connections")
        void should_UnlinkProvider_When_UserHasMultipleConnections() throws Exception {
            // Arrange - create user without password but with multiple OAuth connections
            User oauthOnlyUser = User.builder()
                .email("oauthonly-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash(null)  // No password
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            oauthOnlyUser = userRepository.save(oauthOnlyUser);

            // Create two OAuth connections
            createOAuthConnectionForUser(oauthOnlyUser, GOOGLE_PROVIDER,
                "google-multi-" + UUID.randomUUID(), "multi@gmail.com");
            createOAuthConnectionForUser(oauthOnlyUser, MICROSOFT_PROVIDER,
                "ms-multi-" + UUID.randomUUID(), "multi@outlook.com");

            // Switch context to this user
            TenantContext.setCurrentUserId(oauthOnlyUser.getId());
            testUserId = oauthOnlyUser.getId();

            // Act & Assert - should be able to unlink one since they have another
            performDelete(CONNECTIONS_URL + "/" + GOOGLE_PROVIDER)
                .andExpect(status().isOk());

            // Verify only Google was removed
            assertThat(oauthConnectionRepository.existsByUserIdAndProvider(oauthOnlyUser.getId(), GOOGLE_PROVIDER)).isFalse();
            assertThat(oauthConnectionRepository.existsByUserIdAndProvider(oauthOnlyUser.getId(), MICROSOFT_PROVIDER)).isTrue();
        }

        @Test
        @DisplayName("should return 400 when trying to unlink only login method")
        void should_Return400_When_UnlinkingOnlyLoginMethod() throws Exception {
            // Arrange - create user without password and with only one OAuth connection
            User oauthOnlyUser = User.builder()
                .email("singleoauth-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash(null)  // No password
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            oauthOnlyUser = userRepository.save(oauthOnlyUser);

            createOAuthConnectionForUser(oauthOnlyUser, GOOGLE_PROVIDER,
                "google-only-" + UUID.randomUUID(), "only@gmail.com");

            // Switch context to this user
            TenantContext.setCurrentUserId(oauthOnlyUser.getId());
            testUserId = oauthOnlyUser.getId();

            // Act & Assert
            performDelete(CONNECTIONS_URL + "/" + GOOGLE_PROVIDER)
                .andExpect(status().isBadRequest());

            // Verify connection was NOT removed
            assertThat(oauthConnectionRepository.existsByUserIdAndProvider(oauthOnlyUser.getId(), GOOGLE_PROVIDER)).isTrue();
        }

        @Test
        @DisplayName("should unlink Microsoft provider successfully")
        void should_UnlinkMicrosoft_When_Valid() throws Exception {
            // Arrange
            createOAuthConnection(
                MICROSOFT_PROVIDER,
                "ms-unlink-" + UUID.randomUUID(),
                "unlink@outlook.com"
            );

            // Act & Assert
            performDelete(CONNECTIONS_URL + "/" + MICROSOFT_PROVIDER)
                .andExpect(status().isOk());

            // Verify connection was removed
            assertThat(oauthConnectionRepository.existsByUserIdAndProvider(testUser.getId(), MICROSOFT_PROVIDER)).isFalse();
        }
    }

    @Nested
    @DisplayName("Error Handling Scenarios")
    class ErrorHandlingScenarios {

        @Test
        @DisplayName("should handle invalid JSON in request body")
        void should_Return400_When_InvalidJson() throws Exception {
            // Arrange
            String invalidJson = "{ invalid json }";

            // Act & Assert
            mockMvc.perform(withTenantContext(post(CALLBACK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should handle empty request body")
        void should_Return400_When_EmptyRequestBody() throws Exception {
            // Act & Assert
            mockMvc.perform(withTenantContext(post(CALLBACK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(""))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should handle null request body")
        void should_Return400_When_NullRequestBody() throws Exception {
            // Act & Assert
            mockMvc.perform(withTenantContext(post(CALLBACK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("null"))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should handle empty JSON object")
        void should_Return400_When_EmptyJsonObject() throws Exception {
            // Act & Assert
            mockMvc.perform(withTenantContext(post(CALLBACK_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Token Exchange Scenarios")
    class TokenExchangeScenarios {

        @Test
        @DisplayName("should handle expired tokens in callback")
        void should_HandleExpiredTokens_When_ProcessingCallback() throws Exception {
            // Arrange - token already expired
            String email = "expired-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
            Instant expiredAt = Instant.now().minus(1, ChronoUnit.HOURS);

            OAuthCallbackRequest request = new OAuthCallbackRequest(
                GOOGLE_PROVIDER,
                "google-expired-" + UUID.randomUUID(),
                email,
                "John",
                "Doe",
                "expired-access-token",
                "refresh-token",
                expiredAt
            );

            // Act & Assert - should still process successfully
            performPost(CALLBACK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
        }

        @Test
        @DisplayName("should create new user when OAuth login is first time")
        void should_CreateNewUser_When_FirstTimeOAuthLogin() throws Exception {
            // Arrange
            String newEmail = "brandnew-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";

            OAuthCallbackRequest request = new OAuthCallbackRequest(
                GOOGLE_PROVIDER,
                "google-brandnew-" + UUID.randomUUID(),
                newEmail,
                "Brand",
                "New",
                "access-token",
                "refresh-token",
                Instant.now().plus(1, ChronoUnit.HOURS)
            );

            // Verify user doesn't exist before
            assertThat(userRepository.existsByEmail(newEmail.toLowerCase())).isFalse();

            // Act & Assert
            performPost(CALLBACK_URL, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(newEmail.toLowerCase()))
                .andExpect(jsonPath("$.user.firstName").value("Brand"))
                .andExpect(jsonPath("$.user.lastName").value("New"));

            // Verify user was created
            User createdUser = userRepository.findByEmail(newEmail.toLowerCase()).orElseThrow();
            assertThat(createdUser.getEmailVerified()).isTrue();  // OAuth emails are verified
            assertThat(createdUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        }
    }
}
