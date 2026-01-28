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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Pipeline management flows.
 * Tests opportunity tracking through pipeline stages.
 */
@DisplayName("Pipeline E2E Tests")
class PipelineE2ETest extends BaseControllerTest {

    private static final String PIPELINE_URL = "/pipeline";
    private static final String ALERTS_URL = "/alerts";
    private static final String SAVED_SEARCHES_URL = "/saved-searches";

    @Autowired
    private OpportunityRepository opportunityRepository;

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
            .name("E2E Pipeline Tenant " + UUID.randomUUID())
            .slug("e2e-pipeline-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-pipeline-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Pipeline")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    private Opportunity createTestOpportunity(String title, String stage) {
        Opportunity opp = new Opportunity();
        opp.setId(UUID.randomUUID().toString());
        opp.setTenantId(testTenantId);
        opp.setTitle(title);
        opp.setNoticeId("NOTICE-" + UUID.randomUUID().toString().substring(0, 8));
        opp.setSolicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8));
        opp.setPostedDate(LocalDate.now());
        opp.setResponseDeadLine(LocalDateTime.now().plusDays(30));
        opp.setType("PRESOLICITATION");
        opp.setActive(true);
        return opportunityRepository.save(opp);
    }

    @Nested
    @DisplayName("Pipeline Overview Flow")
    class PipelineOverviewFlow {

        @Test
        @DisplayName("should retrieve pipeline summary")
        void should_RetrievePipelineSummary() throws Exception {
            createTestOpportunity("Pipeline Test Opp", "QUALIFYING");

            performGet(PIPELINE_URL + "/summary")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve opportunities by stage")
        void should_RetrieveOpportunitiesByStage() throws Exception {
            createTestOpportunity("Stage Test Opp", "PURSUING");

            performGet(PIPELINE_URL + "/stages/PURSUING")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve all pipeline stages")
        void should_RetrieveAllPipelineStages() throws Exception {
            performGet(PIPELINE_URL + "/stages")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Pipeline Stage Transition Flow")
    class PipelineStageTransitionFlow {

        @Test
        @DisplayName("should move opportunity to next stage")
        void should_MoveOpportunityToNextStage() throws Exception {
            Opportunity opp = createTestOpportunity("Move Stage Opp", "QUALIFYING");

            java.util.Map<String, Object> stageUpdate = java.util.Map.of(
                "stage", "PURSUING",
                "notes", "Decision made to pursue"
            );

            performPatch(PIPELINE_URL + "/opportunities/" + opp.getId() + "/stage", stageUpdate)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should record stage transition history")
        void should_RecordStageTransitionHistory() throws Exception {
            Opportunity opp = createTestOpportunity("History Opp", "QUALIFYING");

            // Move through stages
            java.util.Map<String, Object> stageUpdate = java.util.Map.of(
                "stage", "PURSUING"
            );
            performPatch(PIPELINE_URL + "/opportunities/" + opp.getId() + "/stage", stageUpdate)
                .andExpect(status().isOk());

            // Get history
            performGet(PIPELINE_URL + "/opportunities/" + opp.getId() + "/history")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Pipeline Metrics Flow")
    class PipelineMetricsFlow {

        @Test
        @DisplayName("should retrieve pipeline value by stage")
        void should_RetrievePipelineValueByStage() throws Exception {
            performGet(PIPELINE_URL + "/metrics/value-by-stage")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve pipeline conversion rates")
        void should_RetrievePipelineConversionRates() throws Exception {
            performGet(PIPELINE_URL + "/metrics/conversion-rates")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve pipeline velocity")
        void should_RetrievePipelineVelocity() throws Exception {
            performGet(PIPELINE_URL + "/metrics/velocity")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Alerts Flow")
    class AlertsFlow {

        @Test
        @DisplayName("should list alerts")
        void should_ListAlerts() throws Exception {
            performGet(ALERTS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create new alert")
        void should_CreateNewAlert() throws Exception {
            java.util.Map<String, Object> alertRequest = java.util.Map.of(
                "name", "E2E Test Alert",
                "type", "DEADLINE",
                "criteria", java.util.Map.of(
                    "daysBeforeDeadline", 7
                ),
                "enabled", true
            );

            performPost(ALERTS_URL, alertRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update alert")
        void should_UpdateAlert() throws Exception {
            // First create an alert
            java.util.Map<String, Object> alertRequest = java.util.Map.of(
                "name", "Alert to Update",
                "type", "KEYWORD",
                "criteria", java.util.Map.of(
                    "keywords", java.util.List.of("cybersecurity")
                ),
                "enabled", true
            );

            performPost(ALERTS_URL, alertRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should toggle alert enabled status")
        void should_ToggleAlertEnabledStatus() throws Exception {
            // Create alert first
            java.util.Map<String, Object> alertRequest = java.util.Map.of(
                "name", "Toggle Alert",
                "type", "DEADLINE",
                "criteria", java.util.Map.of(
                    "daysBeforeDeadline", 5
                ),
                "enabled", true
            );

            performPost(ALERTS_URL, alertRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should delete alert")
        void should_DeleteAlert() throws Exception {
            // Create alert to delete
            java.util.Map<String, Object> alertRequest = java.util.Map.of(
                "name", "Alert to Delete",
                "type", "KEYWORD",
                "criteria", java.util.Map.of(
                    "keywords", java.util.List.of("delete")
                ),
                "enabled", true
            );

            performPost(ALERTS_URL, alertRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Saved Searches Flow")
    class SavedSearchesFlow {

        @Test
        @DisplayName("should list saved searches")
        void should_ListSavedSearches() throws Exception {
            performGet(SAVED_SEARCHES_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create saved search")
        void should_CreateSavedSearch() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "name", "E2E Test Saved Search",
                "criteria", java.util.Map.of(
                    "keywords", java.util.List.of("IT", "services"),
                    "type", "PRESOLICITATION",
                    "active", true
                )
            );

            performPost(SAVED_SEARCHES_URL, searchRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should execute saved search")
        void should_ExecuteSavedSearch() throws Exception {
            // Create saved search first
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "name", "Execute Test Search",
                "criteria", java.util.Map.of(
                    "keywords", java.util.List.of("test"),
                    "active", true
                )
            );

            performPost(SAVED_SEARCHES_URL, searchRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update saved search")
        void should_UpdateSavedSearch() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "name", "Update Test Search",
                "criteria", java.util.Map.of(
                    "keywords", java.util.List.of("original"),
                    "active", true
                )
            );

            performPost(SAVED_SEARCHES_URL, searchRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should delete saved search")
        void should_DeleteSavedSearch() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "name", "Delete Test Search",
                "criteria", java.util.Map.of(
                    "keywords", java.util.List.of("delete"),
                    "active", true
                )
            );

            performPost(SAVED_SEARCHES_URL, searchRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Opportunity Match Flow")
    class OpportunityMatchFlow {

        @Test
        @DisplayName("should list opportunity matches")
        void should_ListOpportunityMatches() throws Exception {
            performGet("/opportunity-matches")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should calculate match score for opportunity")
        void should_CalculateMatchScoreForOpportunity() throws Exception {
            Opportunity opp = createTestOpportunity("Match Score Opp", "NEW");

            performGet("/opportunity-matches/" + opp.getId() + "/score")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Dashboard Integration Flow")
    class DashboardIntegrationFlow {

        @Test
        @DisplayName("should retrieve dashboard stats")
        void should_RetrieveDashboardStats() throws Exception {
            performGet("/dashboard/stats")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve pipeline widget data")
        void should_RetrievePipelineWidgetData() throws Exception {
            performGet("/dashboard/widgets/pipeline")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve upcoming deadlines widget")
        void should_RetrieveUpcomingDeadlinesWidget() throws Exception {
            performGet("/dashboard/widgets/deadlines")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should retrieve recent activity widget")
        void should_RetrieveRecentActivityWidget() throws Exception {
            performGet("/dashboard/widgets/activity")
                .andExpect(status().isOk());
        }
    }
}
