package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableStatus;
import com.samgov.ingestor.service.DeliverableService;
import com.samgov.ingestor.service.DeliverableService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portal/deliverables")
@PreAuthorize("isAuthenticated()")
public class DeliverableController {

    private final DeliverableService deliverableService;

    public DeliverableController(DeliverableService deliverableService) {
        this.deliverableService = deliverableService;
    }

    @PostMapping
    public ResponseEntity<DeliverableResponse> createDeliverable(
            @Valid @RequestBody CreateDeliverableRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(deliverableService.createDeliverable(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<DeliverableResponse>> getDeliverables(
            @RequestParam(required = false) DeliverableStatus status,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (status != null) {
            return ResponseEntity.ok(deliverableService.getDeliverablesByStatus(tenantId, status, pageable));
        }
        return ResponseEntity.ok(deliverableService.getDeliverables(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliverableResponse> getDeliverable(@PathVariable UUID id) {
        return deliverableService.getDeliverable(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<Page<DeliverableResponse>> getDeliverablesByContract(
            @PathVariable UUID contractId,
            Pageable pageable) {
        return ResponseEntity.ok(deliverableService.getDeliverablesByContract(contractId, pageable));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<DeliverableResponse>> getUpcomingDeliverables(
            @RequestParam(defaultValue = "30") int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(deliverableService.getUpcomingDeliverables(tenantId, daysAhead));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<DeliverableResponse>> getOverdueDeliverables() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(deliverableService.getOverdueDeliverables(tenantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliverableResponse> updateDeliverable(
            @PathVariable UUID id,
            @Valid @RequestBody CreateDeliverableRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(deliverableService.updateDeliverable(tenantId, id, userId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam DeliverableStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        deliverableService.updateStatus(tenantId, id, userId, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliverable(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        deliverableService.deleteDeliverable(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<DeliverableStatus>> getDeliverableStatuses() {
        return ResponseEntity.ok(Arrays.asList(DeliverableStatus.values()));
    }
}
