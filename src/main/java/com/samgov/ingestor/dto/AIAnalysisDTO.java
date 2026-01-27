package com.samgov.ingestor.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTOs for AI analysis features.
 */
public class AIAnalysisDTO {

    /**
     * Request for AI contract/opportunity analysis.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Request for AI analysis")
    public static class AnalysisRequest {
        @Schema(description = "Entity ID to analyze")
        private UUID entityId;

        @Schema(description = "Type of entity (opportunity, contract, rfp)")
        private String entityType;

        @Schema(description = "Specific analysis type")
        private AnalysisType analysisType;

        @Schema(description = "Additional context or instructions")
        private String additionalContext;
    }

    /**
     * AI-generated summary of a contract or opportunity.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "AI-generated summary")
    public static class Summary {
        @Schema(description = "Executive summary (1-2 sentences)")
        private String executiveSummary;

        @Schema(description = "Key points extracted")
        private List<String> keyPoints;

        @Schema(description = "Scope of work summary")
        private String scopeSummary;

        @Schema(description = "Timeline and milestones")
        private List<String> timeline;

        @Schema(description = "Budget/value analysis")
        private String budgetAnalysis;

        @Schema(description = "Confidence score (0-100)")
        private int confidence;
    }

    /**
     * Opportunity fit scoring result.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Opportunity fit score")
    public static class FitScore {
        @Schema(description = "Overall fit score (0-100)")
        private int overallScore;

        @Schema(description = "NAICS code match score")
        private int naicsScore;

        @Schema(description = "Past performance relevance")
        private int pastPerformanceScore;

        @Schema(description = "Certification alignment")
        private int certificationScore;

        @Schema(description = "Geographic fit")
        private int geographicScore;

        @Schema(description = "Reasoning for the score")
        private String reasoning;

        @Schema(description = "Strengths identified")
        private List<String> strengths;

        @Schema(description = "Weaknesses/gaps identified")
        private List<String> weaknesses;

        @Schema(description = "Recommended actions")
        private List<String> recommendations;
    }

    /**
     * Risk assessment result.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Risk assessment")
    public static class RiskAssessment {
        @Schema(description = "Overall risk level")
        private RiskLevel overallRisk;

        @Schema(description = "Identified risks")
        private List<Risk> risks;

        @Schema(description = "Mitigation strategies")
        private List<String> mitigations;

        @Schema(description = "Red flags found")
        private List<String> redFlags;

        @Schema(description = "Compliance concerns")
        private List<String> complianceConcerns;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Risk {
        private String category;
        private String description;
        private RiskLevel severity;
        private String mitigation;
    }

    /**
     * Proposal suggestions.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Proposal suggestions")
    public static class ProposalSuggestions {
        @Schema(description = "Suggested win themes")
        private List<String> winThemes;

        @Schema(description = "Key discriminators to highlight")
        private List<String> discriminators;

        @Schema(description = "Section-by-section suggestions")
        private List<SectionSuggestion> sectionSuggestions;

        @Schema(description = "Compliance checklist items")
        private List<String> complianceChecklist;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SectionSuggestion {
        private String section;
        private String suggestion;
        private List<String> keyPoints;
    }

    public enum AnalysisType {
        SUMMARY,
        FIT_SCORE,
        RISK_ASSESSMENT,
        PROPOSAL_SUGGESTIONS,
        FULL_ANALYSIS
    }

    public enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}
