package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.ApiKey;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ApiKeyRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.ApiKeyService.CreateApiKeyRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for ApiKeyController endpoints.
 */
@DisplayName("ApiKeyController")
class ApiKeyControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/api-keys";

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Test Tenant " + UUID.randomUUID())
            .slug("test-tenant-" + UUID.randomUUID())
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("apikey-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .tenantId(testTenantId)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /api/v1/api-keys")
    class GetApiKeys {

        @Test
        @DisplayName("should return paginated list of API keys")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnPaginatedList_When_Authenticated() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should filter API keys by search term")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_FilterBySearchTerm() throws Exception {
            performGet(BASE_URL + "?search=test")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/api-keys/{id}")
    class GetApiKeyById {

        @Test
        @DisplayName("should return 404 when API key not found")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/api-keys/my-keys")
    class GetMyApiKeys {

        @Test
        @DisplayName("should return current user's API keys")
        @WithMockUser(username = "admin", roles = {"USER"})
        void should_ReturnUserKeys() throws Exception {
            performGet(BASE_URL + "/my-keys")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/api-keys")
    class CreateApiKey {

        @Test
        @DisplayName("should return 400 when request body is invalid")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return400_When_RequestInvalid() throws Exception {
            performPost(BASE_URL, new CreateApiKeyRequest(null, null, null))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/api-keys/expiring")
    class GetExpiringKeys {

        @Test
        @DisplayName("should return expiring keys")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnExpiringKeys() throws Exception {
            performGet(BASE_URL + "/expiring?daysAhead=30")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/api-keys/stats")
    class GetApiKeyStats {

        @Test
        @DisplayName("should return API key statistics")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnStats() throws Exception {
            performGet(BASE_URL + "/stats")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/api-keys/{id}/revoke")
    class RevokeApiKey {

        @Test
        @DisplayName("should return 404 when revoking non-existent key")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return404_When_KeyNotFound() throws Exception {
            performPost(BASE_URL + "/" + UUID.randomUUID() + "/revoke")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/api-keys/validate")
    class ValidateApiKey {

        @Test
        @DisplayName("should return 401 when API key is invalid")
        @WithMockUser(username = "admin", roles = {"USER"})
        void should_Return401_When_KeyInvalid() throws Exception {
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(BASE_URL + "/validate")
                    .header("X-API-Key", "invalid-api-key")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isUnauthorized());
        }
    }
}
