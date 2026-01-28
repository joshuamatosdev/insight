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
@Table(name = "scope_changes", indexes = {
    @Index(name = "idx_scope_change_contract_id", columnList = "contract_id"),
    @Index(name = "idx_scope_change_scope_item_id", columnList = "scope_item_id"),
    @Index(name = "idx_scope_change_status", columnList = "status"),
    @Index(name = "idx_scope_change_type", columnList = "change_type")
})
public class ScopeChange {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scope_item_id")
    private ScopeItem scopeItem;

    // Change identification
    @Column(name = "change_number", nullable = false)
    private String changeNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false)
    private ChangeType changeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ChangeStatus status = ChangeStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private ChangePriority priority;

    // Impact assessment
    @Column(name = "hours_impact", precision = 10, scale = 2)
    private BigDecimal hoursImpact;

    @Column(name = "cost_impact", precision = 15, scale = 2)
    private BigDecimal costImpact;

    @Column(name = "schedule_impact_days")
    private Integer scheduleImpactDays;

    @Column(name = "impact_analysis", columnDefinition = "TEXT")
    private String impactAnalysis;

    @Column(name = "impact_assessment", columnDefinition = "TEXT")
    private String impactAssessment;

    // Justification
    @Column(name = "justification", columnDefinition = "TEXT")
    private String justification;

    @Column(name = "business_case", columnDefinition = "TEXT")
    private String businessCase;

    // Previous values (for tracking what changed)
    @Column(name = "previous_estimated_hours", precision = 10, scale = 2)
    private BigDecimal previousEstimatedHours;

    @Column(name = "new_estimated_hours", precision = 10, scale = 2)
    private BigDecimal newEstimatedHours;

    @Column(name = "previous_estimated_cost", precision = 15, scale = 2)
    private BigDecimal previousEstimatedCost;

    @Column(name = "new_estimated_cost", precision = 15, scale = 2)
    private BigDecimal newEstimatedCost;

    @Column(name = "previous_end_date")
    private LocalDate previousEndDate;

    @Column(name = "new_end_date")
    private LocalDate newEndDate;

    // Request information
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id")
    private User requestedBy;

    @Column(name = "requested_date")
    private LocalDate requestedDate;

    @Column(name = "requestor_name")
    private String requestorName;

    @Column(name = "requestor_email")
    private String requestorEmail;

    // Approval workflow
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "reviewed_date")
    private LocalDate reviewedDate;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "review_comments", columnDefinition = "TEXT")
    private String reviewComments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    @Column(name = "approved_date")
    private LocalDate approvedDate;

    @Column(name = "approval_comments", columnDefinition = "TEXT")
    private String approvalComments;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // Implementation
    @Column(name = "implementation_date")
    private LocalDate implementationDate;

    @Column(name = "implementation_notes", columnDefinition = "TEXT")
    private String implementationNotes;

    // Related modification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modification_id")
    private ContractModification modification;

    // External reference (e.g., customer change request number)
    @Column(name = "external_reference")
    private String externalReference;

    // Notes
    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (requestedDate == null) {
            requestedDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isPending() {
        return status == ChangeStatus.PENDING_APPROVAL || status == ChangeStatus.UNDER_REVIEW;
    }

    public boolean isApproved() {
        return status == ChangeStatus.APPROVED || status == ChangeStatus.IMPLEMENTED;
    }

    public boolean isRejected() {
        return status == ChangeStatus.REJECTED;
    }

    public boolean hasImpact() {
        return (hoursImpact != null && hoursImpact.compareTo(BigDecimal.ZERO) != 0) ||
               (costImpact != null && costImpact.compareTo(BigDecimal.ZERO) != 0) ||
               (scheduleImpactDays != null && scheduleImpactDays != 0);
    }

    public enum ChangeType {
        ADD,                // Adding new scope
        MODIFY,             // Modifying existing scope
        REMOVE,             // Removing scope
        ADDITION,           // Adding new scope (legacy)
        MODIFICATION,       // Modifying existing scope (legacy)
        DELETION,           // Removing scope (legacy)
        REBASELINE,         // Re-baselining estimates
        CLARIFICATION,      // Clarifying scope (no impact)
        CORRECTION,         // Correcting errors
        DESCOPE             // Reducing scope
    }

    public enum ChangeStatus {
        PENDING,            // Awaiting review
        APPROVED,           // Approved
        REJECTED,           // Rejected
        DRAFT,              // Initial draft
        PENDING_APPROVAL,   // Submitted for approval
        UNDER_REVIEW,       // Being reviewed
        IMPLEMENTED,        // Approved and implemented
        WITHDRAWN,          // Withdrawn by requestor
        ON_HOLD             // Temporarily on hold
    }

    public enum ChangePriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}
