package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.ApiKeyService;
import com.samgov.ingestor.service.ApiKeyService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/api-keys")
@PreAuthorize("isAuthenticated()")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<ApiKeyCreatedResponse> createApiKey(
            @Valid @RequestBody CreateApiKeyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        ApiKeyCreatedResponse response = apiKeyService.createApiKey(tenantId, userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<Page<ApiKeyResponse>> getApiKeys(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        Page<ApiKeyResponse> keys;
        if (search != null && !search.isEmpty()) {
            keys = apiKeyService.searchApiKeys(tenantId, search, pageable);
        } else {
            keys = apiKeyService.getApiKeysByTenant(tenantId, pageable);
        }
        return ResponseEntity.ok(keys);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiKeyResponse> getApiKey(@PathVariable UUID id) {
        return apiKeyService.getApiKey(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-keys")
    public ResponseEntity<Page<ApiKeyResponse>> getMyApiKeys(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(apiKeyService.getApiKeysByUser(userId, pageable));
    }

    @PostMapping("/{id}/revoke")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<Void> revokeApiKey(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        apiKeyService.revokeApiKey(tenantId, id, userId, reason != null ? reason : "Manually revoked");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/regenerate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<ApiKeyCreatedResponse> regenerateApiKey(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        ApiKeyCreatedResponse response = apiKeyService.regenerateApiKey(tenantId, id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<?> getExpiringKeys(
            @RequestParam(defaultValue = "30") int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(apiKeyService.getExpiringKeys(tenantId, daysAhead));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<ApiKeyStats> getStats() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(apiKeyService.getStats(tenantId));
    }

    // Validation endpoint (for internal/service use)
    @PostMapping("/validate")
    public ResponseEntity<ApiKeyValidationResult> validateApiKey(@RequestHeader("X-API-Key") String apiKey) {
        ApiKeyValidationResult result = apiKeyService.validateApiKey(apiKey);
        if (result.valid()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(401).body(result);
        }
    }
}
