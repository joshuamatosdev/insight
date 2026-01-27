package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an OAuth connection between a user and an external provider.
 * Stores OAuth tokens and provider-specific user identifiers.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "oauth_connections", 
    indexes = {
        @Index(name = "idx_oauth_user_id", columnList = "user_id"),
        @Index(name = "idx_oauth_provider", columnList = "provider"),
        @Index(name = "idx_oauth_provider_user_id", columnList = "provider, provider_user_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_oauth_provider_user", columnNames = {"provider", "provider_user_id"})
    }
)
public class OAuthConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * OAuth provider name: google, microsoft, saml
     */
    @Column(name = "provider", nullable = false, length = 50)
    private String provider;

    /**
     * User ID from the OAuth provider
     */
    @Column(name = "provider_user_id", nullable = false)
    private String providerUserId;

    /**
     * Email from the OAuth provider (may differ from user's primary email)
     */
    @Column(name = "email")
    private String email;

    /**
     * OAuth access token (encrypted at rest)
     */
    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    /**
     * OAuth refresh token (encrypted at rest)
     */
    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    /**
     * When the access token expires
     */
    @Column(name = "expires_at")
    private Instant expiresAt;

    /**
     * When this connection was created
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Last time user logged in via this provider
     */
    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Check if the access token is expired
     */
    public boolean isTokenExpired() {
        if (expiresAt == null) {
            return true;
        }
        return Instant.now().isAfter(expiresAt);
    }

    /**
     * Provider constants
     */
    public static final String PROVIDER_GOOGLE = "google";
    public static final String PROVIDER_MICROSOFT = "microsoft";
    public static final String PROVIDER_SAML = "saml";
}
