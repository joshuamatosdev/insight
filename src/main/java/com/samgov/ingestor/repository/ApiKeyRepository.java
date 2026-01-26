package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ApiKey;
import com.samgov.ingestor.model.ApiKey.ApiKeyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {

    // Find by tenant
    Page<ApiKey> findByTenantId(UUID tenantId, Pageable pageable);

    List<ApiKey> findByTenantIdAndIsActiveTrue(UUID tenantId);

    // Find by hash (for authentication)
    Optional<ApiKey> findByKeyHash(String keyHash);

    Optional<ApiKey> findByKeyHashAndIsActiveTrue(String keyHash);

    // Find by user
    Page<ApiKey> findByUserId(UUID userId, Pageable pageable);

    List<ApiKey> findByUserIdAndIsActiveTrue(UUID userId);

    // Find by type
    Page<ApiKey> findByTenantIdAndKeyType(UUID tenantId, ApiKeyType keyType, Pageable pageable);

    // Find expiring keys
    @Query("SELECT a FROM ApiKey a WHERE a.tenant.id = :tenantId AND a.isActive = true " +
           "AND a.expiresAt IS NOT NULL AND a.expiresAt < :expiresBy")
    List<ApiKey> findExpiringKeys(@Param("tenantId") UUID tenantId, @Param("expiresBy") Instant expiresBy);

    // Find expired keys
    @Query("SELECT a FROM ApiKey a WHERE a.isActive = true AND a.expiresAt IS NOT NULL " +
           "AND a.expiresAt < :now")
    List<ApiKey> findExpiredKeys(@Param("now") Instant now);

    // Find unused keys
    @Query("SELECT a FROM ApiKey a WHERE a.tenant.id = :tenantId AND a.isActive = true " +
           "AND (a.lastUsedAt IS NULL OR a.lastUsedAt < :since)")
    List<ApiKey> findUnusedKeys(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    // Count by tenant
    long countByTenantId(UUID tenantId);

    long countByTenantIdAndIsActiveTrue(UUID tenantId);

    // Statistics
    @Query("SELECT SUM(a.totalRequests) FROM ApiKey a WHERE a.tenant.id = :tenantId")
    Long getTotalRequestsByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM ApiKey a WHERE a.tenant.id = :tenantId ORDER BY a.totalRequests DESC")
    List<ApiKey> findMostUsedKeys(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Check if prefix exists
    boolean existsByKeyPrefix(String keyPrefix);

    // Find active keys by prefix (for efficient validation)
    @Query("""
        SELECT a FROM ApiKey a
        LEFT JOIN FETCH a.tenant
        LEFT JOIN FETCH a.user
        WHERE a.keyPrefix = :keyPrefix AND a.isActive = true
        """)
    List<ApiKey> findActiveByKeyPrefix(@Param("keyPrefix") String keyPrefix);

    // Search
    @Query("SELECT a FROM ApiKey a WHERE a.tenant.id = :tenantId AND " +
           "(LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ApiKey> searchByTenant(@Param("tenantId") UUID tenantId, @Param("search") String search, Pageable pageable);
}
