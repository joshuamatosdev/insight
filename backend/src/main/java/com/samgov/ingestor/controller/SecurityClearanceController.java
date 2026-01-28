package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.SecurityClearance.ClearanceLevel;
import com.samgov.ingestor.model.SecurityClearance.ClearanceStatus;
import com.samgov.ingestor.service.SecurityClearanceService;
import com.samgov.ingestor.service.SecurityClearanceService.*;
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
@RequestMapping("/api/v1/clearances")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER')")
public class SecurityClearanceController {

    private final SecurityClearanceService clearanceService;

    public SecurityClearanceController(SecurityClearanceService clearanceService) {
        this.clearanceService = clearanceService;
    }

    @PostMapping
    public ResponseEntity<ClearanceResponse> createClearance(
            @Valid @RequestBody CreateClearanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID adminUserId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(clearanceService.createClearance(tenantId, adminUserId, request));
    }

    @GetMapping
    public ResponseEntity<Page<ClearanceResponse>> getClearances(
            @RequestParam(required = false) ClearanceLevel level,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (level != null) {
            return ResponseEntity.ok(clearanceService.getClearancesByLevel(tenantId, level, pageable));
        }
        return ResponseEntity.ok(clearanceService.getClearances(tenantId, pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ClearanceResponse> getClearanceByUser(@PathVariable UUID userId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return clearanceService.getClearanceByUser(tenantId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<ClearanceResponse>> getExpiringClearances(
            @RequestParam(defaultValue = "90") int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(clearanceService.getExpiringClearances(tenantId, daysAhead));
    }

    @GetMapping("/level/{minLevel}")
    public ResponseEntity<List<ClearanceResponse>> getClearancesAtLevelOrAbove(@PathVariable ClearanceLevel minLevel) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(clearanceService.getClearancesAtLevelOrAbove(tenantId, minLevel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClearanceResponse> updateClearance(
            @PathVariable UUID id,
            @Valid @RequestBody CreateClearanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID adminUserId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(clearanceService.updateClearance(tenantId, id, adminUserId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam ClearanceStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID adminUserId = UUID.fromString(userDetails.getUsername());
        clearanceService.updateStatus(tenantId, id, adminUserId, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClearance(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID adminUserId = UUID.fromString(userDetails.getUsername());
        clearanceService.deleteClearance(tenantId, id, adminUserId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/levels")
    public ResponseEntity<List<ClearanceLevel>> getClearanceLevels() {
        return ResponseEntity.ok(Arrays.asList(ClearanceLevel.values()));
    }
}
