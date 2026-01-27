package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.ScopeChange.ChangeStatus;
import com.samgov.ingestor.model.ScopeItem.ScopeStatus;
import com.samgov.ingestor.service.ScopeService;
import com.samgov.ingestor.service.ScopeService.CreateScopeChangeRequest;
import com.samgov.ingestor.service.ScopeService.CreateScopeItemRequest;
import com.samgov.ingestor.service.ScopeService.ScopeChangeDto;
import com.samgov.ingestor.service.ScopeService.ScopeItemDto;
import com.samgov.ingestor.service.ScopeService.ScopeSummaryDto;
import com.samgov.ingestor.service.ScopeService.ScopeTreeNodeDto;
import com.samgov.ingestor.service.ScopeService.UpdateScopeItemRequest;
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
@RequestMapping("/api/v1/scope")
@RequiredArgsConstructor
public class ScopeController {

    private final ScopeService scopeService;

    // ==================== Scope Item Endpoints ====================

    /**
     * List all scope items for a contract.
     */
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<ScopeItemDto>> getScopeItems(@PathVariable UUID contractId) {
        List<ScopeItemDto> items = scopeService.getScopeItems(contractId);
        return ResponseEntity.ok(items);
    }

    /**
     * Get paginated scope items for a contract.
     */
    @GetMapping("/contract/{contractId}/paginated")
    public ResponseEntity<Page<ScopeItemDto>> getScopeItemsPaginated(
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
        Page<ScopeItemDto> items = scopeService.getScopeItems(contractId, pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get the WBS tree structure for a contract.
     */
    @GetMapping("/contract/{contractId}/tree")
    public ResponseEntity<List<ScopeTreeNodeDto>> getWbsTree(@PathVariable UUID contractId) {
        List<ScopeTreeNodeDto> tree = scopeService.getWbsTree(contractId);
        return ResponseEntity.ok(tree);
    }

    /**
     * Get summary statistics for scope items.
     */
    @GetMapping("/contract/{contractId}/summary")
    public ResponseEntity<ScopeSummaryDto> getScopeSummary(@PathVariable UUID contractId) {
        ScopeSummaryDto summary = scopeService.getScopeSummary(contractId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get root-level scope items (items without a parent).
     */
    @GetMapping("/contract/{contractId}/root")
    public ResponseEntity<List<ScopeItemDto>> getRootItems(@PathVariable UUID contractId) {
        List<ScopeItemDto> items = scopeService.getRootItems(contractId);
        return ResponseEntity.ok(items);
    }

    /**
     * Get a single scope item by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ScopeItemDto> getScopeItem(@PathVariable UUID id) {
        ScopeItemDto item = scopeService.getScopeItem(id);
        return ResponseEntity.ok(item);
    }

    /**
     * Get child items of a scope item.
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<ScopeItemDto>> getChildren(@PathVariable UUID parentId) {
        List<ScopeItemDto> children = scopeService.getChildren(parentId);
        return ResponseEntity.ok(children);
    }

    /**
     * Create a new scope item.
     */
    @PostMapping
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeItemDto> createScopeItem(@Valid @RequestBody CreateScopeItemRequest request) {
        log.info("Creating scope item: {} - {}", request.wbsCode(), request.title());
        ScopeItemDto item = scopeService.createScopeItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    /**
     * Update an existing scope item.
     */
    @PutMapping("/{id}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeItemDto> updateScopeItem(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateScopeItemRequest request
    ) {
        ScopeItemDto item = scopeService.updateScopeItem(id, request);
        return ResponseEntity.ok(item);
    }

    /**
     * Delete a scope item (and its children).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<Void> deleteScopeItem(@PathVariable UUID id) {
        log.info("Deleting scope item: {}", id);
        scopeService.deleteScopeItem(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update the status of a scope item.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeItemDto> updateStatus(
        @PathVariable UUID id,
        @RequestParam ScopeStatus status
    ) {
        log.info("Updating scope item {} status to {}", id, status);
        ScopeItemDto item = scopeService.updateStatus(id, status);
        return ResponseEntity.ok(item);
    }

    // ==================== Scope Change Endpoints ====================

    /**
     * List all scope changes (optionally filtered by status).
     */
    @GetMapping("/changes")
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
    @GetMapping("/changes/pending")
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
    @GetMapping("/changes/{id}")
    public ResponseEntity<ScopeChangeDto> getScopeChange(@PathVariable UUID id) {
        ScopeChangeDto change = scopeService.getScopeChange(id);
        return ResponseEntity.ok(change);
    }

    /**
     * Request a scope change.
     */
    @PostMapping("/{scopeItemId}/changes")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeChangeDto> requestChange(
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
     * Request a scope change (contract-level, not tied to a specific scope item).
     */
    @PostMapping("/changes")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ScopeChangeDto> requestContractChange(@Valid @RequestBody CreateScopeChangeRequest request) {
        log.info("Creating scope change request for contract: {}", request.contractId());
        ScopeChangeDto change = scopeService.requestChange(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(change);
    }

    /**
     * Approve a scope change.
     */
    @PostMapping("/changes/{id}/approve")
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
    @PostMapping("/changes/{id}/reject")
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
