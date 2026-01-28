package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.ReportDefinition.EntityType;
import com.samgov.ingestor.service.ReportDefinitionService;
import com.samgov.ingestor.service.ReportDefinitionService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for custom report definitions with drag-and-drop column configuration.
 */
@RestController
@RequestMapping("/report-definitions")
@PreAuthorize("isAuthenticated()")
public class ReportDefinitionController {

    private final ReportDefinitionService reportDefinitionService;

    public ReportDefinitionController(ReportDefinitionService reportDefinitionService) {
        this.reportDefinitionService = reportDefinitionService;
    }

    /**
     * List all accessible reports (user's own + public)
     */
    @GetMapping
    public ResponseEntity<Page<ReportDefinitionResponse>> listReports(
            @RequestParam(required = false) EntityType entityType,
            @RequestParam(required = false) String search,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        Page<ReportDefinitionResponse> reports;
        if (search != null && !search.isBlank()) {
            reports = reportDefinitionService.searchReports(tenantId, userId, search, pageable);
        } else if (entityType != null) {
            reports = reportDefinitionService.getReportsByEntityType(tenantId, userId, entityType, pageable);
        } else {
            reports = reportDefinitionService.getAccessibleReports(tenantId, userId, pageable);
        }

        return ResponseEntity.ok(reports);
    }

    /**
     * Get a specific report definition
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportDefinitionResponse> getReport(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        return reportDefinitionService.getReport(tenantId, userId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new report definition
     */
    @PostMapping
    public ResponseEntity<ReportDefinitionResponse> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        ReportDefinitionResponse response = reportDefinitionService.createReport(tenantId, userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Update a report definition
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReportDefinitionResponse> updateReport(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        ReportDefinitionResponse response = reportDefinitionService.updateReport(tenantId, userId, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a report definition
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        reportDefinitionService.deleteReport(tenantId, userId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Execute a report and get the data
     */
    @PostMapping("/{id}/execute")
    public ResponseEntity<ReportExecutionResult> executeReport(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> parameters,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        ReportExecutionResult result = reportDefinitionService.executeReport(tenantId, userId, id, parameters);
        return ResponseEntity.ok(result);
    }

    /**
     * Export a report to CSV, Excel, or PDF
     */
    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "CSV") String format,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        ExportResult result = reportDefinitionService.exportReport(tenantId, userId, id, format);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(result.contentType()));
        headers.setContentDispositionFormData("attachment", result.filename());

        return ResponseEntity.ok()
                .headers(headers)
                .body(result.content());
    }

    /**
     * Get available entity types for reporting
     */
    @GetMapping("/entity-types")
    public ResponseEntity<List<EntityType>> getEntityTypes() {
        return ResponseEntity.ok(Arrays.asList(EntityType.values()));
    }

    /**
     * Get available columns for an entity type
     */
    @GetMapping("/columns/{entityType}")
    public ResponseEntity<List<ColumnDefinition>> getAvailableColumns(
            @PathVariable EntityType entityType) {
        List<ColumnDefinition> columns = reportDefinitionService.getAvailableColumns(entityType);
        return ResponseEntity.ok(columns);
    }

    /**
     * Get available filter operators
     */
    @GetMapping("/operators")
    public ResponseEntity<List<Map<String, String>>> getFilterOperators() {
        List<Map<String, String>> operators = Arrays.asList(
            Map.of("value", "EQUALS", "label", "Equals"),
            Map.of("value", "NOT_EQUALS", "label", "Not Equals"),
            Map.of("value", "CONTAINS", "label", "Contains"),
            Map.of("value", "NOT_CONTAINS", "label", "Does Not Contain"),
            Map.of("value", "STARTS_WITH", "label", "Starts With"),
            Map.of("value", "ENDS_WITH", "label", "Ends With"),
            Map.of("value", "GREATER_THAN", "label", "Greater Than"),
            Map.of("value", "LESS_THAN", "label", "Less Than"),
            Map.of("value", "GREATER_THAN_OR_EQUALS", "label", "Greater Than or Equals"),
            Map.of("value", "LESS_THAN_OR_EQUALS", "label", "Less Than or Equals"),
            Map.of("value", "IS_NULL", "label", "Is Empty"),
            Map.of("value", "IS_NOT_NULL", "label", "Is Not Empty"),
            Map.of("value", "IN", "label", "In List"),
            Map.of("value", "BETWEEN", "label", "Between")
        );
        return ResponseEntity.ok(operators);
    }
}
