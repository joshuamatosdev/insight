package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "roles", indexes = {
    @Index(name = "idx_role_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_role_name", columnList = "name")
})
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    // Comma-separated list of permissions
    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    @Column(name = "is_system_role", nullable = false)
    @Builder.Default
    private Boolean isSystemRole = false;

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

    // Predefined role names as constants for backwards compatibility
    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    public static final String TENANT_ADMIN = "TENANT_ADMIN";
    public static final String MANAGER = "MANAGER";
    public static final String USER = "USER";
    public static final String VIEWER = "VIEWER";

    // Legacy enum for existing code that references RoleName
    public enum RoleName {
        SUPER_ADMIN,
        TENANT_ADMIN,
        MANAGER,
        USER,
        VIEWER
    }
}
