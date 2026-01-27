package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.CapturePlan;
import com.samgov.ingestor.model.CapturePlan.CapturePhase;
import com.samgov.ingestor.model.CapturePlan.CaptureStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CapturePlanRepository extends JpaRepository<CapturePlan, UUID> {

    Page<CapturePlan> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<CapturePlan> findByIdAndTenantId(UUID id, UUID tenantId);

    List<CapturePlan> findByOpportunityId(UUID opportunityId);

    List<CapturePlan> findByTenantIdAndStatus(UUID tenantId, CaptureStatus status);

    List<CapturePlan> findByTenantIdAndPhase(UUID tenantId, CapturePhase phase);

    @Query("SELECT c FROM CapturePlan c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    List<CapturePlan> findActivePlans(@Param("tenantId") UUID tenantId);

    @Query("SELECT c FROM CapturePlan c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE' ORDER BY c.winProbability DESC")
    List<CapturePlan> findActivePlansByPwinDesc(@Param("tenantId") UUID tenantId, Pageable pageable);

    @Query("SELECT c FROM CapturePlan c WHERE c.tenant.id = :tenantId AND c.winProbability >= :minPwin AND c.status = 'ACTIVE'")
    List<CapturePlan> findHighProbabilityPlans(
        @Param("tenantId") UUID tenantId,
        @Param("minPwin") Integer minPwin
    );

    @Query("SELECT c FROM CapturePlan c WHERE c.tenant.id = :tenantId AND c.captureManager.id = :managerId")
    List<CapturePlan> findByCaptureManager(
        @Param("tenantId") UUID tenantId,
        @Param("managerId") UUID managerId
    );

    @Query("SELECT c FROM CapturePlan c WHERE c.tenant.id = :tenantId AND c.bidDecision = 'PENDING' AND c.status = 'ACTIVE'")
    List<CapturePlan> findPendingBidDecision(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(c) FROM CapturePlan c WHERE c.tenant.id = :tenantId AND c.status = :status")
    long countByTenantIdAndStatus(
        @Param("tenantId") UUID tenantId,
        @Param("status") CaptureStatus status
    );

    @Query("SELECT AVG(c.winProbability) FROM CapturePlan c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    Double getAverageWinProbability(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(c.estimatedValue) FROM CapturePlan c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    java.math.BigDecimal getTotalPipelineValue(@Param("tenantId") UUID tenantId);
}
