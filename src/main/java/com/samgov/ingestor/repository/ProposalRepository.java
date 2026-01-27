package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Proposal;
import com.samgov.ingestor.model.Proposal.ProposalStatus;
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
public interface ProposalRepository extends JpaRepository<Proposal, UUID> {

    Page<Proposal> findByTenantId(UUID tenantId, Pageable pageable);

    List<Proposal> findByTenantIdAndStatus(UUID tenantId, ProposalStatus status);

    Optional<Proposal> findByIdAndTenantId(UUID id, UUID tenantId);

    List<Proposal> findByOpportunityId(UUID opportunityId);

    List<Proposal> findByPipelineOpportunityId(UUID pipelineOpportunityId);

    @Query("SELECT p FROM Proposal p WHERE p.tenant.id = :tenantId AND p.status IN :statuses")
    List<Proposal> findByTenantIdAndStatusIn(
        @Param("tenantId") UUID tenantId,
        @Param("statuses") List<ProposalStatus> statuses
    );

    @Query("SELECT p FROM Proposal p WHERE p.tenant.id = :tenantId AND p.dueDate <= :date AND p.status NOT IN ('SUBMITTED', 'AWARDED', 'REJECTED', 'WITHDRAWN')")
    List<Proposal> findDueBefore(
        @Param("tenantId") UUID tenantId,
        @Param("date") LocalDate date
    );

    @Query("SELECT p FROM Proposal p WHERE p.tenant.id = :tenantId AND p.dueDate BETWEEN :startDate AND :endDate")
    List<Proposal> findDueBetween(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(p) FROM Proposal p WHERE p.tenant.id = :tenantId AND p.status = :status")
    long countByTenantIdAndStatus(
        @Param("tenantId") UUID tenantId,
        @Param("status") ProposalStatus status
    );

    @Query("SELECT p FROM Proposal p WHERE p.tenant.id = :tenantId AND p.proposalManager.id = :managerId")
    List<Proposal> findByProposalManager(
        @Param("tenantId") UUID tenantId,
        @Param("managerId") UUID managerId
    );

    @Query("SELECT p FROM Proposal p WHERE p.tenant.id = :tenantId ORDER BY p.dueDate ASC")
    List<Proposal> findUpcoming(@Param("tenantId") UUID tenantId, Pageable pageable);

    boolean existsByProposalNumberAndTenantId(String proposalNumber, UUID tenantId);
}
