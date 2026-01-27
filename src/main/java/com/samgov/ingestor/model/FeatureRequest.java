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
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "feature_requests", indexes = {
    @Index(name = "idx_feature_request_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_feature_request_status", columnList = "status"),
    @Index(name = "idx_feature_request_submitted_by", columnList = "submitted_by_id"),
    @Index(name = "idx_feature_request_vote_count", columnList = "vote_count"),
    @Index(name = "idx_feature_request_priority", columnList = "priority")
})
public class FeatureRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private FeatureRequestStatus status = FeatureRequestStatus.SUBMITTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private FeatureRequestCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private FeatureRequestPriority priority;

    @Column(name = "vote_count", nullable = false)
    @Builder.Default
    private Integer voteCount = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "feature_request_votes",
        joinColumns = @JoinColumn(name = "feature_request_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> voters = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id", nullable = false)
    private User submittedBy;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "target_release")
    private String targetRelease;

    @Column(name = "completed_at")
    private Instant completedAt;

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

    public void addVote(User user) {
        if (voters.add(user)) {
            voteCount = voters.size();
        }
    }

    public void removeVote(User user) {
        if (voters.remove(user)) {
            voteCount = voters.size();
        }
    }

    public boolean hasVoted(User user) {
        return voters.contains(user);
    }

    public enum FeatureRequestStatus {
        SUBMITTED,
        UNDER_REVIEW,
        PLANNED,
        IN_PROGRESS,
        COMPLETED,
        DECLINED,
        DUPLICATE
    }

    public enum FeatureRequestCategory {
        OPPORTUNITIES,
        CONTRACTS,
        PROPOSALS,
        COMPLIANCE,
        REPORTING,
        INTEGRATIONS,
        UI_UX,
        SECURITY,
        PERFORMANCE,
        OTHER
    }

    public enum FeatureRequestPriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}
