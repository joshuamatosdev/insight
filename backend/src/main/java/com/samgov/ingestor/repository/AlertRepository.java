package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Alert;
import com.samgov.ingestor.model.Alert.AlertStatus;
import com.samgov.ingestor.model.Alert.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    Page<Alert> findByUserId(UUID userId, Pageable pageable);

    Page<Alert> findByUserIdAndStatus(UUID userId, AlertStatus status, Pageable pageable);

    Page<Alert> findByUserIdAndType(UUID userId, AlertType type, Pageable pageable);

    Page<Alert> findByUserIdAndTenantId(UUID userId, UUID tenantId, Pageable pageable);

    List<Alert> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, AlertStatus status);

    long countByUserIdAndStatus(UUID userId, AlertStatus status);

    @Modifying
    @Query("UPDATE Alert a SET a.status = :newStatus, a.readAt = :now WHERE a.user.id = :userId AND a.status = :currentStatus")
    int markAllAsRead(@Param("userId") UUID userId, @Param("newStatus") AlertStatus newStatus, @Param("currentStatus") AlertStatus currentStatus, @Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM Alert a WHERE a.createdAt < :cutoff")
    int deleteOldAlerts(@Param("cutoff") Instant cutoff);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.user.id = :userId AND a.status = :status")
    long countUnreadByUserId(@Param("userId") UUID userId, @Param("status") AlertStatus status);
}
