package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.service.SprintService.CreateSprintRequest;
import com.samgov.ingestor.service.SprintService.CreateTaskRequest;
import com.samgov.ingestor.service.SprintService.SprintDto;
import com.samgov.ingestor.service.SprintService.SprintSummaryDto;
import com.samgov.ingestor.service.SprintService.SprintTaskDto;
import com.samgov.ingestor.service.SprintService.TaskStatus;
import com.samgov.ingestor.service.SprintService.UpdateTaskRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for SprintService.
 *
 * Tests the business logic of sprint management for contract portals:
 * - Sprint CRUD operations
 * - Sprint lifecycle (start, complete)
 * - Task management within sprints
 * - Sprint summary calculations
 * - Multi-tenant isolation
 */
@DisplayName("SprintService")
class SprintServiceTest extends BaseServiceTest {

    @Autowired
    private SprintService sprintService;

    @Autowired
    private ContractRepository contractRepository;

    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();

        // Create a test contract for sprint tests
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("SPRINT-TEST-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Sprint Test Contract")
            .description("Contract for testing sprints")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("Department of Defense")
            .agencyCode("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .build();
        testContract = contractRepository.save(testContract);
    }

    private CreateSprintRequest createDefaultSprintRequest(String name) {
        return new CreateSprintRequest(
            testContract.getId(),
            name,
            "Sprint goal: " + name,
            LocalDate.now(),
            LocalDate.now().plusWeeks(2)
        );
    }

    @Nested
    @DisplayName("Sprint CRUD Operations")
    class SprintCrudOperations {

        @Test
        @DisplayName("should create a new sprint successfully")
        void shouldCreateSprintSuccessfully() {
            // Given
            CreateSprintRequest request = createDefaultSprintRequest("Sprint 1");

            // When
            SprintDto result = sprintService.createSprint(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.name()).isEqualTo("Sprint 1");
            assertThat(result.goal()).isEqualTo("Sprint goal: Sprint 1");
            assertThat(result.startDate()).isEqualTo(LocalDate.now());
            assertThat(result.endDate()).isEqualTo(LocalDate.now().plusWeeks(2));
            assertThat(result.status()).isEqualTo(SprintService.SprintStatus.PLANNED);
            assertThat(result.contractId()).isEqualTo(testContract.getId());
        }

