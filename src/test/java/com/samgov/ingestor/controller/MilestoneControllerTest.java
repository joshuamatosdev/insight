package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.MilestoneService.CreateMilestoneRequest;
import com.samgov.ingestor.service.MilestoneService.MilestoneStatus;
import com.samgov.ingestor.service.MilestoneService.UpdateMilestoneRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
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

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for MilestoneController REST API.
 *
 * Tests focus on HTTP behavior:
 * - CRUD endpoints
 * - Critical path endpoint
 * - Upcoming/overdue queries
 * - Dependency management endpoints
 */
@DisplayName("MilestoneController")
class MilestoneControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/milestones";
    private static final String CONTRACTS_URL = "/api/v1/contracts";

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    private Tenant testTenant;
    private User testUser;
    private Role testRole;
    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .permissions("MILESTONE_CREATE,MILESTONE_READ,MILESTONE_UPDATE,MILESTONE_DELETE")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        // Create test user
        testUser = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        // Create membership
        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(membership);

        // Create test contract
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("CTRL-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Test Contract")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .build();
        testContract = contractRepository.save(testContract);

        // Set tenant context
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private CreateMilestoneRequest createRequest(String name, LocalDate dueDate) {
        return new CreateMilestoneRequest(
            testContract.getId(),
            name,
            "Description for " + name,
            dueDate,
            testUser.getId(),
            false,
            null,
            null
        );
    }

    @Nested
    @DisplayName("POST /api/v1/milestones")
    @WithMockUser(roles = "USER")
    class CreateMilestone {

        @Test
        @DisplayName("should create milestone and return 201 CREATED")
        void shouldCreateMilestoneSuccessfully() throws Exception {
            // Given
            CreateMilestoneRequest request = createRequest("Phase 1 Complete", LocalDate.now().plusMonths(3));

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Phase 1 Complete")))
                .andExpect(jsonPath("$.status", is("NOT_STARTED")))
                .andExpect(jsonPath("$.contractId", is(testContract.getId().toString())));
        }

        @Test
        @DisplayName("should return 400 BAD REQUEST for missing name")
        void shouldReturn400ForMissingName() throws Exception {
            // Given
            CreateMilestoneRequest request = new CreateMilestoneRequest(
                testContract.getId(),
                null, // missing name
                "Description",
                LocalDate.now().plusMonths(1),
                testUser.getId(),
                false,
                null,
                null
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should create milestone with dependencies")
        void shouldCreateMilestoneWithDependencies() throws Exception {
            // Given - create predecessor first
            MvcResult predecessorResult = performPost(BASE_URL, createRequest("Predecessor", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            String predecessorId = objectMapper.readTree(predecessorResult.getResponse().getContentAsString())
                .get("id").asText();

            CreateMilestoneRequest request = new CreateMilestoneRequest(
                testContract.getId(),
                "Successor",
                "Description",
                LocalDate.now().plusMonths(2),
                testUser.getId(),
                false,
                null,
                List.of(UUID.fromString(predecessorId))
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dependencies", hasSize(1)))
                .andExpect(jsonPath("$.dependencies[0].predecessorId", is(predecessorId)));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/milestones/{id}")
    @WithMockUser(roles = "USER")
    class GetMilestone {

        @Test
        @DisplayName("should return milestone by ID")
        void shouldReturnMilestoneById() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createRequest("Test Milestone", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            String milestoneId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            performGet(BASE_URL + "/" + milestoneId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(milestoneId)))
                .andExpect(jsonPath("$.name", is("Test Milestone")));
        }

        @Test
        @DisplayName("should return 404 for non-existent milestone")
        void shouldReturn404ForNonExistent() throws Exception {
            // When/Then
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/contracts/{contractId}/milestones")
    @WithMockUser(roles = "USER")
    class GetMilestonesForContract {

        @Test
        @DisplayName("should return paginated milestones for contract")
        void shouldReturnPaginatedMilestones() throws Exception {
            // Given
            for (int i = 0; i < 5; i++) {
                performPost(BASE_URL, createRequest("Milestone " + i, LocalDate.now().plusMonths(i + 1)))
                    .andExpect(status().isCreated());
            }

            // When/Then
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/milestones")
                    .param("page", "0")
                    .param("size", "3")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.totalElements", is(5)));
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/milestones/{id}")
    @WithMockUser(roles = "USER")
    class UpdateMilestone {

        @Test
        @DisplayName("should update milestone")
        void shouldUpdateMilestone() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createRequest("Original", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            String milestoneId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            UpdateMilestoneRequest updateRequest = new UpdateMilestoneRequest(
                "Updated Name",
                "Updated description",
                LocalDate.now().plusMonths(2),
                MilestoneStatus.IN_PROGRESS,
                null,
                true
            );

            // When/Then
            performPut(BASE_URL + "/" + milestoneId, updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Name")))
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.isOnCriticalPath", is(true)));
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/milestones/{id}")
    @WithMockUser(roles = "USER")
    class DeleteMilestone {

        @Test
        @DisplayName("should delete milestone")
        void shouldDeleteMilestone() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createRequest("To Delete", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            String milestoneId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            performDelete(BASE_URL + "/" + milestoneId)
                .andExpect(status().isNoContent());

            // Verify deletion
            performGet(BASE_URL + "/" + milestoneId)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/milestones/{id}/complete")
    @WithMockUser(roles = "USER")
    class CompleteMilestone {

        @Test
        @DisplayName("should mark milestone as completed")
        void shouldCompleteMilestone() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createRequest("To Complete", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            String milestoneId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            performPatch(BASE_URL + "/" + milestoneId + "/complete")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.completedDate", notNullValue()));
        }
    }

    @Nested
    @DisplayName("Critical Path Endpoint")
    @WithMockUser(roles = "USER")
    class CriticalPathEndpoint {

        @Test
        @DisplayName("GET /api/v1/contracts/{id}/milestones/critical-path - should return critical path")
        void shouldReturnCriticalPath() throws Exception {
            // Given - create milestones on critical path
            CreateMilestoneRequest m1Request = new CreateMilestoneRequest(
                testContract.getId(), "Phase 1", "Description", LocalDate.now().plusMonths(1),
                testUser.getId(), true, null, null
            );
            MvcResult m1Result = performPost(BASE_URL, m1Request)
                .andExpect(status().isCreated())
                .andReturn();

            String m1Id = objectMapper.readTree(m1Result.getResponse().getContentAsString())
                .get("id").asText();

            CreateMilestoneRequest m2Request = new CreateMilestoneRequest(
                testContract.getId(), "Phase 2", "Description", LocalDate.now().plusMonths(2),
                testUser.getId(), true, null, List.of(UUID.fromString(m1Id))
            );
            performPost(BASE_URL, m2Request)
                .andExpect(status().isCreated());

            // Create non-critical milestone
            performPost(BASE_URL, createRequest("Optional", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated());

            // When/Then
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/milestones/critical-path")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Phase 1")))
                .andExpect(jsonPath("$[1].name", is("Phase 2")));
        }
    }

    @Nested
    @DisplayName("Upcoming and Overdue Endpoints")
    @WithMockUser(roles = "USER")
    class UpcomingOverdueEndpoints {

        @Test
        @DisplayName("GET /api/v1/contracts/{id}/milestones/upcoming - should return upcoming milestones")
        void shouldReturnUpcomingMilestones() throws Exception {
            // Given
            performPost(BASE_URL, createRequest("Upcoming", LocalDate.now().plusDays(7)))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createRequest("Far Away", LocalDate.now().plusDays(60)))
                .andExpect(status().isCreated());

            // When/Then
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/milestones/upcoming")
                    .param("days", "30")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Upcoming")));
        }

        @Test
        @DisplayName("GET /api/v1/contracts/{id}/milestones/overdue - should return overdue milestones")
        void shouldReturnOverdueMilestones() throws Exception {
            // Given - create overdue milestone
            performPost(BASE_URL, createRequest("Overdue", LocalDate.now().minusDays(5)))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createRequest("Future", LocalDate.now().plusDays(30)))
                .andExpect(status().isCreated());

            // When/Then
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/milestones/overdue")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Overdue")));
        }
    }

    @Nested
    @DisplayName("Dependency Management Endpoints")
    @WithMockUser(roles = "USER")
    class DependencyManagementEndpoints {

        @Test
        @DisplayName("POST /api/v1/milestones/{id}/dependencies - should add dependency")
        void shouldAddDependency() throws Exception {
            // Given
            MvcResult predecessorResult = performPost(BASE_URL, createRequest("Predecessor", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            MvcResult successorResult = performPost(BASE_URL, createRequest("Successor", LocalDate.now().plusMonths(2)))
                .andExpect(status().isCreated())
                .andReturn();

            String predecessorId = objectMapper.readTree(predecessorResult.getResponse().getContentAsString())
                .get("id").asText();
            String successorId = objectMapper.readTree(successorResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + successorId + "/dependencies")
                    .param("predecessorId", predecessorId)
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dependencies", hasSize(1)));
        }

        @Test
        @DisplayName("DELETE /api/v1/milestones/{id}/dependencies/{predecessorId} - should remove dependency")
        void shouldRemoveDependency() throws Exception {
            // Given - create with dependency
            MvcResult predecessorResult = performPost(BASE_URL, createRequest("Predecessor", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            String predecessorId = objectMapper.readTree(predecessorResult.getResponse().getContentAsString())
                .get("id").asText();

            CreateMilestoneRequest successorRequest = new CreateMilestoneRequest(
                testContract.getId(), "Successor", "Description", LocalDate.now().plusMonths(2),
                testUser.getId(), false, null, List.of(UUID.fromString(predecessorId))
            );

            MvcResult successorResult = performPost(BASE_URL, successorRequest)
                .andExpect(status().isCreated())
                .andReturn();

            String successorId = objectMapper.readTree(successorResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            mockMvc.perform(delete(BASE_URL + "/" + successorId + "/dependencies/" + predecessorId)
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dependencies", hasSize(0)));
        }

        @Test
        @DisplayName("should return 400 when creating circular dependency")
        void shouldReturn400ForCircularDependency() throws Exception {
            // Given
            MvcResult m1Result = performPost(BASE_URL, createRequest("M1", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            String m1Id = objectMapper.readTree(m1Result.getResponse().getContentAsString())
                .get("id").asText();

            CreateMilestoneRequest m2Request = new CreateMilestoneRequest(
                testContract.getId(), "M2", "Description", LocalDate.now().plusMonths(2),
                testUser.getId(), false, null, List.of(UUID.fromString(m1Id))
            );

            MvcResult m2Result = performPost(BASE_URL, m2Request)
                .andExpect(status().isCreated())
                .andReturn();

            String m2Id = objectMapper.readTree(m2Result.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then - try to add circular dependency
            mockMvc.perform(post(BASE_URL + "/" + m1Id + "/dependencies")
                    .param("predecessorId", m2Id)
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    @WithMockUser(roles = "USER")
    class TenantIsolation {

        @Test
        @DisplayName("should return 404 when accessing other tenant's milestone")
        void shouldReturn404ForOtherTenantMilestone() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createRequest("Tenant 1 Milestone", LocalDate.now().plusMonths(1)))
                .andExpect(status().isCreated())
                .andReturn();

            String milestoneId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            User user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .firstName("User")
                .lastName("Two")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            // Switch tenant
            testTenantId = tenant2.getId();
            testUserId = user2.getId();
            TenantContext.setCurrentTenantId(tenant2.getId());
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then
            performGet(BASE_URL + "/" + milestoneId)
                .andExpect(status().isNotFound());
        }
    }
}
