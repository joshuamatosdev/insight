package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.SecurityClearance;
import com.samgov.ingestor.model.SecurityClearance.ClearanceLevel;
import com.samgov.ingestor.model.SecurityClearance.ClearanceStatus;
import com.samgov.ingestor.model.SecurityClearance.ClearanceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecurityClearanceRepository extends JpaRepository<SecurityClearance, UUID> {

    Page<SecurityClearance> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<SecurityClearance> findByTenantIdAndId(UUID tenantId, UUID id);

    List<SecurityClearance> findByTenantIdAndClearanceType(UUID tenantId, ClearanceType type);

    List<SecurityClearance> findByTenantIdAndClearanceLevel(UUID tenantId, ClearanceLevel level);

    Page<SecurityClearance> findByTenantIdAndClearanceLevel(UUID tenantId, ClearanceLevel level, Pageable pageable);

    List<SecurityClearance> findByTenantIdAndStatus(UUID tenantId, ClearanceStatus status);

    Optional<SecurityClearance> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    // By user
    List<SecurityClearance> findByUserId(UUID userId);

    Optional<SecurityClearance> findByUserIdAndClearanceTypeAndStatus(UUID userId, ClearanceType type, ClearanceStatus status);

    // Active clearances
    @Query("SELECT s FROM SecurityClearance s WHERE s.tenant.id = :tenantId AND s.status = 'ACTIVE'")
    List<SecurityClearance> findActiveClearances(@Param("tenantId") UUID tenantId);

    // Active personnel clearances
    @Query("""
        SELECT s FROM SecurityClearance s
        WHERE s.tenant.id = :tenantId
        AND s.clearanceType = 'PERSONNEL'
        AND s.status = 'ACTIVE'
        """)
    List<SecurityClearance> findActivePersonnelClearances(@Param("tenantId") UUID tenantId);

    // Facility clearance
    @Query("""
        SELECT s FROM SecurityClearance s
        WHERE s.tenant.id = :tenantId
        AND s.clearanceType = 'FACILITY'
        AND s.status = 'ACTIVE'
        """)
    Optional<SecurityClearance> findActiveFacilityClearance(@Param("tenantId") UUID tenantId);

    // Expiring clearances
    @Query("""
        SELECT s FROM SecurityClearance s
        WHERE s.tenant.id = :tenantId
        AND s.status = 'ACTIVE'
        AND s.expirationDate IS NOT NULL
        AND s.expirationDate <= :deadline
        AND s.expirationDate >= :today
        ORDER BY s.expirationDate ASC
        """)
    List<SecurityClearance> findExpiringClearances(
        @Param("tenantId") UUID tenantId,
        @Param("today") LocalDate today,
        @Param("deadline") LocalDate deadline
    );

    // Needing reinvestigation
    @Query("""
        SELECT s FROM SecurityClearance s
        WHERE s.tenant.id = :tenantId
        AND s.status = 'ACTIVE'
        AND s.reinvestigationDate IS NOT NULL
        AND s.reinvestigationDate <= :deadline
        ORDER BY s.reinvestigationDate ASC
        """)
    List<SecurityClearance> findNeedingReinvestigation(
        @Param("tenantId") UUID tenantId,
        @Param("deadline") LocalDate deadline
    );

    // Count by level
    @Query("SELECT COUNT(s) FROM SecurityClearance s WHERE s.tenant.id = :tenantId AND s.clearanceLevel = :level AND s.status = 'ACTIVE'")
    long countActiveByClearanceLevel(@Param("tenantId") UUID tenantId, @Param("level") ClearanceLevel level);

    // Count active personnel clearances
    @Query("SELECT COUNT(s) FROM SecurityClearance s WHERE s.tenant.id = :tenantId AND s.clearanceType = 'PERSONNEL' AND s.status = 'ACTIVE'")
    long countActivePersonnelClearances(@Param("tenantId") UUID tenantId);

    // Users with specific clearance level or higher
    @Query("""
        SELECT s FROM SecurityClearance s
        WHERE s.tenant.id = :tenantId
        AND s.clearanceType = 'PERSONNEL'
        AND s.status = 'ACTIVE'
        AND s.clearanceLevel IN :levels
        """)
    List<SecurityClearance> findPersonnelWithClearanceLevels(
        @Param("tenantId") UUID tenantId,
        @Param("levels") List<ClearanceLevel> levels
    );
}
