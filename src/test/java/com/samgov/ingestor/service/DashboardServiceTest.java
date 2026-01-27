package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.model.Dashboard;
import com.samgov.ingestor.model.Dashboard.DashboardType;
import com.samgov.ingestor.model.DashboardWidget;
import com.samgov.ingestor.model.DashboardWidget.DataSource;
import com.samgov.ingestor.model.DashboardWidget.WidgetType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.DashboardRepository;
import com.samgov.ingestor.repository.DashboardWidgetRepository;
import com.samgov.ingestor.service.DashboardService.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for DashboardService.
 *
 * Tests the business logic of dashboard and widget management:
 * - Dashboard CRUD operations
 * - Widget add/remove/configuration
 * - Default dashboard behavior
 * - Multi-tenant isolation
 */
class DashboardServiceTest extends BaseServiceTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DashboardRepository dashboardRepository;

    @Autowired
    private DashboardWidgetRepository widgetRepository;

    @Nested
    @DisplayName("Dashboard CRUD Operations")
    class DashboardCrud {

        @Test
        @DisplayName("should create dashboard with basic properties")
        void createDashboardWithBasicProperties() {
            // Given
            CreateDashboardRequest request = new CreateDashboardRequest(
                "Executive Dashboard",
                "High-level KPIs for leadership",
                DashboardType.EXECUTIVE,
                false,
                "{\"columns\": 12, \"rowHeight\": 100}"
            );

            // When
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                request
            );

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.name()).isEqualTo("Executive Dashboard");
            assertThat(result.description()).isEqualTo("High-level KPIs for leadership");
            assertThat(result.dashboardType()).isEqualTo(DashboardType.EXECUTIVE);
            assertThat(result.isDefault()).isFalse();
            assertThat(result.layoutConfig()).isEqualTo("{\"columns\": 12, \"rowHeight\": 100}");
            assertThat(result.widgets()).isEmpty();
            assertThat(result.createdAt()).isNotNull();
        }

        @Test
        @DisplayName("should create dashboard with default type when not specified")
        void createDashboardWithDefaultType() {
            // Given
            CreateDashboardRequest request = new CreateDashboardRequest(
                "My Dashboard",
                null,
                null, // No type specified
                null,
                null
            );

            // When
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                request
            );

            // Then
            assertThat(result.dashboardType()).isEqualTo(DashboardType.CUSTOM);
            assertThat(result.isDefault()).isFalse();
        }

        @Test
        @DisplayName("should get dashboard by ID")
        void getDashboardById() {
            // Given
            DashboardResponse created = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Test Dashboard", null, null, null, null)
            );

            // When
            Optional<DashboardResponse> result = dashboardService.getDashboard(created.id());

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().id()).isEqualTo(created.id());
            assertThat(result.get().name()).isEqualTo("Test Dashboard");
        }

        @Test
        @DisplayName("should return empty optional when dashboard not found")
        void getDashboardNotFound() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When
            Optional<DashboardResponse> result = dashboardService.getDashboard(nonExistentId);

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should get paginated dashboards for tenant")
        void getDashboardsForTenant() {
            // Given
            dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Dashboard 1", null, DashboardType.EXECUTIVE, null, null)
            );
            dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Dashboard 2", null, DashboardType.PIPELINE, null, null)
            );
            dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Dashboard 3", null, DashboardType.CONTRACT, null, null)
            );

            // When
            Page<DashboardResponse> result = dashboardService.getDashboards(
                testTenant.getId(),
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getTotalElements()).isEqualTo(3);
        }

        @Test
        @DisplayName("should delete dashboard")
        void deleteDashboard() {
            // Given
            DashboardResponse created = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("To Delete", null, null, null, null)
            );

            // When
            dashboardService.deleteDashboard(testTenant.getId(), created.id(), testUser.getId());

            // Then
            Optional<DashboardResponse> result = dashboardService.getDashboard(created.id());
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should throw exception when deleting non-existent dashboard")
        void deleteNonExistentDashboard() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() ->
                dashboardService.deleteDashboard(testTenant.getId(), nonExistentId, testUser.getId())
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Dashboard not found");
        }

        @Test
        @DisplayName("should throw exception when deleting dashboard from wrong tenant")
        void deleteDashboardWrongTenant() {
            // Given
            DashboardResponse created = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Dashboard", null, null, null, null)
            );
            UUID wrongTenantId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() ->
                dashboardService.deleteDashboard(wrongTenantId, created.id(), testUser.getId())
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to tenant");
        }

        @Test
        @DisplayName("should throw exception when creating dashboard for non-existent tenant")
        void createDashboardNonExistentTenant() {
            // Given
            UUID nonExistentTenantId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() ->
                dashboardService.createDashboard(
                    nonExistentTenantId,
                    testUser.getId(),
                    new CreateDashboardRequest("Dashboard", null, null, null, null)
                )
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }

        @Test
        @DisplayName("should throw exception when creating dashboard for non-existent user")
        void createDashboardNonExistentUser() {
            // Given
            UUID nonExistentUserId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() ->
                dashboardService.createDashboard(
                    testTenant.getId(),
                    nonExistentUserId,
                    new CreateDashboardRequest("Dashboard", null, null, null, null)
                )
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Default Dashboard Behavior")
    class DefaultDashboardBehavior {

        @Test
        @DisplayName("should get user default dashboard")
        void getUserDefaultDashboard() {
            // Given - create a default dashboard
            dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Default Dashboard", null, null, true, null)
            );

            // When
            Optional<DashboardResponse> result = dashboardService.getDefaultDashboard(
                testTenant.getId(),
                testUser.getId()
            );

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().isDefault()).isTrue();
            assertThat(result.get().name()).isEqualTo("Default Dashboard");
        }

        @Test
        @DisplayName("should return empty when user has no default dashboard")
        void getDefaultDashboardWhenNoneSet() {
            // Given - create dashboard without setting as default
            dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Regular Dashboard", null, null, false, null)
            );

            // When
            Optional<DashboardResponse> result = dashboardService.getDefaultDashboard(
                testTenant.getId(),
                testUser.getId()
            );

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should create dashboard as default when isDefault is true")
        void createDashboardAsDefault() {
            // Given/When
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("My Default", null, null, true, null)
            );

            // Then
            assertThat(result.isDefault()).isTrue();
        }
    }

    @Nested
    @DisplayName("Widget Management")
    class WidgetManagement {

        private DashboardResponse dashboard;

        @BeforeEach
        void createDashboard() {
            dashboard = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Widget Test Dashboard", null, null, null, null)
            );
        }

        @Test
        @DisplayName("should add widget to dashboard")
        void addWidgetToDashboard() {
            // Given
            CreateWidgetRequest request = new CreateWidgetRequest(
                "Pipeline Overview",
                WidgetType.PIPELINE_FUNNEL,
                DataSource.PIPELINE,
                "{\"filter\": \"active\"}",
                0, 0, 6, 4
            );

            // When
            WidgetResponse result = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                request
            );

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.title()).isEqualTo("Pipeline Overview");
            assertThat(result.widgetType()).isEqualTo(WidgetType.PIPELINE_FUNNEL);
            assertThat(result.dataSource()).isEqualTo(DataSource.PIPELINE);
            assertThat(result.dataConfig()).isEqualTo("{\"filter\": \"active\"}");
            assertThat(result.gridX()).isEqualTo(0);
            assertThat(result.gridY()).isEqualTo(0);
            assertThat(result.gridWidth()).isEqualTo(6);
            assertThat(result.gridHeight()).isEqualTo(4);
        }

        @Test
        @DisplayName("should add widget with default grid values")
        void addWidgetWithDefaultGridValues() {
            // Given
            CreateWidgetRequest request = new CreateWidgetRequest(
                "Simple Metric",
                WidgetType.SINGLE_METRIC,
                null, // No data source - should default to OPPORTUNITIES
                null,
                null, null, null, null // No grid values - should use defaults
            );

            // When
            WidgetResponse result = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                request
            );

            // Then
            assertThat(result.dataSource()).isEqualTo(DataSource.OPPORTUNITIES);
            assertThat(result.gridX()).isEqualTo(0);
            assertThat(result.gridY()).isEqualTo(0);
            assertThat(result.gridWidth()).isEqualTo(4);
            assertThat(result.gridHeight()).isEqualTo(3);
        }

        @Test
        @DisplayName("should add multiple widgets to dashboard")
        void addMultipleWidgetsToDashboard() {
            // Given/When - each addWidget should succeed and return the widget
            WidgetResponse widget1 = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                new CreateWidgetRequest("Widget 1", WidgetType.BAR_CHART, DataSource.OPPORTUNITIES,
                    null, 0, 0, 4, 3)
            );
            WidgetResponse widget2 = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                new CreateWidgetRequest("Widget 2", WidgetType.LINE_CHART, DataSource.CONTRACTS,
                    null, 4, 0, 4, 3)
            );
            WidgetResponse widget3 = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                new CreateWidgetRequest("Widget 3", WidgetType.PIE_CHART, DataSource.BUDGET,
                    null, 8, 0, 4, 3)
            );

            // Then - verify each widget was created with correct properties
            assertThat(widget1.id()).isNotNull();
            assertThat(widget1.title()).isEqualTo("Widget 1");
            assertThat(widget2.id()).isNotNull();
            assertThat(widget2.title()).isEqualTo("Widget 2");
            assertThat(widget3.id()).isNotNull();
            assertThat(widget3.title()).isEqualTo("Widget 3");
            // Note: Dashboard.getWidgets() may not reflect widgets due to lazy loading
        }

        @Test
        @DisplayName("should delete widget from dashboard")
        void deleteWidgetFromDashboard() {
            // Given
            WidgetResponse widget = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                new CreateWidgetRequest("To Delete", WidgetType.TABLE, DataSource.OPPORTUNITIES,
                    null, 0, 0, 6, 4)
            );

            // When
            dashboardService.deleteWidget(testTenant.getId(), widget.id(), testUser.getId());

            // Then
            Optional<DashboardResponse> result = dashboardService.getDashboard(dashboard.id());
            assertThat(result).isPresent();
            assertThat(result.get().widgets()).isEmpty();
        }

        @Test
        @DisplayName("should throw exception when deleting non-existent widget")
        void deleteNonExistentWidget() {
            // Given
            UUID nonExistentWidgetId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() ->
                dashboardService.deleteWidget(testTenant.getId(), nonExistentWidgetId, testUser.getId())
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Widget not found");
        }

        @Test
        @DisplayName("should throw exception when deleting widget from wrong tenant")
        void deleteWidgetWrongTenant() {
            // Given
            WidgetResponse widget = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                new CreateWidgetRequest("Widget", WidgetType.TABLE, null, null, 0, 0, 4, 3)
            );
            UUID wrongTenantId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() ->
                dashboardService.deleteWidget(wrongTenantId, widget.id(), testUser.getId())
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to tenant");
        }

        @Test
        @DisplayName("should throw exception when adding widget to non-existent dashboard")
        void addWidgetToNonExistentDashboard() {
            // Given
            UUID nonExistentDashboardId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() ->
                dashboardService.addWidget(
                    testTenant.getId(),
                    nonExistentDashboardId,
                    testUser.getId(),
                    new CreateWidgetRequest("Widget", WidgetType.TABLE, null, null, 0, 0, 4, 3)
                )
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Dashboard not found");
        }

        @Test
        @DisplayName("should throw exception when adding widget to dashboard from wrong tenant")
        void addWidgetToDashboardWrongTenant() {
            // Given
            UUID wrongTenantId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() ->
                dashboardService.addWidget(
                    wrongTenantId,
                    dashboard.id(),
                    testUser.getId(),
                    new CreateWidgetRequest("Widget", WidgetType.TABLE, null, null, 0, 0, 4, 3)
                )
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to tenant");
        }
    }

    @Nested
    @DisplayName("Widget Types and Data Sources")
    class WidgetTypesAndDataSources {

        private DashboardResponse dashboard;

        @BeforeEach
        void createDashboard() {
            dashboard = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Widget Types Dashboard", null, null, null, null)
            );
        }

        @Test
        @DisplayName("should create widgets of all chart types")
        void createAllChartTypeWidgets() {
            // When/Then - create each chart type
            WidgetType[] chartTypes = {
                WidgetType.BAR_CHART,
                WidgetType.LINE_CHART,
                WidgetType.AREA_CHART,
                WidgetType.PIE_CHART,
                WidgetType.DONUT_CHART,
                WidgetType.FUNNEL_CHART,
                WidgetType.SCATTER_PLOT,
                WidgetType.HEATMAP
            };

            for (WidgetType type : chartTypes) {
                WidgetResponse result = dashboardService.addWidget(
                    testTenant.getId(),
                    dashboard.id(),
                    testUser.getId(),
                    new CreateWidgetRequest(type.name() + " Widget", type, DataSource.OPPORTUNITIES,
                        null, 0, 0, 4, 3)
                );
                assertThat(result.widgetType()).isEqualTo(type);
            }
        }

        @Test
        @DisplayName("should create widgets with different data sources")
        void createWidgetsWithDifferentDataSources() {
            // When/Then - create widget for each data source
            DataSource[] dataSources = DataSource.values();

            for (DataSource source : dataSources) {
                WidgetResponse result = dashboardService.addWidget(
                    testTenant.getId(),
                    dashboard.id(),
                    testUser.getId(),
                    new CreateWidgetRequest(source.name() + " Widget", WidgetType.TABLE, source,
                        null, 0, 0, 4, 3)
                );
                assertThat(result.dataSource()).isEqualTo(source);
            }
        }

        @Test
        @DisplayName("should create metric widgets")
        void createMetricWidgets() {
            // Given
            WidgetType[] metricTypes = {
                WidgetType.SINGLE_METRIC,
                WidgetType.METRIC_COMPARISON,
                WidgetType.KPI_GAUGE,
                WidgetType.PROGRESS_INDICATOR
            };

            // When/Then
            for (WidgetType type : metricTypes) {
                WidgetResponse result = dashboardService.addWidget(
                    testTenant.getId(),
                    dashboard.id(),
                    testUser.getId(),
                    new CreateWidgetRequest(type.name(), type, DataSource.PIPELINE,
                        "{\"metric\": \"totalValue\"}", 0, 0, 3, 2)
                );
                assertThat(result.widgetType()).isEqualTo(type);
            }
        }

        @Test
        @DisplayName("should create data display widgets")
        void createDataDisplayWidgets() {
            // Given
            WidgetType[] displayTypes = {
                WidgetType.TABLE,
                WidgetType.LIST,
                WidgetType.GRID,
                WidgetType.TIMELINE,
                WidgetType.CALENDAR
            };

            // When/Then
            for (WidgetType type : displayTypes) {
                WidgetResponse result = dashboardService.addWidget(
                    testTenant.getId(),
                    dashboard.id(),
                    testUser.getId(),
                    new CreateWidgetRequest(type.name(), type, DataSource.OPPORTUNITIES,
                        null, 0, 0, 6, 4)
                );
                assertThat(result.widgetType()).isEqualTo(type);
            }
        }

        @Test
        @DisplayName("should create pipeline-specific widgets")
        void createPipelineWidgets() {
            // Given
            WidgetType[] pipelineTypes = {
                WidgetType.PIPELINE_KANBAN,
                WidgetType.PIPELINE_FUNNEL
            };

            // When/Then
            for (WidgetType type : pipelineTypes) {
                WidgetResponse result = dashboardService.addWidget(
                    testTenant.getId(),
                    dashboard.id(),
                    testUser.getId(),
                    new CreateWidgetRequest(type.name(), type, DataSource.PIPELINE,
                        "{\"pipelineId\": \"default\"}", 0, 0, 8, 6)
                );
                assertThat(result.widgetType()).isEqualTo(type);
            }
        }

        @Test
        @DisplayName("should create text and info widgets")
        void createTextAndInfoWidgets() {
            // Given
            WidgetType[] textTypes = {
                WidgetType.TEXT_BLOCK,
                WidgetType.MARKDOWN,
                WidgetType.ALERT_LIST,
                WidgetType.ACTIVITY_FEED
            };

            // When/Then
            for (WidgetType type : textTypes) {
                WidgetResponse result = dashboardService.addWidget(
                    testTenant.getId(),
                    dashboard.id(),
                    testUser.getId(),
                    new CreateWidgetRequest(type.name(), type, DataSource.ACTIVITY,
                        null, 0, 0, 4, 3)
                );
                assertThat(result.widgetType()).isEqualTo(type);
            }
        }
    }

    @Nested
    @DisplayName("Widget Grid Configuration")
    class WidgetGridConfiguration {

        private DashboardResponse dashboard;

        @BeforeEach
        void createDashboard() {
            dashboard = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Grid Test Dashboard", null, null, null, null)
            );
        }

        @Test
        @DisplayName("should create widget with custom grid position")
        void createWidgetWithCustomGridPosition() {
            // Given
            CreateWidgetRequest request = new CreateWidgetRequest(
                "Positioned Widget",
                WidgetType.BAR_CHART,
                DataSource.OPPORTUNITIES,
                null,
                4, 2, 6, 4 // x=4, y=2, width=6, height=4
            );

            // When
            WidgetResponse result = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                request
            );

            // Then
            assertThat(result.gridX()).isEqualTo(4);
            assertThat(result.gridY()).isEqualTo(2);
            assertThat(result.gridWidth()).isEqualTo(6);
            assertThat(result.gridHeight()).isEqualTo(4);
        }

        @Test
        @DisplayName("should create multiple widgets in grid layout")
        void createMultipleWidgetsInGridLayout() {
            // Given/When - create 4 widgets in 2x2 grid
            WidgetResponse topLeft = dashboardService.addWidget(
                testTenant.getId(), dashboard.id(), testUser.getId(),
                new CreateWidgetRequest("Top Left", WidgetType.SINGLE_METRIC, DataSource.OPPORTUNITIES,
                    null, 0, 0, 6, 3)
            );
            WidgetResponse topRight = dashboardService.addWidget(
                testTenant.getId(), dashboard.id(), testUser.getId(),
                new CreateWidgetRequest("Top Right", WidgetType.SINGLE_METRIC, DataSource.CONTRACTS,
                    null, 6, 0, 6, 3)
            );
            WidgetResponse bottomLeft = dashboardService.addWidget(
                testTenant.getId(), dashboard.id(), testUser.getId(),
                new CreateWidgetRequest("Bottom Left", WidgetType.BAR_CHART, DataSource.PIPELINE,
                    null, 0, 3, 6, 4)
            );
            WidgetResponse bottomRight = dashboardService.addWidget(
                testTenant.getId(), dashboard.id(), testUser.getId(),
                new CreateWidgetRequest("Bottom Right", WidgetType.LINE_CHART, DataSource.INVOICES,
                    null, 6, 3, 6, 4)
            );

            // Then - verify each widget was created with correct grid positions
            assertThat(topLeft.gridX()).isEqualTo(0);
            assertThat(topLeft.gridY()).isEqualTo(0);
            assertThat(topRight.gridX()).isEqualTo(6);
            assertThat(topRight.gridY()).isEqualTo(0);
            assertThat(bottomLeft.gridX()).isEqualTo(0);
            assertThat(bottomLeft.gridY()).isEqualTo(3);
            assertThat(bottomRight.gridX()).isEqualTo(6);
            assertThat(bottomRight.gridY()).isEqualTo(3);
            // Note: Dashboard.getWidgets() may not reflect widgets due to lazy loading
        }
    }

    @Nested
    @DisplayName("Dashboard Types")
    class DashboardTypes {

        @Test
        @DisplayName("should create Executive dashboard type")
        void createExecutiveDashboard() {
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Executive Overview", "CEO Dashboard",
                    DashboardType.EXECUTIVE, null, null)
            );

            assertThat(result.dashboardType()).isEqualTo(DashboardType.EXECUTIVE);
        }

        @Test
        @DisplayName("should create Pipeline dashboard type")
        void createPipelineDashboard() {
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Sales Pipeline", "BD Dashboard",
                    DashboardType.PIPELINE, null, null)
            );

            assertThat(result.dashboardType()).isEqualTo(DashboardType.PIPELINE);
        }

        @Test
        @DisplayName("should create Contract dashboard type")
        void createContractDashboard() {
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Contract Management", null,
                    DashboardType.CONTRACT, null, null)
            );

            assertThat(result.dashboardType()).isEqualTo(DashboardType.CONTRACT);
        }

        @Test
        @DisplayName("should create Financial dashboard type")
        void createFinancialDashboard() {
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Financial Overview", null,
                    DashboardType.FINANCIAL, null, null)
            );

            assertThat(result.dashboardType()).isEqualTo(DashboardType.FINANCIAL);
        }

        @Test
        @DisplayName("should create Compliance dashboard type")
        void createComplianceDashboard() {
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Compliance Tracker", null,
                    DashboardType.COMPLIANCE, null, null)
            );

            assertThat(result.dashboardType()).isEqualTo(DashboardType.COMPLIANCE);
        }

        @Test
        @DisplayName("should create BD dashboard type")
        void createBdDashboard() {
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("BD Dashboard", null,
                    DashboardType.BD, null, null)
            );

            assertThat(result.dashboardType()).isEqualTo(DashboardType.BD);
        }

        @Test
        @DisplayName("should create Custom dashboard type")
        void createCustomDashboard() {
            DashboardResponse result = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("My Custom Dashboard", null,
                    DashboardType.CUSTOM, null, null)
            );

            assertThat(result.dashboardType()).isEqualTo(DashboardType.CUSTOM);
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        private Tenant tenant2;
        private User user2;

        @BeforeEach
        void createSecondTenant() {
            tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Test")
                .lastName("User2")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);
        }

        @Test
        @DisplayName("dashboards are isolated between tenants")
        void dashboardsIsolatedBetweenTenants() {
            // Given - create dashboard for tenant 1
            DashboardResponse tenant1Dashboard = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Tenant 1 Dashboard", null, null, null, null)
            );

            // When - get dashboards for tenant 2
            Page<DashboardResponse> tenant2Dashboards = dashboardService.getDashboards(
                tenant2.getId(),
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(tenant2Dashboards.getContent()).isEmpty();
        }

        @Test
        @DisplayName("should throw when deleting dashboard from different tenant")
        void cannotDeleteOtherTenantDashboard() {
            // Given - create dashboard for tenant 1
            DashboardResponse tenant1Dashboard = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Tenant 1 Dashboard", null, null, null, null)
            );

            // When/Then - try to delete with tenant 2's ID
            assertThatThrownBy(() ->
                dashboardService.deleteDashboard(tenant2.getId(), tenant1Dashboard.id(), user2.getId())
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to tenant");
        }

        @Test
        @DisplayName("should throw when adding widget to dashboard from different tenant")
        void cannotAddWidgetToOtherTenantDashboard() {
            // Given - create dashboard for tenant 1
            DashboardResponse tenant1Dashboard = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Tenant 1 Dashboard", null, null, null, null)
            );

            // When/Then - try to add widget with tenant 2's ID
            assertThatThrownBy(() ->
                dashboardService.addWidget(
                    tenant2.getId(),
                    tenant1Dashboard.id(),
                    user2.getId(),
                    new CreateWidgetRequest("Widget", WidgetType.TABLE, null, null, 0, 0, 4, 3)
                )
            ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to tenant");
        }

        @Test
        @DisplayName("same dashboard name allowed for different tenants")
        void sameDashboardNameAllowedDifferentTenants() {
            // Given - create dashboard for tenant 1
            dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Executive Dashboard", null, null, null, null)
            );

            // When - create same named dashboard for tenant 2
            DashboardResponse tenant2Dashboard = dashboardService.createDashboard(
                tenant2.getId(),
                user2.getId(),
                new CreateDashboardRequest("Executive Dashboard", null, null, null, null)
            );

            // Then - should succeed
            assertThat(tenant2Dashboard.name()).isEqualTo("Executive Dashboard");
        }
    }

    @Nested
    @DisplayName("Widget Data Configuration")
    class WidgetDataConfiguration {

        private DashboardResponse dashboard;

        @BeforeEach
        void createDashboard() {
            dashboard = dashboardService.createDashboard(
                testTenant.getId(),
                testUser.getId(),
                new CreateDashboardRequest("Config Test Dashboard", null, null, null, null)
            );
        }

        @Test
        @DisplayName("should create widget with complex data configuration")
        void createWidgetWithComplexDataConfig() {
            // Given
            String complexConfig = """
                {
                    "filter": {
                        "status": ["active", "pending"],
                        "dateRange": "last_30_days"
                    },
                    "groupBy": "naicsCode",
                    "aggregation": "sum",
                    "limit": 10
                }
                """;

            // When
            WidgetResponse result = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                new CreateWidgetRequest(
                    "Complex Config Widget",
                    WidgetType.BAR_CHART,
                    DataSource.OPPORTUNITIES,
                    complexConfig,
                    0, 0, 8, 6
                )
            );

            // Then
            assertThat(result.dataConfig()).isEqualTo(complexConfig);
        }

        @Test
        @DisplayName("should create widget with null data configuration")
        void createWidgetWithNullDataConfig() {
            // When
            WidgetResponse result = dashboardService.addWidget(
                testTenant.getId(),
                dashboard.id(),
                testUser.getId(),
                new CreateWidgetRequest(
                    "No Config Widget",
                    WidgetType.TABLE,
                    DataSource.CONTRACTS,
                    null,
                    0, 0, 6, 4
                )
            );

            // Then
            assertThat(result.dataConfig()).isNull();
        }
    }
}
