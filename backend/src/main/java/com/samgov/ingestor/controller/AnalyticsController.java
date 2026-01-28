package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.AnalyticsAggregate.MetricName;
import com.samgov.ingestor.model.AnalyticsEvent;
import com.samgov.ingestor.model.Dashboard;
import com.samgov.ingestor.model.Dashboard.DashboardType;
import com.samgov.ingestor.model.DashboardWidget;
import com.samgov.ingestor.model.SavedReport;
import com.samgov.ingestor.model.SavedReport.ReportType;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.AnalyticsService;
import com.samgov.ingestor.service.AnalyticsService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // ==================== Report Endpoints ====================

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<SavedReport>> listReports(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.listReports(tenantId, pageable));
    }

    @GetMapping("/reports/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<SavedReport> getReport(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.getReport(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<SavedReport> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        SavedReport report = analyticsService.createReport(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    @PutMapping("/reports/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<SavedReport> updateReport(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReportRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.updateReport(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reports/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Void> deleteReport(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = analyticsService.deleteReport(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/reports/{id}/schedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<SavedReport> scheduleReport(
            @PathVariable UUID id,
            @Valid @RequestBody ScheduleReportRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.scheduleReport(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reports/{id}/unschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<SavedReport> unscheduleReport(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.unscheduleReport(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reports/{id}/favorite")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<SavedReport> toggleReportFavorite(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.toggleReportFavorite(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reports/{id}/run")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Void> recordReportRun(@PathVariable UUID id) {
        analyticsService.recordReportRun(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reports/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<SavedReport>> searchReports(
            @RequestParam String keyword,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.searchReports(tenantId, keyword, pageable));
    }

    @GetMapping("/reports/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<SavedReport>> getReportsByType(@PathVariable ReportType type) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getReportsByType(tenantId, type));
    }

    @GetMapping("/reports/favorites")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<SavedReport>> getFavoriteReports(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(analyticsService.getFavoriteReports(userId));
    }

    @GetMapping("/reports/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<SavedReport>> getMyReports(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(analyticsService.getUserReports(userId, pageable));
    }

    // ==================== Dashboard Endpoints ====================

    @GetMapping("/dashboards")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<Dashboard>> listDashboards(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.listDashboards(tenantId, pageable));
    }

    @GetMapping("/dashboards/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Dashboard> getDashboard(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.getDashboard(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/dashboards")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Dashboard> createDashboard(
            @Valid @RequestBody CreateDashboardRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        Dashboard dashboard = analyticsService.createDashboard(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dashboard);
    }

    @PutMapping("/dashboards/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Dashboard> updateDashboard(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDashboardRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.updateDashboard(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/dashboards/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Void> deleteDashboard(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = analyticsService.deleteDashboard(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/dashboards/{id}/set-default")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Dashboard> setDefaultDashboard(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.setDefaultDashboard(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/dashboards/{id}/favorite")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Dashboard> toggleDashboardFavorite(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.toggleDashboardFavorite(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dashboards/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<Dashboard>> searchDashboards(
            @RequestParam String keyword,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.searchDashboards(tenantId, keyword, pageable));
    }

    @GetMapping("/dashboards/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<Dashboard>> getDashboardsByType(@PathVariable DashboardType type) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getDashboardsByType(tenantId, type));
    }

    @GetMapping("/dashboards/favorites")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<Dashboard>> getFavoriteDashboards(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(analyticsService.getFavoriteDashboards(userId));
    }

    // ==================== Widget Endpoints ====================

    @GetMapping("/dashboards/{dashboardId}/widgets")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<DashboardWidget>> getDashboardWidgets(@PathVariable UUID dashboardId) {
        return ResponseEntity.ok(analyticsService.getDashboardWidgets(dashboardId));
    }

    @PostMapping("/dashboards/{dashboardId}/widgets")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<DashboardWidget> addWidget(
            @PathVariable UUID dashboardId,
            @Valid @RequestBody CreateWidgetRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return analyticsService.addWidget(tenantId, dashboardId, request)
                .map(widget -> ResponseEntity.status(HttpStatus.CREATED).body(widget))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/dashboards/{dashboardId}/widgets/{widgetId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<DashboardWidget> updateWidget(
            @PathVariable UUID dashboardId,
            @PathVariable UUID widgetId,
            @Valid @RequestBody UpdateWidgetRequest request) {
        return analyticsService.updateWidget(dashboardId, widgetId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/dashboards/{dashboardId}/widgets/{widgetId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Void> deleteWidget(
            @PathVariable UUID dashboardId,
            @PathVariable UUID widgetId) {
        boolean deleted = analyticsService.deleteWidget(dashboardId, widgetId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // ==================== Analytics Data Endpoints ====================

    @GetMapping("/summary/executive")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<ExecutiveSummaryDto> getExecutiveSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getExecutiveSummary(tenantId));
    }

    @GetMapping("/summary/pipeline")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<PipelineSummaryDto> getPipelineSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getPipelineSummary(tenantId));
    }

    @GetMapping("/summary/financial")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<FinancialSummaryDto> getFinancialSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getFinancialSummary(tenantId));
    }

    @GetMapping("/summary/compliance")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'COMPLIANCE_MANAGER')")
    public ResponseEntity<ComplianceSummaryDto> getComplianceSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getComplianceSummary(tenantId));
    }

    // ==================== Event Tracking Endpoints (API v1) ====================

    /**
     * GET /api/v1/analytics/dashboard - Dashboard metrics
     */
    @GetMapping({"/v1/dashboard", "/dashboard"})
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getDashboardStats(tenantId));
    }

    /**
     * GET /api/v1/analytics/metrics - Custom metrics query
     */
    @GetMapping({"/v1/metrics", "/metrics"})
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<List<MetricDto>> getMetrics(
            @RequestParam List<MetricName> metricNames,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getMetrics(tenantId, metricNames, startDate, endDate));
    }

    /**
     * GET /api/v1/analytics/trends - Trend data for charts
     */
    @GetMapping({"/v1/trends", "/trends"})
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<TrendDataDto> getTrends(
            @RequestParam MetricName metricName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getTrends(tenantId, metricName, startDate, endDate));
    }

    /**
     * POST /api/v1/analytics/track - Track custom event
     */
    @PostMapping({"/v1/track", "/track"})
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<AnalyticsEvent> trackEvent(
            @Valid @RequestBody TrackEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        AnalyticsEvent event = analyticsService.trackEvent(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    /**
     * GET /api/v1/analytics/activity - Activity feed
     */
    @GetMapping({"/v1/activity", "/activity"})
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<ActivityItemDto>> getActivityFeed(
            @RequestParam(defaultValue = "20") int limit) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getActivityFeed(tenantId, limit));
    }

    /**
     * GET /api/v1/analytics/top-performers - Top performers
     */
    @GetMapping({"/v1/top-performers", "/top-performers"})
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<List<TopPerformerDto>> getTopPerformers(
            @RequestParam(defaultValue = "10") int limit) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getTopPerformers(tenantId, limit));
    }

    /**
     * GET /api/v1/analytics/events - Recent events (paginated)
     */
    @GetMapping({"/v1/events", "/events"})
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Page<AnalyticsEvent>> getEvents(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(analyticsService.getRecentEvents(tenantId, pageable));
    }

    // Helper method
    private UUID getUserId(UserDetails userDetails) {
        if (userDetails instanceof com.samgov.ingestor.model.User user) {
            return user.getId();
        }
        return null;
    }
}
