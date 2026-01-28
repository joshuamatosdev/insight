package com.samgov.ingestor.aspect;

import com.samgov.ingestor.annotation.TrackUsage;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.UsageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * AOP Aspect for automatic usage tracking.
 *
 * This aspect intercepts methods annotated with @TrackUsage and automatically
 * records usage metrics for billing purposes. The usage is recorded asynchronously
 * to avoid impacting API response times.
 *
 * Usage tracking is only performed when:
 * 1. A tenant context is available (user is authenticated)
 * 2. The method completes successfully (unless trackOnException is true)
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class UsageTrackingAspect {

    private final UsageService usageService;

    /**
     * Around advice for methods annotated with @TrackUsage.
     * Records usage after successful method execution.
     */
    @Around("@annotation(trackUsage)")
    public Object trackUsage(ProceedingJoinPoint joinPoint, TrackUsage trackUsage) throws Throwable {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean shouldTrack = tenantId != null;
        boolean succeeded = false;

        try {
            Object result = joinPoint.proceed();
            succeeded = true;
            return result;
        } catch (Throwable ex) {
            if (trackUsage.trackOnException() && shouldTrack) {
                recordUsageAsync(tenantId, trackUsage, joinPoint);
            }
            throw ex;
        } finally {
            if (succeeded && shouldTrack) {
                recordUsageAsync(tenantId, trackUsage, joinPoint);
            }
        }
    }

    /**
     * Records usage asynchronously by queuing the record for batch processing.
     */
    private void recordUsageAsync(UUID tenantId, TrackUsage trackUsage, ProceedingJoinPoint joinPoint) {
        try {
            String description = trackUsage.description();
            if (description.isEmpty()) {
                // Generate description from method name
                MethodSignature signature = (MethodSignature) joinPoint.getSignature();
                description = signature.getDeclaringType().getSimpleName() + "." + signature.getName();
            }

            usageService.queueUsageRecord(
                tenantId,
                trackUsage.metricType(),
                trackUsage.quantity(),
                description
            );

            log.trace("Queued usage tracking: tenant={}, metric={}, quantity={}, method={}",
                tenantId, trackUsage.metricType(), trackUsage.quantity(), description);
        } catch (Exception e) {
            // Don't let usage tracking failures affect the main request
            log.warn("Failed to queue usage tracking: {}", e.getMessage());
        }
    }

    /**
     * Additional pointcut for tracking API calls on all REST controller methods.
     * This provides automatic API call tracking without requiring annotations.
     */
    @Around("execution(* com.samgov.ingestor.controller.*Controller.*(..))")
    public Object trackApiCalls(ProceedingJoinPoint joinPoint) throws Throwable {
        UUID tenantId = TenantContext.getCurrentTenantId();

        try {
            Object result = joinPoint.proceed();

            // Track successful API calls
            if (tenantId != null) {
                MethodSignature signature = (MethodSignature) joinPoint.getSignature();
                String methodName = signature.getDeclaringType().getSimpleName() + "." + signature.getName();

                usageService.queueUsageRecord(
                    tenantId,
                    com.samgov.ingestor.model.UsageRecord.MetricType.API_CALLS,
                    1,
                    methodName
                );
            }

            return result;
        } catch (Throwable ex) {
            // Don't track failed API calls
            throw ex;
        }
    }
}
