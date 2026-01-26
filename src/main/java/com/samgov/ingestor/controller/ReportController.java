package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.SavedReport.ReportType;
import com.samgov.ingestor.service.ReportService;
import com.samgov.ingestor.service.ReportService.*;
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
@RequestMapping("/api/v1/reports")
@PreAuthorize("isAuthenticated()")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(reportService.createReport(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(required = false) ReportType type,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (type != null) {
            return ResponseEntity.ok(reportService.getReportsByType(tenantId, type, pageable));
        }
        return ResponseEntity.ok(reportService.getReports(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReport(@PathVariable UUID id) {
        return reportService.getReport(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/scheduled")
    public ResponseEntity<List<ReportResponse>> getScheduledReports() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(reportService.getScheduledReports(tenantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportResponse> updateReport(
            @PathVariable UUID id,
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(reportService.updateReport(tenantId, id, userId, request));
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<Void> runReport(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        reportService.runReport(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        reportService.deleteReport(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/types")
    public ResponseEntity<List<ReportType>> getReportTypes() {
        return ResponseEntity.ok(Arrays.asList(ReportType.values()));
    }
}
