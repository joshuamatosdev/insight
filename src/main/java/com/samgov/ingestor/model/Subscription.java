package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing a tenant's subscription to the platform.
 * Stores Stripe customer and subscription IDs along with plan details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "subscriptions", indexes = {
    @Index(name = "idx_subscription_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_subscription_stripe_customer_id", columnList = "stripe_customer_id"),
    @Index(name = "idx_subscription_stripe_subscription_id", columnList = "stripe_subscription_id"),
    @Index(name = "idx_subscription_status", columnList = "status"),
    @Index(name = "idx_subscription_plan", columnList = "plan")
})
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "stripe_customer_id", nullable = false)
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id")
    private String stripeSubscriptionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false)
    @Builder.Default
    private Plan plan = Plan.FREE;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "current_period_start")
    private Instant currentPeriodStart;

    @Column(name = "current_period_end")
    private Instant currentPeriodEnd;

    @Column(name = "cancel_at_period_end")
    @Builder.Default
    private Boolean cancelAtPeriodEnd = false;

    @Column(name = "canceled_at")
    private Instant canceledAt;

    @Column(name = "trial_start")
    private Instant trialStart;

    @Column(name = "trial_end")
    private Instant trialEnd;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Check if the subscription is currently active (not canceled, past_due, or unpaid).
     */
    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE || status == SubscriptionStatus.TRIALING;
    }

    /**
     * Check if the subscription is in trial period.
     */
    public boolean isTrialing() {
        return status == SubscriptionStatus.TRIALING;
    }

    /**
     * Check if the subscription has expired.
     */
    public boolean isExpired() {
        if (currentPeriodEnd == null) {
            return false;
        }
        return Instant.now().isAfter(currentPeriodEnd) &&
               (status == SubscriptionStatus.CANCELED || status == SubscriptionStatus.UNPAID);
    }

    /**
     * Subscription plans available on the platform.
     */
    public enum Plan {
        FREE,
        STARTER,
        PROFESSIONAL,
        ENTERPRISE
    }

    /**
     * Possible subscription statuses (aligned with Stripe subscription statuses).
     */
    public enum SubscriptionStatus {
        /**
         * Subscription is active and in good standing.
         */
        ACTIVE,

        /**
         * Subscription has been canceled and will end at period end.
         */
        CANCELED,

        /**
         * Payment is past due but subscription is still active.
         */
        PAST_DUE,

        /**
         * Subscription is in trial period.
         */
        TRIALING,

        /**
         * Subscription is unpaid and may be suspended.
         */
        UNPAID,

        /**
         * Subscription is incomplete (awaiting payment).
         */
        INCOMPLETE,

        /**
         * Subscription setup has expired.
         */
        INCOMPLETE_EXPIRED,

        /**
         * Subscription is paused.
         */
        PAUSED
    }
}
