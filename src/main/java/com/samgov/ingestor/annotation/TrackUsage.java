package com.samgov.ingestor.annotation;

import com.samgov.ingestor.model.UsageRecord.MetricType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods for automatic usage tracking.
 * When applied to a method, the UsageTrackingAspect will automatically
 * record usage events for the specified metric type.
 *
 * Example usage:
 * <pre>
 * {@code
 * @TrackUsage(metricType = MetricType.API_CALLS)
 * public ResponseEntity<?> getOpportunities() {
 *     // ...
 * }
 *
 * @TrackUsage(metricType = MetricType.OPPORTUNITIES_VIEWED, quantity = 1)
 * public Opportunity viewOpportunity(UUID id) {
 *     // ...
 * }
 * }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface TrackUsage {

    /**
     * The type of metric to track.
     */
    MetricType metricType();

    /**
     * The quantity to record. Defaults to 1.
     * For dynamic quantities, use the aspect's calculation logic.
     */
    long quantity() default 1;

    /**
     * Optional description for the usage record.
     */
    String description() default "";

    /**
     * Whether to track usage even if the method throws an exception.
     * Defaults to false (only track successful invocations).
     */
    boolean trackOnException() default false;
}
