package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.OAuth2Properties;
import com.samgov.ingestor.dto.AuthenticationResponse;
import com.samgov.ingestor.service.OAuth2UserService;
import com.samgov.ingestor.service.OAuth2UserService.OAuthConnectionDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Controller for OAuth2 authentication endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/oauth")
@RequiredArgsConstructor
@Validated
public class OAuth2Controller {

    private final OAuth2UserService oauth2UserService;
    private final OAuth2Properties oauth2Properties;

    /**
     * Get list of enabled OAuth providers
     */
    @GetMapping("/providers")
    public ResponseEntity<ProvidersResponse> getProviders() {
        List<String> providers = oauth2UserService.getEnabledProviders();
        return ResponseEntity.ok(new ProvidersResponse(providers, oauth2Properties.isEnabled()));
    }

    /**
     * Process OAuth callback - exchange code for tokens and authenticate user.
     * This is called by the frontend after the OAuth provider redirects back.
     */
    @PostMapping("/callback")
    public ResponseEntity<AuthenticationResponse> processCallback(
        @Valid @RequestBody OAuthCallbackRequest request
    ) {
        log.info("Processing OAuth callback for provider: {}", request.provider());

        // In a real implementation, we would:
        // 1. Exchange the authorization code for tokens with the provider
        // 2. Fetch user info from the provider
        // 3. Call oauth2UserService.processOAuthLogin()
        
        // For now, we'll accept the user info directly from the frontend
        // (in production, this should be verified server-side)
        
        AuthenticationResponse response = oauth2UserService.processOAuthLogin(
            request.provider(),
            request.providerUserId(),
            request.email(),
            request.firstName(),
            request.lastName(),
            request.accessToken(),
            request.refreshToken(),
            request.expiresAt()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Get current user's linked OAuth connections
     */
    @GetMapping("/connections")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OAuthConnectionDto>> getConnections(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(oauth2UserService.getUserConnections(userId));
    }

    /**
     * Link a new OAuth provider to current user's account
     */
    @PostMapping("/link")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OAuthConnectionDto> linkProvider(
        @Valid @RequestBody OAuthLinkRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        
        var connection = oauth2UserService.linkProvider(
            userId,
            request.provider(),
            request.providerUserId(),
            request.email(),
            request.accessToken(),
            request.refreshToken(),
            request.expiresAt()
        );

        return ResponseEntity.ok(new OAuthConnectionDto(
            connection.getId(),
            connection.getProvider(),
            connection.getEmail(),
            connection.getCreatedAt(),
            connection.getLastLoginAt()
        ));
    }

    /**
     * Unlink an OAuth provider from current user's account
     */
    @DeleteMapping("/connections/{provider}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unlinkProvider(
        @PathVariable String provider,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        oauth2UserService.unlinkProvider(userId, provider);
        return ResponseEntity.ok().build();
    }

    // Request/Response DTOs
    
    public record ProvidersResponse(List<String> providers, boolean enabled) {}

    public record OAuthCallbackRequest(
        @NotBlank String provider,
        @NotBlank String providerUserId,
        @NotBlank String email,
        String firstName,
        String lastName,
        String accessToken,
        String refreshToken,
        Instant expiresAt
    ) {}

    public record OAuthLinkRequest(
        @NotBlank String provider,
        @NotBlank String providerUserId,
        @NotBlank String email,
        String accessToken,
        String refreshToken,
        Instant expiresAt
    ) {}
}
