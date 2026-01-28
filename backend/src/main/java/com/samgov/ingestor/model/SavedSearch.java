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
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "saved_searches", indexes = {
    @Index(name = "idx_search_user_id", columnList = "user_id"),
    @Index(name = "idx_search_tenant_id", columnList = "tenant_id")
})
public class SavedSearch {

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

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    // JSON-serialized search criteria
    @Column(name = "search_criteria", columnDefinition = "TEXT", nullable = false)
    private String searchCriteria;

    @Column(name = "alert_enabled", nullable = false)
    @Builder.Default
    private Boolean alertEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_frequency")
    private AlertFrequency alertFrequency;

    @Column(name = "last_alert_sent_at")
    private Instant lastAlertSentAt;

    @Column(name = "last_result_count")
    private Integer lastResultCount;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

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

    public enum AlertFrequency {
        INSTANT,      // Send alert immediately when new matches found
        DAILY,        // Send daily digest
        WEEKLY        // Send weekly summary
    }
}
