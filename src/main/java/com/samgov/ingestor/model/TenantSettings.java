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
 * Tenant-level settings configuration.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tenant_settings", indexes = {
    @Index(name = "idx_tenant_settings_tenant_id", columnList = "tenant_id")
})
public class TenantSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    private Tenant tenant;

    @Column(name = "timezone", length = 50)
    @Builder.Default
    private String timezone = "America/New_York";

    @Column(name = "date_format", length = 20)
    @Builder.Default
    private String dateFormat = "MM/dd/yyyy";

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "mfa_required", nullable = false)
    @Builder.Default
    private boolean mfaRequired = false;

    @Column(name = "session_timeout_minutes", nullable = false)
    @Builder.Default
    private int sessionTimeoutMinutes = 480; // 8 hours

    @Column(name = "password_expiry_days", nullable = false)
    @Builder.Default
    private int passwordExpiryDays = 90;

    @Column(name = "sso_enabled", nullable = false)
    @Builder.Default
    private boolean ssoEnabled = false;

    @Column(name = "sso_provider", length = 50)
    private String ssoProvider;

    @Column(name = "sso_config", columnDefinition = "TEXT")
    private String ssoConfig;

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
}
