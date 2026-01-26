package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "dashboard_widgets", indexes = {
    @Index(name = "idx_widget_dashboard", columnList = "dashboard_id"),
    @Index(name = "idx_widget_type", columnList = "widget_type")
})
public class DashboardWidget {

    public enum WidgetType {
        // Numbers/Stats
        SINGLE_METRIC,
        METRIC_COMPARISON,
        KPI_GAUGE,
        PROGRESS_INDICATOR,

        // Charts
        BAR_CHART,
        LINE_CHART,
        AREA_CHART,
        PIE_CHART,
        DONUT_CHART,
        FUNNEL_CHART,
        SCATTER_PLOT,
        HEATMAP,

        // Data displays
        TABLE,
        LIST,
        GRID,
        TIMELINE,
        CALENDAR,

        // Pipeline specific
        PIPELINE_KANBAN,
        PIPELINE_FUNNEL,

        // Geographic
        MAP,

        // Text/Info
        TEXT_BLOCK,
        MARKDOWN,
        ALERT_LIST,
        ACTIVITY_FEED,

        // Custom
        IFRAME,
        CUSTOM
    }

    public enum DataSource {
        OPPORTUNITIES,
        PIPELINE,
        CONTRACTS,
        INVOICES,
        BUDGET,
        COMPLIANCE,
        CERTIFICATIONS,
        USERS,
        ACTIVITY,
        CUSTOM_QUERY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_id", nullable = false)
    private Dashboard dashboard;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "widget_type", nullable = false)
    private WidgetType widgetType;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_source", nullable = false)
    private DataSource dataSource;

    // Position and size in grid
    @Column(name = "grid_x", nullable = false)
    private Integer gridX = 0;

    @Column(name = "grid_y", nullable = false)
    private Integer gridY = 0;

    @Column(name = "grid_width", nullable = false)
    private Integer gridWidth = 4;

    @Column(name = "grid_height", nullable = false)
    private Integer gridHeight = 3;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    // Data configuration (JSON)
    @Column(name = "data_config", columnDefinition = "TEXT")
    private String dataConfig;

    // Query/filter configuration (JSON)
    @Column(name = "query_config", columnDefinition = "TEXT")
    private String queryConfig;

    // Visual configuration (JSON - colors, labels, legend, etc.)
    @Column(name = "visual_config", columnDefinition = "TEXT")
    private String visualConfig;

    // Drill-down configuration (JSON)
    @Column(name = "drill_down_config", columnDefinition = "TEXT")
    private String drillDownConfig;

    // Thresholds/alerts (JSON)
    @Column(name = "thresholds", columnDefinition = "TEXT")
    private String thresholds;

    // Linked report
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_report_id")
    private SavedReport linkedReport;

    // Refresh settings (overrides dashboard default)
    @Column(name = "custom_refresh", nullable = false)
    private Boolean customRefresh = false;

    @Column(name = "refresh_interval_seconds")
    private Integer refreshIntervalSeconds;

    // Caching
    @Column(name = "cache_duration_seconds")
    private Integer cacheDurationSeconds;

    @Column(name = "last_data_refresh")
    private Instant lastDataRefresh;

    // Status
    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @Column(name = "is_collapsed", nullable = false)
    private Boolean isCollapsed = false;

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

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Dashboard getDashboard() {
        return dashboard;
    }

    public void setDashboard(Dashboard dashboard) {
        this.dashboard = dashboard;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public WidgetType getWidgetType() {
        return widgetType;
    }

    public void setWidgetType(WidgetType widgetType) {
        this.widgetType = widgetType;
    }

    public DataSource getDataSource() {
        return dataSource;
    }

    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Integer getGridX() {
        return gridX;
    }

    public void setGridX(Integer gridX) {
        this.gridX = gridX;
    }

    public Integer getGridY() {
        return gridY;
    }

    public void setGridY(Integer gridY) {
        this.gridY = gridY;
    }

    public Integer getGridWidth() {
        return gridWidth;
    }

    public void setGridWidth(Integer gridWidth) {
        this.gridWidth = gridWidth;
    }

    public Integer getGridHeight() {
        return gridHeight;
    }

    public void setGridHeight(Integer gridHeight) {
        this.gridHeight = gridHeight;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getDataConfig() {
        return dataConfig;
    }

    public void setDataConfig(String dataConfig) {
        this.dataConfig = dataConfig;
    }

    public String getQueryConfig() {
        return queryConfig;
    }

    public void setQueryConfig(String queryConfig) {
        this.queryConfig = queryConfig;
    }

    public String getVisualConfig() {
        return visualConfig;
    }

    public void setVisualConfig(String visualConfig) {
        this.visualConfig = visualConfig;
    }

    public String getDrillDownConfig() {
        return drillDownConfig;
    }

    public void setDrillDownConfig(String drillDownConfig) {
        this.drillDownConfig = drillDownConfig;
    }

    public String getThresholds() {
        return thresholds;
    }

    public void setThresholds(String thresholds) {
        this.thresholds = thresholds;
    }

    public SavedReport getLinkedReport() {
        return linkedReport;
    }

    public void setLinkedReport(SavedReport linkedReport) {
        this.linkedReport = linkedReport;
    }

    public Boolean getCustomRefresh() {
        return customRefresh;
    }

    public void setCustomRefresh(Boolean customRefresh) {
        this.customRefresh = customRefresh;
    }

    public Integer getRefreshIntervalSeconds() {
        return refreshIntervalSeconds;
    }

    public void setRefreshIntervalSeconds(Integer refreshIntervalSeconds) {
        this.refreshIntervalSeconds = refreshIntervalSeconds;
    }

    public Integer getCacheDurationSeconds() {
        return cacheDurationSeconds;
    }

    public void setCacheDurationSeconds(Integer cacheDurationSeconds) {
        this.cacheDurationSeconds = cacheDurationSeconds;
    }

    public Instant getLastDataRefresh() {
        return lastDataRefresh;
    }

    public void setLastDataRefresh(Instant lastDataRefresh) {
        this.lastDataRefresh = lastDataRefresh;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }

    public Boolean getIsCollapsed() {
        return isCollapsed;
    }

    public void setIsCollapsed(Boolean isCollapsed) {
        this.isCollapsed = isCollapsed;
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
