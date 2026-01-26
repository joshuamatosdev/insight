package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.OpportunityMatch.MatchStatus;
import com.samgov.ingestor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

/**
 * AI-powered opportunity matching service.
 * Calculates match scores based on company profile, past performance, and capabilities.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OpportunityMatchService {

    private final OpportunityMatchRepository matchRepository;
    private final OpportunityRepository opportunityRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    // Score weights for overall calculation
    private static final BigDecimal NAICS_WEIGHT = new BigDecimal("0.20");
    private static final BigDecimal CAPABILITY_WEIGHT = new BigDecimal("0.20");
    private static final BigDecimal PAST_PERFORMANCE_WEIGHT = new BigDecimal("0.15");
    private static final BigDecimal GEOGRAPHIC_WEIGHT = new BigDecimal("0.10");
    private static final BigDecimal CERTIFICATION_WEIGHT = new BigDecimal("0.15");
    private static final BigDecimal CLEARANCE_WEIGHT = new BigDecimal("0.10");
    private static final BigDecimal CONTRACT_SIZE_WEIGHT = new BigDecimal("0.10");

    /**
     * Calculate match score for a single opportunity.
     */
    @Transactional
    public OpportunityMatch calculateMatch(UUID tenantId, String opportunityId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));

        CompanyProfile profile = companyProfileRepository.findByTenantId(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Company profile not found. Create a profile first."));

        // Check for existing match
        OpportunityMatch match = matchRepository.findByTenantIdAndOpportunityId(tenantId, opportunityId)
            .orElse(new OpportunityMatch());

        match.setTenant(tenant);
        match.setOpportunityId(opportunityId);

        // Calculate individual scores
        match.setNaicsScore(calculateNaicsScore(profile, opportunity));
        match.setCapabilityScore(calculateCapabilityScore(profile, opportunity));
        match.setPastPerformanceScore(calculatePastPerformanceScore(profile, opportunity));
        match.setGeographicScore(calculateGeographicScore(profile, opportunity));
        match.setCertificationScore(calculateCertificationScore(profile, opportunity));
        match.setClearanceScore(calculateClearanceScore(profile, opportunity));
        match.setContractSizeScore(calculateContractSizeScore(profile, opportunity));

        // Calculate overall weighted score
        BigDecimal overallScore = calculateOverallScore(match);
        match.setOverallScore(overallScore);

        // Generate match reasons
        match.setMatchReasons(generateMatchReasons(match, profile, opportunity));
        match.setRiskFactors(generateRiskFactors(match, profile, opportunity));

        // Calculate PWin
        match.setPwinScore(calculatePwin(match, opportunity));
        match.setPwinFactors(generatePwinFactors(match, opportunity));

        match.setLastCalculatedAt(Instant.now());

        if (match.getMatchStatus() == null) {
            match.setMatchStatus(MatchStatus.NEW);
        }

        match = matchRepository.save(match);
        log.info("Calculated match score {} for opportunity {} tenant {}", overallScore, opportunityId, tenantId);

        return match;
    }

    /**
     * Calculate matches for all active opportunities (batch process).
     */
    @Async("taskExecutor")
    @Transactional
    public void calculateAllMatches(UUID tenantId) {
        log.info("Starting batch match calculation for tenant: {}", tenantId);

        CompanyProfile profile = companyProfileRepository.findByTenantId(tenantId).orElse(null);
        if (profile == null) {
            log.warn("No company profile found for tenant: {}", tenantId);
            return;
        }

        Page<Opportunity> opportunities = opportunityRepository.findByStatus(
            Opportunity.OpportunityStatus.ACTIVE, PageRequest.of(0, 1000));

        int processed = 0;
        for (Opportunity opp : opportunities) {
            try {
                calculateMatch(tenantId, opp.getId());
                processed++;
            } catch (Exception e) {
                log.error("Error calculating match for opportunity: {}", opp.getId(), e);
            }
        }

        log.info("Completed batch match calculation. Processed {} opportunities for tenant: {}", processed, tenantId);
    }

    /**
     * Get top matches for a tenant.
     */
    @Transactional(readOnly = true)
    public List<MatchResponse> getTopMatches(UUID tenantId, int limit) {
        List<OpportunityMatch> matches = matchRepository.findHighScoreMatches(tenantId, new BigDecimal("70"));

        return matches.stream()
            .limit(limit)
            .map(this::toResponse)
            .toList();
    }

    /**
     * Get matches by status.
     */
    @Transactional(readOnly = true)
    public Page<MatchResponse> getMatchesByStatus(UUID tenantId, MatchStatus status, Pageable pageable) {
        return matchRepository.findByTenantIdAndMatchStatus(tenantId, status, pageable)
            .map(this::toResponse);
    }

    /**
     * Get all matches for tenant.
     */
    @Transactional(readOnly = true)
    public Page<MatchResponse> getAllMatches(UUID tenantId, Pageable pageable) {
        return matchRepository.findByTenantIdOrderByScoreDesc(tenantId, pageable)
            .map(this::toResponse);
    }

    /**
     * Update match status (qualifying/disqualifying opportunities).
     */
    @Transactional
    public void updateMatchStatus(UUID tenantId, UUID matchId, UUID userId, MatchStatus status) {
        OpportunityMatch match = matchRepository.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        if (!match.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Match does not belong to tenant");
        }

        match.setMatchStatus(status);
        matchRepository.save(match);

        auditService.logAction(AuditAction.MATCH_UPDATED, "OpportunityMatch", matchId.toString(),
            "Updated match status to: " + status);
    }

    /**
     * Add user feedback to a match.
     */
    @Transactional
    public void addUserFeedback(UUID tenantId, UUID matchId, Integer rating, String feedback) {
        OpportunityMatch match = matchRepository.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        if (!match.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Match does not belong to tenant");
        }

        match.setUserRating(rating);
        match.setUserFeedback(feedback);
        matchRepository.save(match);
    }

    /**
     * Get match statistics for dashboard.
     */
    @Transactional(readOnly = true)
    public MatchStats getMatchStats(UUID tenantId) {
        long total = matchRepository.countByTenantIdAndStatus(tenantId, MatchStatus.NEW) +
                     matchRepository.countByTenantIdAndStatus(tenantId, MatchStatus.REVIEWING) +
                     matchRepository.countByTenantIdAndStatus(tenantId, MatchStatus.QUALIFIED);
        long newCount = matchRepository.countByTenantIdAndStatus(tenantId, MatchStatus.NEW);
        long qualifiedCount = matchRepository.countByTenantIdAndStatus(tenantId, MatchStatus.QUALIFIED);
        long pursuingCount = matchRepository.countByTenantIdAndStatus(tenantId, MatchStatus.PURSUING);
        BigDecimal avgScore = matchRepository.findAverageScoreByTenantId(tenantId);

        return new MatchStats(total, newCount, qualifiedCount, pursuingCount,
            avgScore != null ? avgScore : BigDecimal.ZERO);
    }

    // Score calculation methods
    private BigDecimal calculateNaicsScore(CompanyProfile profile, Opportunity opportunity) {
        if (opportunity.getNaicsCode() == null || profile.getPrimaryNaics() == null) {
            return BigDecimal.ZERO;
        }

        String oppNaics = opportunity.getNaicsCode();
        String primaryNaics = profile.getPrimaryNaics();
        String secondaryNaics = profile.getSecondaryNaics() != null ? profile.getSecondaryNaics() : "";

        // Exact match on primary
        if (primaryNaics.contains(oppNaics)) {
            return new BigDecimal("100");
        }

        // Match on secondary
        if (secondaryNaics.contains(oppNaics)) {
            return new BigDecimal("80");
        }

        // Partial match (first 4 digits)
        if (oppNaics.length() >= 4 && (primaryNaics.contains(oppNaics.substring(0, 4)) ||
            secondaryNaics.contains(oppNaics.substring(0, 4)))) {
            return new BigDecimal("50");
        }

        return BigDecimal.ZERO;
    }

    private BigDecimal calculateCapabilityScore(CompanyProfile profile, Opportunity opportunity) {
        // Basic keyword matching on capabilities statement vs description
        if (profile.getCapabilitiesStatement() == null || opportunity.getDescription() == null) {
            return new BigDecimal("50"); // Neutral score
        }

        String caps = profile.getCapabilitiesStatement().toLowerCase();
        String desc = opportunity.getDescription().toLowerCase();

        // Count matching words (simplified implementation)
        Set<String> capWords = new HashSet<>(Arrays.asList(caps.split("\\W+")));
        Set<String> descWords = new HashSet<>(Arrays.asList(desc.split("\\W+")));

        long matches = capWords.stream().filter(descWords::contains).count();
        double ratio = (double) matches / Math.max(descWords.size(), 1);

        return BigDecimal.valueOf(Math.min(100, ratio * 200)).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePastPerformanceScore(CompanyProfile profile, Opportunity opportunity) {
        // Placeholder - would analyze past contract history
        if (profile.getPastPerformanceSummary() != null && !profile.getPastPerformanceSummary().isEmpty()) {
            return new BigDecimal("70");
        }
        return new BigDecimal("30");
    }

    private BigDecimal calculateGeographicScore(CompanyProfile profile, Opportunity opportunity) {
        if (opportunity.getPlaceOfPerformanceState() == null) {
            return new BigDecimal("100"); // No geographic restriction
        }

        String popState = opportunity.getPlaceOfPerformanceState();
        String hqState = profile.getHeadquartersState();
        String serviceRegions = profile.getServiceRegions() != null ? profile.getServiceRegions() : "";

        if (popState.equals(hqState)) {
            return new BigDecimal("100");
        }

        if (serviceRegions.contains(popState)) {
            return new BigDecimal("80");
        }

        return new BigDecimal("40"); // Can still bid, just not local
    }

    private BigDecimal calculateCertificationScore(CompanyProfile profile, Opportunity opportunity) {
        String setAside = opportunity.getSetAsideType();
        if (setAside == null || setAside.isBlank()) {
            return new BigDecimal("100"); // Full and open
        }

        // Check certification matches
        setAside = setAside.toUpperCase();

        if (setAside.contains("8(A)") && Boolean.TRUE.equals(profile.getIs8a())) {
            return new BigDecimal("100");
        }
        if (setAside.contains("HUBZONE") && Boolean.TRUE.equals(profile.getIsHubzone())) {
            return new BigDecimal("100");
        }
        if (setAside.contains("SDVOSB") && Boolean.TRUE.equals(profile.getIsSdvosb())) {
            return new BigDecimal("100");
        }
        if (setAside.contains("WOSB") && Boolean.TRUE.equals(profile.getIsWosb())) {
            return new BigDecimal("100");
        }
        if (setAside.contains("SMALL") && Boolean.TRUE.equals(profile.getIsSmallBusiness())) {
            return new BigDecimal("90");
        }

        // Has set-aside but company doesn't qualify
        return new BigDecimal("0");
    }

    private BigDecimal calculateClearanceScore(CompanyProfile profile, Opportunity opportunity) {
        String clearanceRequired = opportunity.getClearanceRequired();
        Boolean itarRequired = opportunity.getItarControlled();

        if ((clearanceRequired == null || clearanceRequired.isBlank()) &&
            !Boolean.TRUE.equals(itarRequired)) {
            return new BigDecimal("100"); // No clearance needed
        }

        int score = 0;
        int requirements = 0;

        if (clearanceRequired != null && !clearanceRequired.isBlank()) {
            requirements++;
            if (Boolean.TRUE.equals(profile.getHasFacilityClearance())) {
                score += 100;
            }
        }

        if (Boolean.TRUE.equals(itarRequired)) {
            requirements++;
            if (Boolean.TRUE.equals(profile.getIsItarRegistered())) {
                score += 100;
            }
        }

        return requirements > 0 ?
            BigDecimal.valueOf(score / requirements) :
            new BigDecimal("100");
    }

    private BigDecimal calculateContractSizeScore(CompanyProfile profile, Opportunity opportunity) {
        // Compare estimated contract value with company revenue
        BigDecimal estimatedValue = opportunity.getEstimatedValueHigh();
        BigDecimal revenue = profile.getAnnualRevenue();

        if (estimatedValue == null || revenue == null) {
            return new BigDecimal("70"); // Neutral
        }

        // Contract should ideally be 10-50% of annual revenue
        BigDecimal ratio = estimatedValue.divide(revenue, 4, RoundingMode.HALF_UP);

        if (ratio.compareTo(new BigDecimal("0.5")) <= 0 && ratio.compareTo(new BigDecimal("0.05")) >= 0) {
            return new BigDecimal("100"); // Good fit
        } else if (ratio.compareTo(new BigDecimal("1.0")) <= 0) {
            return new BigDecimal("70"); // Manageable
        } else {
            return new BigDecimal("30"); // May be too large
        }
    }

    private BigDecimal calculateOverallScore(OpportunityMatch match) {
        BigDecimal score = BigDecimal.ZERO;

        score = score.add(match.getNaicsScore().multiply(NAICS_WEIGHT));
        score = score.add(match.getCapabilityScore().multiply(CAPABILITY_WEIGHT));
        score = score.add(match.getPastPerformanceScore().multiply(PAST_PERFORMANCE_WEIGHT));
        score = score.add(match.getGeographicScore().multiply(GEOGRAPHIC_WEIGHT));
        score = score.add(match.getCertificationScore().multiply(CERTIFICATION_WEIGHT));
        score = score.add(match.getClearanceScore().multiply(CLEARANCE_WEIGHT));
        score = score.add(match.getContractSizeScore().multiply(CONTRACT_SIZE_WEIGHT));

        return score.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePwin(OpportunityMatch match, Opportunity opportunity) {
        // Simplified PWin calculation based on match scores
        BigDecimal baseScore = match.getOverallScore();

        // Adjust for competition (placeholder)
        BigDecimal competitionFactor = new BigDecimal("0.8");

        // Adjust for incumbent (placeholder)
        BigDecimal incumbentFactor = opportunity.getIncumbentContractor() != null ?
            new BigDecimal("0.7") : new BigDecimal("1.0");

        return baseScore.multiply(competitionFactor).multiply(incumbentFactor)
            .setScale(2, RoundingMode.HALF_UP);
    }

    private String generateMatchReasons(OpportunityMatch match, CompanyProfile profile, Opportunity opportunity) {
        List<String> reasons = new ArrayList<>();

        if (match.getNaicsScore().compareTo(new BigDecimal("80")) >= 0) {
            reasons.add("Strong NAICS code alignment");
        }
        if (match.getCertificationScore().compareTo(new BigDecimal("90")) >= 0) {
            reasons.add("Meets set-aside requirements");
        }
        if (match.getGeographicScore().compareTo(new BigDecimal("80")) >= 0) {
            reasons.add("Located in or near place of performance");
        }
        if (match.getClearanceScore().compareTo(new BigDecimal("90")) >= 0) {
            reasons.add("Has required security clearances");
        }

        return String.join("; ", reasons);
    }

    private String generateRiskFactors(OpportunityMatch match, CompanyProfile profile, Opportunity opportunity) {
        List<String> risks = new ArrayList<>();

        if (match.getCertificationScore().compareTo(new BigDecimal("50")) < 0) {
            risks.add("Does not meet set-aside requirements");
        }
        if (match.getClearanceScore().compareTo(new BigDecimal("50")) < 0) {
            risks.add("Missing required security clearances");
        }
        if (match.getContractSizeScore().compareTo(new BigDecimal("50")) < 0) {
            risks.add("Contract size may be too large for company capacity");
        }
        if (opportunity.getIncumbentContractor() != null) {
            risks.add("Has incumbent contractor");
        }

        return String.join("; ", risks);
    }

    private String generatePwinFactors(OpportunityMatch match, Opportunity opportunity) {
        List<String> factors = new ArrayList<>();

        factors.add("Overall match score: " + match.getOverallScore() + "%");
        if (opportunity.getIncumbentContractor() != null) {
            factors.add("Incumbent advantage: " + opportunity.getIncumbentContractor());
        }

        return String.join("; ", factors);
    }

    private MatchResponse toResponse(OpportunityMatch match) {
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

    public record MatchResponse(
        UUID id,
        String opportunityId,
        BigDecimal overallScore,
        BigDecimal naicsScore,
        BigDecimal capabilityScore,
        BigDecimal certificationScore,
        BigDecimal clearanceScore,
        BigDecimal pwinScore,
        MatchStatus status,
        String matchReasons,
        String riskFactors,
        Instant calculatedAt
    ) {}

    public record MatchStats(
        long totalMatches,
        long newMatches,
        long qualifiedMatches,
        long pursuingMatches,
        BigDecimal averageScore
    ) {}
}
