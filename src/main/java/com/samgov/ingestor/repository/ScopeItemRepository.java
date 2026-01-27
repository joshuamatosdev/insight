package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ScopeItem;
import com.samgov.ingestor.model.ScopeItem.ScopeItemType;
import com.samgov.ingestor.model.ScopeItem.ScopeStatus;
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
public interface ScopeItemRepository extends JpaRepository<ScopeItem, UUID> {

    // Basic queries
    List<ScopeItem> findByContractIdOrderBySortOrderAsc(UUID contractId);

    Page<ScopeItem> findByContractId(UUID contractId, Pageable pageable);

    Optional<ScopeItem> findByContractIdAndId(UUID contractId, UUID id);

    Optional<ScopeItem> findByContractIdAndWbsCode(UUID contractId, String wbsCode);

    boolean existsByContractIdAndWbsCode(UUID contractId, String wbsCode);

    // Root items (top-level, no parent)
    @Query("SELECT s FROM ScopeItem s WHERE s.contract.id = :contractId AND s.parent IS NULL ORDER BY s.sortOrder ASC")
    List<ScopeItem> findRootItemsByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT s FROM ScopeItem s WHERE s.contract.id = :contractId AND s.parent IS NULL")
    Page<ScopeItem> findRootItemsByContractId(@Param("contractId") UUID contractId, Pageable pageable);

    // Child items
    List<ScopeItem> findByParentIdOrderBySortOrderAsc(UUID parentId);

    Page<ScopeItem> findByParentId(UUID parentId, Pageable pageable);

    @Query("SELECT COUNT(s) FROM ScopeItem s WHERE s.parent.id = :parentId")
    long countByParentId(@Param("parentId") UUID parentId);

    // Status queries
    List<ScopeItem> findByContractIdAndStatus(UUID contractId, ScopeStatus status);

    Page<ScopeItem> findByContractIdAndStatus(UUID contractId, ScopeStatus status, Pageable pageable);

    @Query("SELECT s FROM ScopeItem s WHERE s.contract.id = :contractId AND s.status NOT IN :excludedStatuses ORDER BY s.sortOrder ASC")
    List<ScopeItem> findActiveItemsByContractId(
        @Param("contractId") UUID contractId,
        @Param("excludedStatuses") List<ScopeStatus> excludedStatuses
    );

    // Type queries
    List<ScopeItem> findByContractIdAndItemType(UUID contractId, ScopeItemType itemType);

    Page<ScopeItem> findByContractIdAndItemType(UUID contractId, ScopeItemType itemType, Pageable pageable);

    // Assignment queries
    List<ScopeItem> findByAssignedToId(UUID userId);

    Page<ScopeItem> findByAssignedToId(UUID userId, Pageable pageable);

    @Query("""
        SELECT s FROM ScopeItem s
        WHERE s.contract.id = :contractId
        AND s.assignedTo.id = :userId
        AND s.status NOT IN ('COMPLETED', 'CANCELLED')
        ORDER BY s.plannedEndDate ASC
        """)
    List<ScopeItem> findActiveItemsByAssignee(
        @Param("contractId") UUID contractId,
        @Param("userId") UUID userId
    );

    // CLIN queries
    List<ScopeItem> findByContractIdAndClinId(UUID contractId, UUID clinId);

    // Milestone queries
    @Query("SELECT s FROM ScopeItem s WHERE s.contract.id = :contractId AND s.isMilestone = true ORDER BY s.plannedEndDate ASC")
    List<ScopeItem> findMilestonesByContractId(@Param("contractId") UUID contractId);

    // Schedule queries
    @Query("""
        SELECT s FROM ScopeItem s
        WHERE s.contract.id = :contractId
        AND s.plannedEndDate IS NOT NULL
        AND s.plannedEndDate < :today
        AND s.status NOT IN ('COMPLETED', 'CANCELLED')
        ORDER BY s.plannedEndDate ASC
        """)
    List<ScopeItem> findOverdueItems(@Param("contractId") UUID contractId, @Param("today") LocalDate today);

    @Query("""
        SELECT s FROM ScopeItem s
        WHERE s.contract.id = :contractId
        AND s.plannedEndDate IS NOT NULL
        AND s.plannedEndDate <= :deadline
        AND s.plannedEndDate >= :today
        AND s.status NOT IN ('COMPLETED', 'CANCELLED')
        ORDER BY s.plannedEndDate ASC
        """)
    List<ScopeItem> findDueSoon(
        @Param("contractId") UUID contractId,
        @Param("today") LocalDate today,
        @Param("deadline") LocalDate deadline
    );

    // Aggregation queries
    @Query("SELECT SUM(s.estimatedHours) FROM ScopeItem s WHERE s.contract.id = :contractId")
    Optional<BigDecimal> sumEstimatedHoursByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(s.actualHours) FROM ScopeItem s WHERE s.contract.id = :contractId")
    Optional<BigDecimal> sumActualHoursByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(s.remainingHours) FROM ScopeItem s WHERE s.contract.id = :contractId AND s.status NOT IN ('COMPLETED', 'CANCELLED')")
    Optional<BigDecimal> sumRemainingHoursByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(s.estimatedCost) FROM ScopeItem s WHERE s.contract.id = :contractId")
    Optional<BigDecimal> sumEstimatedCostByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(s.actualCost) FROM ScopeItem s WHERE s.contract.id = :contractId")
    Optional<BigDecimal> sumActualCostByContractId(@Param("contractId") UUID contractId);

    // Count queries
    @Query("SELECT COUNT(s) FROM ScopeItem s WHERE s.contract.id = :contractId")
    long countByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT COUNT(s) FROM ScopeItem s WHERE s.contract.id = :contractId AND s.status = :status")
    long countByContractIdAndStatus(@Param("contractId") UUID contractId, @Param("status") ScopeStatus status);

    @Query("""
        SELECT COUNT(s) FROM ScopeItem s
        WHERE s.contract.id = :contractId
        AND s.plannedEndDate IS NOT NULL
        AND s.plannedEndDate < :today
        AND s.status NOT IN ('COMPLETED', 'CANCELLED')
        """)
    long countOverdueByContractId(@Param("contractId") UUID contractId, @Param("today") LocalDate today);

    // Max sort order
    @Query("SELECT MAX(s.sortOrder) FROM ScopeItem s WHERE s.contract.id = :contractId AND s.parent IS NULL")
    Optional<Integer> findMaxSortOrderByContractIdAndParentNull(@Param("contractId") UUID contractId);

    @Query("SELECT MAX(s.sortOrder) FROM ScopeItem s WHERE s.parent.id = :parentId")
    Optional<Integer> findMaxSortOrderByParentId(@Param("parentId") UUID parentId);

    // Delete
    void deleteByContractId(UUID contractId);

    // Search
    @Query("""
        SELECT s FROM ScopeItem s
        WHERE s.contract.id = :contractId
        AND (LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(s.wbsCode) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY s.sortOrder ASC
        """)
    List<ScopeItem> searchByKeyword(@Param("contractId") UUID contractId, @Param("keyword") String keyword);

    // Tenant-level queries (via contract)
    @Query("""
        SELECT s FROM ScopeItem s
        JOIN s.contract c
        WHERE c.tenant.id = :tenantId
        AND s.assignedTo.id = :userId
        AND s.status NOT IN ('COMPLETED', 'CANCELLED')
        ORDER BY s.plannedEndDate ASC
        """)
    List<ScopeItem> findActiveItemsByTenantAndAssignee(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId
    );
}
