package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Dashboard.DashboardType;
import com.samgov.ingestor.model.DashboardWidget.DataSource;
import com.samgov.ingestor.model.DashboardWidget.WidgetType;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.SavedReport.ReportFormat;
import com.samgov.ingestor.model.SavedReport.ReportType;
import com.samgov.ingestor.model.SavedReport.ScheduleFrequency;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class AnalyticsService {

    private final SavedReportRepository reportRepository;
    private final DashboardRepository dashboardRepository;
    private final DashboardWidgetRepository widgetRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final OpportunityRepository opportunityRepository;
    private final PipelineRepository pipelineRepository;
    private final PipelineOpportunityRepository pipelineOpportunityRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final CertificationRepository certificationRepository;
    private final AuditService auditService;

    public AnalyticsService(
            SavedReportRepository reportRepository,
            DashboardRepository dashboardRepository,
            DashboardWidgetRepository widgetRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository,
            OpportunityRepository opportunityRepository,
            PipelineRepository pipelineRepository,
            PipelineOpportunityRepository pipelineOpportunityRepository,
            ContractRepository contractRepository,
            InvoiceRepository invoiceRepository,
            CertificationRepository certificationRepository,
            AuditService auditService) {
        this.reportRepository = reportRepository;
        this.dashboardRepository = dashboardRepository;
        this.widgetRepository = widgetRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.opportunityRepository = opportunityRepository;
        this.pipelineRepository = pipelineRepository;
        this.pipelineOpportunityRepository = pipelineOpportunityRepository;
        this.contractRepository = contractRepository;
        this.invoiceRepository = invoiceRepository;
        this.certificationRepository = certificationRepository;
        this.auditService = auditService;
    }

    // ==================== DTOs ====================

    public record CreateReportRequest(
        String name,
        String description,
        ReportType reportType,
        ReportFormat defaultFormat,
        String configuration,
        String filters,
        String columns,
        String sortOrder,
        String grouping,
        String chartConfig
    ) {}

    public record UpdateReportRequest(
        String name,
        String description,
        ReportFormat defaultFormat,
        String configuration,
        String filters,
        String columns,
        String sortOrder,
        String grouping,
        String chartConfig
    ) {}

    public record ScheduleReportRequest(
        ScheduleFrequency frequency,
        String cronExpression,
        String recipients
    ) {}

    public record CreateDashboardRequest(
        String name,
        String description,
        DashboardType dashboardType,
        String layoutConfig,
        String globalFilters,
        Boolean autoRefresh,
        Integer refreshIntervalSeconds,
        String defaultDateRange,
        String theme
    ) {}

    public record UpdateDashboardRequest(
        String name,
        String description,
        String layoutConfig,
        String globalFilters,
        Boolean autoRefresh,
        Integer refreshIntervalSeconds,
        String defaultDateRange,
        String theme
    ) {}

    public record CreateWidgetRequest(
        String title,
        String description,
        WidgetType widgetType,
        DataSource dataSource,
        Integer gridX,
        Integer gridY,
        Integer gridWidth,
        Integer gridHeight,
        String dataConfig,
        String queryConfig,
        String visualConfig,
        String drillDownConfig,
        String thresholds,
        UUID linkedReportId,
        Integer refreshIntervalSeconds,
        Integer cacheDurationSeconds
    ) {}

    public record UpdateWidgetRequest(
        String title,
        String description,
        Integer gridX,
        Integer gridY,
        Integer gridWidth,
        Integer gridHeight,
        String dataConfig,
        String queryConfig,
        String visualConfig,
        String drillDownConfig,
        String thresholds,
        UUID linkedReportId,
        Integer refreshIntervalSeconds,
        Integer cacheDurationSeconds,
        Boolean isVisible,
        Boolean isCollapsed
    ) {}

    // Analytics summary DTOs
    public record ExecutiveSummaryDto(
        long totalOpportunities,
        BigDecimal pipelineValue,
        long activeContracts,
        BigDecimal contractValue,
        BigDecimal totalInvoiced,
        BigDecimal outstandingBalance,
        long expiringCertifications,
        Double averageWinRate
    ) {}

    public record PipelineSummaryDto(
        long totalOpportunities,
        BigDecimal totalValue,
        BigDecimal weightedValue,
        Map<String, Long> byStage,
        Map<String, BigDecimal> valueByStage,
        List<TopOpportunityDto> topOpportunities
    ) {}

    public record TopOpportunityDto(
        String opportunityId,
        String title,
        BigDecimal estimatedValue,
        String stage,
        LocalDate dueDate
    ) {}

    public record WinLossAnalysisDto(
        long totalWins,
        long totalLosses,
        Double winRate,
        BigDecimal totalWonValue,
        BigDecimal averageWonValue,
        Map<String, Double> winRateByAgency,
        Map<String, Double> winRateByNaics
    ) {}

    public record FinancialSummaryDto(
        BigDecimal totalBacklog,
        BigDecimal totalInvoiced,
        BigDecimal totalPaid,
        BigDecimal totalOutstanding,
        BigDecimal overdueAmount,
        Map<String, BigDecimal> revenueByMonth,
        List<InvoiceAgingDto> agingBuckets
    ) {}

    public record InvoiceAgingDto(
        String bucket,
        int count,
        BigDecimal amount
    ) {}

    public record ComplianceSummaryDto(
        long totalCertifications,
        long activeCertifications,
        long expiringSoon,
        long expired,
        Map<String, Long> byType,
        List<ExpiringItemDto> upcomingExpirations
    ) {}

    public record ExpiringItemDto(
        UUID id,
        String name,
        String type,
        LocalDate expirationDate,
        int daysUntilExpiration
    ) {}

    // ==================== Report Operations ====================

    public Page<SavedReport> listReports(UUID tenantId, Pageable pageable) {
        return reportRepository.findByTenantIdAndIsActiveTrue(tenantId, pageable);
    }

    public Optional<SavedReport> getReport(UUID tenantId, UUID reportId) {
        return reportRepository.findByTenantIdAndId(tenantId, reportId);
    }

    public SavedReport createReport(UUID tenantId, UUID userId, CreateReportRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SavedReport report = new SavedReport();
        report.setTenant(tenant);
        report.setOwner(user);
        report.setName(request.name());
        report.setDescription(request.description());
        report.setReportType(request.reportType());
        report.setDefaultFormat(request.defaultFormat() != null ? request.defaultFormat() : ReportFormat.HTML);
        report.setConfiguration(request.configuration());
        report.setFilters(request.filters());
        report.setColumns(request.columns());
        report.setSortOrder(request.sortOrder());
        report.setGrouping(request.grouping());
        report.setChartConfig(request.chartConfig());

        SavedReport saved = reportRepository.save(report);
        auditService.logAction(AuditAction.REPORT_GENERATED, "SavedReport", saved.getId().toString(),
                "Created report: " + saved.getName());
        return saved;
    }

    public Optional<SavedReport> updateReport(UUID tenantId, UUID reportId, UpdateReportRequest request) {
        return reportRepository.findByTenantIdAndId(tenantId, reportId)
                .map(report -> {
                    if (request.name() != null) report.setName(request.name());
                    if (request.description() != null) report.setDescription(request.description());
                    if (request.defaultFormat() != null) report.setDefaultFormat(request.defaultFormat());
                    if (request.configuration() != null) report.setConfiguration(request.configuration());
                    if (request.filters() != null) report.setFilters(request.filters());
                    if (request.columns() != null) report.setColumns(request.columns());
                    if (request.sortOrder() != null) report.setSortOrder(request.sortOrder());
                    if (request.grouping() != null) report.setGrouping(request.grouping());
                    if (request.chartConfig() != null) report.setChartConfig(request.chartConfig());
                    return reportRepository.save(report);
                });
    }

    public boolean deleteReport(UUID tenantId, UUID reportId) {
        return reportRepository.findByTenantIdAndId(tenantId, reportId)
                .map(report -> {
                    report.setIsActive(false);
                    reportRepository.save(report);
                    return true;
                })
                .orElse(false);
    }

    public Optional<SavedReport> scheduleReport(UUID tenantId, UUID reportId, ScheduleReportRequest request) {
        return reportRepository.findByTenantIdAndId(tenantId, reportId)
                .map(report -> {
                    report.setIsScheduled(true);
                    report.setScheduleFrequency(request.frequency());
                    report.setScheduleCron(request.cronExpression());
                    report.setScheduleRecipients(request.recipients());
                    report.setNextRunAt(calculateNextRunTime(request.frequency()));
                    return reportRepository.save(report);
                });
    }

    public Optional<SavedReport> unscheduleReport(UUID tenantId, UUID reportId) {
        return reportRepository.findByTenantIdAndId(tenantId, reportId)
                .map(report -> {
                    report.setIsScheduled(false);
                    report.setNextRunAt(null);
                    return reportRepository.save(report);
                });
    }

    public Optional<SavedReport> toggleReportFavorite(UUID tenantId, UUID reportId) {
        return reportRepository.findByTenantIdAndId(tenantId, reportId)
                .map(report -> {
                    report.setIsFavorite(!report.getIsFavorite());
                    return reportRepository.save(report);
                });
    }

    public void recordReportRun(UUID reportId) {
        reportRepository.findById(reportId).ifPresent(report -> {
            report.recordRun();
            if (report.getIsScheduled()) {
                report.setNextRunAt(calculateNextRunTime(report.getScheduleFrequency()));
            }
            reportRepository.save(report);
        });
    }

    public Page<SavedReport> searchReports(UUID tenantId, String keyword, Pageable pageable) {
        return reportRepository.searchReports(tenantId, keyword, pageable);
    }

    public List<SavedReport> getReportsByType(UUID tenantId, ReportType type) {
        return reportRepository.findByTenantIdAndReportTypeAndIsActiveTrue(tenantId, type);
    }

    public List<SavedReport> getFavoriteReports(UUID userId) {
        return reportRepository.findFavoriteReports(userId);
    }

    public Page<SavedReport> getUserReports(UUID userId, Pageable pageable) {
        return reportRepository.findByOwnerIdAndIsActiveTrue(userId, pageable);
    }

    // ==================== Dashboard Operations ====================

    public Page<Dashboard> listDashboards(UUID tenantId, Pageable pageable) {
        return dashboardRepository.findByTenantIdAndIsActiveTrue(tenantId, pageable);
    }

    public Optional<Dashboard> getDashboard(UUID tenantId, UUID dashboardId) {
        Optional<Dashboard> dashboard = dashboardRepository.findByTenantIdAndId(tenantId, dashboardId);
        dashboard.ifPresent(d -> {
            d.recordView();
            dashboardRepository.save(d);
        });
        return dashboard;
    }

    public Dashboard createDashboard(UUID tenantId, UUID userId, CreateDashboardRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Dashboard dashboard = new Dashboard();
        dashboard.setTenant(tenant);
        dashboard.setOwner(user);
        dashboard.setName(request.name());
        dashboard.setDescription(request.description());
        dashboard.setDashboardType(request.dashboardType());
        dashboard.setLayoutConfig(request.layoutConfig());
        dashboard.setGlobalFilters(request.globalFilters());
        dashboard.setAutoRefresh(request.autoRefresh() != null ? request.autoRefresh() : false);
        dashboard.setRefreshIntervalSeconds(request.refreshIntervalSeconds());
        dashboard.setDefaultDateRange(request.defaultDateRange());
        dashboard.setTheme(request.theme());

        return dashboardRepository.save(dashboard);
    }

    public Optional<Dashboard> updateDashboard(UUID tenantId, UUID dashboardId, UpdateDashboardRequest request) {
        return dashboardRepository.findByTenantIdAndId(tenantId, dashboardId)
                .map(dashboard -> {
                    if (request.name() != null) dashboard.setName(request.name());
                    if (request.description() != null) dashboard.setDescription(request.description());
                    if (request.layoutConfig() != null) dashboard.setLayoutConfig(request.layoutConfig());
                    if (request.globalFilters() != null) dashboard.setGlobalFilters(request.globalFilters());
                    if (request.autoRefresh() != null) dashboard.setAutoRefresh(request.autoRefresh());
                    if (request.refreshIntervalSeconds() != null) dashboard.setRefreshIntervalSeconds(request.refreshIntervalSeconds());
                    if (request.defaultDateRange() != null) dashboard.setDefaultDateRange(request.defaultDateRange());
                    if (request.theme() != null) dashboard.setTheme(request.theme());
                    return dashboardRepository.save(dashboard);
                });
    }

    public boolean deleteDashboard(UUID tenantId, UUID dashboardId) {
        return dashboardRepository.findByTenantIdAndId(tenantId, dashboardId)
                .map(dashboard -> {
                    dashboard.setIsActive(false);
                    dashboardRepository.save(dashboard);
                    return true;
                })
                .orElse(false);
    }

    public Optional<Dashboard> setDefaultDashboard(UUID tenantId, UUID dashboardId) {
        return dashboardRepository.findByTenantIdAndId(tenantId, dashboardId)
                .map(dashboard -> {
                    // Clear existing default for this type
                    dashboardRepository.findByTenantIdAndDashboardTypeAndIsDefaultTrueAndIsActiveTrue(
                            tenantId, dashboard.getDashboardType()
                    ).ifPresent(existing -> {
                        existing.setIsDefault(false);
                        dashboardRepository.save(existing);
                    });

                    dashboard.setIsDefault(true);
                    return dashboardRepository.save(dashboard);
                });
    }

    public Optional<Dashboard> toggleDashboardFavorite(UUID tenantId, UUID dashboardId) {
        return dashboardRepository.findByTenantIdAndId(tenantId, dashboardId)
                .map(dashboard -> {
                    dashboard.setIsFavorite(!dashboard.getIsFavorite());
                    return dashboardRepository.save(dashboard);
                });
    }

    public Page<Dashboard> searchDashboards(UUID tenantId, String keyword, Pageable pageable) {
        return dashboardRepository.searchDashboards(tenantId, keyword, pageable);
    }

    public List<Dashboard> getDashboardsByType(UUID tenantId, DashboardType type) {
        return dashboardRepository.findByTenantIdAndDashboardTypeAndIsActiveTrue(tenantId, type);
    }

    public List<Dashboard> getFavoriteDashboards(UUID userId) {
        return dashboardRepository.findFavoriteDashboards(userId);
    }

    // ==================== Widget Operations ====================

    public List<DashboardWidget> getDashboardWidgets(UUID dashboardId) {
        return widgetRepository.findByDashboardIdAndIsVisibleTrueOrderBySortOrderAsc(dashboardId);
    }

    public Optional<DashboardWidget> addWidget(UUID tenantId, UUID dashboardId, CreateWidgetRequest request) {
        return dashboardRepository.findByTenantIdAndId(tenantId, dashboardId)
                .map(dashboard -> {
                    DashboardWidget widget = new DashboardWidget();
                    widget.setDashboard(dashboard);
                    widget.setTitle(request.title());
                    widget.setDescription(request.description());
                    widget.setWidgetType(request.widgetType());
                    widget.setDataSource(request.dataSource());
                    widget.setGridX(request.gridX() != null ? request.gridX() : 0);
                    widget.setGridY(request.gridY() != null ? request.gridY() : 0);
                    widget.setGridWidth(request.gridWidth() != null ? request.gridWidth() : 4);
                    widget.setGridHeight(request.gridHeight() != null ? request.gridHeight() : 3);
                    widget.setDataConfig(request.dataConfig());
                    widget.setQueryConfig(request.queryConfig());
                    widget.setVisualConfig(request.visualConfig());
                    widget.setDrillDownConfig(request.drillDownConfig());
                    widget.setThresholds(request.thresholds());
                    widget.setRefreshIntervalSeconds(request.refreshIntervalSeconds());
                    widget.setCacheDurationSeconds(request.cacheDurationSeconds());

                    if (request.linkedReportId() != null) {
                        reportRepository.findById(request.linkedReportId()).ifPresent(widget::setLinkedReport);
                    }

                    Integer maxOrder = widgetRepository.findMaxSortOrderByDashboardId(dashboardId);
                    widget.setSortOrder(maxOrder != null ? maxOrder + 1 : 0);

                    return widgetRepository.save(widget);
                });
    }

    public Optional<DashboardWidget> updateWidget(UUID dashboardId, UUID widgetId, UpdateWidgetRequest request) {
        return widgetRepository.findByDashboardIdAndId(dashboardId, widgetId)
                .map(widget -> {
                    if (request.title() != null) widget.setTitle(request.title());
                    if (request.description() != null) widget.setDescription(request.description());
                    if (request.gridX() != null) widget.setGridX(request.gridX());
                    if (request.gridY() != null) widget.setGridY(request.gridY());
                    if (request.gridWidth() != null) widget.setGridWidth(request.gridWidth());
                    if (request.gridHeight() != null) widget.setGridHeight(request.gridHeight());
                    if (request.dataConfig() != null) widget.setDataConfig(request.dataConfig());
                    if (request.queryConfig() != null) widget.setQueryConfig(request.queryConfig());
                    if (request.visualConfig() != null) widget.setVisualConfig(request.visualConfig());
                    if (request.drillDownConfig() != null) widget.setDrillDownConfig(request.drillDownConfig());
                    if (request.thresholds() != null) widget.setThresholds(request.thresholds());
                    if (request.refreshIntervalSeconds() != null) widget.setRefreshIntervalSeconds(request.refreshIntervalSeconds());
                    if (request.cacheDurationSeconds() != null) widget.setCacheDurationSeconds(request.cacheDurationSeconds());
                    if (request.isVisible() != null) widget.setIsVisible(request.isVisible());
                    if (request.isCollapsed() != null) widget.setIsCollapsed(request.isCollapsed());

                    if (request.linkedReportId() != null) {
                        reportRepository.findById(request.linkedReportId()).ifPresent(widget::setLinkedReport);
                    }

                    return widgetRepository.save(widget);
                });
    }

    public boolean deleteWidget(UUID dashboardId, UUID widgetId) {
        return widgetRepository.findByDashboardIdAndId(dashboardId, widgetId)
                .map(widget -> {
                    widgetRepository.delete(widget);
                    return true;
                })
                .orElse(false);
    }

    // ==================== Analytics Data Operations ====================

    public ExecutiveSummaryDto getExecutiveSummary(UUID tenantId) {
        long totalOpportunities = opportunityRepository.count();
        BigDecimal pipelineValue = pipelineOpportunityRepository.sumEstimatedValueByTenantId(tenantId)
                .orElse(BigDecimal.ZERO);
        long activeContracts = contractRepository.countByTenantIdAndStatusIn(tenantId,
                List.of(Contract.ContractStatus.ACTIVE, Contract.ContractStatus.AWARDED));
        BigDecimal contractValue = contractRepository.sumTotalValueByTenantId(tenantId)
                .orElse(BigDecimal.ZERO);
        BigDecimal totalInvoiced = invoiceRepository.sumTotalInvoicedByTenantId(tenantId)
                .orElse(BigDecimal.ZERO);
        BigDecimal outstanding = invoiceRepository.sumOutstandingByTenantId(tenantId)
                .orElse(BigDecimal.ZERO);
        List<Certification> expiring = certificationRepository.findExpiringWithinDays(tenantId, 30);

        return new ExecutiveSummaryDto(
            totalOpportunities,
            pipelineValue,
            activeContracts,
            contractValue,
            totalInvoiced,
            outstanding,
            expiring.size(),
            calculateAverageWinRate(tenantId)
        );
    }

    public PipelineSummaryDto getPipelineSummary(UUID tenantId) {
        List<PipelineOpportunity> opportunities = pipelineOpportunityRepository.findByTenantIdWithDetails(tenantId);

        long totalOpportunities = opportunities.size();
        BigDecimal totalValue = opportunities.stream()
                .map(PipelineOpportunity::getEstimatedValue)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal weightedValue = opportunities.stream()
                .filter(o -> o.getEstimatedValue() != null && o.getProbabilityOfWin() != null)
                .map(o -> o.getEstimatedValue().multiply(BigDecimal.valueOf(o.getProbabilityOfWin() / 100.0)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> byStage = new HashMap<>();
        Map<String, BigDecimal> valueByStage = new HashMap<>();

        for (PipelineOpportunity opp : opportunities) {
            String stageName = opp.getStage().getName();
            byStage.merge(stageName, 1L, Long::sum);
            if (opp.getEstimatedValue() != null) {
                valueByStage.merge(stageName, opp.getEstimatedValue(), BigDecimal::add);
            }
        }

        List<TopOpportunityDto> topOpportunities = opportunities.stream()
                .filter(o -> o.getEstimatedValue() != null)
                .sorted((a, b) -> b.getEstimatedValue().compareTo(a.getEstimatedValue()))
                .limit(10)
                .map(o -> new TopOpportunityDto(
                    o.getOpportunity().getSolicitationNumber(),
                    o.getOpportunity().getTitle(),
                    o.getEstimatedValue(),
                    o.getStage().getName(),
                    o.getOpportunity().getResponseDeadLine()
                ))
                .toList();

        return new PipelineSummaryDto(
            totalOpportunities,
            totalValue,
            weightedValue,
            byStage,
            valueByStage,
            topOpportunities
        );
    }

    public FinancialSummaryDto getFinancialSummary(UUID tenantId) {
        BigDecimal totalBacklog = contractRepository.sumRemainingValueByTenantId(tenantId)
                .orElse(BigDecimal.ZERO);
        BigDecimal totalInvoiced = invoiceRepository.sumTotalInvoicedByTenantId(tenantId)
                .orElse(BigDecimal.ZERO);
        BigDecimal totalPaid = invoiceRepository.sumPaidAmountByContractId(tenantId)
                .orElse(BigDecimal.ZERO);
        BigDecimal totalOutstanding = invoiceRepository.sumOutstandingByTenantId(tenantId)
                .orElse(BigDecimal.ZERO);

        List<Invoice> overdue = invoiceRepository.findOverdueInvoices(tenantId, LocalDate.now());
        BigDecimal overdueAmount = overdue.stream()
                .map(i -> i.getTotalAmount().subtract(i.getAmountPaid() != null ? i.getAmountPaid() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<InvoiceAgingDto> agingBuckets = calculateAgingBuckets(tenantId);

        return new FinancialSummaryDto(
            totalBacklog,
            totalInvoiced,
            totalPaid,
            totalOutstanding,
            overdueAmount,
            new HashMap<>(), // Revenue by month would require more complex query
            agingBuckets
        );
    }

    public ComplianceSummaryDto getComplianceSummary(UUID tenantId) {
        Page<Certification> allCerts = certificationRepository.findByTenantIdOrderByExpirationDateAsc(tenantId, Pageable.unpaged());
        List<Certification> active = certificationRepository.findByTenantIdAndStatus(tenantId, Certification.CertificationStatus.ACTIVE);
        List<Certification> expiringSoon = certificationRepository.findExpiringWithinDays(tenantId, 30);
        List<Certification> expired = certificationRepository.findByTenantIdAndStatus(tenantId, Certification.CertificationStatus.EXPIRED);

        Map<String, Long> byType = new HashMap<>();
        for (Certification cert : allCerts) {
            byType.merge(cert.getCertificationType().name(), 1L, Long::sum);
        }

        List<ExpiringItemDto> upcomingExpirations = expiringSoon.stream()
                .map(c -> new ExpiringItemDto(
                    c.getId(),
                    c.getName(),
                    c.getCertificationType().name(),
                    c.getExpirationDate(),
                    (int) ChronoUnit.DAYS.between(LocalDate.now(), c.getExpirationDate())
                ))
                .toList();

        return new ComplianceSummaryDto(
            allCerts.getTotalElements(),
            active.size(),
            expiringSoon.size(),
            expired.size(),
            byType,
            upcomingExpirations
        );
    }

    // Helper methods
    private Instant calculateNextRunTime(ScheduleFrequency frequency) {
        if (frequency == null) return null;
        return switch (frequency) {
            case DAILY -> Instant.now().plus(1, ChronoUnit.DAYS);
            case WEEKLY -> Instant.now().plus(7, ChronoUnit.DAYS);
            case BIWEEKLY -> Instant.now().plus(14, ChronoUnit.DAYS);
            case MONTHLY -> Instant.now().plus(30, ChronoUnit.DAYS);
            case QUARTERLY -> Instant.now().plus(90, ChronoUnit.DAYS);
            case ANNUALLY -> Instant.now().plus(365, ChronoUnit.DAYS);
            case CUSTOM -> Instant.now().plus(1, ChronoUnit.DAYS);
        };
    }

    private Double calculateAverageWinRate(UUID tenantId) {
        // This would require win/loss tracking which we can approximate
        return 35.0; // Placeholder - would need real win/loss data
    }

    private List<InvoiceAgingDto> calculateAgingBuckets(UUID tenantId) {
        List<Invoice> unpaid = invoiceRepository.findUnpaidInvoices(tenantId);
        LocalDate today = LocalDate.now();

        int current = 0, thirtyDays = 0, sixtyDays = 0, ninetyDays = 0, overNinety = 0;
        BigDecimal currentAmt = BigDecimal.ZERO, thirtyAmt = BigDecimal.ZERO, sixtyAmt = BigDecimal.ZERO;
        BigDecimal ninetyAmt = BigDecimal.ZERO, overNinetyAmt = BigDecimal.ZERO;

        for (Invoice inv : unpaid) {
            if (inv.getDueDate() == null) continue;
            long daysOverdue = ChronoUnit.DAYS.between(inv.getDueDate(), today);
            BigDecimal balance = inv.getTotalAmount().subtract(
                    inv.getAmountPaid() != null ? inv.getAmountPaid() : BigDecimal.ZERO);

            if (daysOverdue <= 0) {
                current++;
                currentAmt = currentAmt.add(balance);
            } else if (daysOverdue <= 30) {
                thirtyDays++;
                thirtyAmt = thirtyAmt.add(balance);
            } else if (daysOverdue <= 60) {
                sixtyDays++;
                sixtyAmt = sixtyAmt.add(balance);
            } else if (daysOverdue <= 90) {
                ninetyDays++;
                ninetyAmt = ninetyAmt.add(balance);
            } else {
                overNinety++;
                overNinetyAmt = overNinetyAmt.add(balance);
            }
        }

        return List.of(
            new InvoiceAgingDto("Current", current, currentAmt),
            new InvoiceAgingDto("1-30 Days", thirtyDays, thirtyAmt),
            new InvoiceAgingDto("31-60 Days", sixtyDays, sixtyAmt),
            new InvoiceAgingDto("61-90 Days", ninetyDays, ninetyAmt),
            new InvoiceAgingDto("Over 90 Days", overNinety, overNinetyAmt)
        );
    }
}
