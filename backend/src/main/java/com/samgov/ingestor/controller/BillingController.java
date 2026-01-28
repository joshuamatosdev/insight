package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.StripeConfig;
import com.samgov.ingestor.model.Subscription.Plan;
import com.samgov.ingestor.service.SubscriptionService;
import com.samgov.ingestor.service.SubscriptionService.CreateSubscriptionRequest;
import com.samgov.ingestor.service.SubscriptionService.SubscriptionDto;
import com.samgov.ingestor.service.SubscriptionService.UpdateSubscriptionRequest;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Controller for billing and subscription management endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

    private final SubscriptionService subscriptionService;
    private final StripeConfig stripeConfig;

    /**
     * Get the current subscription for the authenticated tenant.
     */
    @GetMapping("/subscription")
    public ResponseEntity<SubscriptionDto> getCurrentSubscription() {
        SubscriptionDto subscription = subscriptionService.getCurrentSubscription();
        return ResponseEntity.ok(subscription);
    }

    /**
     * Get available plans with features and pricing.
     */
    @GetMapping("/plans")
    public ResponseEntity<List<PlanDetails>> getAvailablePlans() {
        List<PlanDetails> plans = List.of(
            new PlanDetails(
                Plan.FREE,
                "Free",
                "Get started with basic features",
                BigDecimal.ZERO,
                "month",
                List.of(
                    "Up to 100 opportunities/month",
                    "Basic search filters",
                    "Email notifications",
                    "1 user"
                ),
                false,
                null
            ),
            new PlanDetails(
                Plan.STARTER,
                "Starter",
                "For small teams getting started",
                new BigDecimal("49.00"),
                "month",
                List.of(
                    "Up to 500 opportunities/month",
                    "Advanced search filters",
                    "Email & SMS notifications",
                    "5 users",
                    "Pipeline management",
                    "Basic analytics"
                ),
                true,
                stripeConfig.getPrices().getStarter()
            ),
            new PlanDetails(
                Plan.PROFESSIONAL,
                "Professional",
                "For growing teams that need more",
                new BigDecimal("149.00"),
                "month",
                List.of(
                    "Unlimited opportunities",
                    "All search filters",
                    "Priority notifications",
                    "25 users",
                    "Advanced pipeline management",
                    "Full analytics & reporting",
                    "API access",
                    "Custom integrations"
                ),
                true,
                stripeConfig.getPrices().getProfessional()
            ),
            new PlanDetails(
                Plan.ENTERPRISE,
                "Enterprise",
                "For large organizations",
                new BigDecimal("499.00"),
                "month",
                List.of(
                    "Everything in Professional",
                    "Unlimited users",
                    "Dedicated support",
                    "Custom SLA",
                    "SSO/SAML integration",
                    "Advanced security features",
                    "Custom onboarding"
                ),
                true,
                stripeConfig.getPrices().getEnterprise()
            )
        );

        return ResponseEntity.ok(plans);
    }

    /**
     * Create a new subscription.
     */
    @PostMapping("/subscribe")
    @PreAuthorize("@tenantSecurityService.hasPermission('BILLING_MANAGE')")
    public ResponseEntity<SubscriptionDto> createSubscription(
        @RequestBody SubscribeRequest request
    ) {
        try {
            CreateSubscriptionRequest createRequest = new CreateSubscriptionRequest(request.plan());
            SubscriptionDto subscription = subscriptionService.createSubscription(createRequest);
            log.info("Created subscription for plan: {}", request.plan());
            return ResponseEntity.status(HttpStatus.CREATED).body(subscription);
        } catch (StripeException e) {
            log.error("Stripe error creating subscription: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(null);
        }
    }

    /**
     * Cancel the current subscription at the end of the billing period.
     */
    @PostMapping("/cancel")
    @PreAuthorize("@tenantSecurityService.hasPermission('BILLING_MANAGE')")
    public ResponseEntity<SubscriptionDto> cancelSubscription(
        @RequestParam(defaultValue = "false") boolean immediate
    ) {
        try {
            SubscriptionDto subscription;
            if (immediate) {
                subscription = subscriptionService.cancelSubscriptionImmediately();
            } else {
                subscription = subscriptionService.cancelSubscription();
            }
            log.info("Canceled subscription (immediate={})", immediate);
            return ResponseEntity.ok(subscription);
        } catch (StripeException e) {
            log.error("Stripe error canceling subscription: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Update the subscription to a new plan.
     */
    @PutMapping("/plan")
    @PreAuthorize("@tenantSecurityService.hasPermission('BILLING_MANAGE')")
    public ResponseEntity<SubscriptionDto> updatePlan(
        @RequestBody UpdatePlanRequest request
    ) {
        try {
            UpdateSubscriptionRequest updateRequest = new UpdateSubscriptionRequest(request.plan());
            SubscriptionDto subscription = subscriptionService.updateSubscription(updateRequest);
            log.info("Updated subscription to plan: {}", request.plan());
            return ResponseEntity.ok(subscription);
        } catch (StripeException e) {
            log.error("Stripe error updating plan: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Handle Stripe webhook events.
     * This endpoint should be excluded from authentication.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String signature
    ) {
        try {
            subscriptionService.handleWebhook(payload, signature);
            return ResponseEntity.ok(Map.of("status", "received"));
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe webhook signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid signature"));
        }
    }

    /**
     * Get Stripe publishable key for frontend.
     */
    @GetMapping("/config")
    public ResponseEntity<BillingConfig> getBillingConfig() {
        return ResponseEntity.ok(new BillingConfig(
            stripeConfig.getPublishableKey(),
            stripeConfig.isConfigured()
        ));
    }

    // Request/Response DTOs

    public record SubscribeRequest(Plan plan) {}

    public record UpdatePlanRequest(Plan plan) {}

    public record PlanDetails(
        Plan id,
        String name,
        String description,
        BigDecimal price,
        String interval,
        List<String> features,
        boolean requiresPayment,
        String stripePriceId
    ) {}

    public record BillingConfig(
        String publishableKey,
        boolean configured
    ) {}
}
