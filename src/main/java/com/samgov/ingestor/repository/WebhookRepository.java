package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Webhook;
import com.samgov.ingestor.model.Webhook.WebhookEventType;
import com.samgov.ingestor.model.Webhook.WebhookStatus;
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
public interface WebhookRepository extends JpaRepository<Webhook, UUID> {

    // Find by tenant
    Page<Webhook> findByTenantId(UUID tenantId, Pageable pageable);

    List<Webhook> findByTenantIdAndIsActiveTrue(UUID tenantId);

    // Find by event type (for dispatching)
    List<Webhook> findByTenantIdAndEventTypeAndIsActiveTrue(UUID tenantId, WebhookEventType eventType);

    // Find by status
    Page<Webhook> findByTenantIdAndStatus(UUID tenantId, WebhookStatus status, Pageable pageable);

    List<Webhook> findByStatus(WebhookStatus status);

    // Find failing webhooks
    @Query("SELECT w FROM Webhook w WHERE w.tenant.id = :tenantId AND w.status = 'FAILING'")
    List<Webhook> findFailingWebhooks(@Param("tenantId") UUID tenantId);

    // Find webhooks with consecutive failures
    @Query("SELECT w FROM Webhook w WHERE w.consecutiveFailures >= :threshold AND w.isActive = true")
    List<Webhook> findWebhooksWithFailures(@Param("threshold") int threshold);

    // Count by tenant
    long countByTenantId(UUID tenantId);

    long countByTenantIdAndIsActiveTrue(UUID tenantId);

    long countByTenantIdAndStatus(UUID tenantId, WebhookStatus status);

    // Statistics
    @Query("SELECT SUM(w.totalDeliveries) FROM Webhook w WHERE w.tenant.id = :tenantId")
    Long getTotalDeliveriesByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(w.successfulDeliveries) FROM Webhook w WHERE w.tenant.id = :tenantId")
    Long getSuccessfulDeliveriesByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(w.failedDeliveries) FROM Webhook w WHERE w.tenant.id = :tenantId")
    Long getFailedDeliveriesByTenant(@Param("tenantId") UUID tenantId);

    // Find by event type for all active
    @Query("SELECT w FROM Webhook w WHERE w.eventType = :eventType AND w.isActive = true " +
           "AND w.status IN ('ACTIVE', 'FAILING')")
    List<Webhook> findActiveWebhooksByEventType(@Param("eventType") WebhookEventType eventType);

    // Find webhooks not recently used
    @Query("SELECT w FROM Webhook w WHERE w.tenant.id = :tenantId AND w.isActive = true " +
           "AND (w.lastDeliveryAt IS NULL OR w.lastDeliveryAt < :since)")
    List<Webhook> findUnusedWebhooks(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    // Search
    @Query("SELECT w FROM Webhook w WHERE w.tenant.id = :tenantId AND " +
           "(LOWER(w.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.url) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Webhook> searchByTenant(@Param("tenantId") UUID tenantId, @Param("search") String search, Pageable pageable);

    // Check for duplicate URL + event
    boolean existsByTenantIdAndUrlAndEventType(UUID tenantId, String url, WebhookEventType eventType);
}
