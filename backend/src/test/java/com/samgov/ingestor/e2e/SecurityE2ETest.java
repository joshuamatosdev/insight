package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.dto.AuthenticationRequest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Security features.
 * Tests MFA, API keys, sessions, permissions, and OAuth.
 */
@DisplayName("Security E2E Tests")
class SecurityE2ETest extends BaseControllerTest {

    private static final String AUTH_URL = "/auth";
    private static final String MFA_URL = "/mfa";
    private static final String API_KEYS_URL = "/api-keys";
    private static final String SESSIONS_URL = "/sessions";
    private static final String PERMISSIONS_URL = "/permissions";
    private static final String OAUTH_URL = "/oauth2";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;
    private String accessToken;

    @Override
    @BeforeEach
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E Security Tenant " + UUID.randomUUID())
            .slug("e2e-security-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-security-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Security")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    private String getAccessToken() throws Exception {
        if (accessToken != null) {
            return accessToken;
        }

        AuthenticationRequest request = AuthenticationRequest.builder()
            .email(testUser.getEmail())
            .password("TestPass123!")
            .build();

        MvcResult result = performPost(AUTH_URL + "/login", request)
            .andExpect(status().isOk())
            .andReturn();

        accessToken = objectMapper.readTree(result.getResponse().getContentAsString())
            .get("accessToken").asText();
        return accessToken;
    }

    @Nested
    @DisplayName("MFA Flow")
    class MFAFlow {

        @Test
        @DisplayName("should get MFA status")
        void should_GetMFAStatus() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(MFA_URL + "/status")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
        }

        @Test
        @DisplayName("should initiate MFA setup")
        void should_InitiateMFASetup() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(post(MFA_URL + "/setup")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").exists())
                .andExpect(jsonPath("$.qrCodeUrl").exists());
        }

        @Test
        @DisplayName("should reject invalid MFA code during verification")
        void should_RejectInvalidMFACode() throws Exception {
            String token = getAccessToken();

            // First setup MFA
            mockMvc.perform(post(MFA_URL + "/setup")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Try to verify with invalid code
            java.util.Map<String, Object> verifyRequest = java.util.Map.of(
                "code", "000000"
            );

            mockMvc.perform(post(MFA_URL + "/verify")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(verifyRequest)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should generate backup codes after MFA enabled")
        void should_GenerateBackupCodes() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(post(MFA_URL + "/backup-codes/generate")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("API Keys Flow")
    class APIKeysFlow {

        @Test
        @DisplayName("should list API keys")
        void should_ListAPIKeys() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(API_KEYS_URL)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create new API key")
        void should_CreateNewAPIKey() throws Exception {
            String token = getAccessToken();

            java.util.Map<String, Object> keyRequest = java.util.Map.of(
                "name", "E2E Test API Key",
                "scopes", java.util.List.of("read:opportunities", "read:contracts")
            );

            mockMvc.perform(post(API_KEYS_URL)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(keyRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test API Key"))
                .andExpect(jsonPath("$.key").exists());
        }

        @Test
        @DisplayName("should revoke API key")
        void should_RevokeAPIKey() throws Exception {
            String token = getAccessToken();

            // First create a key
            java.util.Map<String, Object> keyRequest = java.util.Map.of(
                "name", "Key to Revoke",
                "scopes", java.util.List.of("read:opportunities")
            );

            MvcResult createResult = mockMvc.perform(post(API_KEYS_URL)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(keyRequest)))
                .andExpect(status().isCreated())
                .andReturn();

            String keyId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // Then revoke it
            mockMvc.perform(delete(API_KEYS_URL + "/" + keyId)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Sessions Flow")
    class SessionsFlow {

        @Test
        @DisplayName("should list active sessions")
        void should_ListActiveSessions() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(SESSIONS_URL)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get current session")
        void should_GetCurrentSession() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(SESSIONS_URL + "/current")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should revoke all other sessions")
        void should_RevokeAllOtherSessions() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(post(SESSIONS_URL + "/revoke-all")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Permissions Flow")
    class PermissionsFlow {

        @Test
        @DisplayName("should list available permissions")
        void should_ListAvailablePermissions() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(PERMISSIONS_URL)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should check user permission")
        void should_CheckUserPermission() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(PERMISSIONS_URL + "/check?permission=read:opportunities")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should list user roles")
        void should_ListUserRoles() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get("/roles")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("OAuth Flow")
    class OAuthFlow {

        @Test
        @DisplayName("should list available OAuth providers")
        void should_ListAvailableOAuthProviders() throws Exception {
            mockMvc.perform(get(OAUTH_URL + "/providers")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should list connected OAuth accounts")
        void should_ListConnectedOAuthAccounts() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(OAUTH_URL + "/connections")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Security Headers Flow")
    class SecurityHeadersFlow {

        @Test
        @DisplayName("should include security headers in response")
        void should_IncludeSecurityHeaders() throws Exception {
            mockMvc.perform(get("/auth/status")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(header().exists("X-Content-Type-Options"))
                .andExpect(header().exists("X-Frame-Options"));
        }
    }

    @Nested
    @DisplayName("Rate Limiting Flow")
    class RateLimitingFlow {

        @Test
        @DisplayName("should allow normal request rate")
        void should_AllowNormalRequestRate() throws Exception {
            // Make a few requests - should all succeed
            for (int i = 0; i < 5; i++) {
                mockMvc.perform(get("/auth/status")
                        .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
            }
        }
    }

    @Nested
    @DisplayName("Audit Logging Flow")
    class AuditLoggingFlow {

        @Test
        @DisplayName("should retrieve audit logs")
        void should_RetrieveAuditLogs() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get("/audit")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter audit logs by action")
        void should_FilterAuditLogsByAction() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get("/audit?action=LOGIN")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter audit logs by date range")
        void should_FilterAuditLogsByDateRange() throws Exception {
            String token = getAccessToken();

            String from = java.time.LocalDate.now().minusDays(7).toString();
            String to = java.time.LocalDate.now().toString();

            mockMvc.perform(get("/audit?from=" + from + "&to=" + to)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }
}
