package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.ExportRequest;
import com.samgov.ingestor.model.ExportTemplate;
import com.samgov.ingestor.model.ScheduledExport;
import com.samgov.ingestor.service.ExportEnhancementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for enhanced export functionality
 */
@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportEnhancementService exportService;

    /**
     * Export opportunities
     */
    @PostMapping("/opportunities")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportOpportunities(
        @Valid @RequestBody ExportRequest request
    ) {
        byte[] data = exportService.exportOpportunities(request);
        
        String contentType = switch (request.getFormat()) {
            case PDF -> "application/pdf";
            case EXCEL -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case CSV -> "text/csv";
            case JSON -> "application/json";
        };
        
        String extension = request.getFormat().name().toLowerCase();
        String filename = "opportunities-export." + extension;

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .body(data);
    }

    /**
     * Get export templates
     */
    @GetMapping("/templates")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExportTemplate>> getTemplates(
        @RequestParam(required = false) String entityType
    ) {
        return ResponseEntity.ok(exportService.getTemplates(entityType));
    }

    /**
     * Get scheduled exports for current user
     */
    @GetMapping("/scheduled")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ScheduledExport>> getScheduledExports(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(exportService.getScheduledExports(userId));
    }

    /**
     * Create scheduled export
     */
    @PostMapping("/scheduled")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ScheduledExport> createScheduledExport(
        @Valid @RequestBody ScheduledExport export,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        export.setUserId(UUID.fromString(userDetails.getUsername()));
        return ResponseEntity.ok(exportService.createScheduledExport(export));
    }
}
