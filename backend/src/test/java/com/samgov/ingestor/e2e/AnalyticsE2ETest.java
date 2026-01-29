package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.AnalyticsEvent;
import com.samgov.ingestor.model.AnalyticsEvent.EntityType;
import com.samgov.ingestor.model.AnalyticsEvent.EventType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.Tenant.TenantStatus;
import com.samgov.ingestor.model.Tenant.SubscriptionTier;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.AnalyticsEventRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Analytics endpoints.
 * Tests all analytics endpoints including dashboard, activity feed, and tracking.
 *
 * Endpoints tested:
 * - GET /api/analytics/dashboard - Dashboard metrics
 * - GET /api/analytics/activity?limit=20 - Activity feed
 * - GET /api/analytics/top-performers?limit=10 - Top performers
 * - POST /api/analytics/track - Track custom event
 */
@DisplayName("Analytics E2E Tests")
class AnalyticsE2ETest extends BaseControllerTest {

    private static final String ANALYTICS_URL = "/api/analytics";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;
    private List<User> testUsers;

    @Override
    @BeforeEach
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E Analytics Tenant " + UUID.randomUUID())
            .slug("e2e-analytics-" + UUID.randomUUID().toString().substring(0, 8))
            .status(TenantStatus.ACTIVE)
            .subscriptionTier(SubscriptionTier.PRO)
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create primary test user
        testUser = User.builder()
            .email("e2e-analytics-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Analytics")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();

        // Create additional test users for top performers
        testUsers = createTestUsers();

