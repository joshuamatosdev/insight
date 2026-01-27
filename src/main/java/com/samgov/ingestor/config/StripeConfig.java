package com.samgov.ingestor.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Stripe payment processing.
 * Configures the Stripe API key and webhook secret from environment variables.
 */
@Slf4j
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "stripe")
public class StripeConfig {

    /**
     * Stripe secret API key (from environment variable STRIPE_SECRET_KEY)
     */
    private String secretKey;

    /**
     * Stripe webhook signing secret (from environment variable STRIPE_WEBHOOK_SECRET)
     */
    private String webhookSecret;

    /**
     * Stripe publishable key for frontend (from environment variable STRIPE_PUBLISHABLE_KEY)
     */
    private String publishableKey;

    /**
     * Price IDs for each subscription plan
     */
    private PlanPrices prices = new PlanPrices();

    /**
     * Initialize Stripe with the secret key on startup.
     */
    @PostConstruct
    public void init() {
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
            log.info("Stripe API configured successfully");
        } else {
            log.warn("Stripe secret key not configured - billing features will be disabled");
        }
    }

    /**
     * Check if Stripe is properly configured.
     */
    public boolean isConfigured() {
        return secretKey != null && !secretKey.isBlank();
    }

    /**
     * Price IDs for subscription plans.
     */
    @Getter
    @Setter
    public static class PlanPrices {
        private String starter;
        private String professional;
        private String enterprise;
    }
}
