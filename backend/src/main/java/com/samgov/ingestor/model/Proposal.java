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
@Table(name = "proposals", indexes = {
    @Index(name = "idx_proposal_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_proposal_opportunity_id", columnList = "opportunity_id"),
    @Index(name = "idx_proposal_status", columnList = "status"),
    @Index(name = "idx_proposal_due_date", columnList = "due_date")
})
public class Proposal {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_opportunity_id")
    private PipelineOpportunity pipelineOpportunity;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "proposal_number")
    private String proposalNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ProposalStatus status = ProposalStatus.DRAFT;

    @Column(name = "version")
    @Builder.Default
    private Integer version = 1;

    // Due dates
    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    // Financial
    @Column(name = "total_value", precision = 15, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "cost_estimate", precision = 15, scale = 2)
    private BigDecimal costEstimate;

    @Column(name = "profit_margin", precision = 5, scale = 2)
    private BigDecimal profitMargin;

    // Proposal volumes/sections
    @Column(name = "technical_volume", columnDefinition = "TEXT")
    private String technicalVolume;

    @Column(name = "management_volume", columnDefinition = "TEXT")
    private String managementVolume;

    @Column(name = "cost_volume", columnDefinition = "TEXT")
    private String costVolume;

    @Column(name = "past_performance_volume", columnDefinition = "TEXT")
    private String pastPerformanceVolume;

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    // Win themes and discriminators
    @Column(name = "win_themes", columnDefinition = "TEXT")
    private String winThemes;

    @Column(name = "discriminators", columnDefinition = "TEXT")
    private String discriminators;

    // Compliance
    @Column(name = "compliance_matrix", columnDefinition = "TEXT")
    private String complianceMatrix;

    @Column(name = "is_compliant")
    @Builder.Default
    private Boolean isCompliant = false;

    // Review tracking
    @Column(name = "pink_team_date")
    private LocalDate pinkTeamDate;

    @Column(name = "red_team_date")
    private LocalDate redTeamDate;

    @Column(name = "gold_team_date")
    private LocalDate goldTeamDate;

    // Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_manager_id")
    private User proposalManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capture_manager_id")
    private User captureManager;

    // Notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

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

    public boolean isOverdue() {
        if (dueDate == null) {
            return false;
        }
        return status != ProposalStatus.SUBMITTED
            && status != ProposalStatus.AWARDED
            && status != ProposalStatus.REJECTED
            && status != ProposalStatus.WITHDRAWN
            && LocalDate.now().isAfter(dueDate);
    }

    public boolean isDueSoon(int daysThreshold) {
        if (dueDate == null) {
            return false;
        }
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return status == ProposalStatus.DRAFT || status == ProposalStatus.IN_REVIEW
            && !dueDate.isAfter(threshold)
            && !dueDate.isBefore(LocalDate.now());
    }

    public void submit() {
        this.status = ProposalStatus.SUBMITTED;
        this.submittedDate = LocalDate.now();
    }

    public enum ProposalStatus {
        DRAFT,
        IN_REVIEW,
        PINK_TEAM,
        RED_TEAM,
        GOLD_TEAM,
        FINAL_REVIEW,
        SUBMITTED,
        AWARDED,
        REJECTED,
        WITHDRAWN
    }
}
