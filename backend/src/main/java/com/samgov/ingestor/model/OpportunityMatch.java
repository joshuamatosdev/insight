package com.samgov.ingestor.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * AI-powered opportunity matching scores.
 * Links opportunities to tenant company profiles with match scores.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "opportunity_matches", indexes = {
    @Index(name = "idx_match_tenant", columnList = "tenant_id"),
    @Index(name = "idx_match_opp", columnList = "opportunity_id"),
    @Index(name = "idx_match_score", columnList = "overall_score"),
    @Index(name = "idx_match_status", columnList = "match_status")
})
public class OpportunityMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "opportunity_id", nullable = false)
    private String opportunityId;

    // AI Match Scores (0-100 scale)
    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "naics_score", precision = 5, scale = 2)
    private BigDecimal naicsScore;

    @Column(name = "capability_score", precision = 5, scale = 2)
    private BigDecimal capabilityScore;

    @Column(name = "past_performance_score", precision = 5, scale = 2)
    private BigDecimal pastPerformanceScore;

    @Column(name = "geographic_score", precision = 5, scale = 2)
    private BigDecimal geographicScore;

    @Column(name = "certification_score", precision = 5, scale = 2)
    private BigDecimal certificationScore;

    @Column(name = "clearance_score", precision = 5, scale = 2)
    private BigDecimal clearanceScore;

    @Column(name = "contract_size_score", precision = 5, scale = 2)
    private BigDecimal contractSizeScore;

    // Match reasoning
    @Column(name = "match_reasons", columnDefinition = "TEXT")
    private String matchReasons;

    @Column(name = "risk_factors", columnDefinition = "TEXT")
    private String riskFactors;

    @Column(name = "recommended_partners", columnDefinition = "TEXT")
    private String recommendedPartners;

    // PWin (Probability of Win) prediction
    @Column(name = "pwin_score", precision = 5, scale = 2)
    private BigDecimal pwinScore;

    @Column(name = "pwin_factors", columnDefinition = "TEXT")
    private String pwinFactors;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status")
    @Builder.Default
    private MatchStatus matchStatus = MatchStatus.NEW;

    @Column(name = "user_rating")
    private Integer userRating;

    @Column(name = "user_feedback", columnDefinition = "TEXT")
    private String userFeedback;

    @Column(name = "last_calculated_at")
    private Instant lastCalculatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        lastCalculatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum MatchStatus {
        NEW,            // Just matched, not reviewed
        REVIEWING,      // Under review
        QUALIFIED,      // Qualified for pursuit
        DISQUALIFIED,   // Not a good fit
        PURSUING,       // Actively pursuing
        TEAMING,        // Looking for teaming partners
        SUBMITTED,      // Proposal submitted
        WON,            // Contract awarded
        LOST,           // Did not win
        NO_BID          // Decided not to bid
    }
}
