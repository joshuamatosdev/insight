package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "webhooks", indexes = {
    @Index(name = "idx_webhook_tenant", columnList = "tenant_id"),
    @Index(name = "idx_webhook_active", columnList = "is_active"),
    @Index(name = "idx_webhook_event", columnList = "event_type")
})
public class Webhook {

    public enum WebhookEventType {
        // Opportunity events
        OPPORTUNITY_CREATED,
        OPPORTUNITY_UPDATED,
        OPPORTUNITY_DEADLINE_APPROACHING,

        // Pipeline events
        PIPELINE_OPPORTUNITY_ADDED,
        PIPELINE_STAGE_CHANGED,
        BID_DECISION_MADE,

        // Contract events
        CONTRACT_CREATED,
        CONTRACT_UPDATED,
        CONTRACT_EXPIRING,
        OPTION_DEADLINE_APPROACHING,
        DELIVERABLE_DUE,

        // Compliance events
        CERTIFICATION_EXPIRING,
        CLEARANCE_EXPIRING,
        COMPLIANCE_ITEM_DUE,

        // Financial events
        INVOICE_CREATED,
        INVOICE_STATUS_CHANGED,
        PAYMENT_RECEIVED,
        BUDGET_THRESHOLD_REACHED,

        // Document events
        DOCUMENT_UPLOADED,
        DOCUMENT_APPROVED,

        // CRM events
        CONTACT_CREATED,
        INTERACTION_LOGGED,
        FOLLOWUP_DUE,

        // System events
        USER_CREATED,
        USER_INVITED,
        REPORT_GENERATED
    }

    public enum WebhookStatus {
        ACTIVE,
        PAUSED,
        FAILING,
        DISABLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "url", nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private WebhookEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WebhookStatus status = WebhookStatus.ACTIVE;

    // Authentication
    @Column(name = "secret_hash")
    private String secretHash;

    @Column(name = "auth_type")
    private String authType;

    @Column(name = "auth_header")
    private String authHeader;

    @Column(name = "auth_value_encrypted")
    private String authValueEncrypted;

    // Request configuration
    @Column(name = "http_method")
    private String httpMethod = "POST";

    @Column(name = "content_type")
    private String contentType = "application/json";

    @Column(name = "custom_headers", columnDefinition = "TEXT")
    private String customHeaders;

    @Column(name = "payload_template", columnDefinition = "TEXT")
    private String payloadTemplate;

    // Retry configuration
    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;

    @Column(name = "retry_delay_seconds", nullable = false)
    private Integer retryDelaySeconds = 60;

    @Column(name = "timeout_seconds", nullable = false)
    private Integer timeoutSeconds = 30;

    // Delivery tracking
    @Column(name = "total_deliveries", nullable = false)
    private Long totalDeliveries = 0L;

    @Column(name = "successful_deliveries", nullable = false)
    private Long successfulDeliveries = 0L;

    @Column(name = "failed_deliveries", nullable = false)
    private Long failedDeliveries = 0L;

    @Column(name = "consecutive_failures", nullable = false)
    private Integer consecutiveFailures = 0;

    @Column(name = "last_delivery_at")
    private Instant lastDeliveryAt;

    @Column(name = "last_success_at")
    private Instant lastSuccessAt;

    @Column(name = "last_failure_at")
    private Instant lastFailureAt;

    @Column(name = "last_failure_reason", length = 1000)
    private String lastFailureReason;

    @Column(name = "last_response_code")
    private Integer lastResponseCode;

    // Auto-disable after failures
    @Column(name = "disable_after_failures")
    private Integer disableAfterFailures = 10;

    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Audit fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void recordSuccess(int responseCode) {
        this.totalDeliveries++;
        this.successfulDeliveries++;
        this.consecutiveFailures = 0;
        this.lastDeliveryAt = Instant.now();
        this.lastSuccessAt = Instant.now();
        this.lastResponseCode = responseCode;
        if (this.status == WebhookStatus.FAILING) {
            this.status = WebhookStatus.ACTIVE;
        }
    }

