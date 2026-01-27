package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
 * Custom export template configuration.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "export_templates", indexes = {
    @Index(name = "idx_export_template_tenant", columnList = "tenant_id")
})
public class ExportTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "entity_type", nullable = false)
    private String entityType; // opportunity, contract, proposal

    @Column(name = "format", nullable = false)
    private String format; // PDF, EXCEL, CSV

    @Column(name = "columns", columnDefinition = "TEXT")
    private String columns; // JSON array of column definitions

    @Column(name = "header_template", columnDefinition = "TEXT")
    private String headerTemplate;

    @Column(name = "footer_template", columnDefinition = "TEXT")
    private String footerTemplate;

    @Column(name = "include_branding", nullable = false)
    @Builder.Default
    private boolean includeBranding = true;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    @Column(name = "created_by")
    private UUID createdBy;

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
