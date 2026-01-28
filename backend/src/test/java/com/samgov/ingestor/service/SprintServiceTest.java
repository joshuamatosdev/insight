package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.CreateSprintRequest;
import com.samgov.ingestor.dto.CreateTaskRequest;
import com.samgov.ingestor.dto.SprintDto;
import com.samgov.ingestor.dto.SprintSummaryDto;
import com.samgov.ingestor.dto.SprintTaskDto;
import com.samgov.ingestor.dto.UpdateSprintRequest;
import com.samgov.ingestor.dto.UpdateTaskRequest;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Sprint.SprintStatus;
import com.samgov.ingestor.model.SprintTask.TaskPriority;
import com.samgov.ingestor.model.SprintTask.TaskStatus;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for SprintService.
 *
 * Tests the business logic of sprint management:
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

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
    }

    private CreateSprintRequest createDefaultSprintRequest(String name) {
        return new CreateSprintRequest(
            name,
            "Description for " + name,
            "Sprint goal: " + name,
            LocalDate.now(),
            LocalDate.now().plusWeeks(2)
        );
    }

    private CreateTaskRequest createDefaultTaskRequest(String title) {
        return new CreateTaskRequest(
            title,
            "Description for " + title,
            TaskStatus.TODO,
            TaskPriority.MEDIUM,
            3,
            null,
            null,
            null
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
            assertThat(result.status()).isEqualTo(SprintStatus.PLANNING);
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
        @DisplayName("should list sprints for tenant")
        void shouldListSprintsForTenant() {
            // Given
            sprintService.createSprint(createDefaultSprintRequest("Sprint 1"));
            sprintService.createSprint(createDefaultSprintRequest("Sprint 2"));
            sprintService.createSprint(createDefaultSprintRequest("Sprint 3"));

            // When
            Page<SprintDto> sprints = sprintService.getSprints(PageRequest.of(0, 10));

            // Then
            assertThat(sprints.getContent()).hasSize(3);
            assertThat(sprints.getContent())
                .extracting(SprintDto::name)
                .containsExactlyInAnyOrder("Sprint 1", "Sprint 2", "Sprint 3");
        }

        @Test
        @DisplayName("should update sprint details")
        void shouldUpdateSprintDetails() {
            // Given
            SprintDto created = sprintService.createSprint(createDefaultSprintRequest("Original Sprint"));
            UpdateSprintRequest updateRequest = new UpdateSprintRequest(
                "Updated Sprint Name",
                "Updated description",
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
        @DisplayName("should reject duplicate sprint names within same tenant")
        void shouldRejectDuplicateSprintName() {
            // Given
            String sprintName = "Duplicate Sprint";
            sprintService.createSprint(createDefaultSprintRequest(sprintName));

            // When/Then
            assertThatThrownBy(() -> sprintService.createSprint(createDefaultSprintRequest(sprintName)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        }
    }

    @Nested
    @DisplayName("Sprint Lifecycle Management")
    class SprintLifecycle {

        @Test
        @DisplayName("should start a planning sprint")
        void shouldStartPlanningSprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Sprint to Start"));
            assertThat(sprint.status()).isEqualTo(SprintStatus.PLANNING);

            // When
            SprintDto started = sprintService.startSprint(sprint.id());

            // Then
            assertThat(started.status()).isEqualTo(SprintStatus.ACTIVE);
        }

        @Test
        @DisplayName("should complete an active sprint")
        void shouldCompleteActiveSprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Sprint to Complete"));
            SprintDto started = sprintService.startSprint(sprint.id());
            assertThat(started.status()).isEqualTo(SprintStatus.ACTIVE);

            // When
            SprintDto completed = sprintService.completeSprint(sprint.id());

            // Then
            assertThat(completed.status()).isEqualTo(SprintStatus.COMPLETED);
        }

        @Test
        @DisplayName("should not start an already active sprint")
        void shouldNotStartActiveSprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Already Active"));
            sprintService.startSprint(sprint.id());

            // When/Then
            assertThatThrownBy(() -> sprintService.startSprint(sprint.id()))
                .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("should not complete a non-active sprint")
        void shouldNotCompleteNonActiveSprint() {
            // Given
            SprintDto sprint = sprintService.createSprint(createDefaultSprintRequest("Not Started"));

            // When/Then
            assertThatThrownBy(() -> sprintService.completeSprint(sprint.id()))
                .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("should get active sprint for tenant")
        void shouldGetActiveSprintForTenant() {
            // Given
            sprintService.createSprint(createDefaultSprintRequest("Sprint 1"));
            SprintDto sprint2 = sprintService.createSprint(createDefaultSprintRequest("Sprint 2"));
            sprintService.createSprint(createDefaultSprintRequest("Sprint 3"));

            // Start sprint 2
            sprintService.startSprint(sprint2.id());

            // When
            SprintDto activeSprint = sprintService.getActiveSprint();

            // Then
            assertThat(activeSprint).isNotNull();
            assertThat(activeSprint.id()).isEqualTo(sprint2.id());
            assertThat(activeSprint.name()).isEqualTo("Sprint 2");
            assertThat(activeSprint.status()).isEqualTo(SprintStatus.ACTIVE);
        }

        @Test
        @DisplayName("should throw when no active sprint exists")
        void shouldThrowWhenNoActiveSprint() {
            // Given
            sprintService.createSprint(createDefaultSprintRequest("Planning Sprint"));

            // When/Then
            assertThatThrownBy(() -> sprintService.getActiveSprint())
                .isInstanceOf(ResourceNotFoundException.class);
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
                TaskPriority.HIGH,
                8,
                testUser.getId(),
                null,
                "feature,backend"
            );

            // When
            SprintTaskDto task = sprintService.addTask(testSprint.id(), taskRequest);

            // Then
            assertThat(task).isNotNull();
            assertThat(task.id()).isNotNull();
            assertThat(task.title()).isEqualTo("Implement feature X");
            assertThat(task.description()).isEqualTo("Detailed description of feature X");
            assertThat(task.status()).isEqualTo(TaskStatus.TODO);
            assertThat(task.priority()).isEqualTo(TaskPriority.HIGH);
            assertThat(task.assigneeId()).isEqualTo(testUser.getId());
            assertThat(task.storyPoints()).isEqualTo(8);
        }

        @Test
        @DisplayName("should update task details")
        void shouldUpdateTaskDetails() {
            // Given
            SprintTaskDto task = sprintService.addTask(testSprint.id(), createDefaultTaskRequest("Original Title"));

            UpdateTaskRequest updateRequest = new UpdateTaskRequest(
                "Updated Title",
                "Updated description",
                null,
                TaskPriority.HIGH,
                8,
                testUser.getId(),
                null,
                "updated"
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
            SprintTaskDto task = sprintService.addTask(testSprint.id(), createDefaultTaskRequest("Task to Move"));
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
            CreateTaskRequest taskRequest = new CreateTaskRequest(
                "Task to Complete",
                null,
                TaskStatus.IN_PROGRESS,
                TaskPriority.MEDIUM,
                5,
                null,
                null,
                null
            );
            SprintTaskDto task = sprintService.addTask(testSprint.id(), taskRequest);

            // When
            SprintTaskDto completed = sprintService.moveTask(testSprint.id(), task.id(), TaskStatus.DONE);

            // Then
            assertThat(completed.status()).isEqualTo(TaskStatus.DONE);
        }

        @Test
        @DisplayName("should delete task from sprint")
        void shouldDeleteTaskFromSprint() {
            // Given
            SprintTaskDto task = sprintService.addTask(testSprint.id(), createDefaultTaskRequest("Task to Delete"));

            // When
            sprintService.deleteTask(testSprint.id(), task.id());

            // Then
            List<SprintTaskDto> tasks = sprintService.getSprintTasks(testSprint.id());
            assertThat(tasks).isEmpty();
        }

        @Test
        @DisplayName("should get all tasks for sprint")
        void shouldGetAllTasksForSprint() {
            // Given
            sprintService.addTask(testSprint.id(), createDefaultTaskRequest("Task 1"));
            sprintService.addTask(testSprint.id(), createDefaultTaskRequest("Task 2"));
            sprintService.addTask(testSprint.id(), createDefaultTaskRequest("Task 3"));

            // When
            List<SprintTaskDto> tasks = sprintService.getSprintTasks(testSprint.id());

            // Then
            assertThat(tasks).hasSize(3);
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
                "TODO 1", null, TaskStatus.TODO, TaskPriority.LOW, 3, null, null, null
            ));
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "TODO 2", null, TaskStatus.TODO, TaskPriority.MEDIUM, 5, null, null, null
            ));
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "In Progress", null, TaskStatus.IN_PROGRESS, TaskPriority.HIGH, 8, null, null, null
            ));
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "Done 1", null, TaskStatus.DONE, TaskPriority.LOW, 2, null, null, null
            ));
            sprintService.addTask(sprint.id(), new CreateTaskRequest(
                "Done 2", null, TaskStatus.DONE, TaskPriority.MEDIUM, 3, null, null, null
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
            SprintDto tenant2Sprint = sprintService.createSprint(createDefaultSprintRequest("Tenant 2 Sprint"));

            // Then - Each tenant should only see their own sprints
            Page<SprintDto> tenant2Sprints = sprintService.getSprints(PageRequest.of(0, 10));
            assertThat(tenant2Sprints.getContent())
                .extracting(SprintDto::name)
                .contains("Tenant 2 Sprint")
                .doesNotContain("Tenant 1 Sprint");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            Page<SprintDto> tenant1Sprints = sprintService.getSprints(PageRequest.of(0, 10));
            assertThat(tenant1Sprints.getContent())
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
            SprintDto tenant2Sprint = sprintService.createSprint(createDefaultSprintRequest(sameName));

            // Then - Should succeed
            assertThat(tenant2Sprint.name()).isEqualTo(sameName);
        }
    }
}
