package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "organizations", indexes = {
    @Index(name = "idx_org_tenant", columnList = "tenant_id"),
    @Index(name = "idx_org_type", columnList = "organization_type"),
    @Index(name = "idx_org_name", columnList = "name"),
    @Index(name = "idx_org_uei", columnList = "uei"),
    @Index(name = "idx_org_cage", columnList = "cage_code")
})
public class Organization {

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
    private List<Contact> contacts = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_organization_id")
    private Organization parentOrganization;

    @OneToMany(mappedBy = "parentOrganization")
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

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getDbaName() {
        return dbaName;
    }

    public void setDbaName(String dbaName) {
        this.dbaName = dbaName;
    }

    public OrganizationType getOrganizationType() {
        return organizationType;
    }

    public void setOrganizationType(OrganizationType organizationType) {
        this.organizationType = organizationType;
    }

    public OrganizationStatus getStatus() {
        return status;
    }

    public void setStatus(OrganizationStatus status) {
        this.status = status;
    }

    public BusinessSize getBusinessSize() {
        return businessSize;
    }

    public void setBusinessSize(BusinessSize businessSize) {
        this.businessSize = businessSize;
    }

    public String getUei() {
        return uei;
    }

    public void setUei(String uei) {
        this.uei = uei;
    }

    public String getCageCode() {
        return cageCode;
    }

    public void setCageCode(String cageCode) {
        this.cageCode = cageCode;
    }

    public String getDuns() {
        return duns;
    }

    public void setDuns(String duns) {
        this.duns = duns;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getAgencyCode() {
        return agencyCode;
    }

    public void setAgencyCode(String agencyCode) {
        this.agencyCode = agencyCode;
    }

    public String getParentAgency() {
        return parentAgency;
    }

    public void setParentAgency(String parentAgency) {
        this.parentAgency = parentAgency;
    }

    public String getNaicsCodes() {
        return naicsCodes;
    }

    public void setNaicsCodes(String naicsCodes) {
        this.naicsCodes = naicsCodes;
    }

    public String getPscCodes() {
        return pscCodes;
    }

    public void setPscCodes(String pscCodes) {
        this.pscCodes = pscCodes;
    }

    public String getPrimaryNaics() {
        return primaryNaics;
    }

    public void setPrimaryNaics(String primaryNaics) {
        this.primaryNaics = primaryNaics;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getFax() {
        return fax;
    }

    public void setFax(String fax) {
        this.fax = fax;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCapabilities() {
        return capabilities;
    }

    public void setCapabilities(String capabilities) {
        this.capabilities = capabilities;
    }

    public String getCoreCompetencies() {
        return coreCompetencies;
    }

    public void setCoreCompetencies(String coreCompetencies) {
        this.coreCompetencies = coreCompetencies;
    }

    public String getPastPerformanceSummary() {
        return pastPerformanceSummary;
    }

    public void setPastPerformanceSummary(String pastPerformanceSummary) {
        this.pastPerformanceSummary = pastPerformanceSummary;
    }

    public String getCertifications() {
        return certifications;
    }

    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }

    public String getContractVehicles() {
        return contractVehicles;
    }

    public void setContractVehicles(String contractVehicles) {
        this.contractVehicles = contractVehicles;
    }

    public List<Contact> getContacts() {
        return contacts;
    }

    public void setContacts(List<Contact> contacts) {
        this.contacts = contacts;
    }

    public Organization getParentOrganization() {
        return parentOrganization;
    }

    public void setParentOrganization(Organization parentOrganization) {
        this.parentOrganization = parentOrganization;
    }

    public List<Organization> getChildOrganizations() {
        return childOrganizations;
    }

    public void setChildOrganizations(List<Organization> childOrganizations) {
        this.childOrganizations = childOrganizations;
    }

    public String getRelationshipTier() {
        return relationshipTier;
    }

    public void setRelationshipTier(String relationshipTier) {
        this.relationshipTier = relationshipTier;
    }

    public Integer getRelationshipScore() {
        return relationshipScore;
    }

    public void setRelationshipScore(Integer relationshipScore) {
        this.relationshipScore = relationshipScore;
    }

    public String getAnnualRevenue() {
        return annualRevenue;
    }

    public void setAnnualRevenue(String annualRevenue) {
        this.annualRevenue = annualRevenue;
    }

    public Integer getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(Integer employeeCount) {
        this.employeeCount = employeeCount;
    }

    public Integer getYearFounded() {
        return yearFounded;
    }

    public void setYearFounded(Integer yearFounded) {
        this.yearFounded = yearFounded;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
