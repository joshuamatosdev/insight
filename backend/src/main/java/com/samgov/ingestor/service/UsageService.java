package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.UsageRecord;
import com.samgov.ingestor.model.UsageRecord.MetricType;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Service for tracking and managing usage metrics for metered billing.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UsageService {

    private final UsageRepository usageRepository;
    private final TenantRepository tenantRepository;

    // Queue for batch processing of usage records
    private final ConcurrentLinkedQueue<UsageRecordRequest> pendingRecords = new ConcurrentLinkedQueue<>();

    // Default usage limits per subscription tier
    private static final Map<Tenant.SubscriptionTier, Map<MetricType, Long>> TIER_LIMITS = Map.of(
        Tenant.SubscriptionTier.FREE, Map.of(
            MetricType.API_CALLS, 1000L,
            MetricType.STORAGE_GB, 1L,
            MetricType.USERS, 3L,
            MetricType.OPPORTUNITIES_VIEWED, 100L,
            MetricType.DOCUMENTS_UPLOADED, 10L,
            MetricType.REPORTS_GENERATED, 5L,
            MetricType.ALERTS_SENT, 10L,
            MetricType.SEARCH_QUERIES, 100L
        ),
        Tenant.SubscriptionTier.PRO, Map.of(
            MetricType.API_CALLS, 50000L,
            MetricType.STORAGE_GB, 50L,
            MetricType.USERS, 25L,
            MetricType.OPPORTUNITIES_VIEWED, 5000L,
            MetricType.DOCUMENTS_UPLOADED, 500L,
            MetricType.REPORTS_GENERATED, 100L,
            MetricType.ALERTS_SENT, 500L,
            MetricType.SEARCH_QUERIES, 5000L
        ),
        Tenant.SubscriptionTier.ENTERPRISE, Map.of(
            MetricType.API_CALLS, -1L, // Unlimited
            MetricType.STORAGE_GB, 500L,
            MetricType.USERS, -1L, // Unlimited
            MetricType.OPPORTUNITIES_VIEWED, -1L, // Unlimited
            MetricType.DOCUMENTS_UPLOADED, -1L, // Unlimited
            MetricType.REPORTS_GENERATED, -1L, // Unlimited
            MetricType.ALERTS_SENT, -1L, // Unlimited
            MetricType.SEARCH_QUERIES, -1L // Unlimited
        )
    );

    /**
     * Record a usage event for the current tenant.
     */
    @Transactional
    public void recordUsage(UUID tenantId, MetricType metricType, BigDecimal quantity) {
        recordUsage(tenantId, metricType, quantity, null);
    }

    /**
     * Record a usage event with description.
     */
    @Transactional
    public void recordUsage(UUID tenantId, MetricType metricType, BigDecimal quantity, String description) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        LocalDate now = LocalDate.now();
        LocalDate periodStart = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate periodEnd = now.with(TemporalAdjusters.lastDayOfMonth());

        UsageRecord record = UsageRecord.builder()
            .tenant(tenant)
            .metricType(metricType)
            .quantity(quantity)
            .recordedAt(Instant.now())
            .billingPeriodStart(periodStart)
            .billingPeriodEnd(periodEnd)
            .description(description)
            .build();

        usageRepository.save(record);
        log.debug("Recorded usage: tenant={}, metric={}, quantity={}", tenantId, metricType, quantity);
    }

    /**
     * Queue a usage record for batch processing (non-blocking).
     */
    public void queueUsageRecord(UUID tenantId, MetricType metricType, long quantity, String description) {
        pendingRecords.offer(new UsageRecordRequest(tenantId, metricType, BigDecimal.valueOf(quantity), description));
        log.trace("Queued usage record: tenant={}, metric={}, quantity={}", tenantId, metricType, quantity);
    }

    /**
     * Async method to batch-write queued usage records.
     * Should be called periodically by a scheduled task.
     */
    @Async("taskExecutor")
    @Transactional
    public void flushQueuedRecords() {
        List<UsageRecordRequest> batch = new ArrayList<>();
        UsageRecordRequest request;

        // Drain up to 100 records from the queue
        int count = 0;
        while ((request = pendingRecords.poll()) != null && count < 100) {
            batch.add(request);
            count++;
        }

        if (batch.isEmpty()) {
            return;
        }

        log.info("Flushing {} queued usage records", batch.size());

        LocalDate now = LocalDate.now();
        LocalDate periodStart = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate periodEnd = now.with(TemporalAdjusters.lastDayOfMonth());
        Instant recordedAt = Instant.now();

        List<UsageRecord> records = new ArrayList<>();
        for (UsageRecordRequest req : batch) {
            try {
                Tenant tenant = tenantRepository.findById(req.tenantId()).orElse(null);
                if (tenant == null) {
                    log.warn("Skipping usage record for unknown tenant: {}", req.tenantId());
                    continue;
                }

                UsageRecord record = UsageRecord.builder()
                    .tenant(tenant)
                    .metricType(req.metricType())
                    .quantity(req.quantity())
                    .recordedAt(recordedAt)
                    .billingPeriodStart(periodStart)
                    .billingPeriodEnd(periodEnd)
                    .description(req.description())
                    .build();
                records.add(record);
            } catch (Exception e) {
                log.error("Error creating usage record for tenant {}: {}", req.tenantId(), e.getMessage());
            }
        }

        if (!records.isEmpty()) {
            usageRepository.saveAll(records);
            log.info("Saved {} usage records", records.size());
        }
    }

    /**
     * Get current period usage summary for a tenant.
     */
    @Transactional(readOnly = true)
    public UsageSummaryDto getCurrentUsage(UUID tenantId) {
        LocalDate now = LocalDate.now();
        LocalDate periodStart = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate periodEnd = now.with(TemporalAdjusters.lastDayOfMonth());

        return getUsageSummary(tenantId, periodStart, periodEnd);
    }

    /**
     * Get usage summary for a specific billing period.
     */
    @Transactional(readOnly = true)
    public UsageSummaryDto getUsageSummary(UUID tenantId, LocalDate periodStart, LocalDate periodEnd) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        List<Object[]> results = usageRepository.sumAllMetricsByTenantIdAndBillingPeriod(
            tenantId, periodStart, periodEnd
        );

        Map<MetricType, BigDecimal> metrics = new EnumMap<>(MetricType.class);
        for (Object[] row : results) {
            MetricType type = (MetricType) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            metrics.put(type, sum);
        }

        // Ensure all metric types have a value
        for (MetricType type : MetricType.values()) {
            metrics.putIfAbsent(type, BigDecimal.ZERO);
        }

        return new UsageSummaryDto(
            tenantId,
            periodStart,
            periodEnd,
            metrics,
            tenant.getSubscriptionTier()
        );
    }

    /**
     * Get usage history for a date range with pagination.
     */
    @Transactional(readOnly = true)
    public Page<UsageRecordDto> getUsageHistory(UUID tenantId, Instant startDate, Instant endDate, Pageable pageable) {
        return usageRepository.findByTenantIdAndDateRangePaged(tenantId, startDate, endDate, pageable)
            .map(UsageRecordDto::fromEntity);
    }

    /**
     * Check if tenant has exceeded any usage limits.
     */
    @Transactional(readOnly = true)
    public UsageLimitsDto checkUsageLimits(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        UsageSummaryDto currentUsage = getCurrentUsage(tenantId);
        Map<MetricType, Long> limits = TIER_LIMITS.get(tenant.getSubscriptionTier());

        Map<MetricType, UsageLimitStatus> statuses = new EnumMap<>(MetricType.class);
        boolean anyExceeded = false;
        boolean anyWarning = false;

        for (MetricType type : MetricType.values()) {
            Long limit = limits.get(type);
            BigDecimal current = currentUsage.metrics().getOrDefault(type, BigDecimal.ZERO);

            UsageLimitStatus status;
            if (limit == null || limit < 0) {
                // Unlimited
                status = new UsageLimitStatus(type, current.longValue(), -1L, 0.0, false, false);
            } else {
                double percentage = limit > 0 ? (current.doubleValue() / limit) * 100 : 0;
                boolean exceeded = current.longValue() > limit;
                boolean warning = percentage >= 80 && !exceeded;

                if (exceeded) anyExceeded = true;
                if (warning) anyWarning = true;

                status = new UsageLimitStatus(type, current.longValue(), limit, percentage, warning, exceeded);
            }
            statuses.put(type, status);
        }

        return new UsageLimitsDto(
            tenantId,
            tenant.getSubscriptionTier(),
            statuses,
            anyWarning,
            anyExceeded
        );
    }

    /**
     * Get daily usage trend data for a metric.
     */
    @Transactional(readOnly = true)
    public List<DailyUsageDto> getDailyUsageTrend(UUID tenantId, MetricType metricType, int days) {
        Instant endDate = Instant.now();
        Instant startDate = endDate.minusSeconds(days * 24L * 60 * 60);

        List<Object[]> results = usageRepository.getDailyUsageTotals(
            tenantId, metricType.name(), startDate, endDate
        );

        List<DailyUsageDto> trend = new ArrayList<>();
        for (Object[] row : results) {
            java.sql.Date date = (java.sql.Date) row[0];
            BigDecimal total = (BigDecimal) row[1];
            trend.add(new DailyUsageDto(date.toLocalDate(), total));
        }

        return trend;
    }

    // Internal request record for batching
    private record UsageRecordRequest(
        UUID tenantId,
        MetricType metricType,
        BigDecimal quantity,
        String description
    ) {}

    // DTOs
    public record UsageSummaryDto(
        UUID tenantId,
        LocalDate periodStart,
        LocalDate periodEnd,
        Map<MetricType, BigDecimal> metrics,
        Tenant.SubscriptionTier subscriptionTier
    ) {}

    public record UsageRecordDto(
        UUID id,
        MetricType metricType,
        BigDecimal quantity,
        Instant recordedAt,
        LocalDate billingPeriodStart,
        LocalDate billingPeriodEnd,
        String description
    ) {
        public static UsageRecordDto fromEntity(UsageRecord entity) {
            return new UsageRecordDto(
                entity.getId(),
                entity.getMetricType(),
                entity.getQuantity(),
                entity.getRecordedAt(),
                entity.getBillingPeriodStart(),
                entity.getBillingPeriodEnd(),
                entity.getDescription()
            );
        }
    }

    public record UsageLimitsDto(
        UUID tenantId,
        Tenant.SubscriptionTier subscriptionTier,
        Map<MetricType, UsageLimitStatus> limits,
        boolean hasWarnings,
        boolean hasExceeded
    ) {}

    public record UsageLimitStatus(
        MetricType metricType,
        long current,
        long limit,
        double percentageUsed,
        boolean warning,
        boolean exceeded
    ) {}

    public record DailyUsageDto(
        LocalDate date,
        BigDecimal total
    ) {}
}
