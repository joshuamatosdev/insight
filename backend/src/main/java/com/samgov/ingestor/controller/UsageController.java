package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.UsageRecord.MetricType;
import com.samgov.ingestor.service.UsageService;
import com.samgov.ingestor.service.UsageService.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for usage tracking and metered billing endpoints.
 * Provides APIs for viewing current usage, historical usage, and usage limits.
 */
@RestController
@RequestMapping("/usage")
@RequiredArgsConstructor
@Tag(name = "Usage", description = "Usage tracking and metered billing APIs")
public class UsageController {

    private final UsageService usageService;

    /**
     * Get current billing period usage summary.
     */
    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'USER')")
    @Operation(summary = "Get current period usage", description = "Returns usage summary for the current billing period")
    public ResponseEntity<UsageSummaryDto> getCurrentUsage() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        UsageSummaryDto summary = usageService.getCurrentUsage(tenantId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get usage summary for a specific billing period.
     */
    @GetMapping("/period")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    @Operation(summary = "Get usage for period", description = "Returns usage summary for a specific billing period")
    public ResponseEntity<UsageSummaryDto> getUsageForPeriod(
            @Parameter(description = "Period start date (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @Parameter(description = "Period end date (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        UsageSummaryDto summary = usageService.getUsageSummary(tenantId, periodStart, periodEnd);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get usage history with pagination.
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    @Operation(summary = "Get usage history", description = "Returns paginated usage history for a date range")
    public ResponseEntity<Page<UsageRecordDto>> getUsageHistory(
            @Parameter(description = "Start date/time (ISO-8601)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @Parameter(description = "End date/time (ISO-8601)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Page<UsageRecordDto> history = usageService.getUsageHistory(tenantId, startDate, endDate, pageable);
        return ResponseEntity.ok(history);
    }

    /**
     * Get current usage limits and status.
     */
    @GetMapping("/limits")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'USER')")
    @Operation(summary = "Get usage limits", description = "Returns current usage limits and whether they have been exceeded")
    public ResponseEntity<UsageLimitsDto> getUsageLimits() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        UsageLimitsDto limits = usageService.checkUsageLimits(tenantId);
        return ResponseEntity.ok(limits);
    }

    /**
     * Get daily usage trend for a specific metric.
     */
    @GetMapping("/trend/{metricType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'USER')")
    @Operation(summary = "Get usage trend", description = "Returns daily usage totals for a metric over a number of days")
    public ResponseEntity<List<DailyUsageDto>> getUsageTrend(
            @Parameter(description = "Metric type")
            @PathVariable MetricType metricType,
            @Parameter(description = "Number of days to look back (default 30)")
            @RequestParam(defaultValue = "30") int days) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<DailyUsageDto> trend = usageService.getDailyUsageTrend(tenantId, metricType, days);
        return ResponseEntity.ok(trend);
    }

    /**
     * Admin endpoint: Get usage for any tenant.
     */
    @GetMapping("/admin/{tenantId}/current")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Admin: Get tenant usage", description = "Admin-only endpoint to view any tenant's current usage")
    public ResponseEntity<UsageSummaryDto> getAdminTenantUsage(
            @PathVariable UUID tenantId) {
        UsageSummaryDto summary = usageService.getCurrentUsage(tenantId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Admin endpoint: Check limits for any tenant.
     */
    @GetMapping("/admin/{tenantId}/limits")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Admin: Get tenant limits", description = "Admin-only endpoint to check any tenant's usage limits")
    public ResponseEntity<UsageLimitsDto> getAdminTenantLimits(
            @PathVariable UUID tenantId) {
        UsageLimitsDto limits = usageService.checkUsageLimits(tenantId);
        return ResponseEntity.ok(limits);
    }
}
