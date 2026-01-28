package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Permission entity representing a system permission.
 * Permissions follow the format: resource:action (e.g., "opportunities:read")
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "permissions", indexes = {
    @Index(name = "idx_permission_code", columnList = "code"),
    @Index(name = "idx_permission_category", columnList = "category")
})
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /**
     * Permission code in format: resource:action
     * Examples: opportunities:read, contracts:write, users:delete
     * Special: "*" for superadmin access
     */
    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private PermissionCategory category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    /**
     * Permission categories for grouping in UI
     */
    public enum PermissionCategory {
        OPPORTUNITIES("Opportunities"),
        CONTRACTS("Contracts"),
        PIPELINE("Pipeline"),
        DOCUMENTS("Documents"),
        COMPLIANCE("Compliance"),
        FINANCIAL("Financial"),
        REPORTS("Reports"),
        USERS("User Management"),
        SETTINGS("Settings"),
        AUDIT("Audit"),
        SYSTEM("System");

        private final String displayName;

        PermissionCategory(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * Check if this permission grants access to the given permission code.
     * Supports wildcard matching.
     */
    public boolean grants(String permissionCode) {
        if ("*".equals(code)) {
            return true;
        }
        if (code.equals(permissionCode)) {
            return true;
        }
        // Support resource-level wildcards (e.g., "opportunities:*")
        if (code.endsWith(":*")) {
            String resource = code.substring(0, code.length() - 2);
            return permissionCode.startsWith(resource + ":");
        }
        return false;
    }
}
