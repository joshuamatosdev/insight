package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.SavedReport;
import com.samgov.ingestor.model.SavedReport.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedReportRepository extends JpaRepository<SavedReport, UUID> {

    Page<SavedReport> findByTenantId(UUID tenantId, Pageable pageable);

    Page<SavedReport> findByTenantIdAndIsActiveTrue(UUID tenantId, Pageable pageable);

    Page<SavedReport> findByTenantIdAndReportType(UUID tenantId, ReportType reportType, Pageable pageable);

    List<SavedReport> findByTenantIdAndIsScheduledTrue(UUID tenantId);

    Optional<SavedReport> findByTenantIdAndId(UUID tenantId, UUID id);

    // By owner
    Page<SavedReport> findByOwnerIdAndIsActiveTrue(UUID ownerId, Pageable pageable);

    List<SavedReport> findByOwnerIdAndIsFavoriteTrueAndIsActiveTrue(UUID ownerId);

    // By type
    List<SavedReport> findByTenantIdAndReportTypeAndIsActiveTrue(UUID tenantId, ReportType reportType);

    Page<SavedReport> findByTenantIdAndReportTypeAndIsActiveTrue(
        UUID tenantId,
        ReportType reportType,
        Pageable pageable
    );

    // Shared reports visible to user
    @Query("""
        SELECT r FROM SavedReport r
        WHERE r.tenant.id = :tenantId
        AND r.isActive = true
        AND (r.owner.id = :userId
             OR (r.isShared = true
                 AND (r.sharedWithUsers LIKE CONCAT('%', :userIdStr, '%')
                      OR r.sharedWithRoles LIKE CONCAT('%', :role, '%'))))
        """)
    Page<SavedReport> findAccessibleReports(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId,
        @Param("userIdStr") String userIdStr,
        @Param("role") String role,
        Pageable pageable
    );

    // Scheduled reports
    @Query("""
        SELECT r FROM SavedReport r
        WHERE r.tenant.id = :tenantId
        AND r.isScheduled = true
        AND r.isActive = true
        ORDER BY r.nextRunAt ASC
        """)
    List<SavedReport> findScheduledReports(@Param("tenantId") UUID tenantId);

    // Reports due to run
    @Query("""
        SELECT r FROM SavedReport r
        WHERE r.isScheduled = true
        AND r.isActive = true
        AND r.nextRunAt <= :now
        ORDER BY r.nextRunAt ASC
        """)
    List<SavedReport> findReportsDueToRun(@Param("now") Instant now);

    // Most run reports
    @Query("""
        SELECT r FROM SavedReport r
        WHERE r.tenant.id = :tenantId
        AND r.isActive = true
        ORDER BY r.runCount DESC
        """)
    Page<SavedReport> findMostRunReports(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Recently run
    @Query("""
        SELECT r FROM SavedReport r
        WHERE r.tenant.id = :tenantId
        AND r.isActive = true
        AND r.lastRunAt IS NOT NULL
        ORDER BY r.lastRunAt DESC
        """)
    Page<SavedReport> findRecentlyRunReports(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Search
    @Query("""
        SELECT r FROM SavedReport r
        WHERE r.tenant.id = :tenantId
        AND r.isActive = true
        AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<SavedReport> searchReports(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    // Count by type
    @Query("SELECT COUNT(r) FROM SavedReport r WHERE r.tenant.id = :tenantId AND r.reportType = :type AND r.isActive = true")
    long countByTenantIdAndReportType(@Param("tenantId") UUID tenantId, @Param("type") ReportType type);

    // User's favorite reports
    @Query("""
        SELECT r FROM SavedReport r
        WHERE r.owner.id = :userId
        AND r.isFavorite = true
        AND r.isActive = true
        ORDER BY r.name
        """)
    List<SavedReport> findFavoriteReports(@Param("userId") UUID userId);
}
