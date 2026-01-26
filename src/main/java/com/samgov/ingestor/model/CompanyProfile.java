package com.samgov.ingestor.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Company profile for tenant organization.
 * Contains key information for opportunity matching and compliance.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "company_profiles", indexes = {
    @Index(name = "idx_company_tenant", columnList = "tenant_id"),
    @Index(name = "idx_company_uei", columnList = "uei"),
    @Index(name = "idx_company_cage", columnList = "cage_code")
})
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    private Tenant tenant;

    // Business Identifiers
    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "dba_name")
    private String dbaName;

    @Column(name = "uei", length = 12, unique = true)
    private String uei;

    @Column(name = "cage_code", length = 5)
    private String cageCode;

    @Column(name = "duns", length = 9)
    private String duns;

    @Column(name = "ein", length = 10)
    private String ein;

    // SAM.gov Registration
    @Column(name = "sam_status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SamStatus samStatus = SamStatus.NOT_REGISTERED;

    @Column(name = "sam_expiration_date")
    private LocalDate samExpirationDate;

    @Column(name = "sam_registration_date")
    private LocalDate samRegistrationDate;

    // Business Classification
    @Column(name = "business_type")
    private String businessType;

    @Column(name = "organization_structure")
    private String organizationStructure;

    @Column(name = "year_established")
    private Integer yearEstablished;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(name = "annual_revenue", precision = 15, scale = 2)
    private BigDecimal annualRevenue;

    // NAICS Codes (comma-separated primary codes)
    @Column(name = "primary_naics")
    private String primaryNaics;

    @Column(name = "secondary_naics", columnDefinition = "TEXT")
    private String secondaryNaics;

    // PSC Codes (comma-separated)
    @Column(name = "psc_codes", columnDefinition = "TEXT")
    private String pscCodes;

    // Small Business Certifications
    @Column(name = "is_small_business")
    @Builder.Default
    private Boolean isSmallBusiness = false;

    @Column(name = "is_8a")
    @Builder.Default
    private Boolean is8a = false;

    @Column(name = "is_hubzone")
    @Builder.Default
    private Boolean isHubzone = false;

    @Column(name = "is_sdvosb")
    @Builder.Default
    private Boolean isSdvosb = false;

    @Column(name = "is_wosb")
    @Builder.Default
    private Boolean isWosb = false;

    @Column(name = "is_edwosb")
    @Builder.Default
    private Boolean isEdwosb = false;

    @Column(name = "is_vosb")
    @Builder.Default
    private Boolean isVosb = false;

    @Column(name = "is_sdb")
    @Builder.Default
    private Boolean isSdb = false;

    // Security & Compliance
    @Column(name = "has_facility_clearance")
    @Builder.Default
    private Boolean hasFacilityClearance = false;

    @Column(name = "facility_clearance_level")
    private String facilityClearanceLevel;

    @Column(name = "is_itar_registered")
    @Builder.Default
    private Boolean isItarRegistered = false;

    @Column(name = "itar_registration_expiry")
    private LocalDate itarRegistrationExpiry;

    @Column(name = "is_cmmc_certified")
    @Builder.Default
    private Boolean isCmmcCertified = false;

    @Column(name = "cmmc_level")
    private String cmmcLevel;

    @Column(name = "iso_certifications")
    private String isoCertifications;

    // Contract Vehicles
    @Column(name = "gsa_schedule_holder")
    @Builder.Default
    private Boolean gsaScheduleHolder = false;

    @Column(name = "gsa_contract_numbers", columnDefinition = "TEXT")
    private String gsaContractNumbers;

    @Column(name = "other_contract_vehicles", columnDefinition = "TEXT")
    private String otherContractVehicles;

    // Geographic Coverage
    @Column(name = "headquarters_state")
    private String headquartersState;

    @Column(name = "headquarters_city")
    private String headquartersCity;

    @Column(name = "service_regions", columnDefinition = "TEXT")
    private String serviceRegions;

    // Capabilities Description
    @Column(name = "capabilities_statement", columnDefinition = "TEXT")
    private String capabilitiesStatement;

    @Column(name = "core_competencies", columnDefinition = "TEXT")
    private String coreCompetencies;

    @Column(name = "past_performance_summary", columnDefinition = "TEXT")
    private String pastPerformanceSummary;

    @Column(name = "differentiators", columnDefinition = "TEXT")
    private String differentiators;

    // Target Markets
    @Column(name = "target_federal")
    @Builder.Default
    private Boolean targetFederal = true;

    @Column(name = "target_dod")
    @Builder.Default
    private Boolean targetDod = false;

    @Column(name = "target_state")
    @Builder.Default
    private Boolean targetState = false;

    @Column(name = "target_local")
    @Builder.Default
    private Boolean targetLocal = false;

    @Column(name = "target_commercial")
    @Builder.Default
    private Boolean targetCommercial = false;

    // Metadata
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

    public enum SamStatus {
        NOT_REGISTERED,
        PENDING,
        ACTIVE,
        EXPIRED,
        EXCLUDED
    }
}
