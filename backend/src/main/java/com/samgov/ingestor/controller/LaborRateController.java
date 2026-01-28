package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.LaborRateService;
import com.samgov.ingestor.service.LaborRateService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/labor-rates")
@PreAuthorize("isAuthenticated()")
public class LaborRateController {

    private final LaborRateService laborRateService;

    public LaborRateController(LaborRateService laborRateService) {
        this.laborRateService = laborRateService;
    }

    @PostMapping
    public ResponseEntity<LaborRateResponse> createLaborRate(
            @Valid @RequestBody CreateLaborRateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(laborRateService.createLaborRate(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<LaborRateResponse>> getLaborRates(
            @RequestParam(required = false) Boolean activeOnly,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(laborRateService.getActiveLaborRates(tenantId, pageable));
        }
        return ResponseEntity.ok(laborRateService.getLaborRates(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LaborRateResponse> getLaborRate(@PathVariable UUID id) {
        return laborRateService.getLaborRate(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<LaborRateResponse>> getLaborRatesByCategory(@PathVariable String category) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(laborRateService.getLaborRatesByCategory(tenantId, category));
    }

    @GetMapping("/contract-vehicle/{vehicle}")
    public ResponseEntity<List<LaborRateResponse>> getLaborRatesByContractVehicle(@PathVariable String vehicle) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(laborRateService.getLaborRatesByContractVehicle(tenantId, vehicle));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getDistinctCategories() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(laborRateService.getDistinctCategories(tenantId));
    }

    @GetMapping("/contract-vehicles")
    public ResponseEntity<List<String>> getDistinctContractVehicles() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(laborRateService.getDistinctContractVehicles(tenantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LaborRateResponse> updateLaborRate(
            @PathVariable UUID id,
            @Valid @RequestBody CreateLaborRateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(laborRateService.updateLaborRate(tenantId, id, userId, request));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Void> setActive(
            @PathVariable UUID id,
            @RequestParam boolean active,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        laborRateService.setActive(tenantId, id, userId, active);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLaborRate(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        laborRateService.deleteLaborRate(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }
}