        @Test
        @DisplayName("should retrieve sprint by ID")
        void shouldRetrieveSprintById() {
            // Given
            SprintDto created = sprintService.createSprint(createDefaultSprintRequest("Get Sprint Test"));

            // When
            SprintDto result = sprintService.getSprint(created.id());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(created.id());
            assertThat(result.name()).isEqualTo("Get Sprint Test");
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException for non-existent sprint")
        void shouldThrowExceptionForNonExistentSprint() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> sprintService.getSprint(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Sprint not found");
        }

        @Test
        @DisplayName("should list sprints for a contract")
        void shouldListSprintsForContract() {
            // Given
            sprintService.createSprint(createDefaultSprintRequest("Sprint 1"));
            sprintService.createSprint(createDefaultSprintRequest("Sprint 2"));
            sprintService.createSprint(createDefaultSprintRequest("Sprint 3"));

            // When
            List<SprintDto> sprints = sprintService.getSprints(testContract.getId());

            // Then
            assertThat(sprints).hasSize(3);
            assertThat(sprints)
                .extracting(SprintDto::name)
                .containsExactlyInAnyOrder("Sprint 1", "Sprint 2", "Sprint 3");
        }

        @Test
        @DisplayName("should update sprint details")
        void shouldUpdateSprintDetails() {
            // Given
            SprintDto created = sprintService.createSprint(createDefaultSprintRequest("Original Sprint"));
            SprintService.UpdateSprintRequest updateRequest = new SprintService.UpdateSprintRequest(
                "Updated Sprint Name",
                "Updated goal",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusWeeks(3)
            );

            // When
            SprintDto result = sprintService.updateSprint(created.id(), updateRequest);

            // Then
            assertThat(result.name()).isEqualTo("Updated Sprint Name");
            assertThat(result.goal()).isEqualTo("Updated goal");
            assertThat(result.endDate()).isEqualTo(LocalDate.now().plusWeeks(3));
        }

        @Test
        @DisplayName("should delete sprint without tasks")
        void shouldDeleteSprintWithoutTasks() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Sprint to Delete"));

            // When
            sprintService.deleteSprint(sprint.id());

            // Then
            assertThatThrownBy(() -> sprintService.getSprint(sprint.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should reject duplicate sprint names within same contract")
        void shouldRejectDuplicateSprintName() {
            // Given
            String sprintName = "Duplicate Sprint";
            sprintService.createSprint(createDefaultSprintRequest(sprintName));

            // When/Then
            assertThatThrownBy(() -> sprintService.createSprint(createDefaultSprintRequest(sprintName)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Sprint name already exists");
        }
    }

    @Nested
    @DisplayName("Sprint Lifecycle Management")
    class SprintLifecycle {

        @Test
        @DisplayName("should start a planned sprint")
        void shouldStartPlannedSprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Sprint to Start"));
            assertThat(sprint.status()).isEqualTo(SprintService.SprintStatus.PLANNED);

            // When
            SprintDto started = sprintService.startSprint(sprint.id());

            // Then
            assertThat(started.status()).isEqualTo(SprintService.SprintStatus.ACTIVE);
            assertThat(started.actualStartDate()).isNotNull();
        }

        @Test
        @DisplayName("should complete an active sprint")
        void shouldCompleteActiveSprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Sprint to Complete"));
            SprintDto started = sprintService.startSprint(sprint.id());
            assertThat(started.status()).isEqualTo(SprintService.SprintStatus.ACTIVE);

            // When
            SprintDto completed = sprintService.completeSprint(sprint.id());

            // Then
            assertThat(completed.status()).isEqualTo(SprintService.SprintStatus.COMPLETED);
            assertThat(completed.actualEndDate()).isNotNull();
        }

        @Test
        @DisplayName("should not start an already active sprint")
        void shouldNotStartActiveSprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Already Active"));
            sprintService.startSprint(sprint.id());

            // When/Then
            assertThatThrownBy(() -> sprintService.startSprint(sprint.id()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Sprint is not in PLANNED status");
        }

        @Test
        @DisplayName("should not complete a non-active sprint")
        void shouldNotCompleteNonActiveSprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Not Started"));

            // When/Then
            assertThatThrownBy(() -> sprintService.completeSprint(sprint.id()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Sprint is not in ACTIVE status");
        }

        @Test
        @DisplayName("should get active sprint for contract")
        void shouldGetActiveSprintForContract() {
            // Given
            sprintService.createSprint(createDefaultSprintRequest("Sprint 1"));
            SprintDto sprint2 = sprintService.createSprint(createDefaultSprintRequest("Sprint 2"));
            sprintService.createSprint(createDefaultSprintRequest("Sprint 3"));

            // Start sprint 2
            sprintService.startSprint(sprint2.id());

            // When
            SprintDto activeSprint = sprintService.getActiveSprint(testContract.getId());

            // Then
            assertThat(activeSprint).isNotNull();
            assertThat(activeSprint.id()).isEqualTo(sprint2.id());
            assertThat(activeSprint.name()).isEqualTo("Sprint 2");
            assertThat(activeSprint.status()).isEqualTo(SprintService.SprintStatus.ACTIVE);
        }

        @Test
        @DisplayName("should return null when no active sprint exists")
        void shouldReturnNullWhenNoActiveSprint() {
            // Given
            sprintService.createSprint(createDefaultSprintRequest("Planned Sprint"));

            // When
            SprintDto activeSprint = sprintService.getActiveSprint(testContract.getId());

            // Then
            assertThat(activeSprint).isNull();
        }
    }

    @Nested
    @DisplayName("Task Management")
    class TaskManagement {

        private SprintDto testSprint;

        @BeforeEach
        void createTestSprint() {
            testSprint = sprintService.createSprint(createDefaultSprintRequest("Task Management Sprint"));
        }

        @Test
        @DisplayName("should add task to sprint")
        void shouldAddTaskToSprint() {
            // Given
            CreateTaskRequest taskRequest = new CreateTaskRequest(
                "Implement feature X",
                "Detailed description of feature X",
                TaskStatus.TODO,
                testUser.getId(),
                8, // story points
                LocalDate.now().plusDays(3)
            );

            // When
            SprintTaskDto task = sprintService.addTask(testSprint.id(), taskRequest);

            // Then
            assertThat(task).isNotNull();
            assertThat(task.id()).isNotNull();
            assertThat(task.title()).isEqualTo("Implement feature X");
            assertThat(task.description()).isEqualTo("Detailed description of feature X");
            assertThat(task.status()).isEqualTo(TaskStatus.TODO);
            assertThat(task.assigneeId()).isEqualTo(testUser.getId());
            assertThat(task.storyPoints()).isEqualTo(8);
        }

        @Test
        @DisplayName("should update task details")
        void shouldUpdateTaskDetails() {
            // Given
            SprintTaskDto task = sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "Original Title", "Original description", TaskStatus.TODO, null, 5, null
            ));

            UpdateTaskRequest updateRequest = new UpdateTaskRequest(
                "Updated Title",
                "Updated description",
                null, // don't change status
                testUser.getId(),
                8,
                LocalDate.now().plusDays(5)
            );

            // When
            SprintTaskDto updated = sprintService.updateTask(testSprint.id(), task.id(), updateRequest);

            // Then
            assertThat(updated.title()).isEqualTo("Updated Title");
            assertThat(updated.description()).isEqualTo("Updated description");
            assertThat(updated.assigneeId()).isEqualTo(testUser.getId());
            assertThat(updated.storyPoints()).isEqualTo(8);
        }

        @Test
        @DisplayName("should move task to different status")
        void shouldMoveTaskToStatus() {
            // Given
            SprintTaskDto task = sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "Task to Move", null, TaskStatus.TODO, null, 3, null
            ));
            assertThat(task.status()).isEqualTo(TaskStatus.TODO);

            // When
            SprintTaskDto moved = sprintService.moveTask(testSprint.id(), task.id(), TaskStatus.IN_PROGRESS);

            // Then
            assertThat(moved.status()).isEqualTo(TaskStatus.IN_PROGRESS);
        }

        @Test
        @DisplayName("should complete task")
        void shouldCompleteTask() {
            // Given
            SprintTaskDto task = sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "Task to Complete", null, TaskStatus.IN_PROGRESS, null, 5, null
            ));

