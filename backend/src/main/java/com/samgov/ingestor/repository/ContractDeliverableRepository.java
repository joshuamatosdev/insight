package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ContractDeliverable;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableStatus;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableType;
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
public interface ContractDeliverableRepository extends JpaRepository<ContractDeliverable, UUID> {

    List<ContractDeliverable> findByContractIdOrderByDueDateAsc(UUID contractId);

    Page<ContractDeliverable> findByContractId(UUID contractId, Pageable pageable);

    Optional<ContractDeliverable> findByContractIdAndId(UUID contractId, UUID id);

    List<ContractDeliverable> findByContractIdAndStatus(UUID contractId, DeliverableStatus status);

    Page<ContractDeliverable> findByContractIdAndStatus(UUID contractId, DeliverableStatus status, Pageable pageable);

    List<ContractDeliverable> findByContractIdAndDueDateBeforeAndStatusNot(UUID contractId, LocalDate dueDate, DeliverableStatus status);

    List<ContractDeliverable> findByContractIdAndDueDateBeforeAndStatusNotIn(UUID contractId, LocalDate dueDate, List<DeliverableStatus> statuses);

    List<ContractDeliverable> findByContractIdAndDeliverableType(UUID contractId, DeliverableType type);

    List<ContractDeliverable> findByOwnerId(UUID ownerId);

    Page<ContractDeliverable> findByOwnerId(UUID ownerId, Pageable pageable);

    // Due soon
    @Query("""
        SELECT d FROM ContractDeliverable d
        WHERE d.contract.id = :contractId
        AND d.status NOT IN ('ACCEPTED', 'WAIVED')
        AND d.dueDate IS NOT NULL
        AND d.dueDate <= :deadline
        AND d.dueDate >= :today
        ORDER BY d.dueDate ASC
        """)
    List<ContractDeliverable> findDueSoon(
        @Param("contractId") UUID contractId,
        @Param("today") LocalDate today,
        @Param("deadline") LocalDate deadline
    );

    // Overdue
    @Query("""
        SELECT d FROM ContractDeliverable d
        WHERE d.contract.id = :contractId
        AND d.status NOT IN ('ACCEPTED', 'WAIVED')
        AND d.dueDate IS NOT NULL
        AND d.dueDate < :today
        ORDER BY d.dueDate ASC
        """)
    List<ContractDeliverable> findOverdue(@Param("contractId") UUID contractId, @Param("today") LocalDate today);

    // By tenant (through contract)
    @Query("""
        SELECT d FROM ContractDeliverable d
        JOIN d.contract c
        WHERE c.tenant.id = :tenantId
        AND d.status NOT IN ('ACCEPTED', 'WAIVED')
        AND d.dueDate IS NOT NULL
        AND d.dueDate <= :deadline
        ORDER BY d.dueDate ASC
        """)
    List<ContractDeliverable> findDueSoonByTenant(
        @Param("tenantId") UUID tenantId,
        @Param("deadline") LocalDate deadline
    );

    @Query("SELECT d FROM ContractDeliverable d JOIN d.contract c WHERE c.tenant.id = :tenantId")
    Page<ContractDeliverable> findByTenantId(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Upcoming deadlines by tenant (for portal aggregation)
    @Query("""
        SELECT d FROM ContractDeliverable d
        JOIN d.contract c
        WHERE c.tenant.id = :tenantId
        AND d.dueDate IS NOT NULL
        AND d.dueDate >= :startDate
        AND d.dueDate <= :endDate
        ORDER BY d.dueDate ASC
        """)
    List<ContractDeliverable> findUpcomingByTenantId(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT d FROM ContractDeliverable d
        JOIN d.contract c
        WHERE c.tenant.id = :tenantId
        AND d.owner.id = :ownerId
        AND d.status NOT IN ('ACCEPTED', 'WAIVED')
        ORDER BY d.dueDate ASC
        """)
    List<ContractDeliverable> findByTenantIdAndOwnerIdPending(
        @Param("tenantId") UUID tenantId,
        @Param("ownerId") UUID ownerId
    );

    @Query("SELECT COUNT(d) FROM ContractDeliverable d WHERE d.contract.id = :contractId AND d.status = :status")
    long countByContractIdAndStatus(@Param("contractId") UUID contractId, @Param("status") DeliverableStatus status);

    @Query("""
        SELECT COUNT(d) FROM ContractDeliverable d
        WHERE d.contract.id = :contractId
        AND d.status NOT IN ('ACCEPTED', 'WAIVED')
        AND d.dueDate < :today
        """)
    long countOverdueByContractId(@Param("contractId") UUID contractId, @Param("today") LocalDate today);

    void deleteByContractId(UUID contractId);
}
