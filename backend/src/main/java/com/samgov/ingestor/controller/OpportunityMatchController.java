package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.OpportunityMatch.MatchStatus;
import com.samgov.ingestor.service.OpportunityMatchService;
import com.samgov.ingestor.service.OpportunityMatchService.*;
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

/**
 * REST API for AI-powered opportunity matching.
 */
@RestController
@RequestMapping("/matches")
@PreAuthorize("isAuthenticated()")
public class OpportunityMatchController {

    private final OpportunityMatchService matchService;

    public OpportunityMatchController(OpportunityMatchService matchService) {
        this.matchService = matchService;
    }

    /**
     * Calculate match score for a specific opportunity.
     */
    @PostMapping("/calculate/{opportunityId}")
    public ResponseEntity<MatchResponse> calculateMatch(
            @PathVariable String opportunityId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(toMatchResponse(matchService.calculateMatch(tenantId, opportunityId)));
    }

    /**
     * Trigger batch match calculation for all active opportunities.
     */
    @PostMapping("/calculate-all")
    public ResponseEntity<Void> calculateAllMatches() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        matchService.calculateAllMatches(tenantId);
        return ResponseEntity.accepted().build();
    }

    /**
     * Get top matches for the tenant.
     */
    @GetMapping("/top")
    public ResponseEntity<List<MatchResponse>> getTopMatches(
            @RequestParam(defaultValue = "20") int limit) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(matchService.getTopMatches(tenantId, limit));
    }

    /**
     * Get all matches with pagination.
     */
    @GetMapping
    public ResponseEntity<Page<MatchResponse>> getAllMatches(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(matchService.getAllMatches(tenantId, pageable));
    }

    /**
     * Get matches by status.
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<MatchResponse>> getMatchesByStatus(
            @PathVariable MatchStatus status,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(matchService.getMatchesByStatus(tenantId, status, pageable));
    }

    /**
     * Update match status (qualify, disqualify, etc.).
     */
    @PatchMapping("/{matchId}/status")
    public ResponseEntity<Void> updateMatchStatus(
            @PathVariable UUID matchId,
            @RequestParam MatchStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        matchService.updateMatchStatus(tenantId, matchId, userId, status);
        return ResponseEntity.ok().build();
    }

    /**
     * Add user feedback to a match.
     */
    @PostMapping("/{matchId}/feedback")
    public ResponseEntity<Void> addFeedback(
            @PathVariable UUID matchId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String feedback) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        matchService.addUserFeedback(tenantId, matchId, rating, feedback);
        return ResponseEntity.ok().build();
    }

    /**
     * Get match statistics for dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<MatchStats> getMatchStats() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(matchService.getMatchStats(tenantId));
    }

    /**
     * Get available match statuses.
     */
    @GetMapping("/statuses")
    public ResponseEntity<List<MatchStatus>> getMatchStatuses() {
        return ResponseEntity.ok(Arrays.asList(MatchStatus.values()));
    }

    private MatchResponse toMatchResponse(com.samgov.ingestor.model.OpportunityMatch match) {
        return new MatchResponse(
            match.getId(),
            match.getOpportunityId(),
            match.getOverallScore(),
            match.getNaicsScore(),
            match.getCapabilityScore(),
            match.getCertificationScore(),
            match.getClearanceScore(),
            match.getPwinScore(),
            match.getMatchStatus(),
            match.getMatchReasons(),
            match.getRiskFactors(),
            match.getLastCalculatedAt()
        );
    }
}
