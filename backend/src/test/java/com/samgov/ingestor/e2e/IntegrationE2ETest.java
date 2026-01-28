package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Integration functionality.
 * Tests API Keys, Webhooks, CRM, Procurement Sources, and External Integrations.
 */
class IntegrationE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    private Tenant testTenant;
    private User testUser;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Integration E2E Tenant")
            .slug("int-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("int-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("Integration")
            .lastName("User")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("API Key Management")
    class ApiKeyManagement {

        @Test
        @DisplayName("should list API keys")
        void shouldListApiKeys() throws Exception {
            performGet("/api-keys")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should create API key")
        void shouldCreateApiKey() throws Exception {
            Map<String, Object> request = Map.of(
                "name", "E2E Test API Key",
                "description", "API key for E2E testing",
                "permissions", java.util.List.of("read:opportunities", "read:contracts")
            );

            performPost("/api-keys", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test API Key"))
                .andExpect(jsonPath("$.key").isNotEmpty());
        }

        @Test
        @DisplayName("should revoke API key")
        void shouldRevokeApiKey() throws Exception {
            // Create first
            Map<String, Object> createRequest = Map.of(
                "name", "Revoke Test Key",
                "description", "Key to be revoked"
            );

            String response = performPost("/api-keys", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String keyId = objectMapper.readTree(response).get("id").asText();

            performDelete("/api-keys/" + keyId)
                .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("Webhook Management")
    class WebhookManagement {

        @Test
        @DisplayName("should list webhooks")
        void shouldListWebhooks() throws Exception {
            performGet("/webhooks")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should create webhook")
        void shouldCreateWebhook() throws Exception {
            Map<String, Object> webhook = Map.of(
                "name", "E2E Test Webhook",
                "url", "https://webhook.example.com/e2e",
                "events", java.util.List.of("opportunity.created", "contract.updated"),
                "enabled", true
            );

            performPost("/webhooks", webhook)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test Webhook"));
        }

        @Test
        @DisplayName("should update webhook")
        void shouldUpdateWebhook() throws Exception {
            Map<String, Object> createRequest = Map.of(
                "name", "Update Test Webhook",
                "url", "https://webhook.example.com/update",
                "events", java.util.List.of("opportunity.created"),
                "enabled", true
            );

            String response = performPost("/webhooks", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String webhookId = objectMapper.readTree(response).get("id").asText();

            Map<String, Object> update = Map.of(
                "enabled", false
            );

            performPut("/webhooks/" + webhookId, update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
        }

        @Test
        @DisplayName("should test webhook")
        void shouldTestWebhook() throws Exception {
            Map<String, Object> createRequest = Map.of(
                "name", "Test Ping Webhook",
                "url", "https://webhook.example.com/ping",
                "events", java.util.List.of("test"),
                "enabled", true
            );

            String response = performPost("/webhooks", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String webhookId = objectMapper.readTree(response).get("id").asText();

            performPost("/webhooks/" + webhookId + "/test")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("CRM Integration")
    class CrmIntegration {

        @Test
        @DisplayName("should list contacts")
        void shouldListContacts() throws Exception {
            performGet("/crm/contacts")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create contact")
        void shouldCreateContact() throws Exception {
            Map<String, Object> contact = Map.of(
                "firstName", "E2E",
                "lastName", "Contact",
                "email", "e2e-contact-" + UUID.randomUUID() + "@example.com",
                "phone", "555-0100",
                "company", "Test Company"
            );

            performPost("/crm/contacts", contact)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("E2E"));
        }

        @Test
        @DisplayName("should list organizations")
        void shouldListOrganizations() throws Exception {
            performGet("/crm/organizations")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create organization")
        void shouldCreateOrganization() throws Exception {
            Map<String, Object> org = Map.of(
                "name", "E2E Test Organization",
                "type", "GOVERNMENT_AGENCY",
                "website", "https://e2e-org.example.gov"
            );

            performPost("/crm/organizations", org)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test Organization"));
        }

        @Test
        @DisplayName("should list interactions")
        void shouldListInteractions() throws Exception {
            performGet("/crm/interactions")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("Procurement Sources")
    class ProcurementSources {

        @Test
        @DisplayName("should list procurement sources")
        void shouldListProcurementSources() throws Exception {
            performGet("/procurement-sources")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should create procurement source")
        void shouldCreateProcurementSource() throws Exception {
            Map<String, Object> source = Map.of(
                "name", "E2E Test Portal",
                "type", "STATE_PORTAL",
                "url", "https://e2e-procurement.example.gov",
                "enabled", true
            );

            performPost("/procurement-sources", source)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test Portal"));
        }

        @Test
        @DisplayName("should toggle procurement source")
        void shouldToggleProcurementSource() throws Exception {
            Map<String, Object> createRequest = Map.of(
                "name", "Toggle Test Portal",
                "type", "STATE_PORTAL",
                "url", "https://toggle-test.example.gov",
                "enabled", true
            );

            String response = performPost("/procurement-sources", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String sourceId = objectMapper.readTree(response).get("id").asText();

            performPatch("/procurement-sources/" + sourceId + "/toggle")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
        }
    }

    @Nested
    @DisplayName("SBIR Integration")
    class SbirIntegration {

        @Test
        @DisplayName("should list SBIR awards")
        void shouldListSbirAwards() throws Exception {
            performGet("/sbir/awards")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should search SBIR opportunities")
        void shouldSearchSbirOpportunities() throws Exception {
            performGet("/sbir/search?keyword=software")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Ingest Operations")
    class IngestOperations {

        @Test
        @DisplayName("should get ingest status")
        void shouldGetIngestStatus() throws Exception {
            performGet("/ingest/status")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should trigger manual ingest")
        void shouldTriggerManualIngest() throws Exception {
            performPost("/ingest/trigger")
                .andExpect(status().isAccepted());
        }
    }

    @Nested
    @DisplayName("Opportunity Match")
    class OpportunityMatch {

        @Test
        @DisplayName("should get opportunity matches")
        void shouldGetOpportunityMatches() throws Exception {
            performGet("/opportunity-matches")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should get match score for opportunity")
        void shouldGetMatchScore() throws Exception {
            // This requires an actual opportunity ID
            performGet("/opportunity-matches/calculate")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Opportunity Alerts")
    class OpportunityAlerts {

        @Test
        @DisplayName("should list opportunity alerts")
        void shouldListOpportunityAlerts() throws Exception {
            performGet("/opportunity-alerts")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create opportunity alert")
        void shouldCreateOpportunityAlert() throws Exception {
            Map<String, Object> alert = Map.of(
                "name", "E2E NAICS Alert",
                "naicsCodes", java.util.List.of("541512"),
                "keywords", java.util.List.of("software", "development"),
                "emailNotification", true,
                "enabled", true
            );

            performPost("/opportunity-alerts", alert)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E NAICS Alert"));
        }
    }
}
