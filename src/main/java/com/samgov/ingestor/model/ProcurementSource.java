package com.samgov.ingestor.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents external procurement data sources for opportunity ingestion.
 * Supports Federal (SAM.gov, SBIR.gov), State, and Local procurement portals.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "procurement_sources", indexes = {
    @Index(name = "idx_procsrc_level", columnList = "contract_level"),
    @Index(name = "idx_procsrc_state", columnList = "state_code"),
    @Index(name = "idx_procsrc_active", columnList = "is_active")
})
public class ProcurementSource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "short_code", unique = true)
    private String shortCode;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_level", nullable = false)
    private Opportunity.ContractLevel contractLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    private SourceType sourceType;

    @Column(name = "state_code", length = 2)
    private String stateCode;

    @Column(name = "state_name")
    private String stateName;

    @Column(name = "locality")
    private String locality;

    @Column(name = "api_endpoint")
    private String apiEndpoint;

    @Column(name = "api_key_required")
    @Builder.Default
    private Boolean apiKeyRequired = false;

    @Column(name = "web_portal_url")
    private String webPortalUrl;

    @Column(name = "rss_feed_url")
    private String rssFeedUrl;

    @Column(name = "scrape_enabled")
    @Builder.Default
    private Boolean scrapeEnabled = false;

    @Column(name = "scrape_config", columnDefinition = "TEXT")
    private String scrapeConfig;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "refresh_interval_hours")
    @Builder.Default
    private Integer refreshIntervalHours = 24;

    @Column(name = "last_ingestion_at")
    private Instant lastIngestionAt;

    @Column(name = "last_ingestion_count")
    @Builder.Default
    private Integer lastIngestionCount = 0;

    @Column(name = "total_opportunities_ingested")
    @Builder.Default
    private Long totalOpportunitiesIngested = 0L;

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

    public enum SourceType {
        API,            // Official API access
        RSS,            // RSS/Atom feed
        WEB_SCRAPE,     // Web scraping
        MANUAL,         // Manual entry
        FILE_IMPORT     // Bulk file import (CSV, XML)
    }
}
