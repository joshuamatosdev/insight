package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.ScopeChange.ChangeStatus;
import com.samgov.ingestor.service.ScopeService;
import com.samgov.ingestor.service.ScopeService.CreateScopeChangeRequest;
import com.samgov.ingestor.service.ScopeService.ScopeChangeDto;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST controller for scope change request management.
 * Handles creation and approval/rejection of scope change requests.
 */
@Slf4j
@RestController
@RequestMapping("/portal/scope-changes")
@RequiredArgsConstructor
public class ScopeChangeController {

    private final ScopeService scopeService;

    /**
     * List all scope changes (optionally filtered by status).
     */
    @GetMapping
    public ResponseEntity<Page<ScopeChangeDto>> getScopeChanges(
        @RequestParam UUID contractId,
        @RequestParam(required = false) ChangeStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ScopeChangeDto> changes = scopeService.getScopeChanges(contractId, status, pageable);
        return ResponseEntity.ok(changes);
    }

    /**
     * Get all pending scope changes for review.
     */
    @GetMapping("/pending")
    public ResponseEntity<Page<ScopeChangeDto>> getPendingChanges(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedDate").ascending());
        Page<ScopeChangeDto> changes = scopeService.getPendingChanges(pageable);
        return ResponseEntity.ok(changes);
    }

    /**
     * Get a single scope change by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ScopeChangeDto> getScopeChange(@PathVariable UUID id) {
        ScopeChangeDto change = scopeService.getScopeChange(id);
        return ResponseEntity.ok(change);
    }

    /**
     * Request a scope change (contract-level or scope-item-level).
     */
    @PostMapping
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeChangeDto> requestChange(@Valid @RequestBody CreateScopeChangeRequest request) {
        log.info("Creating scope change request for contract: {}", request.contractId());
        ScopeChangeDto change = scopeService.requestChange(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(change);
    }

    /**
     * Request a scope change tied to a specific scope item.
     */
    @PostMapping("/scope-item/{scopeItemId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeChangeDto> requestChangeForScopeItem(
        @PathVariable UUID scopeItemId,
        @Valid @RequestBody CreateScopeChangeRequest request
    ) {
        // Validate that the scopeItemId matches the request
        if (request.scopeItemId() != null && !request.scopeItemId().equals(scopeItemId)) {
            throw new IllegalArgumentException("Scope item ID in path does not match request body");
        }

        // Create a new request with the path variable scopeItemId if not provided in body
        CreateScopeChangeRequest effectiveRequest = request.scopeItemId() != null
            ? request
            : new CreateScopeChangeRequest(
                request.contractId(),
                scopeItemId,
                request.title(),
                request.description(),
                request.changeType(),
                request.priority(),
                request.hoursImpact(),
                request.costImpact(),
                request.scheduleImpactDays(),
                request.impactAnalysis(),
                request.justification(),
                request.businessCase(),
                request.previousEstimatedHours(),
                request.newEstimatedHours(),
                request.previousEstimatedCost(),
                request.newEstimatedCost(),
                request.previousEndDate(),
                request.newEndDate(),
                request.requestorName(),
                request.requestorEmail(),
                request.externalReference(),
                request.internalNotes()
            );

        log.info("Creating scope change request for scope item: {}", scopeItemId);
        ScopeChangeDto change = scopeService.requestChange(effectiveRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(change);
    }

    /**
     * Approve a scope change.
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeChangeDto> approveChange(
        @PathVariable UUID id,
        @RequestParam(required = false) String comments
    ) {
        log.info("Approving scope change: {}", id);
        ScopeChangeDto change = scopeService.approveChange(id, comments);
        return ResponseEntity.ok(change);
    }

    /**
     * Reject a scope change.
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeChangeDto> rejectChange(
        @PathVariable UUID id,
        @RequestParam String reason
    ) {
        log.info("Rejecting scope change: {} - Reason: {}", id, reason);
        ScopeChangeDto change = scopeService.rejectChange(id, reason);
        return ResponseEntity.ok(change);
    }
}
