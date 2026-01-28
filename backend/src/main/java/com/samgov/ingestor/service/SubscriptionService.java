package com.samgov.ingestor.service;

import com.samgov.ingestor.config.StripeConfig;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.BadRequestException;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Subscription;
import com.samgov.ingestor.model.Subscription.Plan;
import com.samgov.ingestor.model.Subscription.SubscriptionStatus;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.SubscriptionRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.SubscriptionCancelParams;
import com.stripe.param.SubscriptionCreateParams;
import com.stripe.param.SubscriptionUpdateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing tenant subscriptions and Stripe integration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final TenantRepository tenantRepository;
    private final StripeConfig stripeConfig;

    /**
     * Get the current subscription for the authenticated tenant.
     */
    @Transactional(readOnly = true)
    public SubscriptionDto getCurrentSubscription() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new BadRequestException("No tenant context available");
        }

        return subscriptionRepository.findByTenantId(tenantId)
            .map(SubscriptionDto::fromEntity)
            .orElse(createDefaultSubscriptionDto());
    }

    /**
     * Get subscription for a specific tenant.
     */
    @Transactional(readOnly = true)
    public SubscriptionDto getSubscription(UUID tenantId) {
        return subscriptionRepository.findByTenantId(tenantId)
            .map(SubscriptionDto::fromEntity)
            .orElse(createDefaultSubscriptionDto());
    }

    /**
     * Create a Stripe customer for a tenant.
     */
    @Transactional
    public String createCustomer(UUID tenantId) throws StripeException {
        if (!stripeConfig.isConfigured()) {
            throw new BadRequestException("Stripe is not configured");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        // Check if customer already exists
        Optional<Subscription> existingSubscription = subscriptionRepository.findByTenantId(tenantId);
        if (existingSubscription.isPresent()) {
            return existingSubscription.get().getStripeCustomerId();
        }

        // Create Stripe customer
        CustomerCreateParams params = CustomerCreateParams.builder()
            .setName(tenant.getName())
            .setMetadata(Map.of(
                "tenant_id", tenantId.toString(),
                "tenant_slug", tenant.getSlug()
            ))
            .build();

        Customer customer = Customer.create(params);
        log.info("Created Stripe customer {} for tenant {}", customer.getId(), tenantId);

        // Create subscription record
        Subscription subscription = Subscription.builder()
            .tenant(tenant)
            .stripeCustomerId(customer.getId())
            .plan(Plan.FREE)
            .status(SubscriptionStatus.ACTIVE)
            .build();

        subscriptionRepository.save(subscription);

        return customer.getId();
    }

    /**
     * Create a new subscription for a tenant.
     */
    @Transactional
    public SubscriptionDto createSubscription(CreateSubscriptionRequest request) throws StripeException {
        if (!stripeConfig.isConfigured()) {
            throw new BadRequestException("Stripe is not configured");
        }

        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new BadRequestException("No tenant context available");
        }

        // Get or create subscription record
        Subscription subscription = subscriptionRepository.findByTenantId(tenantId)
            .orElseGet(() -> {
                Tenant tenant = tenantRepository.findById(tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
                return Subscription.builder()
                    .tenant(tenant)
                    .plan(Plan.FREE)
                    .status(SubscriptionStatus.ACTIVE)
                    .build();
            });

        // Create Stripe customer if needed
        if (subscription.getStripeCustomerId() == null) {
            String customerId = createCustomer(tenantId);
            subscription.setStripeCustomerId(customerId);
        }

        // Get price ID for the plan
        String priceId = getPriceIdForPlan(request.plan());
        if (priceId == null) {
            throw new BadRequestException("Invalid plan: " + request.plan());
        }

        // Create Stripe subscription
        SubscriptionCreateParams params = SubscriptionCreateParams.builder()
            .setCustomer(subscription.getStripeCustomerId())
            .addItem(SubscriptionCreateParams.Item.builder()
                .setPrice(priceId)
                .build())
            .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
            .addExpand("latest_invoice.payment_intent")
            .build();

        com.stripe.model.Subscription stripeSubscription = com.stripe.model.Subscription.create(params);

        // Update subscription record
        subscription.setStripeSubscriptionId(stripeSubscription.getId());
        subscription.setPlan(request.plan());
        subscription.setStatus(mapStripeStatus(stripeSubscription.getStatus()));
        subscription.setCurrentPeriodStart(Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodStart()));
        subscription.setCurrentPeriodEnd(Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd()));

        subscription = subscriptionRepository.save(subscription);
        log.info("Created subscription {} for tenant {}", stripeSubscription.getId(), tenantId);

        return SubscriptionDto.fromEntity(subscription);
    }

    /**
     * Cancel a subscription at the end of the current billing period.
     */
    @Transactional
    public SubscriptionDto cancelSubscription() throws StripeException {
        if (!stripeConfig.isConfigured()) {
            throw new BadRequestException("Stripe is not configured");
        }

        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new BadRequestException("No tenant context available");
        }

        Subscription subscription = subscriptionRepository.findByTenantId(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("No subscription found"));

        if (subscription.getStripeSubscriptionId() == null) {
            throw new BadRequestException("No active Stripe subscription to cancel");
        }

        // Cancel Stripe subscription at period end
        com.stripe.model.Subscription stripeSubscription =
            com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
            .setCancelAtPeriodEnd(true)
            .build();

        stripeSubscription = stripeSubscription.update(params);

        // Update local record
        subscription.setCancelAtPeriodEnd(true);
        subscription.setCanceledAt(Instant.now());
        subscription = subscriptionRepository.save(subscription);

        log.info("Canceled subscription {} for tenant {} at period end",
            subscription.getStripeSubscriptionId(), tenantId);

        return SubscriptionDto.fromEntity(subscription);
    }

    /**
     * Immediately cancel a subscription (no waiting for period end).
     */
    @Transactional
    public SubscriptionDto cancelSubscriptionImmediately() throws StripeException {
        if (!stripeConfig.isConfigured()) {
            throw new BadRequestException("Stripe is not configured");
        }

        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new BadRequestException("No tenant context available");
        }

        Subscription subscription = subscriptionRepository.findByTenantId(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("No subscription found"));

        if (subscription.getStripeSubscriptionId() == null) {
            throw new BadRequestException("No active Stripe subscription to cancel");
        }

        // Cancel Stripe subscription immediately
        com.stripe.model.Subscription stripeSubscription =
            com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        SubscriptionCancelParams params = SubscriptionCancelParams.builder().build();
        stripeSubscription.cancel(params);

        // Update local record
        subscription.setStatus(SubscriptionStatus.CANCELED);
        subscription.setCanceledAt(Instant.now());
        subscription.setPlan(Plan.FREE);
        subscription.setStripeSubscriptionId(null);
        subscription = subscriptionRepository.save(subscription);

        log.info("Immediately canceled subscription for tenant {}", tenantId);

        return SubscriptionDto.fromEntity(subscription);
    }

    /**
     * Update subscription to a new plan.
     */
    @Transactional
    public SubscriptionDto updateSubscription(UpdateSubscriptionRequest request) throws StripeException {
        if (!stripeConfig.isConfigured()) {
            throw new BadRequestException("Stripe is not configured");
        }

        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new BadRequestException("No tenant context available");
        }

        Subscription subscription = subscriptionRepository.findByTenantId(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("No subscription found"));

        if (subscription.getStripeSubscriptionId() == null) {
            // No existing subscription, create a new one
            return createSubscription(new CreateSubscriptionRequest(request.plan()));
        }

        // Get price ID for new plan
        String priceId = getPriceIdForPlan(request.plan());
        if (priceId == null) {
            throw new BadRequestException("Invalid plan: " + request.plan());
        }

        // Update Stripe subscription
        com.stripe.model.Subscription stripeSubscription =
            com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        String itemId = stripeSubscription.getItems().getData().get(0).getId();

        SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
            .addItem(SubscriptionUpdateParams.Item.builder()
                .setId(itemId)
                .setPrice(priceId)
                .build())
            .setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.CREATE_PRORATIONS)
            .build();

        stripeSubscription = stripeSubscription.update(params);

        // Update local record
        subscription.setPlan(request.plan());
        subscription.setStatus(mapStripeStatus(stripeSubscription.getStatus()));
        subscription.setCurrentPeriodStart(Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodStart()));
        subscription.setCurrentPeriodEnd(Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd()));
        subscription.setCancelAtPeriodEnd(false);
        subscription.setCanceledAt(null);
        subscription = subscriptionRepository.save(subscription);

        log.info("Updated subscription {} to plan {} for tenant {}",
            subscription.getStripeSubscriptionId(), request.plan(), tenantId);

        return SubscriptionDto.fromEntity(subscription);
    }

    /**
     * Handle incoming Stripe webhook events.
     */
    @Transactional
    public void handleWebhook(String payload, String signature) throws SignatureVerificationException {
        if (!stripeConfig.isConfigured()) {
            log.warn("Stripe webhook received but Stripe is not configured");
            return;
        }

        Event event = Webhook.constructEvent(payload, signature, stripeConfig.getWebhookSecret());

        log.info("Received Stripe webhook event: {} ({})", event.getType(), event.getId());

        switch (event.getType()) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
                handleSubscriptionUpdated(event);
                break;
            case "customer.subscription.deleted":
                handleSubscriptionDeleted(event);
                break;
            case "invoice.payment_succeeded":
                handlePaymentSucceeded(event);
                break;
            case "invoice.payment_failed":
                handlePaymentFailed(event);
                break;
            default:
                log.debug("Unhandled Stripe webhook event type: {}", event.getType());
        }
    }

    private void handleSubscriptionUpdated(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isEmpty()) {
            log.warn("Failed to deserialize subscription event");
            return;
        }

        StripeObject stripeObject = deserializer.getObject().get();
        if (!(stripeObject instanceof com.stripe.model.Subscription stripeSub)) {
            return;
        }

        subscriptionRepository.findByStripeSubscriptionId(stripeSub.getId())
            .ifPresent(subscription -> {
                subscription.setStatus(mapStripeStatus(stripeSub.getStatus()));
                subscription.setCurrentPeriodStart(Instant.ofEpochSecond(stripeSub.getCurrentPeriodStart()));
                subscription.setCurrentPeriodEnd(Instant.ofEpochSecond(stripeSub.getCurrentPeriodEnd()));
                subscription.setCancelAtPeriodEnd(stripeSub.getCancelAtPeriodEnd());
                subscriptionRepository.save(subscription);
                log.info("Updated subscription {} from webhook", subscription.getId());
            });
    }

    private void handleSubscriptionDeleted(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isEmpty()) {
            return;
        }

        StripeObject stripeObject = deserializer.getObject().get();
        if (!(stripeObject instanceof com.stripe.model.Subscription stripeSub)) {
            return;
        }

        subscriptionRepository.findByStripeSubscriptionId(stripeSub.getId())
            .ifPresent(subscription -> {
                subscription.setStatus(SubscriptionStatus.CANCELED);
                subscription.setPlan(Plan.FREE);
                subscription.setStripeSubscriptionId(null);
                subscriptionRepository.save(subscription);
                log.info("Subscription {} deleted from webhook", subscription.getId());
            });
    }

    private void handlePaymentSucceeded(Event event) {
        log.info("Payment succeeded for event {}", event.getId());
        // Could trigger email notification or update tenant features
    }

    private void handlePaymentFailed(Event event) {
        log.warn("Payment failed for event {}", event.getId());
        // Could trigger email notification or alert
    }

    private String getPriceIdForPlan(Plan plan) {
        return switch (plan) {
            case STARTER -> stripeConfig.getPrices().getStarter();
            case PROFESSIONAL -> stripeConfig.getPrices().getProfessional();
            case ENTERPRISE -> stripeConfig.getPrices().getEnterprise();
            case FREE -> null; // Free plan doesn't have a Stripe price
        };
    }

    private SubscriptionStatus mapStripeStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "active" -> SubscriptionStatus.ACTIVE;
            case "canceled" -> SubscriptionStatus.CANCELED;
            case "past_due" -> SubscriptionStatus.PAST_DUE;
            case "trialing" -> SubscriptionStatus.TRIALING;
            case "unpaid" -> SubscriptionStatus.UNPAID;
            case "incomplete" -> SubscriptionStatus.INCOMPLETE;
            case "incomplete_expired" -> SubscriptionStatus.INCOMPLETE_EXPIRED;
            case "paused" -> SubscriptionStatus.PAUSED;
            default -> SubscriptionStatus.ACTIVE;
        };
    }

    private SubscriptionDto createDefaultSubscriptionDto() {
        return new SubscriptionDto(
            null,
            Plan.FREE,
            SubscriptionStatus.ACTIVE,
            null,
            null,
            false,
            null,
            null,
            null
        );
    }

    // Request and Response DTOs

    public record CreateSubscriptionRequest(Plan plan) {}

    public record UpdateSubscriptionRequest(Plan plan) {}

    public record SubscriptionDto(
        UUID id,
        Plan plan,
        SubscriptionStatus status,
        Instant currentPeriodStart,
        Instant currentPeriodEnd,
        Boolean cancelAtPeriodEnd,
        Instant canceledAt,
        Instant trialStart,
        Instant trialEnd
    ) {
        public static SubscriptionDto fromEntity(Subscription entity) {
            return new SubscriptionDto(
                entity.getId(),
                entity.getPlan(),
                entity.getStatus(),
                entity.getCurrentPeriodStart(),
                entity.getCurrentPeriodEnd(),
                entity.getCancelAtPeriodEnd(),
                entity.getCanceledAt(),
                entity.getTrialStart(),
                entity.getTrialEnd()
            );
        }
    }
}
