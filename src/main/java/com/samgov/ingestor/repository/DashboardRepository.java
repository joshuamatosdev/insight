package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Dashboard;
import com.samgov.ingestor.model.Dashboard.DashboardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DashboardRepository extends JpaRepository<Dashboard, UUID> {

    Page<Dashboard> findByTenantIdAndIsActiveTrue(UUID tenantId, Pageable pageable);

    Optional<Dashboard> findByTenantIdAndId(UUID tenantId, UUID id);

    // By owner
    Page<Dashboard> findByOwnerIdAndIsActiveTrue(UUID ownerId, Pageable pageable);

    List<Dashboard> findByOwnerIdAndIsFavoriteTrueAndIsActiveTrue(UUID ownerId);

    // By type
    List<Dashboard> findByTenantIdAndDashboardTypeAndIsActiveTrue(UUID tenantId, DashboardType dashboardType);

    // Default dashboard for type
    Optional<Dashboard> findByTenantIdAndDashboardTypeAndIsDefaultTrueAndIsActiveTrue(
        UUID tenantId,
        DashboardType dashboardType
    );

    // User's default dashboard
    Optional<Dashboard> findByOwnerIdAndIsDefaultTrueAndIsActiveTrue(UUID ownerId);

    // Shared dashboards visible to user
    @Query("""
        SELECT d FROM Dashboard d
        WHERE d.tenant.id = :tenantId
        AND d.isActive = true
        AND (d.owner.id = :userId
             OR (d.isShared = true
                 AND (d.sharedWithUsers LIKE CONCAT('%', :userIdStr, '%')
                      OR d.sharedWithRoles LIKE CONCAT('%', :role, '%'))))
        ORDER BY d.name
        """)
    Page<Dashboard> findAccessibleDashboards(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId,
        @Param("userIdStr") String userIdStr,
        @Param("role") String role,
        Pageable pageable
    );

    // Most viewed
    @Query("""
        SELECT d FROM Dashboard d
        WHERE d.tenant.id = :tenantId
        AND d.isActive = true
        ORDER BY d.viewCount DESC
        """)
    Page<Dashboard> findMostViewedDashboards(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Recently viewed
    @Query("""
        SELECT d FROM Dashboard d
        WHERE d.tenant.id = :tenantId
        AND d.isActive = true
        AND d.lastViewedAt IS NOT NULL
        ORDER BY d.lastViewedAt DESC
        """)
    Page<Dashboard> findRecentlyViewedDashboards(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Search
    @Query("""
        SELECT d FROM Dashboard d
        WHERE d.tenant.id = :tenantId
        AND d.isActive = true
        AND (LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Dashboard> searchDashboards(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    // User's favorites
    @Query("""
        SELECT d FROM Dashboard d
        WHERE d.owner.id = :userId
        AND d.isFavorite = true
        AND d.isActive = true
        ORDER BY d.name
        """)
    List<Dashboard> findFavoriteDashboards(@Param("userId") UUID userId);

    // Count by type
    @Query("SELECT COUNT(d) FROM Dashboard d WHERE d.tenant.id = :tenantId AND d.dashboardType = :type AND d.isActive = true")
    long countByTenantIdAndDashboardType(@Param("tenantId") UUID tenantId, @Param("type") DashboardType type);
}