    public void recordFailure(int responseCode, String reason) {
        this.totalDeliveries++;
        this.failedDeliveries++;
        this.consecutiveFailures++;
        this.lastDeliveryAt = Instant.now();
        this.lastFailureAt = Instant.now();
        this.lastResponseCode = responseCode;
        this.lastFailureReason = reason;

        if (this.consecutiveFailures >= 3) {
            this.status = WebhookStatus.FAILING;
        }
        if (this.disableAfterFailures != null && this.consecutiveFailures >= this.disableAfterFailures) {
            this.status = WebhookStatus.DISABLED;
            this.isActive = false;
        }
    }

    public Double getSuccessRate() {
        if (totalDeliveries == 0) return null;
        return (double) successfulDeliveries / totalDeliveries * 100;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public WebhookEventType getEventType() {
        return eventType;
    }

    public void setEventType(WebhookEventType eventType) {
        this.eventType = eventType;
    }

    public WebhookStatus getStatus() {
        return status;
    }

    public void setStatus(WebhookStatus status) {
        this.status = status;
    }

    public String getSecretHash() {
        return secretHash;
    }

    public void setSecretHash(String secretHash) {
        this.secretHash = secretHash;
    }

    public String getAuthType() {
        return authType;
    }

    public void setAuthType(String authType) {
        this.authType = authType;
    }

    public String getAuthHeader() {
        return authHeader;
    }

    public void setAuthHeader(String authHeader) {
        this.authHeader = authHeader;
    }

    public String getAuthValueEncrypted() {
        return authValueEncrypted;
    }

    public void setAuthValueEncrypted(String authValueEncrypted) {
        this.authValueEncrypted = authValueEncrypted;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getCustomHeaders() {
        return customHeaders;
    }

    public void setCustomHeaders(String customHeaders) {
        this.customHeaders = customHeaders;
    }

    public String getPayloadTemplate() {
        return payloadTemplate;
    }

    public void setPayloadTemplate(String payloadTemplate) {
        this.payloadTemplate = payloadTemplate;
    }

    public Integer getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }

    public Integer getRetryDelaySeconds() {
        return retryDelaySeconds;
    }

    public void setRetryDelaySeconds(Integer retryDelaySeconds) {
        this.retryDelaySeconds = retryDelaySeconds;
    }

    public Integer getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(Integer timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public Long getTotalDeliveries() {
        return totalDeliveries;
    }

    public void setTotalDeliveries(Long totalDeliveries) {
        this.totalDeliveries = totalDeliveries;
    }

    public Long getSuccessfulDeliveries() {
        return successfulDeliveries;
    }

    public void setSuccessfulDeliveries(Long successfulDeliveries) {
        this.successfulDeliveries = successfulDeliveries;
    }

    public Long getFailedDeliveries() {
        return failedDeliveries;
    }

    public void setFailedDeliveries(Long failedDeliveries) {
        this.failedDeliveries = failedDeliveries;
    }

    public Integer getConsecutiveFailures() {
        return consecutiveFailures;
    }

    public void setConsecutiveFailures(Integer consecutiveFailures) {
        this.consecutiveFailures = consecutiveFailures;
    }

    public Instant getLastDeliveryAt() {
        return lastDeliveryAt;
    }

    public void setLastDeliveryAt(Instant lastDeliveryAt) {
        this.lastDeliveryAt = lastDeliveryAt;
    }

    public Instant getLastSuccessAt() {
        return lastSuccessAt;
    }

    public void setLastSuccessAt(Instant lastSuccessAt) {
        this.lastSuccessAt = lastSuccessAt;
    }

    public Instant getLastFailureAt() {
        return lastFailureAt;
    }

    public void setLastFailureAt(Instant lastFailureAt) {
        this.lastFailureAt = lastFailureAt;
    }

    public String getLastFailureReason() {
        return lastFailureReason;
    }

    public void setLastFailureReason(String lastFailureReason) {
        this.lastFailureReason = lastFailureReason;
    }

    public Integer getLastResponseCode() {
        return lastResponseCode;
    }

    public void setLastResponseCode(Integer lastResponseCode) {
        this.lastResponseCode = lastResponseCode;
    }

    public Integer getDisableAfterFailures() {
        return disableAfterFailures;
    }

    public void setDisableAfterFailures(Integer disableAfterFailures) {
        this.disableAfterFailures = disableAfterFailures;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
