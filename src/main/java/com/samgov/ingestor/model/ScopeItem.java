package com.samgov.ingestor.model;

import jakarta.persistence.CascadeType;
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
@Table(name = "scope_items", indexes = {
    @Index(name = "idx_scope_item_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_scope_item_contract_id", columnList = "contract_id"),
    @Index(name = "idx_scope_item_parent_id", columnList = "parent_id"),
    @Index(name = "idx_scope_item_wbs_code", columnList = "wbs_code"),
    @Index(name = "idx_scope_item_status", columnList = "status")
})
public class ScopeItem {

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

    // WBS hierarchy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ScopeItem parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ScopeItem> children = new ArrayList<>();

    // WBS code (e.g., "1.2.3")
    @Column(name = "wbs_code", nullable = false)
    private String wbsCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    private ScopeItemType itemType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ScopeStatus status = ScopeStatus.PENDING;

    // Priority/ordering
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "priority")
    private Integer priority;

    // Hours tracking
    @Column(name = "estimated_hours", precision = 10, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column(name = "remaining_hours", precision = 10, scale = 2)
    private BigDecimal remainingHours;

    // Cost tracking
    @Column(name = "estimated_cost", precision = 15, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "actual_cost", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal actualCost = BigDecimal.ZERO;

    // Progress
    @Column(name = "percent_complete")
    @Builder.Default
    private Integer percentComplete = 0;

    // Schedule
    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    // Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // Related CLIN
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clin_id")
    private ContractClin clin;

    // Related deliverable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deliverable_id")
    private ContractDeliverable deliverable;

    // Acceptance criteria
    @Column(name = "acceptance_criteria", columnDefinition = "TEXT")
    private String acceptanceCriteria;

    // Additional metadata
    @Column(name = "labor_category")
    private String laborCategory;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_billable")
    @Builder.Default
    private Boolean isBillable = true;

    @Column(name = "is_milestone")
    @Builder.Default
    private Boolean isMilestone = false;

    // Scope changes tracking
    @OneToMany(mappedBy = "scopeItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ScopeChange> scopeChanges = new ArrayList<>();

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
        if (remainingHours == null && estimatedHours != null) {
            remainingHours = estimatedHours;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void addChild(ScopeItem child) {
        children.add(child);
        child.setParent(this);
    }

    public void removeChild(ScopeItem child) {
        children.remove(child);
        child.setParent(null);
    }

    public boolean isOverdue() {
        if (plannedEndDate == null) {
            return false;
        }
        if (status == ScopeStatus.COMPLETED || status == ScopeStatus.CANCELLED) {
            return false;
        }
        return LocalDate.now().isAfter(plannedEndDate);
    }

    public boolean isBehindSchedule() {
        if (plannedEndDate == null || percentComplete == null) {
            return false;
        }
        if (status == ScopeStatus.COMPLETED || status == ScopeStatus.CANCELLED) {
            return false;
        }
        // Simplified check - can be enhanced with earned value calculations
        LocalDate today = LocalDate.now();
        if (plannedStartDate != null && today.isAfter(plannedStartDate)) {
            long totalDays = plannedStartDate.until(plannedEndDate).getDays();
            long elapsedDays = plannedStartDate.until(today).getDays();
            if (totalDays > 0) {
                int expectedProgress = (int) ((elapsedDays * 100) / totalDays);
                return percentComplete < expectedProgress - 10; // 10% tolerance
            }
        }
        return false;
    }

    public boolean isOverBudget() {
        if (estimatedHours == null || actualHours == null) {
            return false;
        }
        return actualHours.compareTo(estimatedHours) > 0;
    }

    public BigDecimal getVarianceHours() {
        if (estimatedHours == null || actualHours == null) {
            return BigDecimal.ZERO;
        }
        return actualHours.subtract(estimatedHours);
    }

    public BigDecimal getVarianceCost() {
        if (estimatedCost == null || actualCost == null) {
            return BigDecimal.ZERO;
        }
        return actualCost.subtract(estimatedCost);
    }

    public int getLevel() {
        int level = 0;
        ScopeItem current = this.parent;
        while (current != null) {
            level++;
            current = current.getParent();
        }
        return level;
    }

    public enum ScopeItemType {
        PHASE,
        TASK,
        SUBTASK,
        MILESTONE,
        DELIVERABLE,
        WORK_PACKAGE
    }

    public enum ScopeStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        NOT_STARTED,
        IN_PROGRESS,
        ON_HOLD,
        CANCELLED,
        DEFERRED
    }
}
