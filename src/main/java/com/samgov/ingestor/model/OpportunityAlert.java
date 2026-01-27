package com.samgov.ingestor.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents an opportunity alert configuration that monitors
 * for opportunities matching specific criteria (NAICS codes, keywords, value ranges).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "opportunity_alerts", indexes = {
    @Index(name = "idx_opp_alert_user_id", columnList = "user_id"),
    @Index(name = "idx_opp_alert_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_opp_alert_enabled", columnList = "enabled")
})
public class OpportunityAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "opportunity_alert_naics_codes",
        joinColumns = @JoinColumn(name = "opportunity_alert_id")
    )
    @Column(name = "naics_code")
    @Builder.Default
    private List<String> naicsCodes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "opportunity_alert_keywords",
        joinColumns = @JoinColumn(name = "opportunity_alert_id")
    )
    @Column(name = "keyword")
    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    @Column(name = "min_value", precision = 15, scale = 2)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 15, scale = 2)
    private BigDecimal maxValue;

    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "last_checked_at")
    private Instant lastCheckedAt;

    @Column(name = "last_match_count")
    private Integer lastMatchCount;

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
