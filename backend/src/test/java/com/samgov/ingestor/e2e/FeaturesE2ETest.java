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
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Feature functionality.
 * Tests Search, Export, Reports, Analytics, Dashboard, Notifications, and Alerts.
 */
class FeaturesE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    private Tenant testTenant;
    private User testUser;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Features E2E Tenant")
            .slug("features-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("features-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("Features")
            .lastName("User")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();

        // Create some test opportunities for search/export tests
        for (int i = 0; i < 3; i++) {
            opportunityRepository.save(Opportunity.builder()
                .id(UUID.randomUUID().toString())
                .title("Feature Test Opportunity " + i)
                .solicitationNumber("FT-" + UUID.randomUUID().toString().substring(0, 8))
                .type("Solicitation")
                .naicsCode("541512")
                .postedDate(LocalDate.now())
                .responseDeadLine(LocalDate.now().plusDays(30))
                .build());
        }
    }

    @Nested
    @DisplayName("Search Functionality")
    class SearchFunctionality {

        @Test
        @DisplayName("should get search suggestions")
        void shouldGetSearchSuggestions() throws Exception {
            performGet("/search/suggestions?query=software")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestions").isArray());
        }

        @Test
        @DisplayName("should perform faceted search")
        void shouldPerformFacetedSearch() throws Exception {
            Map<String, Object> request = Map.of(
                "query", "opportunity",
                "page", 0,
                "size", 10
            );

            performPost("/search/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.facets").exists());
        }

        @Test
        @DisplayName("should filter faceted search by NAICS")
        void shouldFilterFacetedSearchByNaics() throws Exception {
            Map<String, Object> request = Map.of(
                "query", "",
                "naicsCodes", List.of("541512"),
                "page", 0,
                "size", 10
            );

            performPost("/search/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("Export Functionality")
    class ExportFunctionality {

        @Test
        @DisplayName("should export opportunities as CSV")
        void shouldExportOpportunitiesAsCsv() throws Exception {
            List<String> oppIds = opportunityRepository.findAll().stream()
                .limit(2)
                .map(Opportunity::getId)
                .toList();

            Map<String, Object> request = Map.of(
                "format", "CSV",
                "ids", oppIds
            );

            performPost("/export/opportunities", request)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should list export templates")
        void shouldListExportTemplates() throws Exception {
            performGet("/export/templates")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should list scheduled exports")
        void shouldListScheduledExports() throws Exception {
            performGet("/export/scheduled")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should create scheduled export")
        void shouldCreateScheduledExport() throws Exception {
            Map<String, Object> request = Map.of(
                "name", "Daily Opportunities Export",
                "entityType", "OPPORTUNITY",
                "format", "CSV",
                "frequency", "DAILY",
                "hourOfDay", 8,
                "recipients", List.of("export@example.com")
            );

            performPost("/export/scheduled", request)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Reports Functionality")
    class ReportsFunctionality {

        @Test
        @DisplayName("should list report definitions")
        void shouldListReportDefinitions() throws Exception {
            performGet("/reports/definitions")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create report definition")
        void shouldCreateReportDefinition() throws Exception {
            Map<String, Object> request = Map.of(
                "name", "E2E Test Report",
                "description", "Test report for E2E",
                "reportType", "OPPORTUNITIES"
            );

            performPost("/reports/definitions", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test Report"));
        }

        @Test
        @DisplayName("should generate pipeline report")
        void shouldGeneratePipelineReport() throws Exception {
            performGet("/reports/pipeline")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should generate opportunity report")
        void shouldGenerateOpportunityReport() throws Exception {
            performGet("/reports/opportunities")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Analytics Functionality")
    class AnalyticsFunctionality {

        @Test
        @DisplayName("should get analytics overview")
        void shouldGetAnalyticsOverview() throws Exception {
            performGet("/analytics/overview")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get opportunity trends")
        void shouldGetOpportunityTrends() throws Exception {
            performGet("/analytics/opportunities/trends?period=MONTH")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get pipeline analytics")
        void shouldGetPipelineAnalytics() throws Exception {
            performGet("/analytics/pipeline")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should track analytics event")
        void shouldTrackAnalyticsEvent() throws Exception {
            Map<String, Object> event = Map.of(
                "eventType", "PAGE_VIEW",
                "page", "/opportunities",
                "metadata", Map.of("source", "e2e-test")
            );

            performPost("/analytics/events", event)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Dashboard Functionality")
    class DashboardFunctionality {

        @Test
        @DisplayName("should get dashboard data")
        void shouldGetDashboardData() throws Exception {
            performGet("/dashboard")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get dashboard stats")
        void shouldGetDashboardStats() throws Exception {
            performGet("/dashboard/stats")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get dashboard widgets")
        void shouldGetDashboardWidgets() throws Exception {
            performGet("/dashboard/widgets")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should update widget configuration")
        void shouldUpdateWidgetConfiguration() throws Exception {
            Map<String, Object> config = Map.of(
                "widgetType", "PIPELINE_VALUE",
                "position", 1,
                "settings", Map.of("showChart", true)
            );

            performPost("/dashboard/widgets", config)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Notification Functionality")
    class NotificationFunctionality {

        @Test
        @DisplayName("should list notifications")
        void shouldListNotifications() throws Exception {
            performGet("/notifications")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should get unread notification count")
        void shouldGetUnreadNotificationCount() throws Exception {
            performGet("/notifications/unread-count")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").isNumber());
        }

        @Test
        @DisplayName("should mark notification as read")
        void shouldMarkNotificationAsRead() throws Exception {
            // This would need an actual notification to mark as read
            // For now, test the endpoint exists
            performPatch("/notifications/mark-all-read")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Alert Functionality")
    class AlertFunctionality {

        @Test
        @DisplayName("should list alerts")
        void shouldListAlerts() throws Exception {
            performGet("/alerts")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create alert")
        void shouldCreateAlert() throws Exception {
            Map<String, Object> alert = Map.of(
                "name", "E2E Test Alert",
                "type", "OPPORTUNITY_MATCH",
                "criteria", Map.of("naicsCode", "541512"),
                "enabled", true
            );

            performPost("/alerts", alert)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test Alert"));
        }

        @Test
        @DisplayName("should update alert")
        void shouldUpdateAlert() throws Exception {
            // Create alert first
            Map<String, Object> createRequest = Map.of(
                "name", "Update Test Alert",
                "type", "OPPORTUNITY_MATCH",
                "criteria", Map.of("naicsCode", "541512"),
                "enabled", true
            );

            String response = performPost("/alerts", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            // Extract ID and update
            String alertId = objectMapper.readTree(response).get("id").asText();

            Map<String, Object> update = Map.of(
                "name", "Updated Alert Name",
                "enabled", false
            );

            performPut("/alerts/" + alertId, update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Alert Name"));
        }
    }

    @Nested
    @DisplayName("Company Profile")
    class CompanyProfile {

        @Test
        @DisplayName("should get company profile")
        void shouldGetCompanyProfile() throws Exception {
            performGet("/company-profile")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update company profile")
        void shouldUpdateCompanyProfile() throws Exception {
            Map<String, Object> profile = Map.of(
                "legalName", "E2E Test Company LLC",
                "uei", "E2ETESTUE1234",
                "cageCode", "E2ETC"
            );

            performPut("/company-profile", profile)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Certifications")
    class Certifications {

        @Test
        @DisplayName("should list certifications")
        void shouldListCertifications() throws Exception {
            performGet("/certifications")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should add certification")
        void shouldAddCertification() throws Exception {
            Map<String, Object> cert = Map.of(
                "type", "8A",
                "certificationNumber", "E2E-CERT-" + UUID.randomUUID().toString().substring(0, 8),
                "expirationDate", LocalDate.now().plusYears(1).toString()
            );

            performPost("/certifications", cert)
                .andExpect(status().isCreated());
        }
    }
}
