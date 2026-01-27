package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Subscription;
import com.samgov.ingestor.model.Subscription.Plan;
import com.samgov.ingestor.model.Subscription.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for managing Subscription entities.
 */
@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    /**
     * Find subscription by tenant ID.
     */
    Optional<Subscription> findByTenantId(UUID tenantId);

    /**
     * Find subscription by Stripe customer ID.
     */
    Optional<Subscription> findByStripeCustomerId(String stripeCustomerId);

    /**
     * Find subscription by Stripe subscription ID.
     */
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);

    /**
     * Find all subscriptions with a specific status.
     */
    List<Subscription> findByStatus(SubscriptionStatus status);

    /**
     * Find all subscriptions with a specific plan.
     */
    List<Subscription> findByPlan(Plan plan);

    /**
     * Find subscriptions expiring before a given date.
     */
    @Query("SELECT s FROM Subscription s WHERE s.currentPeriodEnd < :cutoff AND s.status = :status")
    List<Subscription> findExpiringBefore(
        @Param("cutoff") Instant cutoff,
        @Param("status") SubscriptionStatus status
    );

    /**
     * Find subscriptions in trial ending before a given date.
     */
    @Query("SELECT s FROM Subscription s WHERE s.trialEnd < :cutoff AND s.status = 'TRIALING'")
    List<Subscription> findTrialsEndingBefore(@Param("cutoff") Instant cutoff);

    /**
     * Update subscription status by Stripe subscription ID.
     */
    @Modifying
    @Query("UPDATE Subscription s SET s.status = :status, s.updatedAt = :now " +
           "WHERE s.stripeSubscriptionId = :stripeSubscriptionId")
    int updateStatusByStripeSubscriptionId(
        @Param("stripeSubscriptionId") String stripeSubscriptionId,
        @Param("status") SubscriptionStatus status,
        @Param("now") Instant now
    );

    /**
     * Check if a tenant has an active subscription.
     */
    @Query("SELECT COUNT(s) > 0 FROM Subscription s WHERE s.tenant.id = :tenantId " +
           "AND s.status IN ('ACTIVE', 'TRIALING')")
    boolean hasActiveSubscription(@Param("tenantId") UUID tenantId);

    /**
     * Find all subscriptions set to cancel at period end.
     */
    List<Subscription> findByCancelAtPeriodEndTrue();
}
