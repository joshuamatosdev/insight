package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.UsageRecord;
import com.samgov.ingestor.model.UsageRecord.MetricType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Repository for UsageRecord entities.
 * Provides methods for querying usage data for billing and analytics.
 */
@Repository
public interface UsageRepository extends JpaRepository<UsageRecord, UUID> {

    /**
     * Find usage records by tenant and billing period.
     */
    @Query("SELECT u FROM UsageRecord u WHERE u.tenant.id = :tenantId " +
           "AND u.billingPeriodStart = :periodStart AND u.billingPeriodEnd = :periodEnd " +
           "ORDER BY u.recordedAt DESC")
    List<UsageRecord> findByTenantIdAndBillingPeriod(
        @Param("tenantId") UUID tenantId,
        @Param("periodStart") LocalDate periodStart,
        @Param("periodEnd") LocalDate periodEnd
    );

    /**
     * Find usage records by tenant and billing period with pagination.
     */
    @Query("SELECT u FROM UsageRecord u WHERE u.tenant.id = :tenantId " +
           "AND u.billingPeriodStart = :periodStart AND u.billingPeriodEnd = :periodEnd")
    Page<UsageRecord> findByTenantIdAndBillingPeriodPaged(
        @Param("tenantId") UUID tenantId,
        @Param("periodStart") LocalDate periodStart,
        @Param("periodEnd") LocalDate periodEnd,
        Pageable pageable
    );

    /**
     * Sum usage by tenant and metric type for a billing period.
     */
    @Query("SELECT COALESCE(SUM(u.quantity), 0) FROM UsageRecord u " +
           "WHERE u.tenant.id = :tenantId AND u.metricType = :metricType " +
           "AND u.billingPeriodStart = :periodStart AND u.billingPeriodEnd = :periodEnd")
    BigDecimal sumByTenantIdAndMetricType(
        @Param("tenantId") UUID tenantId,
        @Param("metricType") MetricType metricType,
        @Param("periodStart") LocalDate periodStart,
        @Param("periodEnd") LocalDate periodEnd
    );

    /**
     * Find usage records by tenant and date range.
     */
    @Query("SELECT u FROM UsageRecord u WHERE u.tenant.id = :tenantId " +
           "AND u.recordedAt >= :startDate AND u.recordedAt <= :endDate " +
           "ORDER BY u.recordedAt DESC")
    List<UsageRecord> findByTenantIdAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    /**
     * Find usage records by tenant and date range with pagination.
     */
    @Query("SELECT u FROM UsageRecord u WHERE u.tenant.id = :tenantId " +
           "AND u.recordedAt >= :startDate AND u.recordedAt <= :endDate")
    Page<UsageRecord> findByTenantIdAndDateRangePaged(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate,
        Pageable pageable
    );

    /**
     * Get all metric sums for a tenant and billing period.
     */
    @Query("SELECT u.metricType, COALESCE(SUM(u.quantity), 0) FROM UsageRecord u " +
           "WHERE u.tenant.id = :tenantId " +
           "AND u.billingPeriodStart = :periodStart AND u.billingPeriodEnd = :periodEnd " +
           "GROUP BY u.metricType")
    List<Object[]> sumAllMetricsByTenantIdAndBillingPeriod(
        @Param("tenantId") UUID tenantId,
        @Param("periodStart") LocalDate periodStart,
        @Param("periodEnd") LocalDate periodEnd
    );

    /**
     * Get daily usage totals for a metric type within a date range.
     */
    @Query(value = "SELECT DATE(u.recorded_at) as usage_date, SUM(u.quantity) as total " +
           "FROM usage_records u " +
           "WHERE u.tenant_id = :tenantId AND u.metric_type = :metricType " +
           "AND u.recorded_at >= :startDate AND u.recorded_at <= :endDate " +
           "GROUP BY DATE(u.recorded_at) " +
           "ORDER BY usage_date", nativeQuery = true)
    List<Object[]> getDailyUsageTotals(
        @Param("tenantId") UUID tenantId,
        @Param("metricType") String metricType,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    /**
     * Count usage records by tenant and billing period.
     */
    @Query("SELECT COUNT(u) FROM UsageRecord u WHERE u.tenant.id = :tenantId " +
           "AND u.billingPeriodStart = :periodStart AND u.billingPeriodEnd = :periodEnd")
    long countByTenantIdAndBillingPeriod(
        @Param("tenantId") UUID tenantId,
        @Param("periodStart") LocalDate periodStart,
        @Param("periodEnd") LocalDate periodEnd
    );

    /**
     * Find the latest billing period for a tenant.
     */
    @Query("SELECT MAX(u.billingPeriodEnd) FROM UsageRecord u WHERE u.tenant.id = :tenantId")
    LocalDate findLatestBillingPeriodEnd(@Param("tenantId") UUID tenantId);

    /**
     * Delete old usage records before a cutoff date.
     */
    @Query("DELETE FROM UsageRecord u WHERE u.billingPeriodEnd < :cutoffDate")
    int deleteOldRecords(@Param("cutoffDate") LocalDate cutoffDate);
}
