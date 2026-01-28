package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.DashboardService;
import com.samgov.ingestor.service.DashboardService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/dashboards")
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @PostMapping
    public ResponseEntity<DashboardResponse> createDashboard(
            @Valid @RequestBody CreateDashboardRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(dashboardService.createDashboard(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<DashboardResponse>> getDashboards(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(dashboardService.getDashboards(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DashboardResponse> getDashboard(@PathVariable UUID id) {
        return dashboardService.getDashboard(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/default")
    public ResponseEntity<DashboardResponse> getDefaultDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return dashboardService.getDefaultDashboard(tenantId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/widgets")
    public ResponseEntity<WidgetResponse> addWidget(
            @PathVariable UUID id,
            @Valid @RequestBody CreateWidgetRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(dashboardService.addWidget(tenantId, id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDashboard(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        dashboardService.deleteDashboard(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/widgets/{widgetId}")
    public ResponseEntity<Void> deleteWidget(
            @PathVariable UUID widgetId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        dashboardService.deleteWidget(tenantId, widgetId, userId);
        return ResponseEntity.ok().build();
    }
}
