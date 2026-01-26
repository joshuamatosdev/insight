package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.AuditLog;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByUserId(UUID userId, Pageable pageable);

    Page<AuditLog> findByTenantId(UUID tenantId, Pageable pageable);

    Page<AuditLog> findByAction(AuditAction action, Pageable pageable);

    @Query("""
        SELECT a FROM AuditLog a
        WHERE a.tenantId = :tenantId
        AND a.createdAt >= :startDate
        AND a.createdAt <= :endDate
        ORDER BY a.createdAt DESC
        """)
    List<AuditLog> findByTenantIdAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT a FROM AuditLog a
        WHERE a.userId = :userId
        AND a.createdAt >= :startDate
        ORDER BY a.createdAt DESC
        """)
    List<AuditLog> findByUserIdSince(
        @Param("userId") UUID userId,
        @Param("startDate") Instant startDate
    );

    @Query("""
        SELECT a FROM AuditLog a
        WHERE a.tenantId = :tenantId
        AND a.action IN :actions
        ORDER BY a.createdAt DESC
        """)
    Page<AuditLog> findByTenantIdAndActions(
        @Param("tenantId") UUID tenantId,
        @Param("actions") List<AuditAction> actions,
        Pageable pageable
    );

    @Query("""
        SELECT a FROM AuditLog a
        WHERE a.entityType = :entityType
        AND a.entityId = :entityId
        ORDER BY a.createdAt DESC
        """)
    List<AuditLog> findByEntity(
        @Param("entityType") String entityType,
        @Param("entityId") String entityId
    );

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId AND a.action = :action AND a.createdAt >= :since")
    long countByTenantIdAndActionSince(
        @Param("tenantId") UUID tenantId,
        @Param("action") AuditAction action,
        @Param("since") Instant since
    );
}
