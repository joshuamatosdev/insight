package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.AIAnalysisDTO.*;
import com.samgov.ingestor.service.AIAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST controller for AI-powered analysis features.
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Analysis", description = "AI-powered contract and opportunity analysis")
public class AIAnalysisController {

    private final AIAnalysisService aiAnalysisService;

    @GetMapping("/opportunities/{id}/summary")
    @Operation(summary = "Get AI summary", description = "Generate an AI-powered summary of an opportunity")
    public ResponseEntity<Summary> getOpportunitySummary(@PathVariable UUID id) {
        Summary summary = aiAnalysisService.summarizeOpportunity(id);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/opportunities/{id}/fit-score")
    @Operation(summary = "Calculate fit score", description = "Calculate how well an opportunity fits your company profile")
    public ResponseEntity<FitScore> getFitScore(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        FitScore score = aiAnalysisService.calculateFitScore(id, tenantId);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/opportunities/{id}/risk-assessment")
    @Operation(summary = "Assess risks", description = "Identify potential risks in an opportunity")
    public ResponseEntity<RiskAssessment> getRiskAssessment(@PathVariable UUID id) {
        RiskAssessment assessment = aiAnalysisService.assessRisks(id);
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/opportunities/{id}/proposal-suggestions")
    @Operation(summary = "Get proposal suggestions", description = "Generate AI suggestions for proposal development")
    public ResponseEntity<ProposalSuggestions> getProposalSuggestions(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        ProposalSuggestions suggestions = aiAnalysisService.generateProposalSuggestions(id, tenantId);
        return ResponseEntity.ok(suggestions);
    }
}
