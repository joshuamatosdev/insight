package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Webhook.WebhookEventType;
import com.samgov.ingestor.service.WebhookService;
import com.samgov.ingestor.service.WebhookService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/webhooks")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping
    public ResponseEntity<WebhookCreatedResponse> createWebhook(
            @Valid @RequestBody CreateWebhookRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        WebhookCreatedResponse response = webhookService.createWebhook(tenantId, userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<WebhookResponse>> getWebhooks(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        Page<WebhookResponse> webhooks;
        if (search != null && !search.isEmpty()) {
            webhooks = webhookService.searchWebhooks(tenantId, search, pageable);
        } else {
            webhooks = webhookService.getWebhooksByTenant(tenantId, pageable);
        }
        return ResponseEntity.ok(webhooks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebhookResponse> getWebhook(@PathVariable UUID id) {
        return webhookService.getWebhook(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebhookResponse> updateWebhook(
            @PathVariable UUID id,
            @Valid @RequestBody CreateWebhookRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        WebhookResponse response = webhookService.updateWebhook(tenantId, id, userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/enable")
    public ResponseEntity<Void> enableWebhook(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        webhookService.setWebhookActive(tenantId, id, userId, true);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/disable")
    public ResponseEntity<Void> disableWebhook(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        webhookService.setWebhookActive(tenantId, id, userId, false);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWebhook(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());

        webhookService.deleteWebhook(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<Map<String, Boolean>> testWebhook(@PathVariable UUID id) {
        boolean success = webhookService.testWebhook(id);
        return ResponseEntity.ok(Map.of("success", success));
    }

    @GetMapping("/stats")
    public ResponseEntity<WebhookStats> getStats() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(webhookService.getStats(tenantId));
    }

    @GetMapping("/event-types")
    public ResponseEntity<List<WebhookEventType>> getEventTypes() {
        return ResponseEntity.ok(Arrays.asList(WebhookEventType.values()));
    }
}
