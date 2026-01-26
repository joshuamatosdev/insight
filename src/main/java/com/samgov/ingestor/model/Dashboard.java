package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "dashboards", indexes = {
    @Index(name = "idx_dashboard_tenant", columnList = "tenant_id"),
    @Index(name = "idx_dashboard_owner", columnList = "owner_id"),
    @Index(name = "idx_dashboard_type", columnList = "dashboard_type")
})
public class Dashboard {

    public enum DashboardType {
        EXECUTIVE,
        PIPELINE,
        CONTRACT,
        FINANCIAL,
        COMPLIANCE,
        BD,
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

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "dashboard_type", nullable = false)
    private DashboardType dashboardType;

    @OneToMany(mappedBy = "dashboard", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<DashboardWidget> widgets = new ArrayList<>();

    // Layout configuration (JSON - grid positions, sizes, etc.)
    @Column(name = "layout_config", columnDefinition = "TEXT")
    private String layoutConfig;

    // Global filters (JSON)
    @Column(name = "global_filters", columnDefinition = "TEXT")
    private String globalFilters;

    // Refresh settings
    @Column(name = "auto_refresh", nullable = false)
    private Boolean autoRefresh = false;

    @Column(name = "refresh_interval_seconds")
    private Integer refreshIntervalSeconds;

    // Default date range
    @Column(name = "default_date_range")
    private String defaultDateRange;

    // Sharing
    @Column(name = "is_shared", nullable = false)
    private Boolean isShared = false;

    @Column(name = "shared_with_roles", columnDefinition = "TEXT")
    private String sharedWithRoles;

    @Column(name = "shared_with_users", columnDefinition = "TEXT")
    private String sharedWithUsers;

    // Status
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_favorite", nullable = false)
    private Boolean isFavorite = false;

    // Theme/styling
    @Column(name = "theme")
    private String theme;

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "last_viewed_at")
    private Instant lastViewedAt;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void addWidget(DashboardWidget widget) {
        widgets.add(widget);
        widget.setDashboard(this);
    }

    public void removeWidget(DashboardWidget widget) {
        widgets.remove(widget);
        widget.setDashboard(null);
    }

    public void recordView() {
        this.viewCount++;
        this.lastViewedAt = Instant.now();
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

    public DashboardType getDashboardType() {
        return dashboardType;
    }

    public void setDashboardType(DashboardType dashboardType) {
        this.dashboardType = dashboardType;
    }

    public List<DashboardWidget> getWidgets() {
        return widgets;
    }

    public void setWidgets(List<DashboardWidget> widgets) {
        this.widgets = widgets;
    }

    public String getLayoutConfig() {
        return layoutConfig;
    }

    public void setLayoutConfig(String layoutConfig) {
        this.layoutConfig = layoutConfig;
    }

    public String getGlobalFilters() {
        return globalFilters;
    }

    public void setGlobalFilters(String globalFilters) {
        this.globalFilters = globalFilters;
    }

    public Boolean getAutoRefresh() {
        return autoRefresh;
    }

    public void setAutoRefresh(Boolean autoRefresh) {
        this.autoRefresh = autoRefresh;
    }

    public Integer getRefreshIntervalSeconds() {
        return refreshIntervalSeconds;
    }

    public void setRefreshIntervalSeconds(Integer refreshIntervalSeconds) {
        this.refreshIntervalSeconds = refreshIntervalSeconds;
    }

    public String getDefaultDateRange() {
        return defaultDateRange;
    }

    public void setDefaultDateRange(String defaultDateRange) {
        this.defaultDateRange = defaultDateRange;
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

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
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

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
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

    public Instant getLastViewedAt() {
        return lastViewedAt;
    }

    public void setLastViewedAt(Instant lastViewedAt) {
        this.lastViewedAt = lastViewedAt;
    }

    public Integer getViewCount() {
        return viewCount;
    }

    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }
}
