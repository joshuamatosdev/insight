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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entity representing a usage record for metered billing.
 * Tracks various metrics like API calls, storage, users, and opportunities viewed.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "usage_records", indexes = {
    @Index(name = "idx_usage_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_usage_metric_type", columnList = "metric_type"),
    @Index(name = "idx_usage_recorded_at", columnList = "recorded_at"),
    @Index(name = "idx_usage_billing_period", columnList = "billing_period_start, billing_period_end"),
    @Index(name = "idx_usage_tenant_metric_period", columnList = "tenant_id, metric_type, billing_period_start")
})
public class UsageRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private MetricType metricType;

    @Column(name = "quantity", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "billing_period_start", nullable = false)
    private LocalDate billingPeriodStart;

    @Column(name = "billing_period_end", nullable = false)
    private LocalDate billingPeriodEnd;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        if (recordedAt == null) {
            recordedAt = now;
        }
    }

    /**
     * Metric types for usage tracking.
     */
    public enum MetricType {
        API_CALLS,
        STORAGE_GB,
        USERS,
        OPPORTUNITIES_VIEWED,
        DOCUMENTS_UPLOADED,
        REPORTS_GENERATED,
        ALERTS_SENT,
        SEARCH_QUERIES
    }
}
