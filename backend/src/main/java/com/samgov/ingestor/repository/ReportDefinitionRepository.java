package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ReportDefinition;
import com.samgov.ingestor.model.ReportDefinition.EntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ReportDefinition entity operations.
 */
@Repository
public interface ReportDefinitionRepository extends JpaRepository<ReportDefinition, UUID> {

    /**
     * Find all report definitions for a tenant
     */
    Page<ReportDefinition> findByTenantId(UUID tenantId, Pageable pageable);

    /**
     * Find report definition by ID and tenant
     */
    Optional<ReportDefinition> findByIdAndTenantId(UUID id, UUID tenantId);

    /**
     * Find reports owned by a specific user
     */
    Page<ReportDefinition> findByTenantIdAndUserId(UUID tenantId, UUID userId, Pageable pageable);

    /**
     * Find reports by entity type
     */
    Page<ReportDefinition> findByTenantIdAndEntityType(UUID tenantId, EntityType entityType, Pageable pageable);

    /**
     * Find all public reports for a tenant
     */
    Page<ReportDefinition> findByTenantIdAndIsPublicTrue(UUID tenantId, Pageable pageable);

    /**
     * Find reports accessible to a user (their own + public)
     */
    @Query("""
        SELECT r FROM ReportDefinition r
        WHERE r.tenant.id = :tenantId
        AND (r.user.id = :userId OR r.isPublic = true)
        ORDER BY r.updatedAt DESC
        """)
    Page<ReportDefinition> findAccessibleReports(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId,
        Pageable pageable
    );

    /**
     * Find most used reports
     */
    @Query("""
        SELECT r FROM ReportDefinition r
        WHERE r.tenant.id = :tenantId
        AND (r.user.id = :userId OR r.isPublic = true)
        ORDER BY r.runCount DESC
        """)
    Page<ReportDefinition> findMostUsedReports(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId,
        Pageable pageable
    );

    /**
     * Search reports by name
     */
    @Query("""
        SELECT r FROM ReportDefinition r
        WHERE r.tenant.id = :tenantId
        AND (r.user.id = :userId OR r.isPublic = true)
        AND LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        """)
    Page<ReportDefinition> searchByName(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    /**
     * Count reports by entity type for a tenant
     */
    @Query("SELECT COUNT(r) FROM ReportDefinition r WHERE r.tenant.id = :tenantId AND r.entityType = :entityType")
    long countByTenantIdAndEntityType(@Param("tenantId") UUID tenantId, @Param("entityType") EntityType entityType);

    /**
     * Find recently updated reports
     */
    @Query("""
        SELECT r FROM ReportDefinition r
        WHERE r.tenant.id = :tenantId
        AND (r.user.id = :userId OR r.isPublic = true)
        ORDER BY r.updatedAt DESC
        """)
    List<ReportDefinition> findRecentReports(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId,
        Pageable pageable
    );

    /**
     * Check if a report with the same name exists for the user
     */
    boolean existsByTenantIdAndUserIdAndName(UUID tenantId, UUID userId, String name);
}
