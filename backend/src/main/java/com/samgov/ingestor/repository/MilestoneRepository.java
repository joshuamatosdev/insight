package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Milestone;
import com.samgov.ingestor.model.Milestone.MilestoneStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID>, JpaSpecificationExecutor<Milestone> {

    // Basic tenant-scoped queries
    Page<Milestone> findByTenant_Id(UUID tenantId, Pageable pageable);

    List<Milestone> findByTenant_Id(UUID tenantId);

    Optional<Milestone> findByTenant_IdAndId(UUID tenantId, UUID id);

    // By contract
    List<Milestone> findByContractIdOrderBySortOrderAsc(UUID contractId);

    List<Milestone> findByContractId(UUID contractId);

    Page<Milestone> findByContractId(UUID contractId, Pageable pageable);

    Optional<Milestone> findByContractIdAndId(UUID contractId, UUID id);

    // By status
    List<Milestone> findByContractIdAndStatus(UUID contractId, MilestoneStatus status);

    Page<Milestone> findByTenant_IdAndStatus(UUID tenantId, MilestoneStatus status, Pageable pageable);

    // Critical path milestones
    @Query("""
        SELECT m FROM Milestone m
        WHERE m.contract.id = :contractId
        AND m.isCriticalPath = true
        ORDER BY m.dueDate ASC, m.sortOrder ASC
        """)
    List<Milestone> findCriticalPathByContractId(@Param("contractId") UUID contractId);

    List<Milestone> findByTenant_IdAndIsCriticalPathTrue(UUID tenantId);

    // Upcoming milestones (due within N days)
    @Query("""
        SELECT m FROM Milestone m
        WHERE m.tenant.id = :tenantId
        AND m.status NOT IN ('COMPLETED', 'CANCELLED')
        AND m.dueDate IS NOT NULL
        AND m.dueDate BETWEEN :today AND :deadline
        ORDER BY m.dueDate ASC
        """)
    List<Milestone> findUpcomingMilestones(
        @Param("tenantId") UUID tenantId,
        @Param("today") LocalDate today,
        @Param("deadline") LocalDate deadline
    );

    @Query("""
        SELECT m FROM Milestone m
        WHERE m.tenant.id = :tenantId
        AND m.status NOT IN ('COMPLETED', 'CANCELLED')
        AND m.dueDate IS NOT NULL
        AND m.dueDate >= :fromDate
        ORDER BY m.dueDate ASC
        """)
    Page<Milestone> findUpcomingMilestonesPaged(
        @Param("tenantId") UUID tenantId,
        @Param("fromDate") LocalDate fromDate,
        Pageable pageable
    );

    // Overdue milestones
    @Query("""
        SELECT m FROM Milestone m
        WHERE m.tenant.id = :tenantId
        AND m.status NOT IN ('COMPLETED', 'CANCELLED')
        AND m.dueDate IS NOT NULL
        AND m.dueDate < :today
        ORDER BY m.dueDate ASC
        """)
    List<Milestone> findOverdueMilestones(
        @Param("tenantId") UUID tenantId,
        @Param("today") LocalDate today
    );

    // Overdue milestones for a specific contract
    @Query("""
        SELECT m FROM Milestone m
        WHERE m.contract.id = :contractId
        AND m.status NOT IN ('COMPLETED', 'CANCELLED')
        AND m.dueDate IS NOT NULL
        AND m.dueDate < :today
        ORDER BY m.dueDate ASC
        """)
    List<Milestone> findOverdueMilestonesByContract(
        @Param("contractId") UUID contractId,
        @Param("today") LocalDate today
    );

    // Timeline view - all milestones for a contract ordered by date
    @Query("""
        SELECT m FROM Milestone m
        LEFT JOIN FETCH m.dependencies
        WHERE m.contract.id = :contractId
        ORDER BY COALESCE(m.dueDate, m.plannedEndDate) ASC, m.sortOrder ASC
        """)
    List<Milestone> findTimelineByContractId(@Param("contractId") UUID contractId);

    // Payment milestones
    @Query("""
        SELECT m FROM Milestone m
        WHERE m.contract.id = :contractId
        AND m.isPaymentMilestone = true
        ORDER BY m.dueDate ASC
        """)
    List<Milestone> findPaymentMilestonesByContractId(@Param("contractId") UUID contractId);

    // Milestones by owner
    Page<Milestone> findByTenant_IdAndOwner_Id(UUID tenantId, UUID ownerId, Pageable pageable);

    List<Milestone> findByOwnerIdAndStatusNot(UUID ownerId, MilestoneStatus status);

    // Count queries
    long countByContractId(UUID contractId);

    long countByContractIdAndStatus(UUID contractId, MilestoneStatus status);

    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.contract.id = :contractId AND m.status NOT IN ('COMPLETED', 'CANCELLED') AND m.dueDate < :today")
    long countOverdueByContractId(@Param("contractId") UUID contractId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.tenant.id = :tenantId AND m.status NOT IN ('COMPLETED', 'CANCELLED') AND m.dueDate < :today")
    long countOverdueByTenantId(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today);

    // Max sort order for new milestone ordering
    @Query("SELECT MAX(m.sortOrder) FROM Milestone m WHERE m.contract.id = :contractId")
    Optional<Integer> findMaxSortOrderByContractId(@Param("contractId") UUID contractId);

    // Check if dependency exists
    @Query("""
        SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END
        FROM Milestone m
        JOIN m.dependencies d
        WHERE m.id = :milestoneId AND d.id = :dependsOnId
        """)
    boolean dependencyExists(@Param("milestoneId") UUID milestoneId, @Param("dependsOnId") UUID dependsOnId);

    // At-risk milestones (in progress but past planned end date)
    @Query("""
        SELECT m FROM Milestone m
        WHERE m.tenant.id = :tenantId
        AND m.status = 'IN_PROGRESS'
        AND m.plannedEndDate IS NOT NULL
        AND m.plannedEndDate < :today
        ORDER BY m.plannedEndDate ASC
        """)
    List<Milestone> findAtRiskMilestones(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today);

    // Search by name
    @Query("""
        SELECT m FROM Milestone m
        WHERE m.tenant.id = :tenantId
        AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Milestone> searchByKeyword(@Param("tenantId") UUID tenantId, @Param("keyword") String keyword, Pageable pageable);

    // Milestones with incomplete dependencies
    @Query("""
        SELECT DISTINCT m FROM Milestone m
        JOIN m.dependencies d
        WHERE m.contract.id = :contractId
        AND m.status = 'NOT_STARTED'
        AND d.status != 'COMPLETED'
        """)
    List<Milestone> findBlockedMilestones(@Param("contractId") UUID contractId);

    // Milestones ready to start (all dependencies completed)
    @Query("""
        SELECT m FROM Milestone m
        WHERE m.contract.id = :contractId
        AND m.status = 'NOT_STARTED'
        AND NOT EXISTS (
            SELECT d FROM Milestone m2
            JOIN m2.dependencies d
            WHERE m2.id = m.id AND d.status != 'COMPLETED'
        )
        ORDER BY m.sortOrder ASC
        """)
    List<Milestone> findReadyToStartMilestones(@Param("contractId") UUID contractId);
}
