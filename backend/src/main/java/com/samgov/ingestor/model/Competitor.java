package com.samgov.ingestor.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Competitor tracking for competitive intelligence.
 * Tracks competitor companies and their contract awards.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "competitors", indexes = {
    @Index(name = "idx_comp_tenant", columnList = "tenant_id"),
    @Index(name = "idx_comp_uei", columnList = "uei"),
    @Index(name = "idx_comp_name", columnList = "name")
})
public class Competitor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "uei", length = 12)
    private String uei;

    @Column(name = "cage_code", length = 5)
    private String cageCode;

    @Column(name = "website")
    private String website;

    @Column(name = "headquarters_location")
    private String headquartersLocation;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(name = "estimated_revenue", precision = 15, scale = 2)
    private BigDecimal estimatedRevenue;

    @Column(name = "primary_naics_codes", columnDefinition = "TEXT")
    private String primaryNaicsCodes;

    @Column(name = "key_customers", columnDefinition = "TEXT")
    private String keyCustomers;

    @Column(name = "contract_vehicles", columnDefinition = "TEXT")
    private String contractVehicles;

    @Column(name = "certifications")
    private String certifications;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "win_themes", columnDefinition = "TEXT")
    private String winThemes;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Contract Statistics
    @Column(name = "total_contract_value", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalContractValue = BigDecimal.ZERO;

    @Column(name = "contract_count")
    @Builder.Default
    private Integer contractCount = 0;

    @Column(name = "average_contract_value", precision = 15, scale = 2)
    private BigDecimal averageContractValue;

    @Column(name = "win_rate", precision = 5, scale = 2)
    private BigDecimal winRate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_activity_date")
    private Instant lastActivityDate;

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
