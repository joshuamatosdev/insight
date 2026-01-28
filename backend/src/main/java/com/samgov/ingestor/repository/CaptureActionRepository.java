package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.CaptureAction;
import com.samgov.ingestor.model.CaptureAction.ActionPriority;
import com.samgov.ingestor.model.CaptureAction.ActionStatus;
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
public interface CaptureActionRepository extends JpaRepository<CaptureAction, UUID> {

    List<CaptureAction> findByCapturePlanId(UUID capturePlanId);

    Page<CaptureAction> findByCapturePlanId(UUID capturePlanId, Pageable pageable);

    Optional<CaptureAction> findByIdAndCapturePlanId(UUID id, UUID capturePlanId);

    List<CaptureAction> findByCapturePlanIdAndStatus(UUID capturePlanId, ActionStatus status);

    List<CaptureAction> findByCapturePlanIdAndPriority(UUID capturePlanId, ActionPriority priority);

    @Query("SELECT a FROM CaptureAction a WHERE a.capturePlan.id = :planId AND a.status NOT IN ('COMPLETED', 'CANCELLED') ORDER BY a.dueDate ASC")
    List<CaptureAction> findPendingActions(@Param("planId") UUID planId);

    @Query("SELECT a FROM CaptureAction a WHERE a.capturePlan.id = :planId AND a.dueDate <= :date AND a.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<CaptureAction> findOverdueActions(
        @Param("planId") UUID planId,
        @Param("date") LocalDate date
    );

    @Query("SELECT a FROM CaptureAction a WHERE a.assignedTo.id = :userId AND a.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<CaptureAction> findByAssignedTo(@Param("userId") UUID userId);

    @Query("SELECT a FROM CaptureAction a WHERE a.assignedTo.id = :userId AND a.status NOT IN ('COMPLETED', 'CANCELLED') ORDER BY a.dueDate ASC")
    List<CaptureAction> findPendingByAssignedTo(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM CaptureAction a WHERE a.capturePlan.id = :planId AND a.status = :status")
    long countByCapturePlanIdAndStatus(
        @Param("planId") UUID planId,
        @Param("status") ActionStatus status
    );

    @Query("SELECT COUNT(a) FROM CaptureAction a WHERE a.capturePlan.id = :planId AND a.status = 'COMPLETED'")
    long countCompletedByCapturePlanId(@Param("planId") UUID planId);

    @Query("SELECT COUNT(a) FROM CaptureAction a WHERE a.capturePlan.id = :planId")
    long countByCapturePlanId(@Param("planId") UUID planId);

    void deleteByCapturePlanId(UUID capturePlanId);
}
