package com.samgov.ingestor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Organization entity used in both Face One (Contract Intelligence) and Face Two (Portal).
 *
 * <p><strong>Face One (Contract Intelligence):</strong> Tracks government agencies,
 * competitors, teaming partners, prospects, and vendors. Used by DoctrineOne Labs for
 * business development, market intelligence, and teaming arrangements.</p>
 *
 * <p><strong>Face Two (Portal):</strong> Tracks client organizations, prime contractors,
 * subcontractors, and vendors involved in contract execution.</p>
 *
 * <p>Multi-tenant: tenant_id isolates organizations between different contexts.</p>
 *
 * @see OrganizationType for which types belong to which system
 */
@Entity
@Table(name = "organizations", indexes = {
    @Index(name = "idx_org_tenant", columnList = "tenant_id"),
    @Index(name = "idx_org_type", columnList = "organization_type"),
    @Index(name = "idx_org_name", columnList = "name"),
    @Index(name = "idx_org_uei", columnList = "uei"),
    @Index(name = "idx_org_cage", columnList = "cage_code")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    /**
     * Organization types used across both systems.
     *
     * <p><strong>Face One (Contract Intelligence):</strong>
     * <ul>
     *   <li>GOVERNMENT_AGENCY - Federal/state agencies for BD targeting</li>
     *   <li>GOVERNMENT_OFFICE - Specific offices within agencies</li>
     *   <li>COMPETITOR - Competing contractors (market intelligence)</li>
     *   <li>PROSPECT - Potential clients</li>
     *   <li>TEAMING_PARTNER - Partners for teaming on bids</li>
     * </ul>
     *
     * <p><strong>Face Two (Portal):</strong>
     * <ul>
     *   <li>CUSTOMER - Client organizations (those who hired DoctrineOne Labs)</li>
     *   <li>PRIME_CONTRACTOR - Prime on client's contract</li>
     *   <li>SUBCONTRACTOR - Subs on client's contract</li>
     *   <li>VENDOR - Vendors for client projects</li>
     * </ul>
     *
     * <p><strong>Shared:</strong> TEAMING_PARTNER, VENDOR (used in both contexts)</p>
     */
    public enum OrganizationType {
        GOVERNMENT_AGENCY,
        GOVERNMENT_OFFICE,
        PRIME_CONTRACTOR,
        SUBCONTRACTOR,
        TEAMING_PARTNER,
        VENDOR,
        COMPETITOR,
        PROSPECT,
        CUSTOMER,
        OTHER
    }

    public enum OrganizationStatus {
        ACTIVE,
        INACTIVE,
        PROSPECT,
        DO_NOT_CONTACT,
        ARCHIVED
    }

    public enum BusinessSize {
        LARGE,
        SMALL,
        SMALL_DISADVANTAGED,
        HUBZONE_SMALL,
        WOSB,
        SDVOSB,
        VOSB,
        UNKNOWN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "dba_name")
    private String dbaName;

    @Enumerated(EnumType.STRING)
    @Column(name = "organization_type", nullable = false)
    private OrganizationType organizationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrganizationStatus status = OrganizationStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_size")
    private BusinessSize businessSize;

    // Government identifiers
    @Column
    private String uei;

    @Column(name = "cage_code")
    private String cageCode;

    @Column(name = "duns")
    private String duns;

    @Column(name = "tax_id")
    private String taxId;

    // Government agency specifics
    @Column(name = "agency_code")
    private String agencyCode;

    @Column(name = "parent_agency")
    private String parentAgency;

    // Industry
    @Column(name = "naics_codes", columnDefinition = "TEXT")
    private String naicsCodes;

    @Column(name = "psc_codes", columnDefinition = "TEXT")
    private String pscCodes;

    @Column(name = "primary_naics")
    private String primaryNaics;

    // Contact information
    @Column(name = "phone")
    private String phone;

    @Column(name = "fax")
    private String fax;

    @Column(name = "email")
    private String email;

    @Column(name = "website")
    private String website;

    // Address
    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column
    private String city;

    @Column
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column
    private String country;

    // Capabilities
    @Column(name = "capabilities", columnDefinition = "TEXT")
    private String capabilities;

    @Column(name = "core_competencies", columnDefinition = "TEXT")
    private String coreCompetencies;

    @Column(name = "past_performance_summary", columnDefinition = "TEXT")
    private String pastPerformanceSummary;

    // Certifications (JSON list)
    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications;

    // Contract vehicles (JSON list)
    @Column(name = "contract_vehicles", columnDefinition = "TEXT")
    private String contractVehicles;

    // Relationships
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Contact> contacts = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_organization_id")
    private Organization parentOrganization;

    @OneToMany(mappedBy = "parentOrganization")
    @Builder.Default
    private List<Organization> childOrganizations = new ArrayList<>();

    // Relationship tracking
    @Column(name = "relationship_tier")
    private String relationshipTier;

    @Column(name = "relationship_score")
    private Integer relationshipScore;

    @Column(name = "annual_revenue")
    private String annualRevenue;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(name = "year_founded")
    private Integer yearFounded;

    // Assigned owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // Metadata
    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Logo
    @Column(name = "logo_url")
    private String logoUrl;

    // Audit fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Helper methods
    public void addContact(Contact contact) {
        contacts.add(contact);
        contact.setOrganization(this);
    }

    public void removeContact(Contact contact) {
        contacts.remove(contact);
        contact.setOrganization(null);
    }
}
