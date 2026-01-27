package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.Milestone.MilestoneStatus;
import com.samgov.ingestor.service.MilestoneService;
import com.samgov.ingestor.service.MilestoneService.CompleteMilestoneRequest;
import com.samgov.ingestor.service.MilestoneService.CreateMilestoneRequest;
import com.samgov.ingestor.service.MilestoneService.MilestoneDto;
import com.samgov.ingestor.service.MilestoneService.MilestoneTimelineDto;
import com.samgov.ingestor.service.MilestoneService.StatusUpdateRequest;
import com.samgov.ingestor.service.MilestoneService.UpdateMilestoneRequest;
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
@RequestMapping("/api/v1/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    // Basic CRUD endpoints

    @GetMapping
    public ResponseEntity<List<MilestoneDto>> getMilestones(
        @RequestParam(required = false) UUID contractId
    ) {
        if (contractId != null) {
            List<MilestoneDto> milestones = milestoneService.getMilestones(contractId);
            return ResponseEntity.ok(milestones);
        }
        // If no contractId provided, return upcoming milestones (default 30 days)
        List<MilestoneDto> milestones = milestoneService.getUpcomingMilestones(30);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MilestoneDto> getMilestone(@PathVariable UUID id) {
        MilestoneDto milestone = milestoneService.getMilestone(id);
        return ResponseEntity.ok(milestone);
    }

    @PostMapping
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<MilestoneDto> createMilestone(@Valid @RequestBody CreateMilestoneRequest request) {
        log.info("Creating milestone: {} for contract: {}", request.name(), request.contractId());
        MilestoneDto milestone = milestoneService.createMilestone(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(milestone);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<MilestoneDto> updateMilestone(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateMilestoneRequest request
    ) {
        log.info("Updating milestone: {}", id);
        MilestoneDto milestone = milestoneService.updateMilestone(id, request);
        return ResponseEntity.ok(milestone);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<Void> deleteMilestone(@PathVariable UUID id) {
        log.info("Deleting milestone: {}", id);
        milestoneService.deleteMilestone(id);
        return ResponseEntity.noContent().build();
    }

    // Status management endpoints

    @PutMapping("/{id}/status")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<MilestoneDto> updateStatus(
        @PathVariable UUID id,
        @RequestBody StatusUpdateRequest request
    ) {
        log.info("Updating milestone {} status to: {}", id, request.status());
        MilestoneDto milestone = milestoneService.updateStatus(id, request.status());
        return ResponseEntity.ok(milestone);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<MilestoneDto> completeMilestone(
        @PathVariable UUID id,
        @RequestBody(required = false) CompleteMilestoneRequest request
    ) {
        log.info("Completing milestone: {}", id);
        String completionNotes = request != null ? request.completionNotes() : null;
        MilestoneDto milestone = milestoneService.completeMilestone(id, completionNotes);
        return ResponseEntity.ok(milestone);
    }

    // Contract-specific endpoints

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<MilestoneDto>> getMilestonesByContract(@PathVariable UUID contractId) {
        List<MilestoneDto> milestones = milestoneService.getMilestones(contractId);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/contract/{contractId}/paged")
    public ResponseEntity<Page<MilestoneDto>> getMilestonesByContractPaged(
        @PathVariable UUID contractId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "sortOrder") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<MilestoneDto> milestones = milestoneService.getMilestonesPaged(contractId, pageable);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/contract/{contractId}/critical-path")
    public ResponseEntity<List<MilestoneDto>> getCriticalPath(@PathVariable UUID contractId) {
        List<MilestoneDto> milestones = milestoneService.getCriticalPath(contractId);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/contract/{contractId}/timeline")
    public ResponseEntity<List<MilestoneTimelineDto>> getMilestoneTimeline(@PathVariable UUID contractId) {
        List<MilestoneTimelineDto> timeline = milestoneService.getMilestoneTimeline(contractId);
        return ResponseEntity.ok(timeline);
    }

    // Upcoming and overdue endpoints

    @GetMapping("/upcoming")
    public ResponseEntity<List<MilestoneDto>> getUpcomingMilestones(
        @RequestParam(defaultValue = "30") int days
    ) {
        List<MilestoneDto> milestones = milestoneService.getUpcomingMilestones(days);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<MilestoneDto>> getOverdueMilestones() {
        List<MilestoneDto> milestones = milestoneService.getOverdueMilestones();
        return ResponseEntity.ok(milestones);
    }

    // Dependency management endpoints

    @PostMapping("/{id}/dependencies/{dependsOnId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<MilestoneDto> addDependency(
        @PathVariable UUID id,
        @PathVariable UUID dependsOnId
    ) {
        log.info("Adding dependency: milestone {} depends on {}", id, dependsOnId);
        MilestoneDto milestone = milestoneService.addDependency(id, dependsOnId);
        return ResponseEntity.ok(milestone);
    }

    @DeleteMapping("/{id}/dependencies/{dependsOnId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<MilestoneDto> removeDependency(
        @PathVariable UUID id,
        @PathVariable UUID dependsOnId
    ) {
        log.info("Removing dependency: milestone {} no longer depends on {}", id, dependsOnId);
        MilestoneDto milestone = milestoneService.removeDependency(id, dependsOnId);
        return ResponseEntity.ok(milestone);
    }
}
