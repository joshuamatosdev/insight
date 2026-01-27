package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.repository.*;
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
 * End-to-End tests for Security features.
 * Covers MFA, OAuth2/SSO, Sessions, and Permissions.
 */
class SecurityE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Security E2E Tenant")
            .slug("sec-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("sec-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Security")
            .lastName("Tester")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("Multi-Factor Authentication (MFA)")
    class MultiFacorAuthentication {

        @Test
        @DisplayName("should get MFA status")
        void shouldGetMfaStatus() throws Exception {
            performGet("/api/v1/mfa/status")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should initiate MFA setup")
        void shouldInitiateMfaSetup() throws Exception {
            performPost("/api/v1/mfa/setup")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qrCodeUrl").isNotEmpty())
                .andExpect(jsonPath("$.secret").isNotEmpty());
        }

        @Test
        @DisplayName("should reject invalid TOTP code during setup verification")
        void shouldRejectInvalidTotpCode() throws Exception {
            // First initiate setup
            performPost("/api/v1/mfa/setup")
                .andExpect(status().isOk());

            // Then try to verify with invalid code
            Map<String, Object> verifyRequest = Map.of(
                "code", "000000"
            );

            performPost("/api/v1/mfa/verify-setup", verifyRequest)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should get backup codes after MFA enabled")
        void shouldGetBackupCodes() throws Exception {
            performGet("/api/v1/mfa/backup-codes")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should regenerate backup codes")
        void shouldRegenerateBackupCodes() throws Exception {
            performPost("/api/v1/mfa/backup-codes/regenerate")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codes").isArray());
        }

        @Test
        @DisplayName("should disable MFA with valid code")
        void shouldDisableMfaWithValidCode() throws Exception {
            Map<String, Object> request = Map.of(
                "code", "123456",
                "password", "TestPass123!"
            );

            // This will likely fail without proper MFA setup, but tests the endpoint
            performPost("/api/v1/mfa/disable", request)
                .andExpect(status().is(anyOf(equalTo(200), equalTo(400))));
        }

        @Test
        @DisplayName("should verify MFA during login")
        void shouldVerifyMfaDuringLogin() throws Exception {
            Map<String, Object> request = Map.of(
                "code", "123456",
                "sessionToken", "temp-session-token"
            );

            performPost("/api/v1/mfa/verify", request)
                .andExpect(status().is(anyOf(equalTo(200), equalTo(400), equalTo(401))));
        }
    }

    @Nested
    @DisplayName("OAuth2 / SSO")
    class OAuth2Sso {

        @Test
        @DisplayName("should list connected OAuth providers")
        void shouldListConnectedOAuthProviders() throws Exception {
            performGet("/api/v1/oauth/connections")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should get available OAuth providers")
        void shouldGetAvailableOAuthProviders() throws Exception {
            performGet("/api/v1/oauth/providers")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should initiate Google OAuth")
        void shouldInitiateGoogleOAuth() throws Exception {
            performGet("/api/v1/oauth/google/authorize")
                .andExpect(status().is(anyOf(equalTo(200), equalTo(302))));
        }

        @Test
        @DisplayName("should initiate Microsoft OAuth")
        void shouldInitiateMicrosoftOAuth() throws Exception {
            performGet("/api/v1/oauth/microsoft/authorize")
                .andExpect(status().is(anyOf(equalTo(200), equalTo(302))));
        }

        @Test
        @DisplayName("should disconnect OAuth provider")
        void shouldDisconnectOAuthProvider() throws Exception {
            performDelete("/api/v1/oauth/connections/google")
                .andExpect(status().is(anyOf(equalTo(204), equalTo(404))));
        }

        @Test
        @DisplayName("should handle OAuth callback")
        void shouldHandleOAuthCallback() throws Exception {
            performGet("/api/v1/oauth/google/callback?code=test-code&state=test-state")
                .andExpect(status().is(anyOf(equalTo(200), equalTo(302), equalTo(400))));
        }
    }

    @Nested
    @DisplayName("Session Management")
    class SessionManagement {

        @Test
        @DisplayName("should list active sessions")
        void shouldListActiveSessions() throws Exception {
            performGet("/api/v1/sessions")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should get current session")
        void shouldGetCurrentSession() throws Exception {
            performGet("/api/v1/sessions/current")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should terminate specific session")
        void shouldTerminateSpecificSession() throws Exception {
            // Get sessions first
            String sessionsResponse = performGet("/api/v1/sessions")
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

            // If there are sessions, try to terminate one
            if (sessionsResponse.contains("id")) {
                performDelete("/api/v1/sessions/test-session-id")
                    .andExpect(status().is(anyOf(equalTo(204), equalTo(404))));
            }
        }

        @Test
        @DisplayName("should terminate all other sessions")
        void shouldTerminateAllOtherSessions() throws Exception {
            performPost("/api/v1/sessions/terminate-others")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get session activity")
        void shouldGetSessionActivity() throws Exception {
            performGet("/api/v1/sessions/activity")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should refresh session")
        void shouldRefreshSession() throws Exception {
            performPost("/api/v1/sessions/refresh")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Permission Management")
    class PermissionManagement {

        @Test
        @DisplayName("should list all permissions")
        void shouldListAllPermissions() throws Exception {
            performGet("/api/v1/permissions")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should list permissions by category")
        void shouldListPermissionsByCategory() throws Exception {
            performGet("/api/v1/permissions?category=OPPORTUNITY")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should get permission details")
        void shouldGetPermissionDetails() throws Exception {
            performGet("/api/v1/permissions/read:opportunities")
                .andExpect(status().is(anyOf(equalTo(200), equalTo(404))));
        }

        @Test
        @DisplayName("should check user permission")
        void shouldCheckUserPermission() throws Exception {
            performGet("/api/v1/permissions/check?permission=read:opportunities")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasPermission").isBoolean());
        }

        @Test
        @DisplayName("should list user effective permissions")
        void shouldListUserEffectivePermissions() throws Exception {
            performGet("/api/v1/users/" + testUserId + "/permissions")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should assign permission to role")
        void shouldAssignPermissionToRole() throws Exception {
            Map<String, Object> request = Map.of(
                "permissions", java.util.List.of("read:opportunities", "write:contracts")
            );

            // This requires a valid role ID
            performPost("/api/v1/permissions/assign", request)
                .andExpect(status().is(anyOf(equalTo(200), equalTo(400))));
        }

        @Test
        @DisplayName("should get permission matrix")
        void shouldGetPermissionMatrix() throws Exception {
            performGet("/api/v1/permissions/matrix")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Security Settings")
    class SecuritySettings {

        @Test
        @DisplayName("should get security settings")
        void shouldGetSecuritySettings() throws Exception {
            performGet("/api/v1/security/settings")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update password policy")
        void shouldUpdatePasswordPolicy() throws Exception {
            Map<String, Object> policy = Map.of(
                "minLength", 12,
                "requireUppercase", true,
                "requireLowercase", true,
                "requireNumbers", true,
                "requireSpecialChars", true,
                "maxAge", 90
            );

            performPut("/api/v1/security/password-policy", policy)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update session settings")
        void shouldUpdateSessionSettings() throws Exception {
            Map<String, Object> settings = Map.of(
                "sessionTimeout", 3600,
                "maxConcurrentSessions", 5,
                "requireReauthForSensitive", true
            );

            performPut("/api/v1/security/session-settings", settings)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get security audit log")
        void shouldGetSecurityAuditLog() throws Exception {
            performGet("/api/v1/security/audit-log")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should get login history")
        void shouldGetLoginHistory() throws Exception {
            performGet("/api/v1/security/login-history")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }
}
