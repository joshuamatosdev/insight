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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * One-time backup codes for MFA recovery.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "mfa_backup_codes", indexes = {
    @Index(name = "idx_mfa_backup_user_id", columnList = "user_id"),
    @Index(name = "idx_mfa_backup_code_hash", columnList = "code_hash")
})
public class MfaBackupCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Hashed backup code (using bcrypt)
     */
    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    /**
     * Whether this code has been used
     */
    @Column(name = "used", nullable = false)
    @Builder.Default
    private boolean used = false;

    /**
     * When the code was used
     */
    @Column(name = "used_at")
    private Instant usedAt;

    /**
     * When the code was created
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    /**
     * Mark this code as used
     */
    public void markUsed() {
        this.used = true;
        this.usedAt = Instant.now();
    }

    /**
     * Number of backup codes to generate
     */
    public static final int BACKUP_CODES_COUNT = 10;
}
