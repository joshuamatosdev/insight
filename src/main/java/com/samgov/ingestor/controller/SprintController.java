package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.SprintTask.TaskStatus;
import com.samgov.ingestor.service.SprintService;
import com.samgov.ingestor.service.SprintService.CreateSprintRequest;
import com.samgov.ingestor.service.SprintService.CreateTaskRequest;
import com.samgov.ingestor.service.SprintService.SprintDto;
import com.samgov.ingestor.service.SprintService.SprintSummaryDto;
import com.samgov.ingestor.service.SprintService.TaskDto;
import com.samgov.ingestor.service.SprintService.UpdateSprintRequest;
import com.samgov.ingestor.service.SprintService.UpdateTaskRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    // Sprint endpoints

    @GetMapping
    public ResponseEntity<Page<SprintDto>> getSprints(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<SprintDto> sprints = sprintService.getSprints(pageable);
        return ResponseEntity.ok(sprints);
    }

    @GetMapping("/active")
    public ResponseEntity<SprintDto> getActiveSprint() {
        SprintDto sprint = sprintService.getActiveSprint();
        return ResponseEntity.ok(sprint);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintDto> getSprint(@PathVariable UUID id) {
        SprintDto sprint = sprintService.getSprint(id);
        return ResponseEntity.ok(sprint);
    }

    @PostMapping
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_CREATE')")
    public ResponseEntity<SprintDto> createSprint(@Valid @RequestBody CreateSprintRequest request) {
        log.info("Creating sprint: {}", request.name());
        SprintDto sprint = sprintService.createSprint(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(sprint);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_UPDATE')")
    public ResponseEntity<SprintDto> updateSprint(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateSprintRequest request
    ) {
        SprintDto sprint = sprintService.updateSprint(id, request);
        return ResponseEntity.ok(sprint);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_DELETE')")
    public ResponseEntity<Void> deleteSprint(@PathVariable UUID id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_UPDATE')")
    public ResponseEntity<SprintDto> startSprint(@PathVariable UUID id) {
        log.info("Starting sprint: {}", id);
        SprintDto sprint = sprintService.startSprint(id);
        return ResponseEntity.ok(sprint);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_UPDATE')")
    public ResponseEntity<SprintDto> completeSprint(@PathVariable UUID id) {
        log.info("Completing sprint: {}", id);
        SprintDto sprint = sprintService.completeSprint(id);
        return ResponseEntity.ok(sprint);
    }

    // Task endpoints

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskDto>> getSprintTasks(@PathVariable UUID id) {
        List<TaskDto> tasks = sprintService.getSprintTasks(id);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/{id}/tasks")
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_TASK_CREATE')")
    public ResponseEntity<TaskDto> addTask(
        @PathVariable UUID id,
        @Valid @RequestBody CreateTaskRequest request
    ) {
        log.info("Adding task to sprint: {}", id);
        TaskDto task = sprintService.addTask(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PutMapping("/{sprintId}/tasks/{taskId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_TASK_UPDATE')")
    public ResponseEntity<TaskDto> updateTask(
        @PathVariable UUID sprintId,
        @PathVariable UUID taskId,
        @Valid @RequestBody UpdateTaskRequest request
    ) {
        TaskDto task = sprintService.updateTask(sprintId, taskId, request);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{sprintId}/tasks/{taskId}/status")
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_TASK_UPDATE')")
    public ResponseEntity<TaskDto> moveTask(
        @PathVariable UUID sprintId,
        @PathVariable UUID taskId,
        @RequestParam TaskStatus status
    ) {
        log.info("Moving task {} to status: {}", taskId, status);
        TaskDto task = sprintService.moveTask(sprintId, taskId, status);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{sprintId}/tasks/{taskId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('SPRINT_TASK_DELETE')")
    public ResponseEntity<Void> deleteTask(
        @PathVariable UUID sprintId,
        @PathVariable UUID taskId
    ) {
        sprintService.deleteTask(sprintId, taskId);
        return ResponseEntity.noContent().build();
    }

    // Summary endpoint

    @GetMapping("/{id}/summary")
    public ResponseEntity<SprintSummaryDto> getSprintSummary(@PathVariable UUID id) {
        SprintSummaryDto summary = sprintService.getSprintSummary(id);
        return ResponseEntity.ok(summary);
    }
}
