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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "milestones", indexes = {
    @Index(name = "idx_milestone_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_milestone_contract_id", columnList = "contract_id"),
    @Index(name = "idx_milestone_status", columnList = "status"),
    @Index(name = "idx_milestone_due_date", columnList = "due_date"),
    @Index(name = "idx_milestone_is_critical", columnList = "is_critical_path")
})
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private MilestoneStatus status = MilestoneStatus.NOT_STARTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "milestone_type")
    private MilestoneType milestoneType;

    // Dates
    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    // Progress tracking
    @Column(name = "percent_complete")
    @Builder.Default
    private Integer percentComplete = 0;

    // Critical path indicator
    @Column(name = "is_critical_path")
    @Builder.Default
    private Boolean isCriticalPath = false;

    // Financial tracking (for payment milestones)
    @Column(name = "payment_amount", precision = 15, scale = 2)
    private BigDecimal paymentAmount;

    @Column(name = "is_payment_milestone")
    @Builder.Default
    private Boolean isPaymentMilestone = false;

    // Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // Priority/ordering
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "priority")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MilestonePriority priority = MilestonePriority.MEDIUM;

    // Dependencies - milestones this one depends on (must be completed before this one can start)
    @ManyToMany
    @JoinTable(
        name = "milestone_dependencies",
        joinColumns = @JoinColumn(name = "milestone_id"),
        inverseJoinColumns = @JoinColumn(name = "depends_on_id")
    )
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Milestone> dependencies = new HashSet<>();

    // Milestones that depend on this one
    @ManyToMany(mappedBy = "dependencies")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Milestone> dependents = new HashSet<>();

    // Deliverable link (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deliverable_id")
    private ContractDeliverable deliverable;

    // Notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void addDependency(Milestone dependency) {
        dependencies.add(dependency);
        dependency.getDependents().add(this);
    }

    public void removeDependency(Milestone dependency) {
        dependencies.remove(dependency);
        dependency.getDependents().remove(this);
    }

    public boolean isOverdue() {
        if (dueDate == null) {
            return false;
        }
        return status != MilestoneStatus.COMPLETED
            && status != MilestoneStatus.CANCELLED
            && LocalDate.now().isAfter(dueDate);
    }

    public boolean isDueSoon(int daysThreshold) {
        if (dueDate == null) {
            return false;
        }
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return status != MilestoneStatus.COMPLETED
            && status != MilestoneStatus.CANCELLED
            && !dueDate.isAfter(threshold)
            && !dueDate.isBefore(LocalDate.now());
    }

    public boolean canStart() {
        // A milestone can start if all its dependencies are completed
        return dependencies.stream()
            .allMatch(d -> d.getStatus() == MilestoneStatus.COMPLETED);
    }

    public Long getDaysUntilDue() {
        if (dueDate == null) {
            return null;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), dueDate);
    }

    public enum MilestoneStatus {
        NOT_STARTED,
        IN_PROGRESS,
        ON_HOLD,
        COMPLETED,
        CANCELLED,
        AT_RISK,
        DELAYED
    }

    public enum MilestoneType {
        KICKOFF,
        DESIGN_REVIEW,
        DEVELOPMENT,
        TESTING,
        DELIVERY,
        ACCEPTANCE,
        PAYMENT,
        REPORTING,
        REVIEW,
        PHASE_GATE,
        COMPLETION,
        OTHER
    }

    public enum MilestonePriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}
