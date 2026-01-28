package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.CreateSprintRequest;
import com.samgov.ingestor.dto.CreateTaskRequest;
import com.samgov.ingestor.dto.SprintDto;
import com.samgov.ingestor.dto.SprintSummaryDto;
import com.samgov.ingestor.dto.SprintTaskDto;
import com.samgov.ingestor.dto.UpdateSprintRequest;
import com.samgov.ingestor.dto.UpdateTaskRequest;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Sprint;
import com.samgov.ingestor.model.Sprint.SprintStatus;
import com.samgov.ingestor.model.SprintTask;
import com.samgov.ingestor.model.SprintTask.TaskPriority;
import com.samgov.ingestor.model.SprintTask.TaskStatus;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.SprintRepository;
import com.samgov.ingestor.repository.SprintTaskRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final SprintTaskRepository taskRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    // Sprint CRUD

    public Page<SprintDto> getSprints(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return sprintRepository.findByTenantId(tenantId, pageable)
            .map(this::toDto);
    }

    public SprintDto getSprint(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Sprint sprint = sprintRepository.findByTenantIdAndIdWithTasks(tenantId, id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));
        return toDto(sprint);
    }

    public SprintDto getActiveSprint() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Sprint sprint = sprintRepository.findByTenantIdAndStatusWithTasks(tenantId, SprintStatus.ACTIVE)
            .orElseThrow(() -> new ResourceNotFoundException("No active sprint found"));
        return toDto(sprint);
    }

    @Transactional
    public SprintDto createSprint(CreateSprintRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        if (sprintRepository.existsByTenantIdAndName(tenantId, request.name())) {
            throw new IllegalArgumentException("Sprint with this name already exists");
        }

        Sprint sprint = Sprint.builder()
            .tenant(tenant)
            .name(request.name())
            .description(request.description())
            .goal(request.goal())
            .status(SprintStatus.PLANNING)
            .startDate(request.startDate())
            .endDate(request.endDate())
            .build();

        Sprint saved = sprintRepository.save(sprint);
        log.info("Created sprint: {} for tenant: {}", saved.getId(), tenantId);
        return toDto(saved);
    }

    @Transactional
    public SprintDto updateSprint(UUID id, UpdateSprintRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Sprint sprint = sprintRepository.findByTenantIdAndId(tenantId, id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        if (request.name() != null && !request.name().equals(sprint.getName())) {
            if (sprintRepository.existsByTenantIdAndName(tenantId, request.name())) {
                throw new IllegalArgumentException("Sprint with this name already exists");
            }
            sprint.setName(request.name());
        }

        if (request.description() != null) {
            sprint.setDescription(request.description());
        }
        if (request.goal() != null) {
            sprint.setGoal(request.goal());
        }
        if (request.startDate() != null) {
            sprint.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            sprint.setEndDate(request.endDate());
        }

        Sprint saved = sprintRepository.save(sprint);
        log.info("Updated sprint: {}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public void deleteSprint(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Sprint sprint = sprintRepository.findByTenantIdAndId(tenantId, id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        if (sprint.getStatus() == SprintStatus.ACTIVE) {
            throw new IllegalStateException("Cannot delete an active sprint");
        }

        sprintRepository.delete(sprint);
        log.info("Deleted sprint: {}", id);
    }

    @Transactional
    public SprintDto startSprint(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Sprint sprint = sprintRepository.findByTenantIdAndId(tenantId, id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        if (sprint.getStatus() != SprintStatus.PLANNING) {
            throw new IllegalStateException("Only sprints in PLANNING status can be started");
        }

        // Check if there's already an active sprint
        if (sprintRepository.findByTenantIdAndStatus(tenantId, SprintStatus.ACTIVE).isPresent()) {
            throw new IllegalStateException("There is already an active sprint. Complete it before starting a new one.");
        }

        sprint.setStatus(SprintStatus.ACTIVE);
        if (sprint.getStartDate() == null) {
            sprint.setStartDate(LocalDate.now());
        }

        Sprint saved = sprintRepository.save(sprint);
        log.info("Started sprint: {}", id);
        return toDto(saved);
    }

    @Transactional
    public SprintDto completeSprint(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Sprint sprint = sprintRepository.findByTenantIdAndId(tenantId, id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw new IllegalStateException("Only active sprints can be completed");
        }

        sprint.setStatus(SprintStatus.COMPLETED);
        if (sprint.getEndDate() == null) {
            sprint.setEndDate(LocalDate.now());
        }

        Sprint saved = sprintRepository.save(sprint);
        log.info("Completed sprint: {}", id);
        return toDto(saved);
    }

    // Task management

    public List<SprintTaskDto> getSprintTasks(UUID sprintId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        sprintRepository.findByTenantIdAndId(tenantId, sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        return taskRepository.findBySprintIdOrderByPositionAsc(sprintId)
            .stream()
            .map(SprintTaskDto::fromEntity)
            .toList();
    }

    @Transactional
    public SprintTaskDto addTask(UUID sprintId, CreateTaskRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Sprint sprint = sprintRepository.findByTenantIdAndId(tenantId, sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        Integer maxPosition = taskRepository.findMaxPositionBySprintId(sprintId).orElse(-1);

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId()).orElse(null);
        }

        SprintTask task = SprintTask.builder()
            .sprint(sprint)
            .title(request.title())
            .description(request.description())
            .status(request.status() != null ? request.status() : TaskStatus.TODO)
            .priority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM)
            .storyPoints(request.storyPoints())
            .position(maxPosition + 1)
            .assignee(assignee)
            .dueDate(request.dueDate())
            .labels(request.labels())
            .build();

        SprintTask saved = taskRepository.save(task);
        log.info("Added task: {} to sprint: {}", saved.getId(), sprintId);
        return SprintTaskDto.fromEntity(saved);
    }

    @Transactional
    public SprintTaskDto updateTask(UUID sprintId, UUID taskId, UpdateTaskRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        sprintRepository.findByTenantIdAndId(tenantId, sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        SprintTask task = taskRepository.findBySprintIdAndId(sprintId, taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (request.title() != null) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.storyPoints() != null) {
            task.setStoryPoints(request.storyPoints());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.labels() != null) {
            task.setLabels(request.labels());
        }
        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId()).orElse(null);
            task.setAssignee(assignee);
        }

        SprintTask saved = taskRepository.save(task);
        log.info("Updated task: {} in sprint: {}", taskId, sprintId);
        return SprintTaskDto.fromEntity(saved);
    }

    @Transactional
    public SprintTaskDto moveTask(UUID sprintId, UUID taskId, TaskStatus newStatus) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        sprintRepository.findByTenantIdAndId(tenantId, sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        SprintTask task = taskRepository.findBySprintIdAndId(sprintId, taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setStatus(newStatus);
        SprintTask saved = taskRepository.save(task);
        log.info("Moved task: {} to status: {}", taskId, newStatus);
        return SprintTaskDto.fromEntity(saved);
    }

    @Transactional
    public void deleteTask(UUID sprintId, UUID taskId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        sprintRepository.findByTenantIdAndId(tenantId, sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        SprintTask task = taskRepository.findBySprintIdAndId(sprintId, taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        int position = task.getPosition();
        taskRepository.deleteTaskById(taskId);
        taskRepository.decrementPositionsAfter(sprintId, position);
        log.info("Deleted task: {} from sprint: {}", taskId, sprintId);
    }

    // Summary

    public SprintSummaryDto getSprintSummary(UUID sprintId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Sprint sprint = sprintRepository.findByTenantIdAndId(tenantId, sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        long todoCount = taskRepository.countBySprintIdAndStatus(sprintId, TaskStatus.TODO);
        long inProgressCount = taskRepository.countBySprintIdAndStatus(sprintId, TaskStatus.IN_PROGRESS);
        long inReviewCount = taskRepository.countBySprintIdAndStatus(sprintId, TaskStatus.IN_REVIEW);
        long doneCount = taskRepository.countBySprintIdAndStatus(sprintId, TaskStatus.DONE);
        long blockedCount = taskRepository.countBySprintIdAndStatus(sprintId, TaskStatus.BLOCKED);
        long totalTasks = taskRepository.countBySprintId(sprintId);

        Integer totalPoints = taskRepository.sumStoryPointsBySprintId(sprintId);
        Integer completedPoints = taskRepository.sumStoryPointsBySprintIdAndStatus(sprintId, TaskStatus.DONE);

        return SprintSummaryDto.builder()
            .sprintId(sprint.getId())
            .sprintName(sprint.getName())
            .status(sprint.getStatus())
            .totalTasks(totalTasks)
            .todoCount(todoCount)
            .inProgressCount(inProgressCount)
            .inReviewCount(inReviewCount)
            .doneCount(doneCount)
            .blockedCount(blockedCount)
            .totalStoryPoints(totalPoints != null ? totalPoints : 0)
            .completedStoryPoints(completedPoints != null ? completedPoints : 0)
            .startDate(sprint.getStartDate())
            .endDate(sprint.getEndDate())
            .build();
    }

    // Helper methods

    private SprintDto toDto(Sprint sprint) {
        List<SprintTaskDto> tasks = taskRepository.findBySprintIdOrderByPositionAsc(sprint.getId())
            .stream()
            .map(SprintTaskDto::fromEntity)
            .toList();

        return SprintDto.fromEntity(sprint, tasks);
    }
}
