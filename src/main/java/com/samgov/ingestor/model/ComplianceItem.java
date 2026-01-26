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

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "compliance_items", indexes = {
    @Index(name = "idx_compliance_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_compliance_contract_id", columnList = "contract_id"),
    @Index(name = "idx_compliance_type", columnList = "compliance_type"),
    @Index(name = "idx_compliance_status", columnList = "status"),
    @Index(name = "idx_compliance_due_date", columnList = "due_date")
})
public class ComplianceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(name = "compliance_type", nullable = false)
    private ComplianceType complianceType;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ComplianceStatus status = ComplianceStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private CompliancePriority priority = CompliancePriority.MEDIUM;

    // Dates
    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(name = "last_review_date")
    private LocalDate lastReviewDate;

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;

    // For recurring compliance items
    @Enumerated(EnumType.STRING)
    @Column(name = "frequency")
    private ComplianceFrequency frequency;

    // Clause reference
    @Column(name = "clause_number")
    private String clauseNumber;

    @Column(name = "clause_title")
    private String clauseTitle;

    // Assigned owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // Evidence/Documentation
    @Column(name = "evidence_required")
    @Builder.Default
    private Boolean evidenceRequired = false;

    @Column(name = "evidence_url")
    private String evidenceUrl;

    @Column(name = "evidence_notes", columnDefinition = "TEXT")
    private String evidenceNotes;

    // Audit trail
    @Column(name = "verification_method")
    private String verificationMethod;

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "verification_date")
    private LocalDate verificationDate;

    // Remediation
    @Column(name = "remediation_plan", columnDefinition = "TEXT")
    private String remediationPlan;

    @Column(name = "remediation_deadline")
    private LocalDate remediationDeadline;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

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
        return dueDate != null
            && status != ComplianceStatus.COMPLIANT
            && status != ComplianceStatus.NOT_APPLICABLE
            && LocalDate.now().isAfter(dueDate);
    }

    public boolean isDueSoon(int daysThreshold) {
        if (dueDate == null || status == ComplianceStatus.COMPLIANT) return false;
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return !dueDate.isBefore(LocalDate.now()) && !dueDate.isAfter(threshold);
    }

    public enum ComplianceType {
        // FAR/DFARS
        FAR_CLAUSE,
        DFARS_CLAUSE,
        AGENCY_CLAUSE,

        // Cybersecurity
        CMMC,
        NIST_800_171,
        NIST_800_53,
        FEDRAMP,

        // Export control
        ITAR,
        EAR,

        // Security
        PERSONNEL_CLEARANCE,
        FACILITY_CLEARANCE,
        CUI_HANDLING,

        // Reporting
        SMALL_BUSINESS_REPORTING,
        SUBCONTRACTING_PLAN,
        COST_ACCOUNTING,
        INCURRED_COST,

        // Ethics
        OCI,                    // Organizational Conflict of Interest
        LOBBYING_DISCLOSURE,
        ETHICS_TRAINING,

        // Labor
        SERVICE_CONTRACT_ACT,
        DAVIS_BACON,
        AFFIRMATIVE_ACTION,

        // Other
        INSURANCE,
        BONDING,
        SECTION_889,
        BUY_AMERICAN,
        TRADE_AGREEMENTS,

        OTHER
    }

    public enum ComplianceStatus {
        PENDING,
        IN_PROGRESS,
        COMPLIANT,
        NON_COMPLIANT,
        REMEDIATION_REQUIRED,
        UNDER_REVIEW,
        NOT_APPLICABLE,
        WAIVED
    }

    public enum CompliancePriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum ComplianceFrequency {
        ONE_TIME,
        MONTHLY,
        QUARTERLY,
        SEMI_ANNUALLY,
        ANNUALLY,
        AS_REQUIRED
    }
}
