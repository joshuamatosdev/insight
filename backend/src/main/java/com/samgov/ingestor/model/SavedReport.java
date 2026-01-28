package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "saved_reports", indexes = {
    @Index(name = "idx_report_tenant", columnList = "tenant_id"),
    @Index(name = "idx_report_type", columnList = "report_type"),
    @Index(name = "idx_report_owner", columnList = "owner_id"),
    @Index(name = "idx_report_scheduled", columnList = "is_scheduled")
})
public class SavedReport {

    public enum ReportType {
        // Pipeline Reports
        PIPELINE_SUMMARY,
        PIPELINE_BY_STAGE,
        PIPELINE_BY_VALUE,
        PIPELINE_FORECAST,

        // Win/Loss Analysis
        WIN_LOSS_ANALYSIS,
        WIN_RATE_BY_AGENCY,
        WIN_RATE_BY_NAICS,
        WIN_RATE_BY_SET_ASIDE,

        // Contract Reports
        CONTRACT_PORTFOLIO,
        CONTRACT_PERFORMANCE,
        CONTRACT_EXPIRING,
        CONTRACT_VALUE_SUMMARY,

        // Financial Reports
        REVENUE_FORECAST,
        BACKLOG_REPORT,
        AR_AGING,
        INVOICE_STATUS,
        BUDGET_VARIANCE,
        BURN_RATE,

        // Compliance Reports
        CERTIFICATION_STATUS,
        EXPIRING_CERTIFICATIONS,
        CLEARANCE_STATUS,
        COMPLIANCE_OVERVIEW,

        // Activity Reports
        USER_ACTIVITY,
        OPPORTUNITY_ACTIVITY,
        BD_ACTIVITY,

        // Custom
        CUSTOM
    }

    public enum ReportFormat {
        HTML,
        PDF,
        EXCEL,
        CSV,
        JSON
    }

    public enum ScheduleFrequency {
        DAILY,
        WEEKLY,
        BIWEEKLY,
        MONTHLY,
        QUARTERLY,
        ANNUALLY,
        CUSTOM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_format", nullable = false)
    private ReportFormat defaultFormat = ReportFormat.HTML;

    // Report configuration (JSON)
    @Column(name = "configuration", columnDefinition = "TEXT")
    private String configuration;

    // Filters (JSON)
    @Column(name = "filters", columnDefinition = "TEXT")
    private String filters;

    // Columns/fields to include (JSON)
    @Column(name = "columns", columnDefinition = "TEXT")
    private String columns;

    // Sort order (JSON)
    @Column(name = "sort_order", columnDefinition = "TEXT")
    private String sortOrder;

    // Grouping (JSON)
    @Column(name = "grouping", columnDefinition = "TEXT")
    private String grouping;

    // Chart configuration (JSON)
    @Column(name = "chart_config", columnDefinition = "TEXT")
    private String chartConfig;

    // Scheduling
    @Column(name = "is_scheduled", nullable = false)
    private Boolean isScheduled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_frequency")
    private ScheduleFrequency scheduleFrequency;

    @Column(name = "schedule_cron")
    private String scheduleCron;

    @Column(name = "schedule_recipients", columnDefinition = "TEXT")
    private String scheduleRecipients;

    @Column(name = "last_run_at")
    private Instant lastRunAt;

    @Column(name = "next_run_at")
    private Instant nextRunAt;

    // Sharing
    @Column(name = "is_shared", nullable = false)
    private Boolean isShared = false;

    @Column(name = "shared_with_roles", columnDefinition = "TEXT")
    private String sharedWithRoles;

    @Column(name = "shared_with_users", columnDefinition = "TEXT")
    private String sharedWithUsers;

    // Usage tracking
    @Column(name = "run_count", nullable = false)
    private Integer runCount = 0;

    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_favorite", nullable = false)
    private Boolean isFavorite = false;

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void recordRun() {
        this.runCount++;
        this.lastRunAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public ReportFormat getDefaultFormat() {
        return defaultFormat;
    }

    public void setDefaultFormat(ReportFormat defaultFormat) {
        this.defaultFormat = defaultFormat;
    }

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }

    public String getFilters() {
        return filters;
    }

    public void setFilters(String filters) {
        this.filters = filters;
    }

    public String getColumns() {
        return columns;
    }

    public void setColumns(String columns) {
        this.columns = columns;
    }

    public String getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getGrouping() {
        return grouping;
    }

    public void setGrouping(String grouping) {
        this.grouping = grouping;
    }

    public String getChartConfig() {
        return chartConfig;
    }

    public void setChartConfig(String chartConfig) {
        this.chartConfig = chartConfig;
    }

    public Boolean getIsScheduled() {
        return isScheduled;
    }

    public void setIsScheduled(Boolean isScheduled) {
        this.isScheduled = isScheduled;
    }

    public ScheduleFrequency getScheduleFrequency() {
        return scheduleFrequency;
    }

    public void setScheduleFrequency(ScheduleFrequency scheduleFrequency) {
        this.scheduleFrequency = scheduleFrequency;
    }

    public String getScheduleCron() {
        return scheduleCron;
    }

    public void setScheduleCron(String scheduleCron) {
        this.scheduleCron = scheduleCron;
    }

    public String getScheduleRecipients() {
        return scheduleRecipients;
    }

    public void setScheduleRecipients(String scheduleRecipients) {
        this.scheduleRecipients = scheduleRecipients;
    }

    public Instant getLastRunAt() {
        return lastRunAt;
    }

    public void setLastRunAt(Instant lastRunAt) {
        this.lastRunAt = lastRunAt;
    }

    public Instant getNextRunAt() {
        return nextRunAt;
    }

    public void setNextRunAt(Instant nextRunAt) {
        this.nextRunAt = nextRunAt;
    }

    public Boolean getIsShared() {
        return isShared;
    }

    public void setIsShared(Boolean isShared) {
        this.isShared = isShared;
    }

    public String getSharedWithRoles() {
        return sharedWithRoles;
    }

    public void setSharedWithRoles(String sharedWithRoles) {
        this.sharedWithRoles = sharedWithRoles;
    }

    public String getSharedWithUsers() {
        return sharedWithUsers;
    }

    public void setSharedWithUsers(String sharedWithUsers) {
        this.sharedWithUsers = sharedWithUsers;
    }

    public Integer getRunCount() {
        return runCount;
    }

    public void setRunCount(Integer runCount) {
        this.runCount = runCount;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsFavorite() {
        return isFavorite;
    }

    public void setIsFavorite(Boolean isFavorite) {
        this.isFavorite = isFavorite;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
