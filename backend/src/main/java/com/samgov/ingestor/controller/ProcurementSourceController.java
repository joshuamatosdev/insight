package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.service.ProcurementSourceService;
import com.samgov.ingestor.service.ProcurementSourceService.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * REST API for procurement source management.
 * Admin-only endpoints for managing data sources.
 */
@RestController
@RequestMapping("/api/v1/procurement-sources")
@PreAuthorize("isAuthenticated()")
public class ProcurementSourceController {

    private final ProcurementSourceService sourceService;

    public ProcurementSourceController(ProcurementSourceService sourceService) {
        this.sourceService = sourceService;
    }

    @GetMapping
    public ResponseEntity<List<SourceResponse>> getAllSources() {
        return ResponseEntity.ok(sourceService.getAllSources());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SourceResponse>> getActiveSources() {
        return ResponseEntity.ok(sourceService.getActiveSources());
    }

    @GetMapping("/code/{shortCode}")
    public ResponseEntity<SourceResponse> getSourceByCode(@PathVariable String shortCode) {
        return sourceService.getSourceByShortCode(shortCode)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<SourceResponse>> getSourcesByLevel(
            @PathVariable Opportunity.ContractLevel level) {
        return ResponseEntity.ok(sourceService.getSourcesByContractLevel(level));
    }

    @GetMapping("/state/{stateCode}")
    public ResponseEntity<List<SourceResponse>> getSourcesByState(@PathVariable String stateCode) {
        return ResponseEntity.ok(sourceService.getSourcesByState(stateCode));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SourceResponse> createSource(@Valid @RequestBody CreateSourceRequest request) {
        return ResponseEntity.ok(sourceService.createSource(request));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateSource(@PathVariable UUID id) {
        sourceService.activateSource(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateSource(@PathVariable UUID id) {
        sourceService.deactivateSource(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSource(@PathVariable UUID id) {
        sourceService.deleteSource(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/initialize-defaults")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> initializeDefaults() {
        sourceService.initializeDefaultSources();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<SourceStats> getSourceStats() {
        return ResponseEntity.ok(sourceService.getSourceStats());
    }

    @GetMapping("/levels")
    public ResponseEntity<List<Opportunity.ContractLevel>> getContractLevels() {
        return ResponseEntity.ok(Arrays.asList(Opportunity.ContractLevel.values()));
    }

    @GetMapping("/types")
    public ResponseEntity<List<com.samgov.ingestor.model.ProcurementSource.SourceType>> getSourceTypes() {
        return ResponseEntity.ok(Arrays.asList(com.samgov.ingestor.model.ProcurementSource.SourceType.values()));
    }
}
