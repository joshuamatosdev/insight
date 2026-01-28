package com.samgov.ingestor.config;

import com.samgov.ingestor.model.ApiKey;
import com.samgov.ingestor.repository.ApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Filter for API key authentication.
 * Checks for X-API-Key header and validates against stored API keys.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";

    private final ApiKeyRepository apiKeyRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip if already authenticated
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader(API_KEY_HEADER);

        if (apiKey != null && !apiKey.isBlank()) {
            Optional<ApiKey> keyOpt = apiKeyRepository.findByKeyHash(hashApiKey(apiKey));

            if (keyOpt.isPresent()) {
                ApiKey key = keyOpt.get();

                // Check if active and not expired
                if (key.isActive() && !isExpired(key)) {
                    // Set tenant context
                    TenantContext.setCurrentTenantId(key.getTenant().getId());

                    // Update last used timestamp
                    key.setLastUsedAt(Instant.now());
                    apiKeyRepository.save(key);

                    // Create authentication with API key authorities
                    List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_API"),
                        new SimpleGrantedAuthority("SCOPE_" + key.getScope().name())
                    );

                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                            key.getId().toString(),
                            null,
                            authorities
                        );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("API key authenticated for tenant: {}", key.getTenant().getId());
                } else {
                    log.warn("API key is inactive or expired: {}", key.getName());
                }
            } else {
                log.warn("Invalid API key provided");
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isExpired(ApiKey key) {
        return key.getExpiresAt() != null && key.getExpiresAt().isBefore(Instant.now());
    }

    private String hashApiKey(String apiKey) {
        // Simple hash for lookup - in production use proper hashing
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(apiKey.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