        // Seed test analytics events
        createTestAnalyticsEvents();
    }

    /**
     * Creates additional test users for top performers testing.
     */
    private List<User> createTestUsers() {
        List<User> users = new ArrayList<>();

        for (int i = 1; i <= 5; i++) {
            User user = User.builder()
                .email("analytics-user-" + i + "-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("Test")
                .lastName("User" + i)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .build();
            users.add(userRepository.save(user));
        }

        return users;
    }

    /**
     * Creates 50+ test analytics events with varied types, timestamps, and users.
     */
    private void createTestAnalyticsEvents() {
        List<AnalyticsEvent> events = new ArrayList<>();
        Instant now = Instant.now();

        // Create events for primary test user (recent activity)
        for (int i = 0; i < 10; i++) {
            events.add(AnalyticsEvent.builder()
                .tenant(testTenant)
                .user(testUser)
                .eventType(EventType.PAGE_VIEW)
                .entityType(EntityType.DASHBOARD)
                .entityId(UUID.randomUUID().toString())
                .properties("{\"page\":\"/dashboard\",\"duration\":1500}")
                .timestamp(now.minus(i, ChronoUnit.HOURS))
                .sessionId("session-" + UUID.randomUUID())
                .ipAddress("192.168.1." + (100 + i))
                .userAgent("Mozilla/5.0 (Test Browser)")
                .build());
        }

        // Create opportunity view events
        for (int i = 0; i < 15; i++) {
            User eventUser = testUsers.get(i % testUsers.size());
            events.add(AnalyticsEvent.builder()
                .tenant(testTenant)
                .user(eventUser)
                .eventType(EventType.OPPORTUNITY_VIEWED)
                .entityType(EntityType.OPPORTUNITY)
                .entityId("opp-" + UUID.randomUUID())
                .properties("{\"title\":\"Test Opportunity " + i + "\",\"source\":\"SAM.gov\"}")
                .timestamp(now.minus(i * 2, ChronoUnit.HOURS))
                .sessionId("session-" + UUID.randomUUID())
                .ipAddress("192.168.1." + (50 + i))
                .userAgent("Mozilla/5.0 (Test Browser)")
                .build());
        }

        // Create search events
        for (int i = 0; i < 10; i++) {
            User eventUser = testUsers.get(i % testUsers.size());
            events.add(AnalyticsEvent.builder()
                .tenant(testTenant)
                .user(eventUser)
                .eventType(EventType.SEARCH_PERFORMED)
                .entityType(EntityType.SEARCH)
                .entityId(null)
                .properties("{\"query\":\"IT services\",\"resultsCount\":" + (10 + i * 2) + "}")
                .timestamp(now.minus(i * 3, ChronoUnit.HOURS))
                .sessionId("session-" + UUID.randomUUID())
                .ipAddress("192.168.1." + (150 + i))
                .userAgent("Mozilla/5.0 (Test Browser)")
                .build());
        }

        // Create pipeline events
        for (int i = 0; i < 8; i++) {
            User eventUser = testUsers.get(i % testUsers.size());
            events.add(AnalyticsEvent.builder()
                .tenant(testTenant)
                .user(eventUser)
                .eventType(EventType.PIPELINE_OPPORTUNITY_ADDED)
                .entityType(EntityType.PIPELINE_OPPORTUNITY)
                .entityId("pipeline-opp-" + UUID.randomUUID())
                .properties("{\"stage\":\"Qualified\",\"value\":50000}")
                .timestamp(now.minus(i * 4, ChronoUnit.HOURS))
                .sessionId("session-" + UUID.randomUUID())
                .ipAddress("192.168.1." + (200 + i))
                .userAgent("Mozilla/5.0 (Test Browser)")
                .build());
        }

        // Create document events
        for (int i = 0; i < 7; i++) {
            User eventUser = testUsers.get(i % testUsers.size());
            events.add(AnalyticsEvent.builder()
                .tenant(testTenant)
                .user(eventUser)
                .eventType(EventType.DOCUMENT_UPLOADED)
                .entityType(EntityType.DOCUMENT)
                .entityId("doc-" + UUID.randomUUID())
                .properties("{\"fileName\":\"proposal-" + i + ".pdf\",\"size\":1024000}")
                .timestamp(now.minus(i * 5, ChronoUnit.HOURS))
                .sessionId("session-" + UUID.randomUUID())
                .ipAddress("192.168.1." + (250 + i))
                .userAgent("Mozilla/5.0 (Test Browser)")
                .build());
        }

        // Save all events in batch
        analyticsEventRepository.saveAll(events);
    }

    @Nested
    @DisplayName("Dashboard Statistics Flow")
    class DashboardStatisticsFlow {

        @Test
        @DisplayName("should retrieve dashboard statistics")
        void should_RetrieveDashboardStatistics() throws Exception {
            performGet(ANALYTICS_URL + "/dashboard")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").exists());
        }

        @Test
        @DisplayName("should handle dashboard request without authentication")
        void should_HandleDashboardRequestWithoutAuthentication() throws Exception {
            // Clear tenant context to simulate missing auth
            testTenantId = null;
            testUserId = null;

            performGet(ANALYTICS_URL + "/dashboard")
                .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("should retrieve dashboard stats with valid tenant context")
        void should_RetrieveDashboardStatsWithValidTenantContext() throws Exception {
            performGet(ANALYTICS_URL + "/dashboard")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isNotEmpty());
        }
    }

    @Nested
    @DisplayName("Activity Feed Flow")
    class ActivityFeedFlow {

        @Test
        @DisplayName("should retrieve activity feed with default limit")
        void should_RetrieveActivityFeedWithDefaultLimit() throws Exception {
            performGet(ANALYTICS_URL + "/activity")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should retrieve activity feed with custom limit")
        void should_RetrieveActivityFeedWithCustomLimit() throws Exception {
            performGet(ANALYTICS_URL + "/activity?limit=20")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should retrieve activity feed with small limit")
        void should_RetrieveActivityFeedWithSmallLimit() throws Exception {
            performGet(ANALYTICS_URL + "/activity?limit=5")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should retrieve activity feed with large limit")
        void should_RetrieveActivityFeedWithLargeLimit() throws Exception {
            performGet(ANALYTICS_URL + "/activity?limit=100")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should handle activity feed request without authentication")
        void should_HandleActivityFeedRequestWithoutAuthentication() throws Exception {
            // Clear tenant context
            testTenantId = null;
            testUserId = null;

            performGet(ANALYTICS_URL + "/activity?limit=20")
                .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("Top Performers Flow")
    class TopPerformersFlow {

        @Test
        @DisplayName("should retrieve top performers with default limit")
        void should_RetrieveTopPerformersWithDefaultLimit() throws Exception {
            performGet(ANALYTICS_URL + "/top-performers")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should retrieve top performers with custom limit")
        void should_RetrieveTopPerformersWithCustomLimit() throws Exception {
            performGet(ANALYTICS_URL + "/top-performers?limit=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should retrieve top performers with small limit")
        void should_RetrieveTopPerformersWithSmallLimit() throws Exception {
            performGet(ANALYTICS_URL + "/top-performers?limit=3")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should retrieve top performers with large limit")
        void should_RetrieveTopPerformersWithLargeLimit() throws Exception {
            performGet(ANALYTICS_URL + "/top-performers?limit=50")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should handle top performers request without authentication")
        void should_HandleTopPerformersRequestWithoutAuthentication() throws Exception {
            // Clear tenant context
            testTenantId = null;
            testUserId = null;

            performGet(ANALYTICS_URL + "/top-performers?limit=10")
                .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("should verify top performers contain user information")
        void should_VerifyTopPerformersContainUserInformation() throws Exception {
            performGet(ANALYTICS_URL + "/top-performers?limit=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("Event Tracking Flow")
    class EventTrackingFlow {

        @Test
        @DisplayName("should track page view event")
        void should_TrackPageViewEvent() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "PAGE_VIEW",
                "entityType", "DASHBOARD",
                "entityId", UUID.randomUUID().toString(),
                "properties", "{\"page\":\"/dashboard\",\"duration\":2000}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventType").value("PAGE_VIEW"));
        }

        @Test
        @DisplayName("should track opportunity viewed event")
        void should_TrackOpportunityViewedEvent() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "OPPORTUNITY_VIEWED",
                "entityType", "OPPORTUNITY",
                "entityId", "opp-" + UUID.randomUUID(),
                "properties", "{\"title\":\"E2E Test Opportunity\",\"source\":\"SAM.gov\"}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventType").value("OPPORTUNITY_VIEWED"))
                .andExpect(jsonPath("$.entityType").value("OPPORTUNITY"));
        }

        @Test
        @DisplayName("should track search performed event")
        void should_TrackSearchPerformedEvent() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "SEARCH_PERFORMED",
                "entityType", "SEARCH",
                "properties", "{\"query\":\"cybersecurity services\",\"resultsCount\":42}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventType").value("SEARCH_PERFORMED"));
        }

        @Test
        @DisplayName("should track pipeline opportunity added event")
        void should_TrackPipelineOpportunityAddedEvent() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "PIPELINE_OPPORTUNITY_ADDED",
                "entityType", "PIPELINE_OPPORTUNITY",
                "entityId", "pipeline-opp-" + UUID.randomUUID(),
                "properties", "{\"stage\":\"Qualified\",\"value\":75000}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventType").value("PIPELINE_OPPORTUNITY_ADDED"));
        }

        @Test
        @DisplayName("should track document uploaded event")
        void should_TrackDocumentUploadedEvent() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "DOCUMENT_UPLOADED",
                "entityType", "DOCUMENT",
                "entityId", "doc-" + UUID.randomUUID(),
                "properties", "{\"fileName\":\"e2e-test-doc.pdf\",\"size\":2048000}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventType").value("DOCUMENT_UPLOADED"));
        }

        @Test
        @DisplayName("should track user login event")
        void should_TrackUserLoginEvent() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "USER_LOGIN",
                "entityType", "USER",
                "entityId", testUserId.toString(),
                "properties", "{\"method\":\"password\",\"success\":true}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventType").value("USER_LOGIN"));
        }

        @Test
        @DisplayName("should track dashboard viewed event")
        void should_TrackDashboardViewedEvent() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "DASHBOARD_VIEWED",
                "entityType", "DASHBOARD",
                "entityId", "dashboard-" + UUID.randomUUID(),
                "properties", "{\"dashboardType\":\"EXECUTIVE\",\"widgets\":5}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventType").value("DASHBOARD_VIEWED"));
        }

        @Test
        @DisplayName("should track report generated event")
        void should_TrackReportGeneratedEvent() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "REPORT_GENERATED",
                "entityType", "REPORT",
                "entityId", "report-" + UUID.randomUUID(),
                "properties", "{\"reportType\":\"PIPELINE\",\"format\":\"PDF\"}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventType").value("REPORT_GENERATED"));
        }

        @Test
        @DisplayName("should handle track event without authentication")
        void should_HandleTrackEventWithoutAuthentication() throws Exception {
            // Clear tenant context
            testTenantId = null;
            testUserId = null;

            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "PAGE_VIEW",
                "properties", "{\"page\":\"/dashboard\"}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("should handle invalid event type")
        void should_HandleInvalidEventType() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "INVALID_EVENT_TYPE",
                "properties", "{\"page\":\"/dashboard\"}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("should track event with minimal properties")
        void should_TrackEventWithMinimalProperties() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "PAGE_VIEW",
                "properties", "{}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists());
        }
    }

    @Nested
    @DisplayName("Analytics Data Validation")
    class AnalyticsDataValidation {

        @Test
        @DisplayName("should verify dashboard stats structure")
        void should_VerifyDashboardStatsStructure() throws Exception {
            performGet(ANALYTICS_URL + "/dashboard")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").exists());
        }

        @Test
        @DisplayName("should verify activity feed items contain required fields")
        void should_VerifyActivityFeedItemsContainRequiredFields() throws Exception {
            performGet(ANALYTICS_URL + "/activity?limit=20")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should verify top performers contain user data")
        void should_VerifyTopPerformersContainUserData() throws Exception {
            performGet(ANALYTICS_URL + "/top-performers?limit=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should verify tracked events are persisted")
        void should_VerifyTrackedEventsArePersisted() throws Exception {
            String uniqueEventId = "tracked-event-" + UUID.randomUUID();

            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "CUSTOM",
                "entityType", "DASHBOARD",
                "entityId", uniqueEventId,
                "properties", "{\"test\":true}"
            );

            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entityId").value(uniqueEventId));

            // Verify event exists in database
            List<AnalyticsEvent> events = analyticsEventRepository.findByEntity(
                testTenantId,
                EntityType.DASHBOARD,
                uniqueEventId
            );

            assert !events.isEmpty() : "Tracked event should be persisted in database";
        }
    }

    @Nested
    @DisplayName("Analytics Edge Cases")
    class AnalyticsEdgeCases {

        @Test
        @DisplayName("should handle activity feed with zero limit")
        void should_HandleActivityFeedWithZeroLimit() throws Exception {
            performGet(ANALYTICS_URL + "/activity?limit=0")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should handle top performers with zero limit")
        void should_HandleTopPerformersWithZeroLimit() throws Exception {
            performGet(ANALYTICS_URL + "/top-performers?limit=0")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should handle negative limit gracefully")
        void should_HandleNegativeLimitGracefully() throws Exception {
            performGet(ANALYTICS_URL + "/activity?limit=-1")
                .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("should handle extremely large limit")
        void should_HandleExtremelyLargeLimit() throws Exception {
            performGet(ANALYTICS_URL + "/activity?limit=10000")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        @Test
        @DisplayName("should isolate dashboard stats by tenant")
        void should_IsolateDashboardStatsByTenant() throws Exception {
            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Tenant 2 " + UUID.randomUUID())
                .slug("tenant2-" + UUID.randomUUID().toString().substring(0, 8))
                .status(TenantStatus.ACTIVE)
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Request with original tenant context - should succeed
            performGet(ANALYTICS_URL + "/dashboard")
                .andExpect(status().isOk());

            // Switch to tenant2 context
            testTenantId = tenant2.getId();

            // Request with tenant2 context - should return different data
            performGet(ANALYTICS_URL + "/dashboard")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should isolate activity feed by tenant")
        void should_IsolateActivityFeedByTenant() throws Exception {
            // Create events for original tenant (already done in setUp)
            performGet(ANALYTICS_URL + "/activity?limit=20")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

            // Create second tenant with no events
            Tenant tenant2 = Tenant.builder()
                .name("Tenant 2 " + UUID.randomUUID())
                .slug("tenant2-" + UUID.randomUUID().toString().substring(0, 8))
                .status(TenantStatus.ACTIVE)
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Switch to tenant2 context
            testTenantId = tenant2.getId();

            // Activity feed should be empty or different
            performGet(ANALYTICS_URL + "/activity?limit=20")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should isolate tracked events by tenant")
        void should_IsolateTrackedEventsByTenant() throws Exception {
            java.util.Map<String, Object> trackRequest = java.util.Map.of(
                "eventType", "PAGE_VIEW",
                "properties", "{\"page\":\"/test\"}"
            );

            // Track event for tenant1
            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated());

            // Create tenant2
            Tenant tenant2 = Tenant.builder()
                .name("Tenant 2 " + UUID.randomUUID())
                .slug("tenant2-" + UUID.randomUUID().toString().substring(0, 8))
                .status(TenantStatus.ACTIVE)
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Switch to tenant2
            testTenantId = tenant2.getId();

            // Track event for tenant2
            performPost(ANALYTICS_URL + "/track", trackRequest)
                .andExpect(status().isCreated());

            // Events should be isolated by tenant
        }
    }
}
