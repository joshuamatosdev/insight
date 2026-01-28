package com.samgov.ingestor.config;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.binder.MeterBinder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Configuration for custom application metrics.
 * Exposes business-specific metrics for monitoring via Prometheus/Grafana.
 *
 * <p>Metrics exposed:
 * <ul>
 *   <li>samgov_opportunities_indexed_total - Total opportunities indexed</li>
 *   <li>samgov_opportunities_active - Current active opportunities gauge</li>
 *   <li>samgov_searches_performed_total - Total searches performed</li>
 *   <li>samgov_api_calls_total - External API calls with status labels</li>
 *   <li>samgov_ingestion_duration_seconds - Ingestion operation timing</li>
 * </ul>
 */
@Configuration
public class MetricsConfig {

    /**
     * Enables the @Timed annotation for method-level timing metrics.
     */
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }

    /**
     * Custom metrics holder for business-specific counters and gauges.
     * Can be injected into services to record metrics.
     */
    @Bean
    public BusinessMetrics businessMetrics(MeterRegistry registry) {
        return new BusinessMetrics(registry);
    }

    /**
     * Holder class for all custom business metrics.
     * Thread-safe and designed for high-throughput metric recording.
     */
    public static class BusinessMetrics implements MeterBinder {

        private final AtomicLong activeOpportunities = new AtomicLong(0);
        private final AtomicLong pendingIngestionJobs = new AtomicLong(0);

        private Counter opportunitiesIndexedCounter;
        private Counter searchesPerformedCounter;
        private Counter samGovApiCallsSuccessCounter;
        private Counter samGovApiCallsErrorCounter;
        private Counter sbirGovApiCallsSuccessCounter;
        private Counter sbirGovApiCallsErrorCounter;
        private Counter userLoginsCounter;
        private Counter userRegistrationsCounter;
        private Timer ingestionDurationTimer;
        private Timer searchDurationTimer;

        public BusinessMetrics(MeterRegistry registry) {
            bindTo(registry);
        }

        @Override
        public void bindTo(MeterRegistry registry) {
            // Counters for opportunity tracking
            this.opportunitiesIndexedCounter = Counter.builder("samgov.opportunities.indexed")
                    .description("Total number of opportunities indexed")
                    .tag("source", "all")
                    .register(registry);

            // Gauge for active opportunities
            Gauge.builder("samgov.opportunities.active", activeOpportunities, AtomicLong::get)
                    .description("Current number of active opportunities in the system")
                    .register(registry);

            // Gauge for pending ingestion jobs
            Gauge.builder("samgov.ingestion.jobs.pending", pendingIngestionJobs, AtomicLong::get)
                    .description("Number of ingestion jobs waiting to be processed")
                    .register(registry);

            // Search metrics
            this.searchesPerformedCounter = Counter.builder("samgov.searches.performed")
                    .description("Total number of searches performed")
                    .register(registry);

            this.searchDurationTimer = Timer.builder("samgov.search.duration")
                    .description("Time taken to perform searches")
                    .publishPercentiles(0.5, 0.75, 0.95, 0.99)
                    .register(registry);

            // SAM.gov API metrics
            this.samGovApiCallsSuccessCounter = Counter.builder("samgov.api.calls")
                    .description("SAM.gov API calls")
                    .tag("api", "sam.gov")
                    .tag("status", "success")
                    .register(registry);

            this.samGovApiCallsErrorCounter = Counter.builder("samgov.api.calls")
                    .description("SAM.gov API calls")
                    .tag("api", "sam.gov")
                    .tag("status", "error")
                    .register(registry);

            // SBIR.gov API metrics
            this.sbirGovApiCallsSuccessCounter = Counter.builder("samgov.api.calls")
                    .description("SBIR.gov API calls")
                    .tag("api", "sbir.gov")
                    .tag("status", "success")
                    .register(registry);

            this.sbirGovApiCallsErrorCounter = Counter.builder("samgov.api.calls")
                    .description("SBIR.gov API calls")
                    .tag("api", "sbir.gov")
                    .tag("status", "error")
                    .register(registry);

            // User activity metrics
            this.userLoginsCounter = Counter.builder("samgov.user.logins")
                    .description("Total number of user logins")
                    .register(registry);

            this.userRegistrationsCounter = Counter.builder("samgov.user.registrations")
                    .description("Total number of user registrations")
                    .register(registry);

            // Ingestion timing
            this.ingestionDurationTimer = Timer.builder("samgov.ingestion.duration")
                    .description("Time taken to complete ingestion operations")
                    .publishPercentiles(0.5, 0.75, 0.95, 0.99)
                    .register(registry);
        }

        // =========================================================================
        // Opportunity Metrics
        // =========================================================================

        /**
         * Record that opportunities were indexed.
         *
         * @param count Number of opportunities indexed
         */
        public void recordOpportunitiesIndexed(long count) {
            opportunitiesIndexedCounter.increment(count);
        }

        /**
         * Record a single opportunity was indexed.
         */
        public void recordOpportunityIndexed() {
            opportunitiesIndexedCounter.increment();
        }

        /**
         * Set the current number of active opportunities.
         *
         * @param count Current active opportunity count
         */
        public void setActiveOpportunities(long count) {
            activeOpportunities.set(count);
        }

        /**
         * Increment the active opportunities count.
         */
        public void incrementActiveOpportunities() {
            activeOpportunities.incrementAndGet();
        }

        /**
         * Decrement the active opportunities count.
         */
        public void decrementActiveOpportunities() {
            activeOpportunities.decrementAndGet();
        }

        // =========================================================================
        // Search Metrics
        // =========================================================================

        /**
         * Record that a search was performed.
         */
        public void recordSearchPerformed() {
            searchesPerformedCounter.increment();
        }

        /**
         * Get the search duration timer for timing search operations.
         * Usage: businessMetrics.getSearchTimer().record(() -> performSearch());
         *
         * @return Timer for search operations
         */
        public Timer getSearchTimer() {
            return searchDurationTimer;
        }

        // =========================================================================
        // API Call Metrics
        // =========================================================================

        /**
         * Record a successful SAM.gov API call.
         */
        public void recordSamGovApiSuccess() {
            samGovApiCallsSuccessCounter.increment();
        }

        /**
         * Record a failed SAM.gov API call.
         */
        public void recordSamGovApiError() {
            samGovApiCallsErrorCounter.increment();
        }

        /**
         * Record a successful SBIR.gov API call.
         */
        public void recordSbirGovApiSuccess() {
            sbirGovApiCallsSuccessCounter.increment();
        }

        /**
         * Record a failed SBIR.gov API call.
         */
        public void recordSbirGovApiError() {
            sbirGovApiCallsErrorCounter.increment();
        }

        // =========================================================================
        // User Activity Metrics
        // =========================================================================

        /**
         * Record a user login.
         */
        public void recordUserLogin() {
            userLoginsCounter.increment();
        }

        /**
         * Record a new user registration.
         */
        public void recordUserRegistration() {
            userRegistrationsCounter.increment();
        }

        // =========================================================================
        // Ingestion Metrics
        // =========================================================================

        /**
         * Get the ingestion duration timer for timing ingestion operations.
         * Usage: businessMetrics.getIngestionTimer().record(() -> performIngestion());
         *
         * @return Timer for ingestion operations
         */
        public Timer getIngestionTimer() {
            return ingestionDurationTimer;
        }

        /**
         * Increment pending ingestion jobs.
         */
        public void incrementPendingIngestionJobs() {
            pendingIngestionJobs.incrementAndGet();
        }

        /**
         * Decrement pending ingestion jobs.
         */
        public void decrementPendingIngestionJobs() {
            pendingIngestionJobs.decrementAndGet();
        }

        /**
         * Set the pending ingestion jobs count.
         *
         * @param count Number of pending jobs
         */
        public void setPendingIngestionJobs(long count) {
            pendingIngestionJobs.set(count);
        }
    }
}
