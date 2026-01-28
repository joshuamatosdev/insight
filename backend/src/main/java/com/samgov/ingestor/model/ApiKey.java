package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "api_keys", indexes = {
    @Index(name = "idx_api_key_tenant", columnList = "tenant_id"),
    @Index(name = "idx_api_key_hash", columnList = "key_hash", unique = true),
    @Index(name = "idx_api_key_active", columnList = "is_active")
})
public class ApiKey {

    public enum ApiKeyType {
        FULL_ACCESS,
        READ_ONLY,
        WEBHOOK,
        INTEGRATION,
        CUSTOM
    }

    public enum ApiKeyScope {
        READ,
        WRITE,
        ADMIN,
        FULL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "key_type", nullable = false)
    private ApiKeyType keyType;

    // Only store the hash of the API key
    @Column(name = "key_hash", nullable = false, unique = true)
    private String keyHash;

    // First 8 characters for display
    @Column(name = "key_prefix", nullable = false)
    private String keyPrefix;

    // Primary scope for this API key
    @Enumerated(EnumType.STRING)
    @Column(name = "scope")
    private ApiKeyScope scope = ApiKeyScope.READ;

    // Permissions (JSON array of additional allowed scopes)
    @Column(name = "scopes", columnDefinition = "TEXT")
    private String scopes;

    // Rate limiting
    @Column(name = "rate_limit_per_minute")
    private Integer rateLimitPerMinute;

    @Column(name = "rate_limit_per_hour")
    private Integer rateLimitPerHour;

    @Column(name = "rate_limit_per_day")
    private Integer rateLimitPerDay;

    // IP restrictions (JSON array)
    @Column(name = "allowed_ips", columnDefinition = "TEXT")
    private String allowedIps;

    // Expiration
    @Column(name = "expires_at")
    private Instant expiresAt;

    // Usage tracking
    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "last_used_ip")
    private String lastUsedIp;

    @Column(name = "total_requests", nullable = false)
    private Long totalRequests = 0L;

    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revoked_by")
    private User revokedBy;

    @Column(name = "revocation_reason")
    private String revocationReason;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void recordUsage(String ip) {
        this.lastUsedAt = Instant.now();
        this.lastUsedIp = ip;
        this.totalRequests++;
    }

    public void revoke(User revokedBy, String reason) {
        this.isActive = false;
        this.revokedAt = Instant.now();
        this.revokedBy = revokedBy;
        this.revocationReason = reason;
    }

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(isActive);
    }

    public ApiKeyScope getScope() {
        return scope != null ? scope : ApiKeyScope.READ;
    }

    public void setScope(ApiKeyScope scope) {
        this.scope = scope;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public ApiKeyType getKeyType() {
        return keyType;
    }

    public void setKeyType(ApiKeyType keyType) {
        this.keyType = keyType;
    }

    public String getKeyHash() {
        return keyHash;
    }

    public void setKeyHash(String keyHash) {
        this.keyHash = keyHash;
    }

    public String getKeyPrefix() {
        return keyPrefix;
    }

    public void setKeyPrefix(String keyPrefix) {
        this.keyPrefix = keyPrefix;
    }

    public String getScopes() {
        return scopes;
    }

    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    public Integer getRateLimitPerMinute() {
        return rateLimitPerMinute;
    }

    public void setRateLimitPerMinute(Integer rateLimitPerMinute) {
        this.rateLimitPerMinute = rateLimitPerMinute;
    }

    public Integer getRateLimitPerHour() {
        return rateLimitPerHour;
    }

    public void setRateLimitPerHour(Integer rateLimitPerHour) {
        this.rateLimitPerHour = rateLimitPerHour;
    }

    public Integer getRateLimitPerDay() {
        return rateLimitPerDay;
    }

    public void setRateLimitPerDay(Integer rateLimitPerDay) {
        this.rateLimitPerDay = rateLimitPerDay;
    }

    public String getAllowedIps() {
        return allowedIps;
    }

    public void setAllowedIps(String allowedIps) {
        this.allowedIps = allowedIps;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(Instant lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    public String getLastUsedIp() {
        return lastUsedIp;
    }

    public void setLastUsedIp(String lastUsedIp) {
        this.lastUsedIp = lastUsedIp;
    }

    public Long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(Long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(Instant revokedAt) {
        this.revokedAt = revokedAt;
    }

    public User getRevokedBy() {
        return revokedBy;
    }

    public void setRevokedBy(User revokedBy) {
        this.revokedBy = revokedBy;
    }

    public String getRevocationReason() {
        return revocationReason;
    }

    public void setRevocationReason(String revocationReason) {
        this.revocationReason = revocationReason;
    }
}
