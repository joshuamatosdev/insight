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
import com.samgov.ingestor.dto.CreateSprintRequest;
import com.samgov.ingestor.dto.CreateTaskRequest;
import com.samgov.ingestor.model.SprintTask.TaskStatus;
import com.samgov.ingestor.dto.UpdateSprintRequest;
import com.samgov.ingestor.dto.UpdateTaskRequest;
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
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for SprintController REST API.
 *
 * Tests focus on HTTP behavior:
 * - Request/response formats
 * - HTTP status codes
 * - Sprint lifecycle endpoints
 * - Task management endpoints
 * - Authorization and tenant isolation
 */
@DisplayName("SprintController")
class SprintControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/portal/sprints";
    private static final String CONTRACTS_URL = "/contracts";

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

        // Create test role with SPRINT permissions
        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .permissions("SPRINT_CREATE,SPRINT_READ,SPRINT_UPDATE,SPRINT_DELETE,TASK_CREATE,TASK_UPDATE,TASK_DELETE")
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

        // Create tenant membership
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

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private CreateSprintRequest createSprintRequest(String name) {
        return new CreateSprintRequest(
            testContract.getId(),
            name,
            "Sprint goal for " + name,
            LocalDate.now(),
            LocalDate.now().plusWeeks(2)
        );
    }

    @Nested
    @DisplayName("POST /sprints")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class CreateSprint {

        @Test
        @DisplayName("should create sprint and return 201 CREATED")
        void shouldCreateSprintSuccessfully() throws Exception {
            // Given
            CreateSprintRequest request = createSprintRequest("Sprint 1");

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Sprint 1")))
                .andExpect(jsonPath("$.goal", is("Sprint goal for Sprint 1")))
                .andExpect(jsonPath("$.status", is("PLANNED")))
                .andExpect(jsonPath("$.contractId", is(testContract.getId().toString())));
        }

        @Test
        @DisplayName("should return 400 BAD REQUEST for missing required fields")
        void shouldReturn400ForMissingFields() throws Exception {
            // Given - request with missing name
            CreateSprintRequest request = new CreateSprintRequest(
                testContract.getId(),
                null, // missing name
                "Goal",
                LocalDate.now(),
                LocalDate.now().plusWeeks(2)
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 BAD REQUEST for duplicate sprint name")
        void shouldReturn400ForDuplicateName() throws Exception {
            // Given - create first sprint
            CreateSprintRequest request = createSprintRequest("Duplicate Sprint");
            performPost(BASE_URL, request)
                .andExpect(status().isCreated());

            // When/Then - try to create duplicate
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 404 NOT FOUND for non-existent contract")
        void shouldReturn404ForNonExistentContract() throws Exception {
            // Given
            CreateSprintRequest request = new CreateSprintRequest(
                UUID.randomUUID(), // non-existent contract
                "Sprint",
                "Goal",
                LocalDate.now(),
                LocalDate.now().plusWeeks(2)
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /sprints/{id}")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class GetSprint {

        @Test
        @DisplayName("should return sprint by ID")
        void shouldReturnSprintById() throws Exception {
            // Given - create sprint first
            CreateSprintRequest request = createSprintRequest("Get Test Sprint");
            MvcResult createResult = performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andReturn();

            String responseJson = createResult.getResponse().getContentAsString();
            String sprintId = objectMapper.readTree(responseJson).get("id").asText();

            // When/Then
            performGet(BASE_URL + "/" + sprintId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sprintId)))
                .andExpect(jsonPath("$.name", is("Get Test Sprint")));
        }

        @Test
        @DisplayName("should return 404 for non-existent sprint")
        void shouldReturn404ForNonExistentSprint() throws Exception {
            // When/Then
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /contracts/{contractId}/sprints")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class GetSprintsForContract {

        @Test
        @DisplayName("should return all sprints for a contract")
        void shouldReturnAllSprintsForContract() throws Exception {
            // Given - create multiple sprints
            performPost(BASE_URL, createSprintRequest("Sprint 1"))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createSprintRequest("Sprint 2"))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createSprintRequest("Sprint 3"))
                .andExpect(status().isCreated());

            // When/Then
            performGet(CONTRACTS_URL + "/" + testContract.getId() + "/sprints")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
        }

        @Test
        @DisplayName("should return empty list for contract with no sprints")
        void shouldReturnEmptyListForNoSprints() throws Exception {
            // When/Then
            performGet(CONTRACTS_URL + "/" + testContract.getId() + "/sprints")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /contracts/{contractId}/sprints/active")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class GetActiveSprint {

        @Test
        @DisplayName("should return active sprint for contract")
        void shouldReturnActiveSprintForContract() throws Exception {
            // Given - create and start a sprint
            MvcResult createResult = performPost(BASE_URL, createSprintRequest("Active Sprint"))
                .andExpect(status().isCreated())
                .andReturn();

            String sprintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // Start the sprint
            performPatch(BASE_URL + "/" + sprintId + "/start")
                .andExpect(status().isOk());

            // When/Then
            performGet(CONTRACTS_URL + "/" + testContract.getId() + "/sprints/active")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sprintId)))
                .andExpect(jsonPath("$.status", is("ACTIVE")));
        }

        @Test
        @DisplayName("should return 204 NO CONTENT when no active sprint exists")
        void shouldReturn204WhenNoActiveSprint() throws Exception {
            // Given - create sprint but don't start it
            performPost(BASE_URL, createSprintRequest("Planned Sprint"))
                .andExpect(status().isCreated());

            // When/Then
            performGet(CONTRACTS_URL + "/" + testContract.getId() + "/sprints/active")
                .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("PUT /sprints/{id}")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class UpdateSprint {

        @Test
        @DisplayName("should update sprint successfully")
        void shouldUpdateSprintSuccessfully() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createSprintRequest("Original Sprint"))
                .andExpect(status().isCreated())
                .andReturn();

            String sprintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            UpdateSprintRequest updateRequest = new UpdateSprintRequest(
                "Updated Sprint",
                "Updated goal",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusWeeks(3)
            );

            // When/Then
            performPut(BASE_URL + "/" + sprintId, updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Sprint")))
                .andExpect(jsonPath("$.goal", is("Updated goal")));
        }

        @Test
        @DisplayName("should return 404 when updating non-existent sprint")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            // Given
            UpdateSprintRequest updateRequest = new UpdateSprintRequest(
                "Updated", "Goal", LocalDate.now(), LocalDate.now().plusWeeks(2)
            );

            // When/Then
            performPut(BASE_URL + "/" + UUID.randomUUID(), updateRequest)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /sprints/{id}")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class DeleteSprint {

        @Test
        @DisplayName("should delete sprint successfully")
        void shouldDeleteSprintSuccessfully() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createSprintRequest("Sprint to Delete"))
                .andExpect(status().isCreated())
                .andReturn();

            String sprintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            performDelete(BASE_URL + "/" + sprintId)
                .andExpect(status().isNoContent());

            // Verify deletion
            performGet(BASE_URL + "/" + sprintId)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Sprint Status Transitions")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class SprintStatusTransitions {

        private String sprintId;

        @BeforeEach
        void createSprint() throws Exception {
            MvcResult createResult = performPost(BASE_URL, createSprintRequest("Status Test Sprint"))
                .andExpect(status().isCreated())
                .andReturn();

            sprintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();
        }

        @Test
        @DisplayName("PATCH /sprints/{id}/start - should start planned sprint")
        void shouldStartPlannedSprint() throws Exception {
            // When/Then
            performPatch(BASE_URL + "/" + sprintId + "/start")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.actualStartDate", notNullValue()));
        }

        @Test
        @DisplayName("PATCH /sprints/{id}/complete - should complete active sprint")
        void shouldCompleteActiveSprint() throws Exception {
            // Given - start the sprint first
            performPatch(BASE_URL + "/" + sprintId + "/start")
                .andExpect(status().isOk());

            // When/Then
            performPatch(BASE_URL + "/" + sprintId + "/complete")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.actualEndDate", notNullValue()));
        }

        @Test
        @DisplayName("should return 400 when starting non-planned sprint")
        void shouldReturn400WhenStartingNonPlannedSprint() throws Exception {
            // Given - start the sprint
            performPatch(BASE_URL + "/" + sprintId + "/start")
                .andExpect(status().isOk());

            // When/Then - try to start again
            performPatch(BASE_URL + "/" + sprintId + "/start")
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when completing non-active sprint")
        void shouldReturn400WhenCompletingNonActiveSprint() throws Exception {
            // When/Then - try to complete without starting
            performPatch(BASE_URL + "/" + sprintId + "/complete")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Task Management Endpoints")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class TaskManagementEndpoints {

        private String sprintId;

        @BeforeEach
        void createSprint() throws Exception {
            MvcResult createResult = performPost(BASE_URL, createSprintRequest("Task Management Sprint"))
                .andExpect(status().isCreated())
                .andReturn();

            sprintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();
        }

        @Test
        @DisplayName("POST /sprints/{id}/tasks - should add task to sprint")
        void shouldAddTaskToSprint() throws Exception {
            // Given
            CreateTaskRequest taskRequest = new CreateTaskRequest(
                "Implement feature",
                "Feature description",
                TaskStatus.TODO,
                testUser.getId(),
                5,
                LocalDate.now().plusDays(5)
            );

            // When/Then
            performPost(BASE_URL + "/" + sprintId + "/tasks", taskRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Implement feature")))
                .andExpect(jsonPath("$.status", is("TODO")))
                .andExpect(jsonPath("$.storyPoints", is(5)));
        }

        @Test
        @DisplayName("GET /sprints/{id}/tasks - should return all tasks")
        void shouldReturnAllTasks() throws Exception {
            // Given - create tasks
            CreateTaskRequest task1 = new CreateTaskRequest(
                "Task 1", null, TaskStatus.TODO, null, 3, null
            );
            CreateTaskRequest task2 = new CreateTaskRequest(
                "Task 2", null, TaskStatus.IN_PROGRESS, null, 5, null
            );

            performPost(BASE_URL + "/" + sprintId + "/tasks", task1)
                .andExpect(status().isCreated());
            performPost(BASE_URL + "/" + sprintId + "/tasks", task2)
                .andExpect(status().isCreated());

            // When/Then
            performGet(BASE_URL + "/" + sprintId + "/tasks")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
        }

        @Test
        @DisplayName("GET /sprints/{id}/tasks?status=TODO - should filter tasks by status")
        void shouldFilterTasksByStatus() throws Exception {
            // Given
            performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("TODO Task", null, TaskStatus.TODO, null, 3, null))
                .andExpect(status().isCreated());
            performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("Done Task", null, TaskStatus.DONE, null, 5, null))
                .andExpect(status().isCreated());

            // When/Then
            mockMvc.perform(get(BASE_URL + "/" + sprintId + "/tasks")
                    .param("status", "TODO")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("TODO Task")));
        }

        @Test
        @DisplayName("PUT /sprints/{sprintId}/tasks/{taskId} - should update task")
        void shouldUpdateTask() throws Exception {
            // Given - create a task
            MvcResult createResult = performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("Original Task", null, TaskStatus.TODO, null, 3, null))
                .andExpect(status().isCreated())
                .andReturn();

            String taskId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            UpdateTaskRequest updateRequest = new UpdateTaskRequest(
                "Updated Task",
                "Updated description",
                TaskStatus.IN_PROGRESS,
                testUser.getId(),
                8,
                LocalDate.now().plusDays(3)
            );

            // When/Then
            performPut(BASE_URL + "/" + sprintId + "/tasks/" + taskId, updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Task")))
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.storyPoints", is(8)));
        }

        @Test
        @DisplayName("PATCH /sprints/{sprintId}/tasks/{taskId}/move - should move task to status")
        void shouldMoveTaskToStatus() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("Task to Move", null, TaskStatus.TODO, null, 3, null))
                .andExpect(status().isCreated())
                .andReturn();

            String taskId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            mockMvc.perform(patch(BASE_URL + "/" + sprintId + "/tasks/" + taskId + "/move")
                    .param("status", "IN_PROGRESS")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")));
        }

        @Test
        @DisplayName("DELETE /sprints/{sprintId}/tasks/{taskId} - should delete task")
        void shouldDeleteTask() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("Task to Delete", null, TaskStatus.TODO, null, 3, null))
                .andExpect(status().isCreated())
                .andReturn();

            String taskId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            performDelete(BASE_URL + "/" + sprintId + "/tasks/" + taskId)
                .andExpect(status().isNoContent());

            // Verify deletion
            performGet(BASE_URL + "/" + sprintId + "/tasks")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("Sprint Summary Endpoint")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class SprintSummaryEndpoint {

        @Test
        @DisplayName("GET /sprints/{id}/summary - should return sprint summary")
        void shouldReturnSprintSummary() throws Exception {
            // Given - create sprint with tasks
            MvcResult createResult = performPost(BASE_URL, createSprintRequest("Summary Sprint"))
                .andExpect(status().isCreated())
                .andReturn();

            String sprintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // Add tasks
            performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("TODO 1", null, TaskStatus.TODO, null, 3, null));
            performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("TODO 2", null, TaskStatus.TODO, null, 5, null));
            performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("In Progress", null, TaskStatus.IN_PROGRESS, null, 8, null));
            performPost(BASE_URL + "/" + sprintId + "/tasks",
                new CreateTaskRequest("Done", null, TaskStatus.DONE, null, 2, null));

            // When/Then
            performGet(BASE_URL + "/" + sprintId + "/summary")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks", is(4)))
                .andExpect(jsonPath("$.todoCount", is(2)))
                .andExpect(jsonPath("$.inProgressCount", is(1)))
                .andExpect(jsonPath("$.doneCount", is(1)))
                .andExpect(jsonPath("$.totalStoryPoints", is(18)))
                .andExpect(jsonPath("$.completedStoryPoints", is(2)));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    @WithMockUser(roles = "SPRINT_MANAGER")
    class TenantIsolation {

        @Test
        @DisplayName("should not return sprints from other tenants")
        void shouldNotReturnSprintsFromOtherTenants() throws Exception {
            // Given - create sprint in current tenant
            performPost(BASE_URL, createSprintRequest("Tenant 1 Sprint"))
                .andExpect(status().isCreated());

            // Create second tenant with contract
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            Contract tenant2Contract = Contract.builder()
                .tenant(tenant2)
                .contractNumber("T2-CONTRACT")
                .title("Tenant 2 Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .agency("DOD")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("100000.00"))
                .build();
            contractRepository.save(tenant2Contract);

            // When/Then - Query should only return tenant1's sprints
            performGet(CONTRACTS_URL + "/" + testContract.getId() + "/sprints")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name",
                    org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("Tenant 2 Sprint"))));
        }
    }
}
