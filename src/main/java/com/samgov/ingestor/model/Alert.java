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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "alerts", indexes = {
    @Index(name = "idx_alert_user_id", columnList = "user_id"),
    @Index(name = "idx_alert_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_alert_search_id", columnList = "saved_search_id"),
    @Index(name = "idx_alert_status", columnList = "status")
})
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saved_search_id")
    private SavedSearch savedSearch;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private AlertType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AlertStatus status = AlertStatus.UNREAD;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    @Builder.Default
    private AlertPriority priority = AlertPriority.NORMAL;

    @Column(name = "link")
    private String link;

    // JSON-serialized data about matched opportunities
    @Column(name = "data", columnDefinition = "TEXT")
    private String data;

    @Column(name = "match_count")
    private Integer matchCount;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public void markAsRead() {
        this.status = AlertStatus.READ;
        this.readAt = Instant.now();
    }

    public enum AlertType {
        NEW_OPPORTUNITY_MATCH,
        DEADLINE_APPROACHING,
        OPPORTUNITY_UPDATED,
        OPPORTUNITY_CLOSED,
        SYSTEM_NOTIFICATION,
        TEAM_MENTION,
        PIPELINE_UPDATE
    }

    public enum AlertStatus {
        UNREAD,
        READ,
        DISMISSED
    }

    public enum AlertPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
}
