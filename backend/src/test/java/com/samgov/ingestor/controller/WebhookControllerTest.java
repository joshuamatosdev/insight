package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for WebhookController endpoints.
 */
@DisplayName("WebhookController")
class WebhookControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/webhooks";

    @Autowired
    private TenantRepository tenantRepository;

    private Tenant testTenant;

    @Override
    @BeforeEach
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Test Tenant " + UUID.randomUUID())
            .slug("test-tenant-" + UUID.randomUUID())
            .build());
        testTenantId = testTenant.getId();
    }

    @Nested
    @DisplayName("GET /webhooks")
    class GetWebhooks {

        @Test
        @DisplayName("should return webhooks")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnWebhooks() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /webhooks/{id}")
    class GetWebhookById {

        @Test
        @DisplayName("should return 404 when webhook not found")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /webhooks")
    class CreateWebhook {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return400_When_Invalid() throws Exception {
            performPost(BASE_URL, "{}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /webhooks/{id}")
    class DeleteWebhook {

        @Test
        @DisplayName("should return 404 when webhook not found")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performDelete(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /webhooks/{id}/test")
    class TestWebhook {

        @Test
        @DisplayName("should return 404 when webhook not found")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performPost(BASE_URL + "/" + UUID.randomUUID() + "/test")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /webhooks/events")
    class GetEvents {

        @Test
        @DisplayName("should return available webhook events")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnEvents() throws Exception {
            performGet(BASE_URL + "/events")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }
}
