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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Pre-computed analytics aggregates for fast dashboard loading.
 * Aggregates are computed on a scheduled basis to avoid real-time computation overhead.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "analytics_aggregates", indexes = {
    @Index(name = "idx_analytics_agg_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_analytics_agg_metric", columnList = "metric_name"),
    @Index(name = "idx_analytics_agg_period", columnList = "period"),
    @Index(name = "idx_analytics_agg_period_start", columnList = "period_start"),
    @Index(name = "idx_analytics_agg_lookup", columnList = "tenant_id, metric_name, period, period_start"),
    @Index(name = "idx_analytics_agg_dimension", columnList = "tenant_id, metric_name, dimension, period_start")
}, uniqueConstraints = {
    @UniqueConstraint(
        name = "uk_analytics_aggregate",
        columnNames = {"tenant_id", "metric_name", "dimension", "dimension_value", "period", "period_start"}
    )
})
public class AnalyticsAggregate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /**
     * Name of the metric being aggregated.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "metric_name", nullable = false, length = 50)
    private MetricName metricName;

    /**
     * Dimension for grouping (e.g., "agency", "naics_code", "stage").
     * Can be null for total aggregates.
     */
    @Column(name = "dimension", length = 50)
    private String dimension;

    /**
     * Value of the dimension (e.g., "DOD", "541511", "Qualified").
     * Can be null for total aggregates.
     */
    @Column(name = "dimension_value", length = 255)
    private String dimensionValue;

    /**
     * Time period for the aggregate.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "period", nullable = false, length = 20)
    private Period period;

    /**
     * Start date of the period.
     */
    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    /**
     * End date of the period.
     */
    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    /**
     * Numeric aggregate value (count, sum, average, etc.).
     */
    @Column(name = "value", nullable = false, precision = 19, scale = 4)
    private BigDecimal value;

    /**
     * Optional secondary value (e.g., weighted value, percentage).
     */
    @Column(name = "secondary_value", precision = 19, scale = 4)
    private BigDecimal secondaryValue;

    /**
     * Count of records that contributed to this aggregate.
     */
    @Column(name = "record_count")
    private Long recordCount;

    /**
     * Timestamp when this aggregate was computed.
     */
    @Column(name = "computed_at", nullable = false)
    private Instant computedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (computedAt == null) {
            computedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Supported metric names for aggregation.
     */
    public enum MetricName {
        // Opportunity metrics
        OPPORTUNITIES_VIEWED,
        OPPORTUNITIES_SAVED,
        OPPORTUNITIES_IN_PIPELINE,
        OPPORTUNITIES_WON,
        OPPORTUNITIES_LOST,

        // Pipeline metrics
        PIPELINE_VALUE_TOTAL,
        PIPELINE_VALUE_WEIGHTED,
        PIPELINE_CONVERSION_RATE,
        AVERAGE_DEAL_SIZE,
        AVERAGE_TIME_IN_STAGE,

        // Contract metrics
        ACTIVE_CONTRACTS,
        CONTRACT_VALUE_TOTAL,
        INVOICES_SUBMITTED,
        INVOICES_PAID,
        REVENUE_RECOGNIZED,
        OUTSTANDING_RECEIVABLES,

        // Engagement metrics
        PAGE_VIEWS,
        SEARCHES_PERFORMED,
        DOCUMENTS_DOWNLOADED,
        REPORTS_GENERATED,
        ACTIVE_USERS,
        SESSION_DURATION_AVG,

        // Win/Loss metrics
        WIN_RATE,
        WIN_VALUE,
        LOSS_VALUE,

        // Custom metrics
        CUSTOM
    }

    /**
     * Time periods for aggregation.
     */
    public enum Period {
        DAILY,
        WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY
    }
}
