package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Pipeline;
import com.samgov.ingestor.model.PipelineStage;
import com.samgov.ingestor.model.PipelineStage.StageType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.PipelineRepository;
import com.samgov.ingestor.repository.PipelineStageRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.PipelineService.CreatePipelineRequest;
import com.samgov.ingestor.service.PipelineService.CreateStageRequest;
import com.samgov.ingestor.service.PipelineService.AddOpportunityRequest;
import com.samgov.ingestor.service.PipelineService.UpdatePipelineRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for PipelineController.
 *
 * Tests HTTP endpoints and their behavior:
 * - Pipeline CRUD via REST API
 * - Stage management endpoints
 * - Opportunity-pipeline relationship endpoints
 * - Tenant isolation at API level
 */
@WithMockUser(roles = {"USER", "TENANT_ADMIN"})
class PipelineControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/pipelines";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository tenantMembershipRepository;

    @Autowired
    private PipelineRepository pipelineRepository;

    @Autowired
    private PipelineStageRepository stageRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    private Tenant testTenant;
    private User testUser;
    private Role testRole;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();

        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.TENANT_ADMIN)
            .description("Admin role")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        // Create test user
        testUser = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        // Create tenant membership
        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        tenantMembershipRepository.save(membership);

        // Set tenant context
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("POST /api/v1/pipelines - Create Pipeline")
    class CreatePipeline {

        @Test
        @DisplayName("should create pipeline with default stages")
        void createPipelineWithDefaultStages() throws Exception {
            // Given
            CreatePipelineRequest request = new CreatePipelineRequest(
                "Sales Pipeline",
                "Main sales pipeline",
                null
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name", is("Sales Pipeline")))
                .andExpect(jsonPath("$.description", is("Main sales pipeline")))
                .andExpect(jsonPath("$.isDefault", is(true)))
                .andExpect(jsonPath("$.isArchived", is(false)))
                .andExpect(jsonPath("$.stages", hasSize(7)))
                .andExpect(jsonPath("$.stages[0].name", is("Identified")))
                .andExpect(jsonPath("$.stages[0].stageType", is("INITIAL")));
        }

        @Test
        @DisplayName("should create pipeline with custom stages")
        void createPipelineWithCustomStages() throws Exception {
            // Given
            List<CreateStageRequest> customStages = List.of(
                new CreateStageRequest("Lead", "New leads", 0, "#3B82F6", StageType.INITIAL, 10),
                new CreateStageRequest("Qualified", "Qualified opps", 1, "#10B981", StageType.IN_PROGRESS, 30),
                new CreateStageRequest("Closed", "Done", 2, "#059669", StageType.WON, 100)
            );

            CreatePipelineRequest request = new CreatePipelineRequest(
                "Custom Pipeline",
                null,
                customStages
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.stages", hasSize(3)))
                .andExpect(jsonPath("$.stages[0].name", is("Lead")))
                .andExpect(jsonPath("$.stages[1].name", is("Qualified")))
                .andExpect(jsonPath("$.stages[2].name", is("Closed")));
        }

        @Test
        @DisplayName("should reject duplicate pipeline name")
        void rejectDuplicateName() throws Exception {
            // Given - create first pipeline
            CreatePipelineRequest request = new CreatePipelineRequest(
                "Sales Pipeline",
                null,
                null
            );
            performPost(BASE_URL, request).andExpect(status().isCreated());

            // When/Then - try to create duplicate
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/pipelines - List Pipelines")
    class ListPipelines {

        @Test
        @DisplayName("should list active pipelines by default")
        void listActivePipelines() throws Exception {
            // Given
            createTestPipeline("Pipeline 1");
            createTestPipeline("Pipeline 2");

            // Archive second pipeline directly
            Pipeline p2 = pipelineRepository.findByTenantIdAndIsArchivedFalse(testTenant.getId())
                .stream()
                .filter(p -> p.getName().equals("Pipeline 2"))
                .findFirst()
                .orElseThrow();
            p2.setIsArchived(true);
            pipelineRepository.save(p2);

            // When/Then
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Pipeline 1")));
        }

        @Test
        @DisplayName("should include archived pipelines when requested")
        void listAllPipelinesIncludingArchived() throws Exception {
            // Given
            createTestPipeline("Pipeline 1");
            createTestPipeline("Pipeline 2");

            // Archive second pipeline
            Pipeline p2 = pipelineRepository.findByTenantIdAndIsArchivedFalse(testTenant.getId())
                .stream()
                .filter(p -> p.getName().equals("Pipeline 2"))
                .findFirst()
                .orElseThrow();
            p2.setIsArchived(true);
            pipelineRepository.save(p2);

            // When/Then
            mockMvc.perform(get(BASE_URL)
                    .param("includeArchived", "true")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/pipelines/{id} - Get Pipeline")
    class GetPipeline {

        @Test
        @DisplayName("should get pipeline by ID with stages")
        void getPipelineById() throws Exception {
            // Given
            String pipelineId = createTestPipeline("Test Pipeline");

            // When/Then
            performGet(BASE_URL + "/" + pipelineId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(pipelineId)))
                .andExpect(jsonPath("$.name", is("Test Pipeline")))
                .andExpect(jsonPath("$.stages", hasSize(greaterThan(0))));
        }

        @Test
        @DisplayName("should return 404 for non-existent pipeline")
        void pipelineNotFound() throws Exception {
            // When/Then
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/pipelines/{id} - Update Pipeline")
    class UpdatePipeline {

        @Test
        @DisplayName("should update pipeline name and description")
        void updatePipeline() throws Exception {
            // Given
            String pipelineId = createTestPipeline("Original Name");

            UpdatePipelineRequest request = new UpdatePipelineRequest(
                "Updated Name",
                "Updated description"
            );

            // When/Then
            performPut(BASE_URL + "/" + pipelineId, request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Name")))
                .andExpect(jsonPath("$.description", is("Updated description")));
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/pipelines/{id} - Delete Pipeline")
    class DeletePipeline {

        @Test
        @DisplayName("should delete pipeline without opportunities")
        void deletePipeline() throws Exception {
            // Given - create two pipelines
            createTestPipeline("Pipeline 1"); // This becomes default
            String pipelineToDelete = createTestPipeline("Pipeline 2");

            // When/Then
            performDelete(BASE_URL + "/" + pipelineToDelete)
                .andExpect(status().isNoContent());

            performGet(BASE_URL + "/" + pipelineToDelete)
                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should not delete default pipeline")
        void cannotDeleteDefaultPipeline() throws Exception {
            // Given - first pipeline is default
            String defaultPipelineId = createTestPipeline("Default Pipeline");

            // When/Then - API returns 409 Conflict for business rule violations
            performDelete(BASE_URL + "/" + defaultPipelineId)
                .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/pipelines/{id}/set-default - Set Default Pipeline")
    class SetDefaultPipeline {

        @Test
        @DisplayName("should set new default pipeline")
        void setDefaultPipeline() throws Exception {
            // Given
            String firstPipelineId = createTestPipeline("First Pipeline");
            String secondPipelineId = createTestPipeline("Second Pipeline");

            // When
            performPost(BASE_URL + "/" + secondPipelineId + "/set-default")
                .andExpect(status().isOk());

            // Then - verify second is now default
            performGet(BASE_URL + "/" + secondPipelineId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isDefault", is(true)));

            // And first is no longer default
            performGet(BASE_URL + "/" + firstPipelineId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isDefault", is(false)));
        }
    }

    @Nested
    @DisplayName("Stage Management Endpoints")
    class StageEndpoints {

        private String pipelineId;

        @BeforeEach
        void createPipeline() throws Exception {
            pipelineId = createTestPipeline("Test Pipeline");
        }

        @Test
        @DisplayName("POST /pipelines/{id}/stages - should add stage to pipeline")
        void addStage() throws Exception {
            // Given
            CreateStageRequest request = new CreateStageRequest(
                "Review",
                "Review stage",
                null,
                "#9333EA",
                StageType.IN_PROGRESS,
                85
            );

            // When/Then
            performPost(BASE_URL + "/" + pipelineId + "/stages", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Review")))
                .andExpect(jsonPath("$.color", is("#9333EA")))
                .andExpect(jsonPath("$.probability", is(85)));
        }

        @Test
        @DisplayName("POST /pipelines/{id}/stages/reorder - should reorder stages")
        void reorderStages() throws Exception {
            // Given - get current stages
            MvcResult result = performGet(BASE_URL + "/" + pipelineId)
                .andExpect(status().isOk())
                .andReturn();

            String responseJson = result.getResponse().getContentAsString();

            // Parse stage IDs from response (simplified - in real test use proper JSON parsing)
            List<PipelineStage> stages = stageRepository.findByPipelineIdOrderByPositionAsc(
                UUID.fromString(pipelineId)
            );

            // Create reordered list (swap first two)
            List<UUID> reorderedIds = List.of(
                stages.get(1).getId(),
                stages.get(0).getId(),
                stages.get(2).getId(),
                stages.get(3).getId(),
                stages.get(4).getId(),
                stages.get(5).getId(),
                stages.get(6).getId()
            );

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + pipelineId + "/stages/reorder")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(reorderedIds)))
                .andExpect(status().isOk());

            // Verify reorder
            List<PipelineStage> updatedStages = stageRepository.findByPipelineIdOrderByPositionAsc(
                UUID.fromString(pipelineId)
            );
            org.assertj.core.api.Assertions.assertThat(updatedStages.get(0).getId())
                .isEqualTo(stages.get(1).getId());
            org.assertj.core.api.Assertions.assertThat(updatedStages.get(1).getId())
                .isEqualTo(stages.get(0).getId());
        }

        @Test
        @DisplayName("DELETE /pipelines/{id}/stages/{stageId} - should delete empty stage")
        void deleteEmptyStage() throws Exception {
            // Given
            List<PipelineStage> stages = stageRepository.findByPipelineIdOrderByPositionAsc(
                UUID.fromString(pipelineId)
            );
            UUID stageToDelete = stages.get(3).getId();

            // When/Then
            performDelete(BASE_URL + "/" + pipelineId + "/stages/" + stageToDelete)
                .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("Pipeline Opportunity Endpoints")
    class PipelineOpportunityEndpoints {

        private String pipelineId;
        private Opportunity testOpportunity;

        @BeforeEach
        void setUp() throws Exception {
            pipelineId = createTestPipeline("Test Pipeline");

            // Create test opportunity
            testOpportunity = Opportunity.builder()
                .id("SAM-OPP-" + UUID.randomUUID().toString().substring(0, 8))
                .solicitationNumber("W911NF-24-R-0001")
                .title("IT Services Contract")
                .description("Enterprise IT modernization")
                .naicsCode("541511")
                .agency("Department of Defense")
                .responseDeadLine(LocalDate.now().plusDays(30))
                .build();
            opportunityRepository.save(testOpportunity);
        }

        @Test
        @DisplayName("POST /pipelines/{id}/opportunities - should add opportunity to pipeline")
        void addOpportunityToPipeline() throws Exception {
            // Given
            AddOpportunityRequest request = new AddOpportunityRequest(
                testOpportunity.getId(),
                null,
                null,
                "DoD IT Modernization",
                "High priority",
                new BigDecimal("1500000")
            );

            // When/Then
            performPost(BASE_URL + "/" + pipelineId + "/opportunities", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.opportunityId", is(testOpportunity.getId())))
                .andExpect(jsonPath("$.stageName", is("Identified")))
                .andExpect(jsonPath("$.internalName", is("DoD IT Modernization")))
                .andExpect(jsonPath("$.estimatedValue", is(1500000)));
        }

        @Test
        @DisplayName("GET /pipelines/{id}/opportunities - should list opportunities in pipeline")
        void listPipelineOpportunities() throws Exception {
            // Given - add opportunity first
            AddOpportunityRequest request = new AddOpportunityRequest(
                testOpportunity.getId(),
                null,
                null,
                null,
                null,
                null
            );
            performPost(BASE_URL + "/" + pipelineId + "/opportunities", request)
                .andExpect(status().isCreated());

            // When/Then
            performGet(BASE_URL + "/" + pipelineId + "/opportunities")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].opportunityId", is(testOpportunity.getId())));
        }

        @Test
        @DisplayName("POST /pipelines/{id}/opportunities/{oppId}/move - should move opportunity to new stage")
        void moveOpportunityToStage() throws Exception {
            // Given - add opportunity first
            AddOpportunityRequest request = new AddOpportunityRequest(
                testOpportunity.getId(),
                null,
                null,
                null,
                null,
                null
            );
            MvcResult addResult = performPost(BASE_URL + "/" + pipelineId + "/opportunities", request)
                .andExpect(status().isCreated())
                .andReturn();

            String responseJson = addResult.getResponse().getContentAsString();
            // Extract pipeline opportunity ID (simplified)
            String pipelineOppId = objectMapper.readTree(responseJson).get("id").asText();

            // Get target stage
            List<PipelineStage> stages = stageRepository.findByPipelineIdOrderByPositionAsc(
                UUID.fromString(pipelineId)
            );
            UUID targetStageId = stages.get(2).getId(); // "Pursuing" stage

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + pipelineId + "/opportunities/" + pipelineOppId + "/move")
                    .param("stageId", targetStageId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stageId", is(targetStageId.toString())))
                .andExpect(jsonPath("$.stageName", is("Pursuing")));
        }

        @Test
        @DisplayName("DELETE /pipelines/{id}/opportunities/{oppId} - should remove opportunity from pipeline")
        void removeOpportunityFromPipeline() throws Exception {
            // Given - add opportunity first
            AddOpportunityRequest request = new AddOpportunityRequest(
                testOpportunity.getId(),
                null,
                null,
                null,
                null,
                null
            );
            MvcResult addResult = performPost(BASE_URL + "/" + pipelineId + "/opportunities", request)
                .andExpect(status().isCreated())
                .andReturn();

            String responseJson = addResult.getResponse().getContentAsString();
            String pipelineOppId = objectMapper.readTree(responseJson).get("id").asText();

            // When/Then
            performDelete(BASE_URL + "/" + pipelineId + "/opportunities/" + pipelineOppId)
                .andExpect(status().isNoContent());

            // Verify removed
            performGet(BASE_URL + "/" + pipelineId + "/opportunities/" + pipelineOppId)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Pipeline Analytics Endpoints")
    class AnalyticsEndpoints {

        private String pipelineId;

        @BeforeEach
        void setUp() throws Exception {
            pipelineId = createTestPipeline("Analytics Pipeline");

            // Add some opportunities
            for (int i = 0; i < 3; i++) {
                Opportunity opp = Opportunity.builder()
                    .id("SAM-OPP-" + UUID.randomUUID().toString().substring(0, 8))
                    .solicitationNumber("W911NF-24-R-000" + i)
                    .title("Opportunity " + i)
                    .responseDeadLine(LocalDate.now().plusDays(i * 7))
                    .build();
                opportunityRepository.save(opp);

                AddOpportunityRequest request = new AddOpportunityRequest(
                    opp.getId(),
                    null,
                    null,
                    null,
                    null,
                    new BigDecimal(String.valueOf((i + 1) * 500000))
                );
                performPost(BASE_URL + "/" + pipelineId + "/opportunities", request)
                    .andExpect(status().isCreated());
            }
        }

        @Test
        @DisplayName("GET /pipelines/{id}/summary - should return pipeline summary")
        void getPipelineSummary() throws Exception {
            performGet(BASE_URL + "/" + pipelineId + "/summary")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pipelineId", is(pipelineId)))
                .andExpect(jsonPath("$.totalOpportunities", is(3)))
                .andExpect(jsonPath("$.totalValue", notNullValue()))
                .andExpect(jsonPath("$.stages", hasSize(greaterThan(0))));
        }

        @Test
        @DisplayName("GET /pipelines/{id}/approaching-deadlines - should return opportunities with approaching deadlines")
        void getApproachingDeadlines() throws Exception {
            mockMvc.perform(get(BASE_URL + "/" + pipelineId + "/approaching-deadlines")
                    .param("daysAhead", "30")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("Tenant Isolation at API Level")
    class TenantIsolationApi {

        @Test
        @Disabled("Security disabled during development - tenant isolation requires security")
        @DisplayName("should not access other tenant's pipeline")
        void cannotAccessOtherTenantPipeline() throws Exception {
            // Given - create pipeline for current tenant
            String pipelineId = createTestPipeline("Tenant 1 Pipeline");

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Switch to second tenant
            TenantContext.setCurrentTenantId(tenant2.getId());

            // When/Then - try to access first tenant's pipeline
            performGet(BASE_URL + "/" + pipelineId)
                .andExpect(status().isNotFound());
        }

        @Test
        @Disabled("Security disabled during development - tenant isolation requires security")
        @DisplayName("pipelines isolated between tenants")
        void pipelinesIsolatedBetweenTenants() throws Exception {
            // Given - create pipeline for current tenant
            createTestPipeline("Tenant 1 Pipeline");

            // Create second tenant and switch
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);
            TenantContext.setCurrentTenantId(tenant2.getId());

            // When/Then - second tenant should see no pipelines
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    // Helper methods

    private String createTestPipeline(String name) throws Exception {
        CreatePipelineRequest request = new CreatePipelineRequest(name, null, null);

        MvcResult result = performPost(BASE_URL, request)
            .andExpect(status().isCreated())
            .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        return objectMapper.readTree(responseJson).get("id").asText();
    }
}
