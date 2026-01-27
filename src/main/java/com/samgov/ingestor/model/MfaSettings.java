package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * MFA settings for a user, including TOTP secret.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "mfa_settings", indexes = {
    @Index(name = "idx_mfa_user_id", columnList = "user_id")
})
public class MfaSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * Whether MFA is currently enabled
     */
    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private boolean enabled = false;

    /**
     * TOTP secret (encrypted at rest)
     */
    @Column(name = "secret", columnDefinition = "TEXT")
    private String secret;

    /**
     * Recovery email for MFA recovery
     */
    @Column(name = "recovery_email")
    private String recoveryEmail;

    /**
     * When MFA was enabled
     */
    @Column(name = "enabled_at")
    private Instant enabledAt;

    /**
     * Last successful TOTP verification
     */
    @Column(name = "last_verified_at")
    private Instant lastVerifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

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
     * Enable MFA with the current secret
     */
    public void enable() {
        this.enabled = true;
        this.enabledAt = Instant.now();
    }

    /**
     * Disable MFA and clear secrets
     */
    public void disable() {
        this.enabled = false;
        this.secret = null;
        this.enabledAt = null;
    }

    /**
     * Record a successful verification
     */
    public void recordVerification() {
        this.lastVerifiedAt = Instant.now();
    }
}
