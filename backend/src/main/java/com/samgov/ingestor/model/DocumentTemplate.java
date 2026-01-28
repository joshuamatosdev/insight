package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "document_templates", indexes = {
    @Index(name = "idx_template_tenant", columnList = "tenant_id"),
    @Index(name = "idx_template_type", columnList = "template_type"),
    @Index(name = "idx_template_category", columnList = "category"),
    @Index(name = "idx_template_active", columnList = "is_active")
})
public class DocumentTemplate {

    public enum TemplateType {
        // Proposal Templates
        PROPOSAL_COVER_LETTER,
        PROPOSAL_EXECUTIVE_SUMMARY,
        PROPOSAL_TECHNICAL_VOLUME,
        PROPOSAL_MANAGEMENT_VOLUME,
        PROPOSAL_PAST_PERFORMANCE_VOLUME,
        PROPOSAL_COST_VOLUME,
        COMPLIANCE_MATRIX,

        // Contract Templates
        STATEMENT_OF_WORK,
        PERFORMANCE_WORK_STATEMENT,
        QUALITY_ASSURANCE_PLAN,
        SECURITY_PLAN,
        PROJECT_MANAGEMENT_PLAN,

        // Agreement Templates
        NDA_MUTUAL,
        NDA_ONE_WAY,
        TEAMING_AGREEMENT,
        SUBCONTRACT_AGREEMENT,
        LETTER_OF_INTENT,
        CONSULTING_AGREEMENT,

        // Reports
        STATUS_REPORT_WEEKLY,
        STATUS_REPORT_MONTHLY,
        FINANCIAL_REPORT,
        PROGRESS_REPORT,
        INCIDENT_REPORT,

        // Personnel
        RESUME_TEMPLATE,
        KEY_PERSONNEL_BIO,
        ORG_CHART,

        // Correspondence
        LETTER_FORMAL,
        LETTER_RESPONSE,
        EMAIL_TEMPLATE,

        // Other
        CHECKLIST,
        FORM,
        OTHER
    }

    public enum TemplateFormat {
        WORD,
        PDF,
        EXCEL,
        POWERPOINT,
        HTML,
        MARKDOWN,
        TEXT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false)
    private TemplateType templateType;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_format", nullable = false)
    private TemplateFormat templateFormat;

    // Category for organization
    @Column(nullable = false)
    private String category;

    // File storage
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type")
    private String contentType;

    // Template content (for simple text templates stored inline)
    @Column(name = "template_content", columnDefinition = "TEXT")
    private String templateContent;

    // Merge fields/variables
    @Column(name = "merge_fields", columnDefinition = "TEXT")
    private String mergeFields;

    // Versioning
    @Column(name = "version", nullable = false)
    private String version = "1.0";

    @Column(name = "version_notes", length = 1000)
    private String versionNotes;

    // Usage tracking
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "is_system_template", nullable = false)
    private Boolean isSystemTemplate = false;

    // Metadata
    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    // Approval
    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false;

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Helper method to increment usage
    public void recordUsage() {
        this.usageCount++;
        this.lastUsedAt = Instant.now();
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TemplateType getTemplateType() {
        return templateType;
    }

    public void setTemplateType(TemplateType templateType) {
        this.templateType = templateType;
    }

    public TemplateFormat getTemplateFormat() {
        return templateFormat;
    }

    public void setTemplateFormat(TemplateFormat templateFormat) {
        this.templateFormat = templateFormat;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getTemplateContent() {
        return templateContent;
    }

    public void setTemplateContent(String templateContent) {
        this.templateContent = templateContent;
    }

    public String getMergeFields() {
        return mergeFields;
    }

    public void setMergeFields(String mergeFields) {
        this.mergeFields = mergeFields;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getVersionNotes() {
        return versionNotes;
    }

    public void setVersionNotes(String versionNotes) {
        this.versionNotes = versionNotes;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Boolean getIsSystemTemplate() {
        return isSystemTemplate;
    }

    public void setIsSystemTemplate(Boolean isSystemTemplate) {
        this.isSystemTemplate = isSystemTemplate;
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

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
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