            // When
            SprintTaskDto completed = sprintService.moveTask(testSprint.id(), task.id(), TaskStatus.DONE);

            // Then
            assertThat(completed.status()).isEqualTo(TaskStatus.DONE);
            assertThat(completed.completedAt()).isNotNull();
        }

        @Test
        @DisplayName("should delete task from sprint")
        void shouldDeleteTaskFromSprint() {
            // Given
            SprintTaskDto task = sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "Task to Delete", null, TaskStatus.TODO, null, 2, null
            ));

            // When
            sprintService.deleteTask(testSprint.id(), task.id());

            // Then
            List<SprintTaskDto> tasks = sprintService.getTasks(testSprint.id());
            assertThat(tasks).isEmpty();
        }

        @Test
        @DisplayName("should get all tasks for sprint")
        void shouldGetAllTasksForSprint() {
            // Given
            sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "Task 1", null, TaskStatus.TODO, null, 3, null
            ));
            sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "Task 2", null, TaskStatus.IN_PROGRESS, testUser.getId(), 5, null
            ));
            sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "Task 3", null, TaskStatus.DONE, null, 2, null
            ));

            // When
            List<SprintTaskDto> tasks = sprintService.getTasks(testSprint.id());

            // Then
            assertThat(tasks).hasSize(3);
        }

        @Test
        @DisplayName("should get tasks filtered by status")
        void shouldGetTasksFilteredByStatus() {
            // Given
            sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "TODO Task 1", null, TaskStatus.TODO, null, 3, null
            ));
            sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "TODO Task 2", null, TaskStatus.TODO, null, 5, null
            ));
            sprintService.addTask(testSprint.id(), new CreateTaskRequest(
                "Done Task", null, TaskStatus.DONE, null, 2, null
            ));

            // When
            List<SprintTaskDto> todoTasks = sprintService.getTasksByStatus(testSprint.id(), TaskStatus.TODO);

            // Then
            assertThat(todoTasks).hasSize(2);
            assertThat(todoTasks).allMatch(t -> t.status() == TaskStatus.TODO);
        }
    }

    @Nested
    @DisplayName("Sprint Summary")
    class SprintSummary {

        @Test
        @DisplayName("should calculate sprint summary with task counts")
        void shouldCalculateSprintSummary() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Summary Sprint"));

            // Add tasks in various statuses
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "TODO 1", null, TaskStatus.TODO, null, 3, null
            ));
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "TODO 2", null, TaskStatus.TODO, null, 5, null
            ));
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "In Progress", null, TaskStatus.IN_PROGRESS, null, 8, null
            ));
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "Done 1", null, TaskStatus.DONE, null, 2, null
            ));
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "Done 2", null, TaskStatus.DONE, null, 3, null
            ));

            // When
            SprintSummaryDto summary = sprintService.getSprintSummary(sprint.id());

            // Then
            assertThat(summary).isNotNull();
            assertThat(summary.totalTasks()).isEqualTo(5);
            assertThat(summary.todoCount()).isEqualTo(2);
            assertThat(summary.inProgressCount()).isEqualTo(1);
            assertThat(summary.doneCount()).isEqualTo(2);
            assertThat(summary.totalStoryPoints()).isEqualTo(21); // 3+5+8+2+3
            assertThat(summary.completedStoryPoints()).isEqualTo(5); // 2+3
            assertThat(summary.completionPercentage()).isEqualTo(40); // 2/5 = 40%
        }

        @Test
        @DisplayName("should return zero counts for empty sprint")
        void shouldReturnZeroCountsForEmptySprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Empty Sprint"));

            // When
            SprintSummaryDto summary = sprintService.getSprintSummary(sprint.id());

            // Then
            assertThat(summary.totalTasks()).isZero();
            assertThat(summary.todoCount()).isZero();
            assertThat(summary.inProgressCount()).isZero();
            assertThat(summary.doneCount()).isZero();
            assertThat(summary.totalStoryPoints()).isZero();
            assertThat(summary.completedStoryPoints()).isZero();
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        private Tenant tenant2;
        private User user2;
        private Contract tenant2Contract;

        @BeforeEach
        void setUpSecondTenant() {
            // Create second tenant
            tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Create second user
            user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Second")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            // Create role and membership for tenant2
            var role2 = createTestRole(tenant2, "USER");
            TenantMembership membership2 = TenantMembership.builder()
                .user(user2)
                .tenant(tenant2)
                .role(role2)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(membership2);

            // Create contract in tenant 2
            tenant2Contract = Contract.builder()
                .tenant(tenant2)
                .contractNumber("T2-CONTRACT-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Tenant 2 Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .agency("GSA")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("300000.00"))
                .build();
            tenant2Contract = contractRepository.save(tenant2Contract);
        }

        @Test
        @DisplayName("should isolate sprints between tenants")
        void shouldIsolateSprintsBetweenTenants() {
            // Given - Create sprint in tenant 1
            SprintDto tenant1Sprint = sprintService.createSprint(createDefaultSprintRequest("Tenant 1 Sprint"));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // Create sprint in tenant 2
            CreateSprintRequest tenant2Request = new CreateSprintRequest(
                tenant2Contract.getId(),
                "Tenant 2 Sprint",
                "Goal for tenant 2",
                LocalDate.now(),
                LocalDate.now().plusWeeks(2)
            );
            SprintDto tenant2Sprint = sprintService.createSprint(tenant2Request);

            // Then - Each tenant should only see their own sprints
            List<SprintDto> tenant2Sprints = sprintService.getSprints(tenant2Contract.getId());
            assertThat(tenant2Sprints)
                .extracting(SprintDto::name)
                .contains("Tenant 2 Sprint")
                .doesNotContain("Tenant 1 Sprint");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            List<SprintDto> tenant1Sprints = sprintService.getSprints(testContract.getId());
            assertThat(tenant1Sprints)
                .extracting(SprintDto::name)
                .contains("Tenant 1 Sprint")
                .doesNotContain("Tenant 2 Sprint");
        }

        @Test
        @DisplayName("should not allow access to other tenant's sprint by ID")
        void shouldNotAllowCrossTenantSprintAccess() {
            // Given - Create sprint in tenant 1
            SprintDto tenant1Sprint = sprintService.createSprint(createDefaultSprintRequest("Cross Tenant Test"));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then - Attempting to access tenant 1's sprint should fail
            assertThatThrownBy(() -> sprintService.getSprint(tenant1Sprint.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should allow same sprint name in different tenants")
        void shouldAllowSameSprintNameInDifferentTenants() {
            // Given - Create sprint in tenant 1
            String sameName = "Sprint Alpha";
            sprintService.createSprint(createDefaultSprintRequest(sameName));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // When - Create sprint with same name in tenant 2
            CreateSprintRequest tenant2Request = new CreateSprintRequest(
                tenant2Contract.getId(),
                sameName,
                "Goal for tenant 2",
                LocalDate.now(),
                LocalDate.now().plusWeeks(2)
            );
            SprintDto tenant2Sprint = sprintService.createSprint(tenant2Request);

            // Then - Should succeed
            assertThat(tenant2Sprint.name()).isEqualTo(sameName);
        }
    }
}
