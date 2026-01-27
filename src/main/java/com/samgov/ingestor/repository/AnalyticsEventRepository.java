package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.AnalyticsEvent;
import com.samgov.ingestor.model.AnalyticsEvent.EntityType;
import com.samgov.ingestor.model.AnalyticsEvent.EventType;
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
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, UUID> {

    Page<AnalyticsEvent> findByTenantIdOrderByTimestampDesc(UUID tenantId, Pageable pageable);

    Page<AnalyticsEvent> findByTenantIdAndUserIdOrderByTimestampDesc(
        UUID tenantId,
        UUID userId,
        Pageable pageable
    );

    Page<AnalyticsEvent> findByTenantIdAndEventTypeOrderByTimestampDesc(
        UUID tenantId,
        EventType eventType,
        Pageable pageable
    );

    @Query("""
        SELECT e FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.timestamp >= :startDate
        AND e.timestamp <= :endDate
        ORDER BY e.timestamp DESC
        """)
    List<AnalyticsEvent> findByTenantIdAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT e FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.eventType = :eventType
        AND e.timestamp >= :startDate
        AND e.timestamp <= :endDate
        ORDER BY e.timestamp DESC
        """)
    List<AnalyticsEvent> findByTenantIdAndEventTypeAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("eventType") EventType eventType,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT e FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.entityType = :entityType
        AND e.entityId = :entityId
        ORDER BY e.timestamp DESC
        """)
    List<AnalyticsEvent> findByEntity(
        @Param("tenantId") UUID tenantId,
        @Param("entityType") EntityType entityType,
        @Param("entityId") String entityId
    );

    @Query("SELECT COUNT(e) FROM AnalyticsEvent e WHERE e.tenant.id = :tenantId AND e.eventType = :eventType AND e.timestamp >= :since")
    long countByTenantIdAndEventTypeSince(
        @Param("tenantId") UUID tenantId,
        @Param("eventType") EventType eventType,
        @Param("since") Instant since
    );

    @Query("""
        SELECT COUNT(DISTINCT e.user.id) FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.timestamp >= :since
        AND e.user IS NOT NULL
        """)
    long countDistinctUsersByTenantIdSince(
        @Param("tenantId") UUID tenantId,
        @Param("since") Instant since
    );

    @Query("""
        SELECT e.eventType, COUNT(e) FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.timestamp >= :startDate
        AND e.timestamp <= :endDate
        GROUP BY e.eventType
        ORDER BY COUNT(e) DESC
        """)
    List<Object[]> countByEventTypeInRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT DATE(e.timestamp), COUNT(e) FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.eventType = :eventType
        AND e.timestamp >= :startDate
        AND e.timestamp <= :endDate
        GROUP BY DATE(e.timestamp)
        ORDER BY DATE(e.timestamp)
        """)
    List<Object[]> countByDateForEventType(
        @Param("tenantId") UUID tenantId,
        @Param("eventType") EventType eventType,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT e.entityId, COUNT(e) FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.eventType = :eventType
        AND e.entityType = :entityType
        AND e.timestamp >= :startDate
        GROUP BY e.entityId
        ORDER BY COUNT(e) DESC
        """)
    List<Object[]> findTopEntitiesByEventType(
        @Param("tenantId") UUID tenantId,
        @Param("eventType") EventType eventType,
        @Param("entityType") EntityType entityType,
        @Param("startDate") Instant startDate,
        Pageable pageable
    );

    @Query("""
        SELECT e.user.id, COUNT(e) FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.timestamp >= :startDate
        AND e.user IS NOT NULL
        GROUP BY e.user.id
        ORDER BY COUNT(e) DESC
        """)
    List<Object[]> findMostActiveUsers(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") Instant startDate,
        Pageable pageable
    );

    @Query("""
        SELECT e FROM AnalyticsEvent e
        WHERE e.tenant.id = :tenantId
        AND e.user.id = :userId
        AND e.timestamp >= :startDate
        ORDER BY e.timestamp DESC
        """)
    List<AnalyticsEvent> findRecentActivityByUser(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId,
        @Param("startDate") Instant startDate,
        Pageable pageable
    );
}
