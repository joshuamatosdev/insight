package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.CompetitorService;
import com.samgov.ingestor.service.CompetitorService.*;
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

/**
 * REST API for competitive intelligence management.
 */
@RestController
@RequestMapping("/competitors")
@PreAuthorize("isAuthenticated()")
public class CompetitorController {

    private final CompetitorService competitorService;

    public CompetitorController(CompetitorService competitorService) {
        this.competitorService = competitorService;
    }

    @PostMapping
    public ResponseEntity<CompetitorResponse> createCompetitor(
            @Valid @RequestBody CreateCompetitorRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(competitorService.createCompetitor(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<CompetitorResponse>> getCompetitors(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(competitorService.getCompetitors(tenantId, pageable));
    }

    @GetMapping("/active")
    public ResponseEntity<List<CompetitorResponse>> getActiveCompetitors() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(competitorService.getActiveCompetitors(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetitorResponse> getCompetitor(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return competitorService.getCompetitor(tenantId, id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CompetitorResponse>> searchCompetitors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String naicsCode) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(competitorService.searchByName(tenantId, name));
        }
        if (naicsCode != null && !naicsCode.isBlank()) {
            return ResponseEntity.ok(competitorService.searchByNaics(tenantId, naicsCode));
        }
        return ResponseEntity.ok(competitorService.getActiveCompetitors(tenantId));
    }

    @GetMapping("/top/value")
    public ResponseEntity<List<CompetitorResponse>> getTopCompetitorsByValue(
            @RequestParam(defaultValue = "10") int limit) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(competitorService.getTopCompetitorsByValue(tenantId, limit));
    }

    @GetMapping("/top/winrate")
    public ResponseEntity<List<CompetitorResponse>> getTopCompetitorsByWinRate(
            @RequestParam(defaultValue = "10") int limit) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(competitorService.getTopCompetitorsByWinRate(tenantId, limit));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompetitorResponse> updateCompetitor(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCompetitorRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(competitorService.updateCompetitor(tenantId, id, userId, request));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateCompetitor(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        competitorService.deactivateCompetitor(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompetitor(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        competitorService.deleteCompetitor(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<CompetitorStats> getCompetitorStats() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(competitorService.getCompetitorStats(tenantId));
    }
}
