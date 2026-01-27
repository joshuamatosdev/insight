package com.samgov.ingestor.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "teaming_partners", indexes = {
    @Index(name = "idx_teaming_partner_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_teaming_partner_uei", columnList = "uei"),
    @Index(name = "idx_teaming_partner_cage_code", columnList = "cage_code"),
    @Index(name = "idx_teaming_partner_status", columnList = "status")
})
public class TeammingPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "uei")
    private String uei;

    @Column(name = "cage_code")
    private String cageCode;

    @Column(name = "duns_number")
    private String dunsNumber;

    // Contact information
    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "contact_title")
    private String contactTitle;

    // Company information
    @Column(name = "website")
    private String website;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    @Column(name = "country")
    @Builder.Default
    private String country = "USA";

    // Partner classification
    @Enumerated(EnumType.STRING)
    @Column(name = "partner_type")
    @Builder.Default
    private PartnerType partnerType = PartnerType.SUBCONTRACTOR;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private PartnerStatus status = PartnerStatus.ACTIVE;

    // Small business status
    @Column(name = "is_small_business")
    @Builder.Default
    private Boolean isSmallBusiness = false;

    @Column(name = "small_business_types")
    private String smallBusinessTypes; // Comma-separated: 8a, HUBZone, WOSB, SDVOSB, etc.

    // Capabilities and certifications
    @ElementCollection
    @CollectionTable(name = "teaming_partner_capabilities", joinColumns = @JoinColumn(name = "partner_id"))
    @Column(name = "capability")
    @Builder.Default
    private List<String> capabilities = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "teaming_partner_certifications", joinColumns = @JoinColumn(name = "partner_id"))
    @Column(name = "certification")
    @Builder.Default
    private List<String> certifications = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "teaming_partner_naics", joinColumns = @JoinColumn(name = "partner_id"))
    @Column(name = "naics_code")
    @Builder.Default
    private List<String> naicsCodes = new ArrayList<>();

    // Performance tracking
    @Column(name = "past_performance_rating")
    private Integer pastPerformanceRating; // 1-5 scale

    @Column(name = "reliability_score")
    private Integer reliabilityScore; // 1-100

    @Column(name = "contracts_together")
    @Builder.Default
    private Integer contractsTogether = 0;

    // Notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;

    // Audit fields
    @Column(name = "created_by")
    private String createdBy;

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

    public enum PartnerType {
        PRIME,
        SUBCONTRACTOR,
        MENTOR,
        PROTEGE,
        JOINT_VENTURE,
        TEAMING_PARTNER,
        CONSULTANT,
        SUPPLIER
    }

    public enum PartnerStatus {
        ACTIVE,
        INACTIVE,
        PENDING_REVIEW,
        BLACKLISTED,
        ARCHIVED
    }
}
