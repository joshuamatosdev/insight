package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.TeammingAgreement;
import com.samgov.ingestor.model.TeammingAgreement.AgreementStatus;
import com.samgov.ingestor.model.TeammingAgreement.AgreementType;
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
public interface TeammingAgreementRepository extends JpaRepository<TeammingAgreement, UUID> {

    Page<TeammingAgreement> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<TeammingAgreement> findByIdAndTenantId(UUID id, UUID tenantId);

    List<TeammingAgreement> findByPartnerId(UUID partnerId);

    List<TeammingAgreement> findByOpportunityId(String opportunityId);

    List<TeammingAgreement> findByProposalId(UUID proposalId);

    List<TeammingAgreement> findByTenantIdAndStatus(UUID tenantId, AgreementStatus status);

    List<TeammingAgreement> findByTenantIdAndAgreementType(UUID tenantId, AgreementType agreementType);

    @Query("SELECT a FROM TeammingAgreement a WHERE a.tenant.id = :tenantId AND a.status = 'ACTIVE'")
    List<TeammingAgreement> findActiveAgreements(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM TeammingAgreement a WHERE a.tenant.id = :tenantId AND a.partner.id = :partnerId AND a.status = 'ACTIVE'")
    List<TeammingAgreement> findActiveAgreementsByPartner(
        @Param("tenantId") UUID tenantId,
        @Param("partnerId") UUID partnerId
    );

    @Query("SELECT a FROM TeammingAgreement a WHERE a.tenant.id = :tenantId AND a.expirationDate <= :date AND a.status = 'ACTIVE'")
    List<TeammingAgreement> findExpiringSoon(
        @Param("tenantId") UUID tenantId,
        @Param("date") LocalDate date
    );

    @Query("SELECT a FROM TeammingAgreement a WHERE a.tenant.id = :tenantId AND a.ndaRequired = true AND a.ndaSigned = false AND a.status IN ('DRAFT', 'PENDING_REVIEW', 'PENDING_SIGNATURE')")
    List<TeammingAgreement> findPendingNda(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(a) FROM TeammingAgreement a WHERE a.tenant.id = :tenantId AND a.status = :status")
    long countByTenantIdAndStatus(
        @Param("tenantId") UUID tenantId,
        @Param("status") AgreementStatus status
    );

    @Query("SELECT COUNT(a) FROM TeammingAgreement a WHERE a.partner.id = :partnerId AND a.status = 'ACTIVE'")
    long countActiveByPartnerId(@Param("partnerId") UUID partnerId);
}
