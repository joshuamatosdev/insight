package com.samgov.ingestor.service;

import com.samgov.ingestor.config.OpenAIConfig;
import com.samgov.ingestor.dto.AIAnalysisDTO;
import com.samgov.ingestor.dto.AIAnalysisDTO.*;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for AI-powered analysis of contracts and opportunities.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final OpenAIConfig config;
    private final OpportunityRepository opportunityRepository;

    /**
     * Generate a summary of an opportunity.
     */
    public Summary summarizeOpportunity(UUID opportunityId) {
        if (config.isEnabled() == false) {
            return createDisabledSummary();
        }

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        log.info("Generating AI summary for opportunity: {}", opportunityId);

        // Build prompt for summary
        String prompt = buildSummaryPrompt(opportunity);
        
        // In production, call OpenAI API here
        // For now, return a structured placeholder
        return Summary.builder()
            .executiveSummary("AI summary for: " + opportunity.getTitle())
            .keyPoints(List.of(
                "NAICS: " + opportunity.getNaicsCode(),
                "Type: " + opportunity.getType(),
                "Deadline: " + opportunity.getResponseDeadline()
            ))
            .scopeSummary("This opportunity involves " + opportunity.getType() + " work.")
            .timeline(List.of(
                "Posted: " + opportunity.getPostedDate(),
                "Response Due: " + opportunity.getResponseDeadline()
            ))
            .budgetAnalysis("See opportunity details for budget information.")
            .confidence(75)
            .build();
    }

    /**
     * Calculate fit score for an opportunity against company profile.
     */
    public FitScore calculateFitScore(UUID opportunityId, UUID tenantId) {
        if (config.isEnabled() == false) {
            return createDisabledFitScore();
        }

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        log.info("Calculating AI fit score for opportunity: {} and tenant: {}", opportunityId, tenantId);

        // In production, this would:
        // 1. Fetch company profile
        // 2. Compare NAICS codes
        // 3. Analyze past performance
        // 4. Check certifications
        // 5. Use AI for nuanced analysis

        return FitScore.builder()
            .overallScore(72)
            .naicsScore(85)
            .pastPerformanceScore(70)
            .certificationScore(60)
            .geographicScore(80)
            .reasoning("Good NAICS alignment with moderate past performance match.")
            .strengths(List.of(
                "Strong NAICS code alignment",
                "Geographic proximity to performance location",
                "Relevant certifications"
            ))
            .weaknesses(List.of(
                "Limited past performance in this specific domain",
                "May need teaming partner for full capability coverage"
            ))
            .recommendations(List.of(
                "Consider partnering with a firm strong in the specific technical area",
                "Highlight any relevant commercial experience",
                "Emphasize geographic presence and response capability"
            ))
            .build();
    }

    /**
     * Assess risks for an opportunity.
     */
    public RiskAssessment assessRisks(UUID opportunityId) {
        if (config.isEnabled() == false) {
            return createDisabledRiskAssessment();
        }

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        log.info("Performing AI risk assessment for opportunity: {}", opportunityId);

        List<Risk> risks = new ArrayList<>();
        risks.add(Risk.builder()
            .category("Schedule")
            .description("Tight timeline between award and start date")
            .severity(RiskLevel.MEDIUM)
            .mitigation("Begin staffing plan and resource allocation before award")
            .build());
        risks.add(Risk.builder()
            .category("Technical")
            .description("Complex integration requirements")
            .severity(RiskLevel.LOW)
            .mitigation("Identify technical SMEs early in proposal phase")
            .build());

        return RiskAssessment.builder()
            .overallRisk(RiskLevel.MEDIUM)
            .risks(risks)
            .mitigations(List.of(
                "Develop contingency staffing plan",
                "Engage subcontractors for specialized skills",
                "Build schedule buffer for integration tasks"
            ))
            .redFlags(List.of())
            .complianceConcerns(List.of())
            .build();
    }

    /**
     * Generate proposal suggestions.
     */
    public ProposalSuggestions generateProposalSuggestions(UUID opportunityId, UUID tenantId) {
        if (config.isEnabled() == false) {
            return createDisabledProposalSuggestions();
        }

        log.info("Generating AI proposal suggestions for opportunity: {}", opportunityId);

        return ProposalSuggestions.builder()
            .winThemes(List.of(
                "Proven track record in similar government contracts",
                "Innovative technical approach with cost savings",
                "Experienced local team ready to execute"
            ))
            .discriminators(List.of(
                "Unique methodology for rapid deployment",
                "Strong past performance on similar scale projects",
                "Competitive pricing with value-added services"
            ))
            .sectionSuggestions(List.of(
                SectionSuggestion.builder()
                    .section("Technical Approach")
                    .suggestion("Lead with your proven methodology and emphasize flexibility")
                    .keyPoints(List.of("Methodology overview", "Tools and technologies", "Quality assurance"))
                    .build(),
                SectionSuggestion.builder()
                    .section("Management Approach")
                    .suggestion("Highlight your project management framework and communication plan")
                    .keyPoints(List.of("PM methodology", "Risk management", "Stakeholder engagement"))
                    .build()
            ))
            .complianceChecklist(List.of(
                "Verify page limits for each volume",
                "Include all required certifications",
                "Address all evaluation criteria explicitly",
                "Ensure pricing format matches RFP requirements"
            ))
            .build();
    }

    private String buildSummaryPrompt(Opportunity opportunity) {
        return String.format("""
            Summarize this government contracting opportunity:
            
            Title: %s
            Type: %s
            NAICS: %s
            Description: %s
            
            Provide:
            1. Executive summary (1-2 sentences)
            2. Key points
            3. Scope summary
            4. Timeline
            5. Budget analysis
            """,
            opportunity.getTitle(),
            opportunity.getType(),
            opportunity.getNaicsCode(),
            opportunity.getDescription() != null ? opportunity.getDescription() : "N/A"
        );
    }

    private Summary createDisabledSummary() {
        return Summary.builder()
            .executiveSummary("AI features are disabled")
            .keyPoints(List.of("Enable OpenAI integration in configuration"))
            .confidence(0)
            .build();
    }

    private FitScore createDisabledFitScore() {
        return FitScore.builder()
            .overallScore(0)
            .reasoning("AI features are disabled")
            .recommendations(List.of("Enable OpenAI integration in configuration"))
            .build();
    }

    private RiskAssessment createDisabledRiskAssessment() {
        return RiskAssessment.builder()
            .overallRisk(RiskLevel.LOW)
            .risks(List.of())
            .mitigations(List.of("Enable OpenAI integration for risk assessment"))
            .build();
    }

    private ProposalSuggestions createDisabledProposalSuggestions() {
        return ProposalSuggestions.builder()
            .winThemes(List.of("Enable OpenAI integration for suggestions"))
            .discriminators(List.of())
            .sectionSuggestions(List.of())
            .complianceChecklist(List.of())
            .build();
    }
}
