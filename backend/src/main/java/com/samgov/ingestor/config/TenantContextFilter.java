package com.samgov.ingestor.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter that sets TenantContext from request headers.
 * This is a simple filter for development/testing when full JWT security is disabled.
 *
 * Headers:
 * - X-Tenant-Id: UUID of the tenant
 * - X-User-Id: UUID of the user (optional)
 */
@Slf4j
public class TenantContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Clear any existing context
            TenantContext.clear();

            // Set tenant from header
            String tenantIdHeader = request.getHeader("X-Tenant-Id");
            if (tenantIdHeader != null && !tenantIdHeader.isBlank()) {
                try {
                    UUID tenantId = UUID.fromString(tenantIdHeader);
                    TenantContext.setCurrentTenantId(tenantId);
                    log.debug("Set tenant context from header: {}", tenantId);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid X-Tenant-Id header: {}", tenantIdHeader);
                }
            }

            // Set user from header
            String userIdHeader = request.getHeader("X-User-Id");
            if (userIdHeader != null && !userIdHeader.isBlank()) {
                try {
                    UUID userId = UUID.fromString(userIdHeader);
                    TenantContext.setCurrentUserId(userId);
                    log.debug("Set user context from header: {}", userId);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid X-User-Id header: {}", userIdHeader);
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
