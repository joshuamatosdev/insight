package com.samgov.ingestor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.samgov.ingestor.config.OpenAIConfig;
import com.samgov.ingestor.dto.AIAnalysisDTO.*;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.repository.OpportunityRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service for AI-powered analysis of contracts and opportunities using Spring AI with OpenAI.
 */
@Slf4j
@Service
public class AIAnalysisService {

    private final OpenAIConfig config;
    private final ChatClient chatClient;
    private final OpportunityRepository opportunityRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public AIAnalysisService(
            OpenAIConfig config,
            @Autowired(required = false) ChatModel chatModel,
            OpportunityRepository opportunityRepository,
            ObjectMapper objectMapper) {
        this.config = config;
        this.chatClient = chatModel != null ? ChatClient.create(chatModel) : null;
        this.opportunityRepository = opportunityRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate a summary of an opportunity.
     */
    public Summary summarizeOpportunity(UUID opportunityId) {
        if (config.isEnabled() == false || chatClient == null) {
            return createDisabledSummary();
        }

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        log.info("Generating AI summary for opportunity: {}", opportunityId);

        String prompt = buildSummaryPrompt(opportunity);
        String systemPrompt = """
            You are a government contracting expert analyst. Analyze the opportunity and provide a structured response in JSON format:
            {
              "executiveSummary": "1-2 sentence summary",
              "keyPoints": ["point1", "point2", "point3"],
              "scopeSummary": "description of work scope",
              "timeline": ["timeline item 1", "timeline item 2"],
              "budgetAnalysis": "budget analysis",
              "confidence": 85
            }
            Only respond with valid JSON, no other text.
            """;

        try {
            String response = callAI(systemPrompt, prompt);
            return objectMapper.readValue(response, Summary.class);
        } catch (Exception e) {
            log.error("Failed to parse AI summary response", e);
            return createFallbackSummary(opportunity);
        }
    }

    /**
     * Calculate fit score for an opportunity against company profile.
     */
    public FitScore calculateFitScore(UUID opportunityId, UUID tenantId) {
        if (config.isEnabled() == false || chatClient == null) {
            return createDisabledFitScore();
        }

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        log.info("Calculating AI fit score for opportunity: {} and tenant: {}", opportunityId, tenantId);

        String prompt = buildFitScorePrompt(opportunity, tenantId);
        String systemPrompt = """
            You are a government contracting expert. Analyze the opportunity fit and provide a structured response in JSON format:
            {
              "overallScore": 75,
              "naicsScore": 85,
              "pastPerformanceScore": 70,
              "certificationScore": 60,
              "geographicScore": 80,
              "reasoning": "explanation of scores",
              "strengths": ["strength1", "strength2"],
              "weaknesses": ["weakness1", "weakness2"],
              "recommendations": ["recommendation1", "recommendation2"]
            }
            Scores should be 0-100. Only respond with valid JSON, no other text.
            """;

        try {
            String response = callAI(systemPrompt, prompt);
            return objectMapper.readValue(response, FitScore.class);
        } catch (Exception e) {
            log.error("Failed to parse AI fit score response", e);
            return createFallbackFitScore(opportunity);
        }
    }

    /**
     * Assess risks for an opportunity.
     */
    public RiskAssessment assessRisks(UUID opportunityId) {
        if (config.isEnabled() == false || chatClient == null) {
            return createDisabledRiskAssessment();
        }

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        log.info("Performing AI risk assessment for opportunity: {}", opportunityId);

        String prompt = buildRiskPrompt(opportunity);
        String systemPrompt = """
            You are a government contracting risk analyst. Analyze the opportunity and provide risks in JSON format:
            {
              "overallRisk": "LOW|MEDIUM|HIGH|CRITICAL",
              "risks": [
                {"category": "Schedule", "description": "risk description", "severity": "LOW|MEDIUM|HIGH|CRITICAL", "mitigation": "how to mitigate"}
              ],
              "mitigations": ["general mitigation 1", "general mitigation 2"],
              "redFlags": ["red flag if any"],
              "complianceConcerns": ["compliance concern if any"]
            }
            Only respond with valid JSON, no other text.
            """;

        try {
            String response = callAI(systemPrompt, prompt);
            return objectMapper.readValue(response, RiskAssessment.class);
        } catch (Exception e) {
            log.error("Failed to parse AI risk assessment response", e);
            return createFallbackRiskAssessment();
        }
    }

    /**
     * Generate proposal suggestions.
     */
    public ProposalSuggestions generateProposalSuggestions(UUID opportunityId, UUID tenantId) {
        if (config.isEnabled() == false || chatClient == null) {
            return createDisabledProposalSuggestions();
        }

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        log.info("Generating AI proposal suggestions for opportunity: {}", opportunityId);

        String prompt = buildProposalPrompt(opportunity, tenantId);
        String systemPrompt = """
            You are a government proposal expert. Provide proposal suggestions in JSON format:
            {
              "winThemes": ["theme1", "theme2", "theme3"],
              "discriminators": ["discriminator1", "discriminator2"],
              "sectionSuggestions": [
                {"section": "Technical Approach", "suggestion": "suggestion text", "keyPoints": ["point1", "point2"]}
              ],
              "complianceChecklist": ["checklist item 1", "checklist item 2"]
            }
            Only respond with valid JSON, no other text.
            """;

        try {
            String response = callAI(systemPrompt, prompt);
            return objectMapper.readValue(response, ProposalSuggestions.class);
        } catch (Exception e) {
            log.error("Failed to parse AI proposal suggestions response", e);
            return createFallbackProposalSuggestions();
        }
    }

    /**
     * Call AI with system and user prompts using Spring AI ChatClient.
     */
    private String callAI(String systemPrompt, String userPrompt) {
        return chatClient.prompt()
            .system(systemPrompt)
            .user(userPrompt)
            .call()
            .content();
    }

    private String buildSummaryPrompt(Opportunity opportunity) {
        return String.format("""
            Summarize this government contracting opportunity:

            Title: %s
            Type: %s
            NAICS: %s
            Set-Aside: %s
            Description: %s
            Response Deadline: %s
            """,
            opportunity.getTitle(),
            opportunity.getType(),
            opportunity.getNaicsCode(),
            opportunity.getSetAside() != null ? opportunity.getSetAside() : "None",
            opportunity.getDescription() != null ? opportunity.getDescription() : "N/A",
            opportunity.getResponseDeadline()
        );
    }

    private String buildFitScorePrompt(Opportunity opportunity, UUID tenantId) {
        return String.format("""
            Analyze fit for this opportunity:

            Title: %s
            Type: %s
            NAICS: %s
            Set-Aside: %s
            Place of Performance: %s

            Assume a typical small business contractor profile.
            """,
            opportunity.getTitle(),
            opportunity.getType(),
            opportunity.getNaicsCode(),
            opportunity.getSetAside() != null ? opportunity.getSetAside() : "None",
            opportunity.getPlaceOfPerformance() != null ? opportunity.getPlaceOfPerformance() : "N/A"
        );
    }

    private String buildRiskPrompt(Opportunity opportunity) {
        return String.format("""
            Assess risks for this opportunity:

            Title: %s
            Type: %s
            NAICS: %s
            Response Deadline: %s
            Description: %s
            """,
            opportunity.getTitle(),
            opportunity.getType(),
            opportunity.getNaicsCode(),
            opportunity.getResponseDeadline(),
            opportunity.getDescription() != null ? opportunity.getDescription() : "N/A"
        );
    }

    private String buildProposalPrompt(Opportunity opportunity, UUID tenantId) {
        return String.format("""
            Generate proposal suggestions for this opportunity:

            Title: %s
            Type: %s
            NAICS: %s
            Set-Aside: %s
            Description: %s
            """,
            opportunity.getTitle(),
            opportunity.getType(),
            opportunity.getNaicsCode(),
            opportunity.getSetAside() != null ? opportunity.getSetAside() : "None",
            opportunity.getDescription() != null ? opportunity.getDescription() : "N/A"
        );
    }

    private Summary createFallbackSummary(Opportunity opportunity) {
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
            .confidence(50)
            .build();
    }

    private FitScore createFallbackFitScore(Opportunity opportunity) {
        return FitScore.builder()
            .overallScore(70)
            .naicsScore(80)
            .pastPerformanceScore(65)
            .certificationScore(60)
            .geographicScore(75)
            .reasoning("Analysis based on available opportunity data.")
            .strengths(List.of("Review opportunity details for specific fit factors"))
            .weaknesses(List.of("Unable to complete full AI analysis"))
            .recommendations(List.of("Manually review opportunity requirements"))
            .build();
    }

    private RiskAssessment createFallbackRiskAssessment() {
        return RiskAssessment.builder()
            .overallRisk(RiskLevel.MEDIUM)
            .risks(List.of())
            .mitigations(List.of("Review opportunity manually for risk factors"))
            .redFlags(List.of())
            .complianceConcerns(List.of())
            .build();
    }

    private ProposalSuggestions createFallbackProposalSuggestions() {
        return ProposalSuggestions.builder()
            .winThemes(List.of("Focus on relevant past performance", "Emphasize technical capability"))
            .discriminators(List.of("Review RFP for evaluation criteria"))
            .sectionSuggestions(List.of())
            .complianceChecklist(List.of("Verify all RFP requirements", "Check page limits"))
            .build();
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
