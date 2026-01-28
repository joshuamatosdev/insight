package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for AI Analysis, Billing, Usage, and User Preferences.
 * Covers remaining controllers not in other E2E test files.
 */
class AIAndAdvancedE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    private Tenant testTenant;
    private User testUser;
    private Opportunity testOpportunity;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("AI E2E Tenant")
            .slug("ai-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("ai-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("AI")
            .lastName("Tester")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();

        testOpportunity = opportunityRepository.save(Opportunity.builder()
            .id(UUID.randomUUID().toString())
            .title("AI Analysis Test Opportunity")
            .solicitationNumber("AI-" + UUID.randomUUID().toString().substring(0, 8))
            .type("Solicitation")
            .naicsCode("541512")
            .description("This is a software development opportunity for government systems.")
            .postedDate(LocalDate.now())
            .responseDeadLine(LocalDate.now().plusDays(30))
            .build());
    }

    @Nested
    @DisplayName("AI Analysis")
    class AIAnalysis {

        @Test
        @DisplayName("should get AI summary for opportunity")
        void shouldGetAISummaryForOpportunity() throws Exception {
            performGet("/api/v1/ai/opportunities/" + testOpportunity.getId() + "/summary")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get AI fit score for opportunity")
        void shouldGetAIFitScoreForOpportunity() throws Exception {
            performGet("/api/v1/ai/opportunities/" + testOpportunity.getId() + "/fit-score")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get AI risk assessment for opportunity")
        void shouldGetAIRiskAssessmentForOpportunity() throws Exception {
            performGet("/api/v1/ai/opportunities/" + testOpportunity.getId() + "/risk-assessment")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get AI proposal suggestions")
        void shouldGetAIProposalSuggestions() throws Exception {
            performGet("/api/v1/ai/opportunities/" + testOpportunity.getId() + "/proposal-suggestions")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should analyze opportunity with custom prompt")
        void shouldAnalyzeOpportunityWithCustomPrompt() throws Exception {
            Map<String, Object> request = Map.of(
                "opportunityId", testOpportunity.getId(),
                "prompt", "What are the key requirements?"
            );

            performPost("/api/v1/ai/analyze", request)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should return 404 for non-existent opportunity")
        void shouldReturn404ForNonExistentOpportunity() throws Exception {
            performGet("/api/v1/ai/opportunities/non-existent-id/summary")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Billing Management")
    class BillingManagement {

        @Test
        @DisplayName("should get billing overview")
        void shouldGetBillingOverview() throws Exception {
            performGet("/api/v1/billing")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get current subscription")
        void shouldGetCurrentSubscription() throws Exception {
            performGet("/api/v1/billing/subscription")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should list available plans")
        void shouldListAvailablePlans() throws Exception {
            performGet("/api/v1/billing/plans")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should list invoices")
        void shouldListBillingInvoices() throws Exception {
            performGet("/api/v1/billing/invoices")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should get payment methods")
        void shouldGetPaymentMethods() throws Exception {
            performGet("/api/v1/billing/payment-methods")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should update subscription")
        void shouldUpdateSubscription() throws Exception {
            Map<String, Object> update = Map.of(
                "planId", "professional",
                "billingCycle", "ANNUAL"
            );

            performPut("/api/v1/billing/subscription", update)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should add payment method")
        void shouldAddPaymentMethod() throws Exception {
            Map<String, Object> paymentMethod = Map.of(
                "type", "CREDIT_CARD",
                "token", "tok_test_" + UUID.randomUUID().toString().substring(0, 8),
                "isDefault", true
            );

            performPost("/api/v1/billing/payment-methods", paymentMethod)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Usage Tracking")
    class UsageTracking {

        @Test
        @DisplayName("should get usage summary")
        void shouldGetUsageSummary() throws Exception {
            performGet("/api/v1/usage")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get usage by feature")
        void shouldGetUsageByFeature() throws Exception {
            performGet("/api/v1/usage/by-feature")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get usage history")
        void shouldGetUsageHistory() throws Exception {
            performGet("/api/v1/usage/history?period=MONTH")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get API usage")
        void shouldGetApiUsage() throws Exception {
            performGet("/api/v1/usage/api")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get storage usage")
        void shouldGetStorageUsage() throws Exception {
            performGet("/api/v1/usage/storage")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get user activity")
        void shouldGetUserActivity() throws Exception {
            performGet("/api/v1/usage/activity")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should export usage report")
        void shouldExportUsageReport() throws Exception {
            performGet("/api/v1/usage/export?format=CSV")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("User Preferences")
    class UserPreferences {

        @Test
        @DisplayName("should get user preferences")
        void shouldGetUserPreferences() throws Exception {
            performGet("/api/v1/users/me/preferences")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update user preferences")
        void shouldUpdateUserPreferences() throws Exception {
            Map<String, Object> preferences = Map.of(
                "theme", "dark",
                "language", "en-US",
                "timezone", "America/New_York",
                "dateFormat", "MM/dd/yyyy",
                "emailNotifications", true,
                "pushNotifications", false
            );

            performPut("/api/v1/users/me/preferences", preferences)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update notification preferences")
        void shouldUpdateNotificationPreferences() throws Exception {
            Map<String, Object> notifications = Map.of(
                "emailOnNewOpportunity", true,
                "emailOnDeadlineReminder", true,
                "emailOnContractUpdate", false,
                "dailyDigest", true
            );

            performPut("/api/v1/users/me/preferences/notifications", notifications)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get dashboard preferences")
        void shouldGetDashboardPreferences() throws Exception {
            performGet("/api/v1/users/me/preferences/dashboard")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update dashboard preferences")
        void shouldUpdateDashboardPreferences() throws Exception {
            Map<String, Object> dashboardPrefs = Map.of(
                "defaultView", "grid",
                "widgetOrder", java.util.List.of("pipeline", "deadlines", "activity"),
                "showQuickStats", true
            );

            performPut("/api/v1/users/me/preferences/dashboard", dashboardPrefs)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should reset preferences to default")
        void shouldResetPreferencesToDefault() throws Exception {
            performPost("/api/v1/users/me/preferences/reset")
                .andExpect(status().isOk());
        }
    }
}
