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
@Table(name = "capture_actions", indexes = {
    @Index(name = "idx_capture_action_plan_id", columnList = "capture_plan_id"),
    @Index(name = "idx_capture_action_status", columnList = "status"),
    @Index(name = "idx_capture_action_due_date", columnList = "due_date"),
    @Index(name = "idx_capture_action_assigned_to", columnList = "assigned_to_id")
})
public class CaptureAction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capture_plan_id", nullable = false)
    private CapturePlan capturePlan;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ActionStatus status = ActionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    @Builder.Default
    private ActionPriority priority = ActionPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type")
    private ActionType actionType;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "outcome", columnDefinition = "TEXT")
    private String outcome;

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
        return status != ActionStatus.COMPLETED
            && status != ActionStatus.CANCELLED
            && LocalDate.now().isAfter(dueDate);
    }

    public void complete() {
        this.status = ActionStatus.COMPLETED;
        this.completedDate = LocalDate.now();
    }

    public enum ActionStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        BLOCKED,
        CANCELLED
    }

    public enum ActionPriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum ActionType {
        CUSTOMER_MEETING,
        COMPETITOR_ANALYSIS,
        PARTNER_OUTREACH,
        SOLUTION_DEVELOPMENT,
        PRICE_ANALYSIS,
        PROPOSAL_PREP,
        TEAM_BUILDING,
        REVIEW_GATE,
        OTHER
    }
}
