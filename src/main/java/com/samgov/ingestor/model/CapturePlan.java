package com.samgov.ingestor.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "capture_plans", indexes = {
    @Index(name = "idx_capture_plan_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_capture_plan_opportunity_id", columnList = "opportunity_id"),
    @Index(name = "idx_capture_plan_status", columnList = "status"),
    @Index(name = "idx_capture_plan_pwin", columnList = "win_probability")
})
public class CapturePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id")
    private Opportunity opportunity;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private CaptureStatus status = CaptureStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "phase")
    @Builder.Default
    private CapturePhase phase = CapturePhase.IDENTIFICATION;

    // Win probability (Pwin)
    @Column(name = "win_probability")
    @Builder.Default
    private Integer winProbability = 0; // 0-100 percentage

    @Column(name = "confidence_level")
    @Builder.Default
    private Integer confidenceLevel = 0; // 0-100

    // Financial estimates
    @Column(name = "estimated_value", precision = 15, scale = 2)
    private BigDecimal estimatedValue;

    @Column(name = "price_to_win", precision = 15, scale = 2)
    private BigDecimal priceToWin;

    @Column(name = "bid_cost_estimate", precision = 15, scale = 2)
    private BigDecimal bidCostEstimate;

    // Analysis sections
    @Column(name = "customer_insights", columnDefinition = "TEXT")
    private String customerInsights;

    @Column(name = "competitive_analysis", columnDefinition = "TEXT")
    private String competitiveAnalysis;

    @Column(name = "incumbent_analysis", columnDefinition = "TEXT")
    private String incumbentAnalysis;

    @Column(name = "solution_approach", columnDefinition = "TEXT")
    private String solutionApproach;

    // Win themes and strategies
    @ElementCollection
    @CollectionTable(name = "capture_plan_win_themes", joinColumns = @JoinColumn(name = "capture_plan_id"))
    @Column(name = "theme")
    @Builder.Default
    private List<String> winThemes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "capture_plan_ghosting", joinColumns = @JoinColumn(name = "capture_plan_id"))
    @Column(name = "strategy")
    @Builder.Default
    private List<String> ghostingStrategies = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "capture_plan_discriminators", joinColumns = @JoinColumn(name = "capture_plan_id"))
    @Column(name = "discriminator")
    @Builder.Default
    private List<String> discriminators = new ArrayList<>();

    // Key personnel
    @Column(name = "key_personnel", columnDefinition = "TEXT")
    private String keyPersonnel;

    @Column(name = "proposed_pm")
    private String proposedProgramManager;

    @Column(name = "proposed_tech_lead")
    private String proposedTechnicalLead;

    // Risk assessment
    @Column(name = "risks", columnDefinition = "TEXT")
    private String risks;

    @Column(name = "risk_mitigation", columnDefinition = "TEXT")
    private String riskMitigation;

    // Decision gates
    @Column(name = "bid_decision")
    @Enumerated(EnumType.STRING)
    private BidDecision bidDecision;

    @Column(name = "bid_decision_date")
    private LocalDate bidDecisionDate;

    @Column(name = "bid_decision_rationale", columnDefinition = "TEXT")
    private String bidDecisionRationale;

    // Assignments
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capture_manager_id")
    private User captureManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_dev_lead_id")
    private User businessDevLead;

    // Dates
    @Column(name = "pursuit_start_date")
    private LocalDate pursuitStartDate;

    @Column(name = "rfp_expected_date")
    private LocalDate rfpExpectedDate;

    @Column(name = "proposal_due_date")
    private LocalDate proposalDueDate;

    @Column(name = "award_expected_date")
    private LocalDate awardExpectedDate;

    // Notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "lessons_learned", columnDefinition = "TEXT")
    private String lessonsLearned;

    // Audit fields
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isHighProbability() {
        return winProbability != null && winProbability >= 70;
    }

    public boolean isLowProbability() {
        return winProbability != null && winProbability < 30;
    }

    public enum CaptureStatus {
        DRAFT,
        ACTIVE,
        ON_HOLD,
        BID,
        NO_BID,
        WON,
        LOST,
        CANCELLED
    }

    public enum CapturePhase {
        IDENTIFICATION,
        QUALIFICATION,
        CAPTURE,
        PROPOSAL,
        NEGOTIATION,
        AWARD,
        POST_AWARD
    }

    public enum BidDecision {
        PENDING,
        BID,
        NO_BID,
        CONDITIONAL_BID
    }
}
