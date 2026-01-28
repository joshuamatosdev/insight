package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ScopeChange;
import com.samgov.ingestor.model.ScopeChange.ChangeStatus;
import com.samgov.ingestor.model.ScopeChange.ChangeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScopeChangeRepository extends JpaRepository<ScopeChange, UUID> {

    // Basic queries
    List<ScopeChange> findByContractIdOrderByCreatedAtDesc(UUID contractId);

    Page<ScopeChange> findByContractId(UUID contractId, Pageable pageable);

    Optional<ScopeChange> findByContractIdAndId(UUID contractId, UUID id);

    Optional<ScopeChange> findByContractIdAndChangeNumber(UUID contractId, String changeNumber);

    boolean existsByContractIdAndChangeNumber(UUID contractId, String changeNumber);

    // Scope item queries
    List<ScopeChange> findByScopeItemIdOrderByCreatedAtDesc(UUID scopeItemId);

    Page<ScopeChange> findByScopeItemId(UUID scopeItemId, Pageable pageable);

    // Status queries
    List<ScopeChange> findByContractIdAndStatus(UUID contractId, ChangeStatus status);

    Page<ScopeChange> findByContractIdAndStatus(UUID contractId, ChangeStatus status, Pageable pageable);

    @Query("SELECT sc FROM ScopeChange sc WHERE sc.contract.id = :contractId AND sc.status IN :statuses ORDER BY sc.createdAt DESC")
    List<ScopeChange> findByContractIdAndStatusIn(
        @Param("contractId") UUID contractId,
        @Param("statuses") List<ChangeStatus> statuses
    );

    // Type queries
    List<ScopeChange> findByContractIdAndChangeType(UUID contractId, ChangeType changeType);

    Page<ScopeChange> findByContractIdAndChangeType(UUID contractId, ChangeType changeType, Pageable pageable);

    // Pending changes (for review/approval)
    @Query("""
        SELECT sc FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND sc.status IN ('PENDING_APPROVAL', 'UNDER_REVIEW')
        ORDER BY sc.requestedDate ASC
        """)
    List<ScopeChange> findPendingChangesByContractId(@Param("contractId") UUID contractId);

    @Query("""
        SELECT sc FROM ScopeChange sc
        JOIN sc.contract c
        WHERE c.tenant.id = :tenantId
        AND sc.status IN ('PENDING_APPROVAL', 'UNDER_REVIEW')
        ORDER BY sc.requestedDate ASC
        """)
    List<ScopeChange> findPendingChangesByTenantId(@Param("tenantId") UUID tenantId);

    @Query("""
        SELECT sc FROM ScopeChange sc
        JOIN sc.contract c
        WHERE c.tenant.id = :tenantId
        AND sc.status IN ('PENDING_APPROVAL', 'UNDER_REVIEW')
        """)
    Page<ScopeChange> findPendingChangesByTenantId(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Requestor queries
    List<ScopeChange> findByRequestedByIdOrderByCreatedAtDesc(UUID userId);

    Page<ScopeChange> findByRequestedById(UUID userId, Pageable pageable);

    // Date range queries
    @Query("""
        SELECT sc FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND sc.requestedDate >= :startDate
        AND sc.requestedDate <= :endDate
        ORDER BY sc.requestedDate DESC
        """)
    List<ScopeChange> findByContractIdAndDateRange(
        @Param("contractId") UUID contractId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // Approved changes
    @Query("""
        SELECT sc FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND sc.status IN ('APPROVED', 'IMPLEMENTED')
        ORDER BY sc.approvedDate DESC
        """)
    List<ScopeChange> findApprovedChangesByContractId(@Param("contractId") UUID contractId);

    // Count queries
    @Query("SELECT COUNT(sc) FROM ScopeChange sc WHERE sc.contract.id = :contractId")
    long countByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT COUNT(sc) FROM ScopeChange sc WHERE sc.contract.id = :contractId AND sc.status = :status")
    long countByContractIdAndStatus(@Param("contractId") UUID contractId, @Param("status") ChangeStatus status);

    @Query("""
        SELECT COUNT(sc) FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND sc.status IN ('PENDING_APPROVAL', 'UNDER_REVIEW')
        """)
    long countPendingByContractId(@Param("contractId") UUID contractId);

    @Query("""
        SELECT COUNT(sc) FROM ScopeChange sc
        JOIN sc.contract c
        WHERE c.tenant.id = :tenantId
        AND sc.status IN ('PENDING_APPROVAL', 'UNDER_REVIEW')
        """)
    long countPendingByTenantId(@Param("tenantId") UUID tenantId);

    // Sum impact queries
    @Query("""
        SELECT SUM(sc.hoursImpact) FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND sc.status IN ('APPROVED', 'IMPLEMENTED')
        """)
    Optional<BigDecimal> sumApprovedHoursImpactByContractId(@Param("contractId") UUID contractId);

    @Query("""
        SELECT SUM(sc.costImpact) FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND sc.status IN ('APPROVED', 'IMPLEMENTED')
        """)
    Optional<BigDecimal> sumApprovedCostImpactByContractId(@Param("contractId") UUID contractId);

    @Query("""
        SELECT SUM(sc.hoursImpact) FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND sc.status IN ('PENDING_APPROVAL', 'UNDER_REVIEW')
        """)
    Optional<BigDecimal> sumPendingHoursImpactByContractId(@Param("contractId") UUID contractId);

    @Query("""
        SELECT SUM(sc.costImpact) FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND sc.status IN ('PENDING_APPROVAL', 'UNDER_REVIEW')
        """)
    Optional<BigDecimal> sumPendingCostImpactByContractId(@Param("contractId") UUID contractId);

    // Max change number
    @Query("SELECT MAX(sc.changeNumber) FROM ScopeChange sc WHERE sc.contract.id = :contractId")
    Optional<String> findMaxChangeNumberByContractId(@Param("contractId") UUID contractId);

    // Delete
    void deleteByContractId(UUID contractId);

    void deleteByScopeItemId(UUID scopeItemId);

    // Search
    @Query("""
        SELECT sc FROM ScopeChange sc
        WHERE sc.contract.id = :contractId
        AND (LOWER(sc.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(sc.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(sc.changeNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY sc.createdAt DESC
        """)
    List<ScopeChange> searchByKeyword(@Param("contractId") UUID contractId, @Param("keyword") String keyword);

    // Tenant-level queries (via contract)
    @Query("""
        SELECT sc FROM ScopeChange sc
        JOIN sc.contract c
        WHERE c.tenant.id = :tenantId
        AND sc.status = :status
        ORDER BY sc.createdAt DESC
        """)
    Page<ScopeChange> findByTenantIdAndStatus(
        @Param("tenantId") UUID tenantId,
        @Param("status") ChangeStatus status,
        Pageable pageable
    );

    @Query("""
        SELECT sc FROM ScopeChange sc
        JOIN sc.contract c
        WHERE c.tenant.id = :tenantId
        ORDER BY sc.createdAt DESC
        """)
    Page<ScopeChange> findByTenantId(@Param("tenantId") UUID tenantId, Pageable pageable);
}
