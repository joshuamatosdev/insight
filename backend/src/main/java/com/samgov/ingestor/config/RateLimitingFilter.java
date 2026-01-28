package com.samgov.ingestor.config;

import com.samgov.ingestor.exception.RateLimitExceededException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import java.io.IOException;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiting filter.
 * For production, use Redis-based rate limiting.
 */
@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, RateLimitEntry> rateLimitMap = new ConcurrentHashMap<>();
    private ScheduledExecutorService cleanupExecutor;

    @Value("${rate.limit.requests-per-minute:60}")
    private int requestsPerMinute;

    @Value("${rate.limit.window-seconds:60}")
    private int windowSeconds;

    @Value("${rate.limit.cleanup-interval-seconds:300}")
    private int cleanupIntervalSeconds;

    @PostConstruct
    public void init() {
        // Schedule periodic cleanup to prevent memory leaks
        cleanupExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "rate-limit-cleanup");
            t.setDaemon(true);
            return t;
        });
        cleanupExecutor.scheduleAtFixedRate(
            this::cleanupExpiredEntries,
            cleanupIntervalSeconds,
            cleanupIntervalSeconds,
            TimeUnit.SECONDS
        );
        log.info("Rate limiting filter initialized with cleanup every {} seconds", cleanupIntervalSeconds);
    }

    @PreDestroy
    public void destroy() {
        if (cleanupExecutor != null) {
            cleanupExecutor.shutdown();
            try {
                if (!cleanupExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                    cleanupExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                cleanupExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    /**
     * Remove expired entries to prevent memory leaks.
     */
    private void cleanupExpiredEntries() {
        Instant now = Instant.now();
        int removed = 0;

        Iterator<Map.Entry<String, RateLimitEntry>> iterator = rateLimitMap.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, RateLimitEntry> entry = iterator.next();
            if (entry.getValue().isExpired(now, windowSeconds)) {
                iterator.remove();
                removed++;
            }
        }

        if (removed > 0) {
            log.debug("Cleaned up {} expired rate limit entries, {} remaining", removed, rateLimitMap.size());
        }
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String clientKey = getClientKey(request);

        if (!isRateLimitExceeded(clientKey)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for client: {}", clientKey);
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setHeader("Retry-After", String.valueOf(windowSeconds));
            response.setContentType("application/json");
            response.getWriter().write("""
                {"error": "Rate limit exceeded", "retryAfter": %d}
                """.formatted(windowSeconds));
        }
    }

    private String getClientKey(HttpServletRequest request) {
        // Check for tenant ID first (authenticated requests)
        String tenantId = request.getHeader("X-Tenant-Id");
        if (tenantId != null && !tenantId.isBlank()) {
            return "tenant:" + tenantId;
        }

        // Fall back to IP address
        String clientIp = getClientIp(request);
        return "ip:" + clientIp;
    }

    private String getClientIp(HttpServletRequest request) {
        // Check various headers for real IP behind proxies
        String[] headerNames = {
            "X-Forwarded-For",
            "X-Real-IP",
            "CF-Connecting-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For may contain multiple IPs, take the first
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }

    private boolean isRateLimitExceeded(String clientKey) {
        Instant now = Instant.now();

        RateLimitEntry entry = rateLimitMap.compute(clientKey, (key, existing) -> {
            if (existing == null || existing.isExpired(now, windowSeconds)) {
                return new RateLimitEntry(now);
            }
            existing.incrementCount();
            return existing;
        });

        return entry.getCount() > requestsPerMinute;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Don't rate limit health checks and public endpoints
        String path = request.getRequestURI();
        return path.startsWith("/actuator/health") ||
               path.startsWith("/actuator/info") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs");
    }

    private static class RateLimitEntry {
        private final Instant windowStart;
        private final AtomicInteger count;

        RateLimitEntry(Instant windowStart) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(1);
        }

        void incrementCount() {
            count.incrementAndGet();
        }

        int getCount() {
            return count.get();
        }

        boolean isExpired(Instant now, int windowSeconds) {
            return windowStart.plusSeconds(windowSeconds).isBefore(now);
        }
    }
}
