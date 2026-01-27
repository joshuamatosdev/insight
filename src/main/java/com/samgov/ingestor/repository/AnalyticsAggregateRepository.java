package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.AnalyticsAggregate;
import com.samgov.ingestor.model.AnalyticsAggregate.MetricName;
import com.samgov.ingestor.model.AnalyticsAggregate.Period;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnalyticsAggregateRepository extends JpaRepository<AnalyticsAggregate, UUID> {

    /**
     * Find a specific aggregate by all its key fields.
     */
    Optional<AnalyticsAggregate> findByTenantIdAndMetricNameAndDimensionAndDimensionValueAndPeriodAndPeriodStart(
        UUID tenantId,
        MetricName metricName,
        String dimension,
        String dimensionValue,
        Period period,
        LocalDate periodStart
    );

    /**
     * Find all aggregates for a metric within a date range.
     */
    @Query("""
        SELECT a FROM AnalyticsAggregate a
        WHERE a.tenant.id = :tenantId
        AND a.metricName = :metricName
        AND a.period = :period
        AND a.periodStart >= :startDate
        AND a.periodStart <= :endDate
        AND a.dimension IS NULL
        ORDER BY a.periodStart
        """)
    List<AnalyticsAggregate> findByMetricAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("metricName") MetricName metricName,
        @Param("period") Period period,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Find aggregates for a metric grouped by dimension.
     */
    @Query("""
        SELECT a FROM AnalyticsAggregate a
        WHERE a.tenant.id = :tenantId
        AND a.metricName = :metricName
        AND a.period = :period
        AND a.dimension = :dimension
        AND a.periodStart = :periodStart
        ORDER BY a.value DESC
        """)
    List<AnalyticsAggregate> findByMetricAndDimension(
        @Param("tenantId") UUID tenantId,
        @Param("metricName") MetricName metricName,
        @Param("period") Period period,
        @Param("dimension") String dimension,
        @Param("periodStart") LocalDate periodStart
    );

    /**
     * Get trend data for a metric over time.
     */
    @Query("""
        SELECT a FROM AnalyticsAggregate a
        WHERE a.tenant.id = :tenantId
        AND a.metricName = :metricName
        AND a.period = :period
        AND a.dimension IS NULL
        AND a.periodStart >= :startDate
        ORDER BY a.periodStart
        """)
    List<AnalyticsAggregate> findTrendData(
        @Param("tenantId") UUID tenantId,
        @Param("metricName") MetricName metricName,
        @Param("period") Period period,
        @Param("startDate") LocalDate startDate
    );

    /**
     * Get the latest aggregate for a metric.
     */
    @Query("""
        SELECT a FROM AnalyticsAggregate a
        WHERE a.tenant.id = :tenantId
        AND a.metricName = :metricName
        AND a.period = :period
        AND a.dimension IS NULL
        ORDER BY a.periodStart DESC
        LIMIT 1
        """)
    Optional<AnalyticsAggregate> findLatestByMetric(
        @Param("tenantId") UUID tenantId,
        @Param("metricName") MetricName metricName,
        @Param("period") Period period
    );

    /**
     * Find all latest aggregates for multiple metrics.
     */
    @Query("""
        SELECT a FROM AnalyticsAggregate a
        WHERE a.tenant.id = :tenantId
        AND a.metricName IN :metricNames
        AND a.period = :period
        AND a.dimension IS NULL
        AND a.periodStart = :periodStart
        """)
    List<AnalyticsAggregate> findLatestByMetrics(
        @Param("tenantId") UUID tenantId,
        @Param("metricNames") List<MetricName> metricNames,
        @Param("period") Period period,
        @Param("periodStart") LocalDate periodStart
    );

    /**
     * Get comparison data (current vs previous period).
     */
    @Query("""
        SELECT a FROM AnalyticsAggregate a
        WHERE a.tenant.id = :tenantId
        AND a.metricName = :metricName
        AND a.period = :period
        AND a.dimension IS NULL
        AND a.periodStart IN (:currentPeriod, :previousPeriod)
        ORDER BY a.periodStart
        """)
    List<AnalyticsAggregate> findForComparison(
        @Param("tenantId") UUID tenantId,
        @Param("metricName") MetricName metricName,
        @Param("period") Period period,
        @Param("currentPeriod") LocalDate currentPeriod,
        @Param("previousPeriod") LocalDate previousPeriod
    );

    /**
     * Sum aggregates for a metric across a date range.
     */
    @Query("""
        SELECT COALESCE(SUM(a.value), 0) FROM AnalyticsAggregate a
        WHERE a.tenant.id = :tenantId
        AND a.metricName = :metricName
        AND a.period = :period
        AND a.dimension IS NULL
        AND a.periodStart >= :startDate
        AND a.periodStart <= :endDate
        """)
    BigDecimal sumByMetricAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("metricName") MetricName metricName,
        @Param("period") Period period,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Delete old aggregates (for cleanup).
     */
    @Modifying
    @Query("""
        DELETE FROM AnalyticsAggregate a
        WHERE a.tenant.id = :tenantId
        AND a.period = :period
        AND a.periodStart < :before
        """)
    int deleteOldAggregates(
        @Param("tenantId") UUID tenantId,
        @Param("period") Period period,
        @Param("before") LocalDate before
    );

    /**
     * Find all metrics for a specific period.
     */
    List<AnalyticsAggregate> findByTenantIdAndPeriodAndPeriodStartAndDimensionIsNull(
        UUID tenantId,
        Period period,
        LocalDate periodStart
    );
}
