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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_user_id", columnList = "user_id"),
    @Index(name = "idx_audit_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_created_at", columnList = "created_at")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private AuditAction action;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "description")
    private String description;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public enum AuditAction {
        // Authentication
        LOGIN,
        LOGOUT,
        LOGIN_FAILED,
        PASSWORD_RESET_REQUESTED,
        PASSWORD_RESET_COMPLETED,
        PASSWORD_CHANGED,
        MFA_ENABLED,
        MFA_DISABLED,

        // User management
        USER_CREATED,
        USER_UPDATED,
        USER_ACTIVATED,
        USER_SUSPENDED,
        USER_DELETED,
        USER_INVITED,
        INVITATION_ACCEPTED,
        INVITATION_CANCELLED,

        // Tenant management
        TENANT_CREATED,
        TENANT_UPDATED,
        TENANT_SUSPENDED,
        TENANT_ACTIVATED,
        TENANT_SETTINGS_CHANGED,

        // Role management
        ROLE_ASSIGNED,
        ROLE_REMOVED,
        ROLE_CHANGED,

        // Opportunity management
        OPPORTUNITY_VIEWED,
        OPPORTUNITY_SAVED,
        OPPORTUNITY_REMOVED_FROM_SAVED,
        OPPORTUNITY_ADDED_TO_PIPELINE,
        OPPORTUNITY_STAGE_CHANGED,

        // Pipeline management
        PIPELINE_CREATED,
        PIPELINE_UPDATED,
        PIPELINE_DELETED,
        PIPELINE_ARCHIVED,
        PIPELINE_DEFAULT_SET,
        OPPORTUNITY_REMOVED_FROM_PIPELINE,
        BID_DECISION_SET,

        // Document management
        DOCUMENT_UPLOADED,
        DOCUMENT_DOWNLOADED,
        DOCUMENT_DELETED,
        DOCUMENT_CREATED,
        DOCUMENT_UPDATED,

        // Template management
        TEMPLATE_CREATED,
        TEMPLATE_UPDATED,
        TEMPLATE_DELETED,

        // Content library
        CONTENT_CREATED,
        CONTENT_UPDATED,
        CONTENT_DELETED,

        // Contract management
        CONTRACT_CREATED,
        CONTRACT_UPDATED,
        CONTRACT_DELETED,
        CONTRACT_STATUS_CHANGED,
        CLIN_CREATED,
        CLIN_UPDATED,
        MODIFICATION_CREATED,
        OPTION_EXERCISED,
        DELIVERABLE_CREATED,
        DELIVERABLE_COMPLETED,

        // Compliance
        CERTIFICATION_CREATED,
        CERTIFICATION_UPDATED,
        CERTIFICATION_DELETED,
        CERTIFICATION_EXPIRED,
        CLEARANCE_CREATED,
        CLEARANCE_UPDATED,
        COMPLIANCE_ITEM_CREATED,
        COMPLIANCE_STATUS_CHANGED,

        // Financial
        INVOICE_CREATED,
        INVOICE_SUBMITTED,
        INVOICE_PAID,
        BUDGET_ITEM_CREATED,
        LABOR_RATE_CREATED,

        // Export/Report
        DATA_EXPORTED,
        REPORT_GENERATED,

        // System
        SETTINGS_CHANGED,
        API_KEY_CREATED,
        API_KEY_REVOKED,

        // Competitor management
        COMPETITOR_CREATED,
        COMPETITOR_UPDATED,
        COMPETITOR_DELETED,

        // Company profile
        PROFILE_CREATED,
        PROFILE_UPDATED,

        // Session management
        SESSION_CREATED,
        SESSION_EXPIRED,
        SESSION_TERMINATED,

        // Alert management
        ALERT_CREATED,
        ALERT_UPDATED,
        ALERT_DELETED,
        ALERT_TRIGGERED,

        // Saved search management
        SEARCH_CREATED,
        SEARCH_UPDATED,
        SEARCH_DELETED,

        // Labor rate management
        LABOR_RATE_UPDATED,
        LABOR_RATE_DELETED,

        // Webhook management
        WEBHOOK_CREATED,
        WEBHOOK_UPDATED,
        WEBHOOK_DELETED,

        // Role management (specific actions)
        ROLE_CREATED,
        ROLE_UPDATED,
        ROLE_DELETED,

        // Report management
        REPORT_CREATED,
        REPORT_UPDATED,
        REPORT_DELETED,
        REPORT_RAN,

        // Match management
        MATCH_UPDATED
    }
}
