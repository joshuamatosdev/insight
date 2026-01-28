package com.samgov.ingestor.config;

import com.samgov.ingestor.repository.TenantMembershipRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TenantMembershipRepository tenantMembershipRepository;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Clear context at start of request
        TenantContext.clear();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // Set user context from JWT
                    UUID userId = jwtService.extractUserId(jwt);
                    if (userId != null) {
                        TenantContext.setCurrentUserId(userId);
                    }

                    // Set tenant context from header - VALIDATE user has access
                    String tenantIdHeader = request.getHeader("X-Tenant-Id");
                    if (tenantIdHeader != null && !tenantIdHeader.isBlank() && userId != null) {
                        try {
                            UUID tenantId = UUID.fromString(tenantIdHeader);
                            // CRITICAL: Verify user has membership in the requested tenant
                            boolean hasAccess = tenantMembershipRepository.existsByUserIdAndTenantId(userId, tenantId);
                            if (hasAccess) {
                                TenantContext.setCurrentTenantId(tenantId);
                            } else {
                                log.warn("User {} attempted to access tenant {} without membership", userId, tenantId);
                            }
                        } catch (IllegalArgumentException e) {
                            log.warn("Invalid X-Tenant-Id header: {}", tenantIdHeader);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Always clear context after request
            TenantContext.clear();
        }
    }
}
