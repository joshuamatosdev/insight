package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ComplianceItem;
import com.samgov.ingestor.model.ComplianceItem.CompliancePriority;
import com.samgov.ingestor.model.ComplianceItem.ComplianceStatus;
import com.samgov.ingestor.model.ComplianceItem.ComplianceType;
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
public interface ComplianceItemRepository extends JpaRepository<ComplianceItem, UUID> {

    Page<ComplianceItem> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<ComplianceItem> findByTenantIdAndId(UUID tenantId, UUID id);

    List<ComplianceItem> findByContractId(UUID contractId);

    Page<ComplianceItem> findByContractId(UUID contractId, Pageable pageable);

    List<ComplianceItem> findByTenantIdAndComplianceType(UUID tenantId, ComplianceType type);

    List<ComplianceItem> findByTenantIdAndStatus(UUID tenantId, ComplianceStatus status);

    List<ComplianceItem> findByTenantIdAndPriority(UUID tenantId, CompliancePriority priority);

    List<ComplianceItem> findByOwnerId(UUID ownerId);

    // Pending items
    @Query("""
        SELECT c FROM ComplianceItem c
        WHERE c.tenant.id = :tenantId
        AND c.status NOT IN ('COMPLIANT', 'NOT_APPLICABLE', 'WAIVED')
        ORDER BY c.priority DESC, c.dueDate ASC
        """)
    List<ComplianceItem> findPendingItems(@Param("tenantId") UUID tenantId);

    // Due soon
    @Query("""
        SELECT c FROM ComplianceItem c
        WHERE c.tenant.id = :tenantId
        AND c.status NOT IN ('COMPLIANT', 'NOT_APPLICABLE', 'WAIVED')
        AND c.dueDate IS NOT NULL
        AND c.dueDate <= :deadline
        AND c.dueDate >= :today
        ORDER BY c.dueDate ASC
        """)
    List<ComplianceItem> findDueSoon(
        @Param("tenantId") UUID tenantId,
        @Param("today") LocalDate today,
        @Param("deadline") LocalDate deadline
    );

    // Overdue
    @Query("""
        SELECT c FROM ComplianceItem c
        WHERE c.tenant.id = :tenantId
        AND c.status NOT IN ('COMPLIANT', 'NOT_APPLICABLE', 'WAIVED')
        AND c.dueDate IS NOT NULL
        AND c.dueDate < :today
        ORDER BY c.dueDate ASC
        """)
    List<ComplianceItem> findOverdue(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today);

    // Non-compliant items
    @Query("""
        SELECT c FROM ComplianceItem c
        WHERE c.tenant.id = :tenantId
        AND c.status IN ('NON_COMPLIANT', 'REMEDIATION_REQUIRED')
        ORDER BY c.priority DESC
        """)
    List<ComplianceItem> findNonCompliantItems(@Param("tenantId") UUID tenantId);

    // Contract-specific queries
    @Query("""
        SELECT c FROM ComplianceItem c
        WHERE c.contract.id = :contractId
        AND c.status NOT IN ('COMPLIANT', 'NOT_APPLICABLE', 'WAIVED')
        ORDER BY c.priority DESC, c.dueDate ASC
        """)
    List<ComplianceItem> findPendingItemsByContract(@Param("contractId") UUID contractId);

    @Query("""
        SELECT c FROM ComplianceItem c
        WHERE c.contract.id = :contractId
        AND c.status IN ('NON_COMPLIANT', 'REMEDIATION_REQUIRED')
        """)
    List<ComplianceItem> findNonCompliantItemsByContract(@Param("contractId") UUID contractId);

    // Count queries
    @Query("SELECT COUNT(c) FROM ComplianceItem c WHERE c.tenant.id = :tenantId AND c.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") ComplianceStatus status);

    @Query("""
        SELECT COUNT(c) FROM ComplianceItem c
        WHERE c.tenant.id = :tenantId
        AND c.status NOT IN ('COMPLIANT', 'NOT_APPLICABLE', 'WAIVED')
        AND c.dueDate IS NOT NULL
        AND c.dueDate < :today
        """)
    long countOverdueByTenantId(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(c) FROM ComplianceItem c WHERE c.contract.id = :contractId AND c.status = :status")
    long countByContractIdAndStatus(@Param("contractId") UUID contractId, @Param("status") ComplianceStatus status);

    // Needing review
    @Query("""
        SELECT c FROM ComplianceItem c
        WHERE c.tenant.id = :tenantId
        AND c.nextReviewDate IS NOT NULL
        AND c.nextReviewDate <= :deadline
        ORDER BY c.nextReviewDate ASC
        """)
    List<ComplianceItem> findNeedingReview(@Param("tenantId") UUID tenantId, @Param("deadline") LocalDate deadline);

    // Upcoming deadlines by tenant (for portal aggregation)
    @Query("""
        SELECT c FROM ComplianceItem c
        WHERE c.tenant.id = :tenantId
        AND c.dueDate IS NOT NULL
        AND c.dueDate >= :startDate
        AND c.dueDate <= :endDate
        ORDER BY c.dueDate ASC
        """)
    List<ComplianceItem> findUpcomingByTenantId(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
