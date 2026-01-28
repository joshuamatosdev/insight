package com.samgov.ingestor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Webhook.WebhookEventType;
import com.samgov.ingestor.model.Webhook.WebhookStatus;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.repository.WebhookRepository;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class WebhookService {

    private final WebhookRepository webhookRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final SecureRandom secureRandom = new SecureRandom();

    public WebhookService(WebhookRepository webhookRepository, TenantRepository tenantRepository,
                          UserRepository userRepository, AuditService auditService,
                          PasswordEncoder passwordEncoder, ObjectMapper objectMapper) {
        this.webhookRepository = webhookRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    // DTOs
    public record CreateWebhookRequest(
            @NotBlank(message = "Webhook name is required")
            @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
            String name,
            @Size(max = 500, message = "Description must not exceed 500 characters")
            String description,
            @NotBlank(message = "URL is required")
            @URL(message = "Invalid URL format")
            String url,
            @NotNull(message = "Event type is required")
            WebhookEventType eventType,
            @Pattern(regexp = "^(GET|POST|PUT|PATCH)$", message = "HTTP method must be GET, POST, PUT, or PATCH")
            String httpMethod,
            String contentType,
            Map<String, String> customHeaders,
            String payloadTemplate,
            @Min(value = 0, message = "Max retries must be non-negative")
            Integer maxRetries,
            @Min(value = 1, message = "Retry delay must be at least 1 second")
            Integer retryDelaySeconds,
            @Min(value = 1, message = "Timeout must be at least 1 second")
            Integer timeoutSeconds,
            @Min(value = 1, message = "Disable after failures must be at least 1")
            Integer disableAfterFailures
    ) {}

    public record WebhookResponse(
            UUID id,
            String name,
            String description,
            String url,
            WebhookEventType eventType,
            WebhookStatus status,
            String httpMethod,
            String contentType,
            Integer maxRetries,
            Integer timeoutSeconds,
            Long totalDeliveries,
            Long successfulDeliveries,
            Long failedDeliveries,
            Integer consecutiveFailures,
            Double successRate,
            Instant lastDeliveryAt,
            Instant lastSuccessAt,
            Instant lastFailureAt,
            String lastFailureReason,
            Boolean isActive,
            Instant createdAt
    ) {}

    public record WebhookCreatedResponse(
            UUID id,
            String name,
            String secret,  // Only returned once
            WebhookEventType eventType
    ) {}

    public record WebhookPayload(
            String eventType,
            Instant timestamp,
            UUID tenantId,
            Map<String, Object> data
    ) {}

    // Create webhook
    public WebhookCreatedResponse createWebhook(UUID tenantId, UUID userId, CreateWebhookRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check for duplicate
        if (webhookRepository.existsByTenantIdAndUrlAndEventType(tenantId, request.url(), request.eventType())) {
            throw new IllegalArgumentException("Webhook with same URL and event type already exists");
        }

        // Generate secret
        String secret = generateSecret();
        String secretHash = passwordEncoder.encode(secret);

        Webhook webhook = new Webhook();
        webhook.setTenant(tenant);
        webhook.setCreatedBy(user);
        webhook.setName(request.name());
        webhook.setDescription(request.description());
        webhook.setUrl(request.url());
        webhook.setEventType(request.eventType());
        webhook.setSecretHash(secretHash);

        if (request.httpMethod() != null) {
            webhook.setHttpMethod(request.httpMethod());
        }
        if (request.contentType() != null) {
            webhook.setContentType(request.contentType());
        }
        if (request.customHeaders() != null && !request.customHeaders().isEmpty()) {
            try {
                webhook.setCustomHeaders(objectMapper.writeValueAsString(request.customHeaders()));
            } catch (Exception e) {
                // Ignore JSON errors
            }
        }
        if (request.payloadTemplate() != null) {
            webhook.setPayloadTemplate(request.payloadTemplate());
        }
        if (request.maxRetries() != null) {
            webhook.setMaxRetries(request.maxRetries());
        }
        if (request.retryDelaySeconds() != null) {
            webhook.setRetryDelaySeconds(request.retryDelaySeconds());
        }
        if (request.timeoutSeconds() != null) {
            webhook.setTimeoutSeconds(request.timeoutSeconds());
        }
        if (request.disableAfterFailures() != null) {
            webhook.setDisableAfterFailures(request.disableAfterFailures());
        }

        webhook = webhookRepository.save(webhook);

        auditService.logAction(AuditAction.WEBHOOK_CREATED, "Webhook", webhook.getId().toString(),
                "Created webhook: " + request.name() + " for event: " + request.eventType());

        return new WebhookCreatedResponse(webhook.getId(), webhook.getName(), secret, webhook.getEventType());
    }

    // Dispatch event to all matching webhooks
    @Async
    public void dispatchEvent(UUID tenantId, WebhookEventType eventType, Map<String, Object> data) {
        List<Webhook> webhooks = webhookRepository.findByTenantIdAndEventTypeAndIsActiveTrue(tenantId, eventType);

        for (Webhook webhook : webhooks) {
            if (webhook.getStatus() != WebhookStatus.DISABLED) {
                deliverWebhook(webhook, eventType, tenantId, data, 0);
            }
        }
    }

    // Deliver single webhook
    private void deliverWebhook(Webhook webhook, WebhookEventType eventType, UUID tenantId,
                                 Map<String, Object> data, int attempt) {
        try {
            WebhookPayload payload = new WebhookPayload(
                    eventType.name(),
                    Instant.now(),
                    tenantId,
                    data
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

            // Calculate signature
            String signature = calculateSignature(jsonPayload, webhook.getSecretHash());

            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(webhook.getUrl()))
                    .timeout(Duration.ofSeconds(webhook.getTimeoutSeconds()))
                    .header("Content-Type", webhook.getContentType())
                    .header("X-Webhook-Signature", signature)
                    .header("X-Webhook-Event", eventType.name())
                    .header("X-Webhook-Timestamp", String.valueOf(Instant.now().toEpochMilli()));

            // Add custom headers
            if (webhook.getCustomHeaders() != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, String> headers = objectMapper.readValue(webhook.getCustomHeaders(), Map.class);
                    headers.forEach(requestBuilder::header);
                } catch (Exception e) {
                    // Ignore JSON parse errors
                }
            }

            // Set HTTP method
            HttpRequest request;
            if ("POST".equalsIgnoreCase(webhook.getHttpMethod())) {
                request = requestBuilder.POST(HttpRequest.BodyPublishers.ofString(jsonPayload)).build();
            } else if ("PUT".equalsIgnoreCase(webhook.getHttpMethod())) {
                request = requestBuilder.PUT(HttpRequest.BodyPublishers.ofString(jsonPayload)).build();
            } else {
                request = requestBuilder.POST(HttpRequest.BodyPublishers.ofString(jsonPayload)).build();
            }

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                webhook.recordSuccess(response.statusCode());
                webhookRepository.save(webhook);
            } else {
                handleFailure(webhook, response.statusCode(), "HTTP " + response.statusCode(), attempt);
            }

        } catch (Exception e) {
            handleFailure(webhook, 0, e.getMessage(), attempt);
        }
    }

    private void handleFailure(Webhook webhook, int statusCode, String reason, int attempt) {
        webhook.recordFailure(statusCode, reason);
        webhookRepository.save(webhook);

        // Retry if within limits
        if (attempt < webhook.getMaxRetries()) {
            try {
                Thread.sleep(webhook.getRetryDelaySeconds() * 1000L);
                // Would need to recursively call or queue for retry
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    private String calculateSignature(String payload, String secretHash) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(secretHash.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return "";
        }
    }

    // Get webhooks by tenant
    @Transactional(readOnly = true)
    public Page<WebhookResponse> getWebhooksByTenant(UUID tenantId, Pageable pageable) {
        return webhookRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    // Get single webhook
    @Transactional(readOnly = true)
    public Optional<WebhookResponse> getWebhook(UUID webhookId) {
        return webhookRepository.findById(webhookId).map(this::toResponse);
    }

    // Update webhook
    public WebhookResponse updateWebhook(UUID tenantId, UUID webhookId, UUID userId, CreateWebhookRequest request) {
        Webhook webhook = webhookRepository.findById(webhookId)
                .orElseThrow(() -> new IllegalArgumentException("Webhook not found"));

        if (!webhook.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Webhook does not belong to tenant");
        }

        webhook.setName(request.name());
        webhook.setDescription(request.description());
        webhook.setUrl(request.url());
        webhook.setEventType(request.eventType());

        if (request.httpMethod() != null) {
            webhook.setHttpMethod(request.httpMethod());
        }
        if (request.contentType() != null) {
            webhook.setContentType(request.contentType());
        }
        if (request.maxRetries() != null) {
            webhook.setMaxRetries(request.maxRetries());
        }
        if (request.timeoutSeconds() != null) {
            webhook.setTimeoutSeconds(request.timeoutSeconds());
        }

        webhook = webhookRepository.save(webhook);

        auditService.logAction(AuditAction.WEBHOOK_UPDATED, "Webhook", webhookId.toString(),
                "Updated webhook: " + request.name());

        return toResponse(webhook);
    }

    // Enable/Disable webhook
    public void setWebhookActive(UUID tenantId, UUID webhookId, UUID userId, boolean active) {
        Webhook webhook = webhookRepository.findById(webhookId)
                .orElseThrow(() -> new IllegalArgumentException("Webhook not found"));

        if (!webhook.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Webhook does not belong to tenant");
        }

        webhook.setIsActive(active);
        if (active) {
            webhook.setStatus(WebhookStatus.ACTIVE);
            webhook.setConsecutiveFailures(0);
        } else {
            webhook.setStatus(WebhookStatus.PAUSED);
        }
        webhookRepository.save(webhook);

        auditService.logAction(AuditAction.WEBHOOK_UPDATED,
                "Webhook", webhookId.toString(), (active ? "Enabled" : "Disabled") + " webhook");
    }

    // Delete webhook
    public void deleteWebhook(UUID tenantId, UUID webhookId, UUID userId) {
        Webhook webhook = webhookRepository.findById(webhookId)
                .orElseThrow(() -> new IllegalArgumentException("Webhook not found"));

        if (!webhook.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Webhook does not belong to tenant");
        }

        webhookRepository.delete(webhook);

        auditService.logAction(AuditAction.WEBHOOK_DELETED, "Webhook", webhookId.toString(),
                "Deleted webhook: " + webhook.getName());
    }

    // Test webhook
    public boolean testWebhook(UUID webhookId) {
        Webhook webhook = webhookRepository.findById(webhookId)
                .orElseThrow(() -> new IllegalArgumentException("Webhook not found"));

        Map<String, Object> testData = new HashMap<>();
        testData.put("test", true);
        testData.put("message", "This is a test webhook delivery");

        try {
            WebhookPayload payload = new WebhookPayload(
                    "TEST",
                    Instant.now(),
                    webhook.getTenant().getId(),
                    testData
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);
            String signature = calculateSignature(jsonPayload, webhook.getSecretHash());

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(webhook.getUrl()))
                    .timeout(Duration.ofSeconds(webhook.getTimeoutSeconds()))
                    .header("Content-Type", webhook.getContentType())
                    .header("X-Webhook-Signature", signature)
                    .header("X-Webhook-Event", "TEST")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() >= 200 && response.statusCode() < 300;

        } catch (Exception e) {
            return false;
        }
    }

    // Get webhook stats
    @Transactional(readOnly = true)
    public WebhookStats getStats(UUID tenantId) {
        long total = webhookRepository.countByTenantId(tenantId);
        long active = webhookRepository.countByTenantIdAndIsActiveTrue(tenantId);
        long failing = webhookRepository.countByTenantIdAndStatus(tenantId, WebhookStatus.FAILING);
        Long totalDeliveries = webhookRepository.getTotalDeliveriesByTenant(tenantId);
        Long successfulDeliveries = webhookRepository.getSuccessfulDeliveriesByTenant(tenantId);

        return new WebhookStats(
                total, active, failing,
                totalDeliveries != null ? totalDeliveries : 0,
                successfulDeliveries != null ? successfulDeliveries : 0
        );
    }

    public record WebhookStats(long totalWebhooks, long activeWebhooks, long failingWebhooks,
                               long totalDeliveries, long successfulDeliveries) {}

    // Search webhooks
    @Transactional(readOnly = true)
    public Page<WebhookResponse> searchWebhooks(UUID tenantId, String search, Pageable pageable) {
        return webhookRepository.searchByTenant(tenantId, search, pageable).map(this::toResponse);
    }

    // Helper methods
    private String generateSecret() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private WebhookResponse toResponse(Webhook webhook) {
        return new WebhookResponse(
                webhook.getId(),
                webhook.getName(),
                webhook.getDescription(),
                webhook.getUrl(),
                webhook.getEventType(),
                webhook.getStatus(),
                webhook.getHttpMethod(),
                webhook.getContentType(),
                webhook.getMaxRetries(),
                webhook.getTimeoutSeconds(),
                webhook.getTotalDeliveries(),
                webhook.getSuccessfulDeliveries(),
                webhook.getFailedDeliveries(),
                webhook.getConsecutiveFailures(),
                webhook.getSuccessRate(),
                webhook.getLastDeliveryAt(),
                webhook.getLastSuccessAt(),
                webhook.getLastFailureAt(),
                webhook.getLastFailureReason(),
                webhook.getIsActive(),
                webhook.getCreatedAt()
        );
    }
}
