package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Dashboard.DashboardType;
import com.samgov.ingestor.model.DashboardWidget.DataSource;
import com.samgov.ingestor.model.DashboardWidget.WidgetType;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final DashboardWidgetRepository widgetRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DashboardService(DashboardRepository dashboardRepository, DashboardWidgetRepository widgetRepository,
                            TenantRepository tenantRepository, UserRepository userRepository,
                            AuditService auditService) {
        this.dashboardRepository = dashboardRepository;
        this.widgetRepository = widgetRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public record CreateDashboardRequest(String name, String description, DashboardType dashboardType,
                                          Boolean isDefault, String layoutConfig) {}
    public record CreateWidgetRequest(String title, WidgetType widgetType, DataSource dataSource,
                                       String dataConfig, Integer gridX, Integer gridY,
                                       Integer gridWidth, Integer gridHeight) {}
    public record DashboardResponse(UUID id, String name, String description, DashboardType dashboardType,
                                     Boolean isDefault, String layoutConfig, List<WidgetResponse> widgets,
                                     Instant createdAt) {}
    public record WidgetResponse(UUID id, String title, WidgetType widgetType, DataSource dataSource,
                                  String dataConfig, Integer gridX, Integer gridY,
                                  Integer gridWidth, Integer gridHeight) {}

    public DashboardResponse createDashboard(UUID tenantId, UUID userId, CreateDashboardRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Dashboard dashboard = new Dashboard();
        dashboard.setTenant(tenant);
        dashboard.setOwner(user);
        dashboard.setName(request.name());
        dashboard.setDescription(request.description());
        dashboard.setDashboardType(request.dashboardType() != null ? request.dashboardType() : DashboardType.CUSTOM);
        dashboard.setIsDefault(request.isDefault() != null ? request.isDefault() : false);
        dashboard.setLayoutConfig(request.layoutConfig());

        dashboard = dashboardRepository.save(dashboard);
        auditService.logAction(AuditAction.PIPELINE_CREATED, "Dashboard", dashboard.getId().toString(),
                "Created dashboard: " + request.name());

        return toResponse(dashboard);
    }

    public WidgetResponse addWidget(UUID tenantId, UUID dashboardId, UUID userId, CreateWidgetRequest request) {
        Dashboard dashboard = dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard not found"));

        if (!dashboard.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Dashboard does not belong to tenant");
        }

        DashboardWidget widget = new DashboardWidget();
        widget.setDashboard(dashboard);
        widget.setTitle(request.title());
        widget.setWidgetType(request.widgetType());
        widget.setDataSource(request.dataSource() != null ? request.dataSource() : DataSource.OPPORTUNITIES);
        widget.setDataConfig(request.dataConfig());
        widget.setGridX(request.gridX() != null ? request.gridX() : 0);
        widget.setGridY(request.gridY() != null ? request.gridY() : 0);
        widget.setGridWidth(request.gridWidth() != null ? request.gridWidth() : 4);
        widget.setGridHeight(request.gridHeight() != null ? request.gridHeight() : 3);

        widget = widgetRepository.save(widget);
        return toWidgetResponse(widget);
    }

    @Transactional(readOnly = true)
    public Page<DashboardResponse> getDashboards(UUID tenantId, Pageable pageable) {
        return dashboardRepository.findByTenantIdAndIsActiveTrue(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<DashboardResponse> getDashboard(UUID dashboardId) {
        return dashboardRepository.findById(dashboardId).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<DashboardResponse> getDefaultDashboard(UUID tenantId, UUID userId) {
        return dashboardRepository.findByOwnerIdAndIsDefaultTrueAndIsActiveTrue(userId)
                .map(this::toResponse);
    }

    public void deleteWidget(UUID tenantId, UUID widgetId, UUID userId) {
        DashboardWidget widget = widgetRepository.findById(widgetId)
                .orElseThrow(() -> new IllegalArgumentException("Widget not found"));

        if (!widget.getDashboard().getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Widget does not belong to tenant");
        }

        widgetRepository.delete(widget);
    }

    public void deleteDashboard(UUID tenantId, UUID dashboardId, UUID userId) {
        Dashboard dashboard = dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard not found"));

        if (!dashboard.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Dashboard does not belong to tenant");
        }

        dashboardRepository.delete(dashboard);
        auditService.logAction(AuditAction.PIPELINE_DELETED, "Dashboard", dashboardId.toString(),
                "Deleted dashboard: " + dashboard.getName());
    }

    private DashboardResponse toResponse(Dashboard dashboard) {
        List<WidgetResponse> widgets = dashboard.getWidgets() != null ?
                dashboard.getWidgets().stream().map(this::toWidgetResponse).toList() : Collections.emptyList();

        return new DashboardResponse(dashboard.getId(), dashboard.getName(), dashboard.getDescription(),
                dashboard.getDashboardType(), dashboard.getIsDefault(), dashboard.getLayoutConfig(),
                widgets, dashboard.getCreatedAt());
    }

    private WidgetResponse toWidgetResponse(DashboardWidget widget) {
        return new WidgetResponse(widget.getId(), widget.getTitle(), widget.getWidgetType(),
                widget.getDataSource(), widget.getDataConfig(), widget.getGridX(), widget.getGridY(),
                widget.getGridWidth(), widget.getGridHeight());
    }
}
