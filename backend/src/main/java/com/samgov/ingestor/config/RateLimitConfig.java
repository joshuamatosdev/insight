package com.samgov.ingestor.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting configuration to prevent abuse.
 */
@Slf4j
@Configuration
public class RateLimitConfig {

    private static final int REQUESTS_PER_MINUTE = 100;
    private static final int REQUESTS_PER_MINUTE_AUTH = 10;
    private static final int REQUESTS_PER_MINUTE_EXPORT = 5;

    @Bean
    @Order(1)
    public Filter rateLimitFilter() {
        return new RateLimitFilter();
    }

    private static class RateLimitFilter implements Filter {
        private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            
            if (request instanceof HttpServletRequest httpRequest) {
                String clientId = getClientIdentifier(httpRequest);
                String path = httpRequest.getRequestURI();
                
                Bucket bucket = resolveBucket(clientId, path);
                
                if (bucket.tryConsume(1)) {
                    chain.doFilter(request, response);
                } else {
                    HttpServletResponse httpResponse = (HttpServletResponse) response;
                    httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    httpResponse.setHeader("Retry-After", "60");
                    httpResponse.getWriter().write("{\"error\": \"Rate limit exceeded. Please try again later.\"}");
                    
                    log.warn("Rate limit exceeded for client: {}, path: {}", clientId, path);
                }
            } else {
                chain.doFilter(request, response);
            }
        }

        private String getClientIdentifier(HttpServletRequest request) {
            // Try to get user ID from JWT if authenticated
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                // In production, extract user ID from JWT
                return "user:" + authHeader.hashCode();
            }
            
            // Fall back to IP address
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isEmpty()) {
                return "ip:" + forwardedFor.split(",")[0].trim();
            }
            return "ip:" + request.getRemoteAddr();
        }

        private Bucket resolveBucket(String clientId, String path) {
            String bucketKey = clientId + ":" + getBucketType(path);
            
            return buckets.computeIfAbsent(bucketKey, key -> {
                int limit = getLimit(path);
                Bandwidth bandwidth = Bandwidth.classic(limit, 
                    Refill.greedy(limit, Duration.ofMinutes(1)));
                return Bucket.builder().addLimit(bandwidth).build();
            });
        }

        private String getBucketType(String path) {
            if (path.contains("/auth/login") || path.contains("/auth/register")) {
                return "auth";
            }
            if (path.contains("/export")) {
                return "export";
            }
            return "general";
        }

        private int getLimit(String path) {
            if (path.contains("/auth/login") || path.contains("/auth/register")) {
                return REQUESTS_PER_MINUTE_AUTH;
            }
            if (path.contains("/export")) {
                return REQUESTS_PER_MINUTE_EXPORT;
            }
            return REQUESTS_PER_MINUTE;
        }
    }
}
