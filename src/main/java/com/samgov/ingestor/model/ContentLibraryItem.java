package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "content_library_items", indexes = {
    @Index(name = "idx_content_tenant", columnList = "tenant_id"),
    @Index(name = "idx_content_type", columnList = "content_type"),
    @Index(name = "idx_content_category", columnList = "category"),
    @Index(name = "idx_content_active", columnList = "is_active")
})
public class ContentLibraryItem {

    public enum ContentType {
        // Past Performance
        PAST_PERFORMANCE_NARRATIVE,
        PAST_PERFORMANCE_SUMMARY,
        PROJECT_DESCRIPTION,
        CASE_STUDY,

        // Personnel
        RESUME,
        KEY_PERSONNEL_BIO,
        PERSONNEL_SUMMARY,
        QUALIFICATIONS_STATEMENT,

        // Capability Statements
        CAPABILITY_STATEMENT,
        CORPORATE_OVERVIEW,
        COMPANY_HISTORY,
        MISSION_STATEMENT,
        VALUE_PROPOSITION,

        // Technical Content
        TECHNICAL_APPROACH,
        METHODOLOGY,
        PROCESS_DESCRIPTION,
        TOOL_DESCRIPTION,
        TECHNOLOGY_OVERVIEW,

        // Management Content
        MANAGEMENT_APPROACH,
        ORGANIZATIONAL_STRUCTURE,
        STAFFING_PLAN,
        QUALITY_APPROACH,
        RISK_MANAGEMENT,

        // Compliance & Certifications
        CERTIFICATION_DESCRIPTION,
        COMPLIANCE_STATEMENT,
        SECURITY_STATEMENT,

        // Boilerplate
        BOILERPLATE_INTRO,
        BOILERPLATE_CLOSING,
        DISCLAIMER,
        TERMS_CONDITIONS,

        // Other
        WIN_THEME,
        DISCRIMINATOR,
        GRAPHIC,
        TABLE,
        OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    // Primary category for organization
    @Column(nullable = false)
    private String category;

    // Subcategory for further organization
    @Column(name = "sub_category")
    private String subCategory;

    // The actual content
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    // HTML/Rich text version if applicable
    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    // Related entity links
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private User employee;

    // For past performance - customer info
    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_agency")
    private String customerAgency;

    @Column(name = "contract_number")
    private String contractNumber;

    @Column(name = "contract_value")
    private String contractValue;

    @Column(name = "period_of_performance")
    private String periodOfPerformance;

    // Relevance tags for search and matching
    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    @Column(name = "naics_codes")
    private String naicsCodes;

    @Column(name = "psc_codes")
    private String pscCodes;

    // Word/character counts for proposal planning
    @Column(name = "word_count")
    private Integer wordCount;

    @Column(name = "character_count")
    private Integer characterCount;

    @Column(name = "page_count")
    private Integer pageCount;

    // Usage tracking
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "last_used_in")
    private String lastUsedIn;

    // Quality indicators
    @Column(name = "quality_score")
    private Integer qualityScore;

    @Column(name = "win_count")
    private Integer winCount = 0;

    @Column(name = "loss_count")
    private Integer lossCount = 0;

    // Versioning
    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @Column(name = "version_notes", length = 1000)
    private String versionNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_version_id")
    private ContentLibraryItem parentVersion;

    @Column(name = "is_latest_version", nullable = false)
    private Boolean isLatestVersion = true;

    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false;

    @Column(name = "expiration_date")
    private Instant expirationDate;

    // Approval workflow
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    // Audit fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        calculateCounts();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        calculateCounts();
    }

    // Helper methods
    private void calculateCounts() {
        if (content != null) {
            this.characterCount = content.length();
            this.wordCount = content.split("\\s+").length;
            // Rough estimate: 500 words per page
            this.pageCount = (int) Math.ceil(wordCount / 500.0);
        }
    }

    public void recordUsage(String proposalName) {
        this.usageCount++;
        this.lastUsedAt = Instant.now();
        this.lastUsedIn = proposalName;
    }

    public void recordWin() {
        this.winCount++;
    }

    public void recordLoss() {
        this.lossCount++;
    }

    public Double getWinRate() {
        int total = winCount + lossCount;
        if (total == 0) return null;
        return (double) winCount / total * 100;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public void setContentType(ContentType contentType) {
        this.contentType = contentType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubCategory() {
        return subCategory;
    }

    public void setSubCategory(String subCategory) {
        this.subCategory = subCategory;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContentHtml() {
        return contentHtml;
    }

    public void setContentHtml(String contentHtml) {
        this.contentHtml = contentHtml;
    }

    public Contract getContract() {
        return contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public User getEmployee() {
        return employee;
    }

    public void setEmployee(User employee) {
        this.employee = employee;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerAgency() {
        return customerAgency;
    }

    public void setCustomerAgency(String customerAgency) {
        this.customerAgency = customerAgency;
    }

    public String getContractNumber() {
        return contractNumber;
    }

    public void setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
    }

    public String getContractValue() {
        return contractValue;
    }

    public void setContractValue(String contractValue) {
        this.contractValue = contractValue;
    }

    public String getPeriodOfPerformance() {
        return periodOfPerformance;
    }

    public void setPeriodOfPerformance(String periodOfPerformance) {
        this.periodOfPerformance = periodOfPerformance;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
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

    public Integer getWordCount() {
        return wordCount;
    }

    public void setWordCount(Integer wordCount) {
        this.wordCount = wordCount;
    }

    public Integer getCharacterCount() {
        return characterCount;
    }

    public void setCharacterCount(Integer characterCount) {
        this.characterCount = characterCount;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public Instant getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(Instant lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    public String getLastUsedIn() {
        return lastUsedIn;
    }

    public void setLastUsedIn(String lastUsedIn) {
        this.lastUsedIn = lastUsedIn;
    }

    public Integer getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Integer qualityScore) {
        this.qualityScore = qualityScore;
    }

    public Integer getWinCount() {
        return winCount;
    }

    public void setWinCount(Integer winCount) {
        this.winCount = winCount;
    }

    public Integer getLossCount() {
        return lossCount;
    }

    public void setLossCount(Integer lossCount) {
        this.lossCount = lossCount;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getVersionNotes() {
        return versionNotes;
    }

    public void setVersionNotes(String versionNotes) {
        this.versionNotes = versionNotes;
    }

    public ContentLibraryItem getParentVersion() {
        return parentVersion;
    }

    public void setParentVersion(ContentLibraryItem parentVersion) {
        this.parentVersion = parentVersion;
    }

    public Boolean getIsLatestVersion() {
        return isLatestVersion;
    }

    public void setIsLatestVersion(Boolean isLatestVersion) {
        this.isLatestVersion = isLatestVersion;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }

    public Instant getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(Instant expirationDate) {
        this.expirationDate = expirationDate;
    }

    public User getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
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
