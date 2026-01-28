package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.OAuthConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OAuthConnectionRepository extends JpaRepository<OAuthConnection, UUID> {

    /**
     * Find connection by provider and provider's user ID
     */
    Optional<OAuthConnection> findByProviderAndProviderUserId(String provider, String providerUserId);

    /**
     * Find all connections for a user
     */
    List<OAuthConnection> findByUserId(UUID userId);

    /**
     * Find a specific connection for a user and provider
     */
    Optional<OAuthConnection> findByUserIdAndProvider(UUID userId, String provider);

    /**
     * Check if a user has a connection to a provider
     */
    boolean existsByUserIdAndProvider(UUID userId, String provider);

    /**
     * Delete all connections for a user
     */
    @Modifying
    @Query("DELETE FROM OAuthConnection c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

    /**
     * Delete a specific provider connection for a user
     */
    @Modifying
    @Query("DELETE FROM OAuthConnection c WHERE c.user.id = :userId AND c.provider = :provider")
    void deleteByUserIdAndProvider(@Param("userId") UUID userId, @Param("provider") String provider);

    /**
     * Find connection by email and provider
     */
    Optional<OAuthConnection> findByEmailAndProvider(String email, String provider);
}
