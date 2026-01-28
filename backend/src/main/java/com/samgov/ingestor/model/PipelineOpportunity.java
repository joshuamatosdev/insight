package com.samgov.ingestor.model;

import jakarta.persistence.Column;
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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pipeline_opportunities",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"pipeline_id", "opportunity_id"}, name = "uk_pipeline_opportunity")
    },
    indexes = {
        @Index(name = "idx_pipeline_opp_pipeline_id", columnList = "pipeline_id"),
        @Index(name = "idx_pipeline_opp_stage_id", columnList = "stage_id"),
        @Index(name = "idx_pipeline_opp_tenant_id", columnList = "tenant_id"),
        @Index(name = "idx_pipeline_opp_owner_id", columnList = "owner_id")
    }
)
public class PipelineOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id", nullable = false)
    private Pipeline pipeline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private PipelineStage stage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by")
    private User addedBy;

    // Custom fields
    @Column(name = "internal_name")
    private String internalName;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Bid/No-Bid decision
    @Enumerated(EnumType.STRING)
    @Column(name = "decision")
    private BidDecision decision;

    @Column(name = "decision_date")
    private LocalDate decisionDate;

    @Column(name = "decision_notes", columnDefinition = "TEXT")
    private String decisionNotes;

    // Estimated values
    @Column(name = "estimated_value", precision = 15, scale = 2)
    private BigDecimal estimatedValue;

    @Column(name = "probability_of_win")
    private Integer probabilityOfWin;

    @Column(name = "weighted_value", precision = 15, scale = 2)
    private BigDecimal weightedValue;

    // Capture information
    @Column(name = "capture_manager")
    private String captureManager;

    @Column(name = "proposal_manager")
    private String proposalManager;

    @Column(name = "teaming_partners", columnDefinition = "TEXT")
    private String teamingPartners;

    // Win themes and discriminators
    @Column(name = "win_themes", columnDefinition = "TEXT")
    private String winThemes;

    @Column(name = "discriminators", columnDefinition = "TEXT")
    private String discriminators;

    // Key dates
    @Column(name = "internal_deadline")
    private LocalDate internalDeadline;

    @Column(name = "review_date")
    private LocalDate reviewDate;

    // Tracking
    @Column(name = "stage_entered_at")
    private Instant stageEnteredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        stageEnteredAt = now;
        calculateWeightedValue();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        calculateWeightedValue();
    }

    private void calculateWeightedValue() {
        if (estimatedValue != null && probabilityOfWin != null) {
            weightedValue = estimatedValue.multiply(BigDecimal.valueOf(probabilityOfWin / 100.0));
        }
    }

    public void moveToStage(PipelineStage newStage) {
        this.stage = newStage;
        this.stageEnteredAt = Instant.now();

        // Update probability from stage default if not custom set
        if (newStage.getProbabilityOfWin() != null && this.probabilityOfWin == null) {
            this.probabilityOfWin = newStage.getProbabilityOfWin();
        }
    }

    public enum BidDecision {
        PENDING,
        BID,
        NO_BID,
        WATCH
    }
}
