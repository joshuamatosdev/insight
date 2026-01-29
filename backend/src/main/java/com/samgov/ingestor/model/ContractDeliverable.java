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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
@Table(name = "contract_deliverables", indexes = {
    @Index(name = "idx_deliverable_contract_id", columnList = "contract_id"),
    @Index(name = "idx_deliverable_status", columnList = "status"),
    @Index(name = "idx_deliverable_due_date", columnList = "due_date")
})
public class ContractDeliverable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "cdrl_number")
    private String cdrlNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "deliverable_type", nullable = false)
    private DeliverableType deliverableType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private DeliverableStatus status = DeliverableStatus.PENDING;

    // Dates
    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @Column(name = "accepted_date")
    private LocalDate acceptedDate;

    // Frequency for recurring deliverables
    @Enumerated(EnumType.STRING)
    @Column(name = "frequency")
    private DeliverableFrequency frequency;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    // Related CLIN
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clin_id")
    private ContractClin clin;

    // Assigned owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // Review
    @Column(name = "reviewer_name")
    private String reviewerName;

    @Column(name = "review_comments", columnDefinition = "TEXT")
    private String reviewComments;

    // Format requirements
    @Column(name = "format_requirements", columnDefinition = "TEXT")
    private String formatRequirements;

    @Column(name = "distribution_list")
    private String distributionList;

    @Column(name = "copies_required")
    private Integer copiesRequired;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Related scope items for progress calculation
    @OneToMany(mappedBy = "deliverable", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScopeItem> scopeItems = new ArrayList<>();

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
        return status != DeliverableStatus.ACCEPTED
            && status != DeliverableStatus.WAIVED
            && dueDate != null
            && LocalDate.now().isAfter(dueDate);
    }

    public boolean isDueSoon(int daysThreshold) {
        if (dueDate == null || status == DeliverableStatus.ACCEPTED || status == DeliverableStatus.WAIVED) {
            return false;
        }
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return !dueDate.isBefore(LocalDate.now()) && !dueDate.isAfter(threshold);
    }

    public enum DeliverableType {
        REPORT,
        DATA,
        SOFTWARE,
        DOCUMENTATION,
        HARDWARE,
        SERVICES,
        MILESTONE,
        STATUS_REPORT,
        FINANCIAL_REPORT,
        TECHNICAL_REPORT,
        OTHER
    }

    public enum DeliverableStatus {
        PENDING,
        IN_PROGRESS,
        SUBMITTED,
        UNDER_REVIEW,
        REVISION_REQUIRED,
        ACCEPTED,
        REJECTED,
        WAIVED
    }

    public enum DeliverableFrequency {
        ONE_TIME,
        DAILY,
        WEEKLY,
        BI_WEEKLY,
        MONTHLY,
        QUARTERLY,
        SEMI_ANNUALLY,
        ANNUALLY,
        AS_REQUIRED
    }
}
