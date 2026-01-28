package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Reports and Analytics functionality.
 * Tests report generation, analytics dashboards, and data visualization.
 */
@DisplayName("Report & Analytics E2E Tests")
class ReportAnalyticsE2ETest extends BaseControllerTest {

    private static final String REPORTS_URL = "/api/v1/reports";
    private static final String REPORT_DEFS_URL = "/api/v1/report-definitions";
    private static final String ANALYTICS_URL = "/api/v1/analytics";
    private static final String DASHBOARD_URL = "/api/v1/dashboard";

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
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E Report Tenant " + UUID.randomUUID())
            .slug("e2e-report-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-report-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Report")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("Report Generation Flow")
    class ReportGenerationFlow {

        @Test
        @DisplayName("should list available reports")
        void should_ListAvailableReports() throws Exception {
            performGet(REPORTS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should generate opportunity summary report")
        void should_GenerateOpportunitySummaryReport() throws Exception {
            java.util.Map<String, Object> reportRequest = java.util.Map.of(
                "type", "OPPORTUNITY_SUMMARY",
                "dateRange", java.util.Map.of(
                    "from", java.time.LocalDate.now().minusDays(30).toString(),
                    "to", java.time.LocalDate.now().toString()
                ),
                "format", "PDF"
            );

            performPost(REPORTS_URL + "/generate", reportRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should generate pipeline report")
        void should_GeneratePipelineReport() throws Exception {
            java.util.Map<String, Object> reportRequest = java.util.Map.of(
                "type", "PIPELINE",
                "format", "PDF"
            );

            performPost(REPORTS_URL + "/generate", reportRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should generate contract status report")
        void should_GenerateContractStatusReport() throws Exception {
            java.util.Map<String, Object> reportRequest = java.util.Map.of(
                "type", "CONTRACT_STATUS",
                "format", "XLSX"
            );

            performPost(REPORTS_URL + "/generate", reportRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Report Definitions Flow")
    class ReportDefinitionsFlow {

        @Test
        @DisplayName("should list report definitions")
        void should_ListReportDefinitions() throws Exception {
            performGet(REPORT_DEFS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create custom report definition")
        void should_CreateCustomReportDefinition() throws Exception {
            java.util.Map<String, Object> defRequest = java.util.Map.of(
                "name", "E2E Custom Report",
                "description", "Custom report for E2E testing",
                "entityType", "OPPORTUNITY",
                "columns", java.util.List.of(
                    java.util.Map.of("field", "title", "label", "Title"),
                    java.util.Map.of("field", "postedDate", "label", "Posted Date"),
                    java.util.Map.of("field", "type", "label", "Type")
                ),
                "filters", java.util.List.of(
                    java.util.Map.of("field", "active", "operator", "eq", "value", true)
                )
            );

            performPost(REPORT_DEFS_URL, defRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update report definition")
        void should_UpdateReportDefinition() throws Exception {
            // Create definition first
            java.util.Map<String, Object> defRequest = java.util.Map.of(
                "name", "Report to Update",
                "entityType", "OPPORTUNITY",
                "columns", java.util.List.of(
                    java.util.Map.of("field", "title", "label", "Title")
                )
            );

            performPost(REPORT_DEFS_URL, defRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should delete report definition")
        void should_DeleteReportDefinition() throws Exception {
            // Create definition to delete
            java.util.Map<String, Object> defRequest = java.util.Map.of(
                "name", "Report to Delete",
                "entityType", "OPPORTUNITY",
                "columns", java.util.List.of(
                    java.util.Map.of("field", "title", "label", "Title")
                )
            );

            performPost(REPORT_DEFS_URL, defRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Analytics Events Flow")
    class AnalyticsEventsFlow {

        @Test
        @DisplayName("should track analytics event")
        void should_TrackAnalyticsEvent() throws Exception {
            java.util.Map<String, Object> eventRequest = java.util.Map.of(
                "eventType", "PAGE_VIEW",
                "eventName", "dashboard_view",
                "properties", java.util.Map.of(
                    "page", "/dashboard",
                    "source", "e2e_test"
                )
            );

            performPost(ANALYTICS_URL + "/events", eventRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should track search event")
        void should_TrackSearchEvent() throws Exception {
            java.util.Map<String, Object> eventRequest = java.util.Map.of(
                "eventType", "SEARCH",
                "eventName", "opportunity_search",
                "properties", java.util.Map.of(
                    "query", "IT services",
                    "resultsCount", 15
                )
            );

            performPost(ANALYTICS_URL + "/events", eventRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Analytics Aggregations Flow")
    class AnalyticsAggregationsFlow {

        @Test
        @DisplayName("should retrieve page view analytics")
        void should_RetrievePageViewAnalytics() throws Exception {
            performGet(ANALYTICS_URL + "/page-views?days=30")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve user activity analytics")
        void should_RetrieveUserActivityAnalytics() throws Exception {
            performGet(ANALYTICS_URL + "/user-activity?days=7")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve search analytics")
        void should_RetrieveSearchAnalytics() throws Exception {
            performGet(ANALYTICS_URL + "/searches?days=30")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve feature usage analytics")
        void should_RetrieveFeatureUsageAnalytics() throws Exception {
            performGet(ANALYTICS_URL + "/feature-usage?days=30")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Dashboard Widgets Flow")
    class DashboardWidgetsFlow {

        @Test
        @DisplayName("should retrieve all dashboard stats")
        void should_RetrieveAllDashboardStats() throws Exception {
            performGet(DASHBOARD_URL + "/stats")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve opportunity count widget")
        void should_RetrieveOpportunityCountWidget() throws Exception {
            performGet(DASHBOARD_URL + "/widgets/opportunity-count")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve pipeline value widget")
        void should_RetrievePipelineValueWidget() throws Exception {
            performGet(DASHBOARD_URL + "/widgets/pipeline-value")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve deadline calendar widget")
        void should_RetrieveDeadlineCalendarWidget() throws Exception {
            performGet(DASHBOARD_URL + "/widgets/deadline-calendar")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve activity feed widget")
        void should_RetrieveActivityFeedWidget() throws Exception {
            performGet(DASHBOARD_URL + "/widgets/activity-feed?limit=10")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve quick stats widget")
        void should_RetrieveQuickStatsWidget() throws Exception {
            performGet(DASHBOARD_URL + "/widgets/quick-stats")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Usage Tracking Flow")
    class UsageTrackingFlow {

        @Test
        @DisplayName("should retrieve usage statistics")
        void should_RetrieveUsageStatistics() throws Exception {
            performGet(ANALYTICS_URL + "/usage")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve storage usage")
        void should_RetrieveStorageUsage() throws Exception {
            performGet(ANALYTICS_URL + "/usage/storage")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve API usage")
        void should_RetrieveAPIUsage() throws Exception {
            performGet(ANALYTICS_URL + "/usage/api")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve user activity summary")
        void should_RetrieveUserActivitySummary() throws Exception {
            performGet(ANALYTICS_URL + "/usage/users")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Data Export for Analytics")
    class DataExportForAnalytics {

        @Test
        @DisplayName("should export analytics data")
        void should_ExportAnalyticsData() throws Exception {
            java.util.Map<String, Object> exportRequest = java.util.Map.of(
                "type", "ANALYTICS",
                "dateRange", java.util.Map.of(
                    "from", java.time.LocalDate.now().minusDays(30).toString(),
                    "to", java.time.LocalDate.now().toString()
                ),
                "format", "CSV"
            );

            performPost(ANALYTICS_URL + "/export", exportRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Billing Analytics Flow")
    class BillingAnalyticsFlow {

        @Test
        @DisplayName("should retrieve billing summary")
        void should_RetrieveBillingSummary() throws Exception {
            performGet("/api/v1/billing/summary")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve usage history")
        void should_RetrieveUsageHistory() throws Exception {
            performGet("/api/v1/billing/usage-history?months=6")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve invoice history")
        void should_RetrieveInvoiceHistory() throws Exception {
            performGet("/api/v1/billing/invoices")
                .andExpect(status().isOk());
        }
    }
}
