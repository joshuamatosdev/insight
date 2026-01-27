package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Scheduled export job configuration.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "scheduled_exports", indexes = {
    @Index(name = "idx_scheduled_export_tenant", columnList = "tenant_id"),
    @Index(name = "idx_scheduled_export_user", columnList = "user_id")
})
public class ScheduledExport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "format", nullable = false)
    private String format;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "filter_criteria", columnDefinition = "TEXT")
    private String filterCriteria; // JSON filter criteria

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false)
    private Frequency frequency;

    @Column(name = "day_of_week")
    private Integer dayOfWeek; // 1-7 for weekly

    @Column(name = "day_of_month")
    private Integer dayOfMonth; // 1-31 for monthly

    @Column(name = "hour_of_day", nullable = false)
    @Builder.Default
    private int hourOfDay = 8; // Default 8 AM

    @Column(name = "recipients", columnDefinition = "TEXT")
    private String recipients; // JSON array of emails

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "last_run_at")
    private Instant lastRunAt;

    @Column(name = "next_run_at")
    private Instant nextRunAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum Frequency {
        DAILY,
        WEEKLY,
        MONTHLY
    }

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
}
