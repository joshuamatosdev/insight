package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.DashboardWidget;
import com.samgov.ingestor.model.DashboardWidget.DataSource;
import com.samgov.ingestor.model.DashboardWidget.WidgetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DashboardWidgetRepository extends JpaRepository<DashboardWidget, UUID> {

    List<DashboardWidget> findByDashboardIdOrderBySortOrderAsc(UUID dashboardId);

    List<DashboardWidget> findByDashboardIdAndIsVisibleTrueOrderBySortOrderAsc(UUID dashboardId);

    Optional<DashboardWidget> findByDashboardIdAndId(UUID dashboardId, UUID id);

    // By widget type
    List<DashboardWidget> findByDashboardIdAndWidgetType(UUID dashboardId, WidgetType widgetType);

    // By data source
    List<DashboardWidget> findByDashboardIdAndDataSource(UUID dashboardId, DataSource dataSource);

    // Widgets linked to a report
    List<DashboardWidget> findByLinkedReportId(UUID reportId);

    // Count widgets in dashboard
    @Query("SELECT COUNT(w) FROM DashboardWidget w WHERE w.dashboard.id = :dashboardId")
    long countByDashboardId(@Param("dashboardId") UUID dashboardId);

    // Get max sort order
    @Query("SELECT MAX(w.sortOrder) FROM DashboardWidget w WHERE w.dashboard.id = :dashboardId")
    Integer findMaxSortOrderByDashboardId(@Param("dashboardId") UUID dashboardId);

    // Delete all widgets for dashboard
    void deleteByDashboardId(UUID dashboardId);
}
