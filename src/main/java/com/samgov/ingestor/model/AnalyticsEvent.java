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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Analytics event entity for tracking user actions and system events.
 * Designed for fast querying with appropriate indexes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "analytics_events", indexes = {
    @Index(name = "idx_analytics_event_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_analytics_event_user_id", columnList = "user_id"),
    @Index(name = "idx_analytics_event_type", columnList = "event_type"),
    @Index(name = "idx_analytics_event_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_analytics_event_timestamp", columnList = "timestamp"),
    @Index(name = "idx_analytics_event_tenant_timestamp", columnList = "tenant_id, timestamp"),
    @Index(name = "idx_analytics_event_tenant_type_timestamp", columnList = "tenant_id, event_type, timestamp")
})
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", length = 50)
    private EntityType entityType;

    @Column(name = "entity_id")
    private String entityId;

    /**
     * JSON-serialized event-specific properties.
     * Examples: page URL, search query, filter criteria, etc.
     */
    @Column(name = "properties", columnDefinition = "TEXT")
    private String properties;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    /**
     * Session ID for grouping events within a user session.
     */
    @Column(name = "session_id")
    private String sessionId;

    /**
     * Client IP address for geographic analytics.
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * User agent string for device/browser analytics.
     */
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }

    /**
     * Supported event types for analytics tracking.
     */
    public enum EventType {
        // Page views
        PAGE_VIEW,

        // Search & Discovery
        SEARCH_PERFORMED,
        FILTER_APPLIED,
        SORT_CHANGED,

        // Opportunity interactions
        OPPORTUNITY_VIEWED,
        OPPORTUNITY_SAVED,
        OPPORTUNITY_UNSAVED,
        OPPORTUNITY_EXPORTED,
        OPPORTUNITY_SHARED,

        // Pipeline actions
        PIPELINE_OPPORTUNITY_ADDED,
        PIPELINE_OPPORTUNITY_MOVED,
        PIPELINE_OPPORTUNITY_REMOVED,
        BID_DECISION_MADE,

        // Contract actions
        CONTRACT_VIEWED,
        CONTRACT_CREATED,
        CONTRACT_UPDATED,
        DELIVERABLE_COMPLETED,
        INVOICE_SUBMITTED,

        // Document actions
        DOCUMENT_UPLOADED,
        DOCUMENT_DOWNLOADED,
        DOCUMENT_VIEWED,

        // User actions
        USER_LOGIN,
        USER_LOGOUT,
        PROFILE_UPDATED,
        SETTINGS_CHANGED,

        // Dashboard interactions
        DASHBOARD_VIEWED,
        REPORT_GENERATED,
        REPORT_EXPORTED,
        WIDGET_INTERACTED,

        // Alert interactions
        ALERT_CREATED,
        ALERT_TRIGGERED,
        ALERT_DISMISSED,

        // Custom events
        CUSTOM
    }

    /**
     * Entity types that can be associated with events.
     */
    public enum EntityType {
        OPPORTUNITY,
        CONTRACT,
        PIPELINE,
        PIPELINE_OPPORTUNITY,
        DOCUMENT,
        INVOICE,
        REPORT,
        DASHBOARD,
        ALERT,
        SEARCH,
        USER,
        COMPANY_PROFILE
    }
}
