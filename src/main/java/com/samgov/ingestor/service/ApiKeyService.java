package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.ApiKey.ApiKeyType;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.repository.ApiKeyRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final String KEY_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int KEY_LENGTH = 48;
    private static final String KEY_PREFIX_PATTERN = "samgov_";

    public ApiKeyService(ApiKeyRepository apiKeyRepository, TenantRepository tenantRepository,
                         UserRepository userRepository, AuditService auditService,
                         PasswordEncoder passwordEncoder) {
        this.apiKeyRepository = apiKeyRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
    }

    // DTOs
    public record CreateApiKeyRequest(
            @NotBlank(message = "API key name is required")
            @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
            String name,
            @Size(max = 500, message = "Description must not exceed 500 characters")
            String description,
            @NotNull(message = "API key type is required")
            ApiKeyType keyType,
            List<String> scopes,
            @Min(value = 1, message = "Rate limit per minute must be at least 1")
            Integer rateLimitPerMinute,
            @Min(value = 1, message = "Rate limit per hour must be at least 1")
            Integer rateLimitPerHour,
            @Min(value = 1, message = "Rate limit per day must be at least 1")
            Integer rateLimitPerDay,
            List<String> allowedIps,
            @Min(value = 1, message = "Expiration days must be at least 1")
            Integer expiresInDays
    ) {}

    public record ApiKeyResponse(
            UUID id,
            String name,
            String description,
            ApiKeyType keyType,
            String keyPrefix,
            List<String> scopes,
            Integer rateLimitPerMinute,
            Integer rateLimitPerHour,
            Integer rateLimitPerDay,
            Instant expiresAt,
            Instant lastUsedAt,
            Long totalRequests,
            Boolean isActive,
            Instant createdAt
    ) {}

    public record ApiKeyCreatedResponse(
            UUID id,
            String apiKey,  // Only returned once on creation
            String keyPrefix,
            String name,
            ApiKeyType keyType,
            Instant expiresAt
    ) {}

    public record ApiKeyValidationResult(
            boolean valid,
            UUID apiKeyId,
            UUID tenantId,
            UUID userId,
            List<String> scopes,
            String errorMessage
    ) {}

    // Create new API key
    public ApiKeyCreatedResponse createApiKey(UUID tenantId, UUID userId, CreateApiKeyRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Generate the raw API key
        String rawKey = generateApiKey();
        String keyHash = passwordEncoder.encode(rawKey);
        String keyPrefix = rawKey.substring(0, 12);

        ApiKey apiKey = new ApiKey();
        apiKey.setTenant(tenant);
        apiKey.setUser(user);
        apiKey.setName(request.name());
        apiKey.setDescription(request.description());
        apiKey.setKeyType(request.keyType() != null ? request.keyType() : ApiKeyType.READ_ONLY);
        apiKey.setKeyHash(keyHash);
        apiKey.setKeyPrefix(keyPrefix);

        if (request.scopes() != null && !request.scopes().isEmpty()) {
            apiKey.setScopes(String.join(",", request.scopes()));
        }

        apiKey.setRateLimitPerMinute(request.rateLimitPerMinute());
        apiKey.setRateLimitPerHour(request.rateLimitPerHour());
        apiKey.setRateLimitPerDay(request.rateLimitPerDay());

        if (request.allowedIps() != null && !request.allowedIps().isEmpty()) {
            apiKey.setAllowedIps(String.join(",", request.allowedIps()));
        }

        if (request.expiresInDays() != null && request.expiresInDays() > 0) {
            apiKey.setExpiresAt(Instant.now().plus(request.expiresInDays(), ChronoUnit.DAYS));
        }

        apiKey = apiKeyRepository.save(apiKey);

        auditService.logAction(AuditAction.API_KEY_CREATED, "ApiKey", apiKey.getId().toString(),
                "Created API key: " + request.name());

        return new ApiKeyCreatedResponse(
                apiKey.getId(),
                rawKey,  // Only returned once
                keyPrefix,
                apiKey.getName(),
                apiKey.getKeyType(),
                apiKey.getExpiresAt()
        );
    }

    // Validate API key
    public ApiKeyValidationResult validateApiKey(String rawKey) {
        if (rawKey == null || rawKey.isEmpty()) {
            return new ApiKeyValidationResult(false, null, null, null, null, "API key is required");
        }

        // Extract prefix (first 12 characters) to narrow down candidates
        if (rawKey.length() < 12) {
            return new ApiKeyValidationResult(false, null, null, null, null, "Invalid API key format");
        }

        String keyPrefix = rawKey.substring(0, 12);

        // Find active keys with matching prefix (much more efficient than loading all keys)
        List<ApiKey> candidateKeys = apiKeyRepository.findActiveByKeyPrefix(keyPrefix);
        for (ApiKey apiKey : candidateKeys) {
            if (passwordEncoder.matches(rawKey, apiKey.getKeyHash())) {
                // Check if expired
                if (apiKey.isExpired()) {
                    return new ApiKeyValidationResult(false, apiKey.getId(), null, null, null, "API key has expired");
                }

                List<String> scopes = apiKey.getScopes() != null ?
                        Arrays.asList(apiKey.getScopes().split(",")) : Collections.emptyList();

                return new ApiKeyValidationResult(
                        true,
                        apiKey.getId(),
                        apiKey.getTenant().getId(),
                        apiKey.getUser().getId(),
                        scopes,
                        null
                );
            }
        }

        return new ApiKeyValidationResult(false, null, null, null, null, "Invalid API key");
    }

    // Record API key usage
    public void recordUsage(UUID apiKeyId, String ipAddress) {
        apiKeyRepository.findById(apiKeyId).ifPresent(apiKey -> {
            apiKey.recordUsage(ipAddress);
            apiKeyRepository.save(apiKey);
        });
    }

    // Get API keys by tenant
    @Transactional(readOnly = true)
    public Page<ApiKeyResponse> getApiKeysByTenant(UUID tenantId, Pageable pageable) {
        return apiKeyRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    // Get API keys by user
    @Transactional(readOnly = true)
    public Page<ApiKeyResponse> getApiKeysByUser(UUID userId, Pageable pageable) {
        return apiKeyRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    // Get single API key
    @Transactional(readOnly = true)
    public Optional<ApiKeyResponse> getApiKey(UUID apiKeyId) {
        return apiKeyRepository.findById(apiKeyId).map(this::toResponse);
    }

    // Revoke API key
    public void revokeApiKey(UUID tenantId, UUID apiKeyId, UUID revokedByUserId, String reason) {
        ApiKey apiKey = apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));

        if (!apiKey.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("API key does not belong to tenant");
        }

        User revokedBy = userRepository.findById(revokedByUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        apiKey.revoke(revokedBy, reason);
        apiKeyRepository.save(apiKey);

        auditService.logAction(AuditAction.API_KEY_REVOKED, "ApiKey", apiKeyId.toString(),
                "Revoked API key: " + apiKey.getName() + ", reason: " + reason);
    }

    // Regenerate API key
    public ApiKeyCreatedResponse regenerateApiKey(UUID tenantId, UUID apiKeyId, UUID userId) {
        ApiKey oldKey = apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));

        if (!oldKey.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("API key does not belong to tenant");
        }

        // Revoke old key
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        oldKey.revoke(user, "Regenerated");
        apiKeyRepository.save(oldKey);

        // Create new key with same settings
        CreateApiKeyRequest request = new CreateApiKeyRequest(
                oldKey.getName(),
                oldKey.getDescription(),
                oldKey.getKeyType(),
                oldKey.getScopes() != null ? Arrays.asList(oldKey.getScopes().split(",")) : null,
                oldKey.getRateLimitPerMinute(),
                oldKey.getRateLimitPerHour(),
                oldKey.getRateLimitPerDay(),
                oldKey.getAllowedIps() != null ? Arrays.asList(oldKey.getAllowedIps().split(",")) : null,
                null
        );

        return createApiKey(tenantId, userId, request);
    }

    // Find expiring keys
    @Transactional(readOnly = true)
    public List<ApiKeyResponse> getExpiringKeys(UUID tenantId, int daysAhead) {
        Instant expiresBy = Instant.now().plus(daysAhead, ChronoUnit.DAYS);
        return apiKeyRepository.findExpiringKeys(tenantId, expiresBy).stream()
                .map(this::toResponse)
                .toList();
    }

    // Deactivate expired keys (scheduled task)
    public int deactivateExpiredKeys() {
        List<ApiKey> expired = apiKeyRepository.findExpiredKeys(Instant.now());
        for (ApiKey key : expired) {
            key.setIsActive(false);
            apiKeyRepository.save(key);
        }
        return expired.size();
    }

    // Search API keys
    @Transactional(readOnly = true)
    public Page<ApiKeyResponse> searchApiKeys(UUID tenantId, String search, Pageable pageable) {
        return apiKeyRepository.searchByTenant(tenantId, search, pageable).map(this::toResponse);
    }

    // Get statistics
    @Transactional(readOnly = true)
    public ApiKeyStats getStats(UUID tenantId) {
        long total = apiKeyRepository.countByTenantId(tenantId);
        long active = apiKeyRepository.countByTenantIdAndIsActiveTrue(tenantId);
        Long totalRequests = apiKeyRepository.getTotalRequestsByTenant(tenantId);

        return new ApiKeyStats(total, active, totalRequests != null ? totalRequests : 0);
    }

    public record ApiKeyStats(long totalKeys, long activeKeys, long totalRequests) {}

    // Helper methods
    private String generateApiKey() {
        StringBuilder sb = new StringBuilder(KEY_PREFIX_PATTERN);
        for (int i = 0; i < KEY_LENGTH; i++) {
            sb.append(KEY_ALPHABET.charAt(secureRandom.nextInt(KEY_ALPHABET.length())));
        }
        return sb.toString();
    }

    private ApiKeyResponse toResponse(ApiKey apiKey) {
        return new ApiKeyResponse(
                apiKey.getId(),
                apiKey.getName(),
                apiKey.getDescription(),
                apiKey.getKeyType(),
                apiKey.getKeyPrefix(),
                apiKey.getScopes() != null ? Arrays.asList(apiKey.getScopes().split(",")) : Collections.emptyList(),
                apiKey.getRateLimitPerMinute(),
                apiKey.getRateLimitPerHour(),
                apiKey.getRateLimitPerDay(),
                apiKey.getExpiresAt(),
                apiKey.getLastUsedAt(),
                apiKey.getTotalRequests(),
                apiKey.getIsActive(),
                apiKey.getCreatedAt()
        );
    }
}
