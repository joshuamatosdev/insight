package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "documents", indexes = {
    @Index(name = "idx_document_tenant", columnList = "tenant_id"),
    @Index(name = "idx_document_folder", columnList = "folder_id"),
    @Index(name = "idx_document_opportunity", columnList = "opportunity_id"),
    @Index(name = "idx_document_contract", columnList = "contract_id"),
    @Index(name = "idx_document_type", columnList = "document_type"),
    @Index(name = "idx_document_name", columnList = "name")
})
public class Document {

    public enum DocumentType {
        // Opportunity/Proposal Documents
        RFP,
        RFQ,
        RFI,
        SOURCES_SOUGHT,
        AMENDMENT,
        QUESTIONS_ANSWERS,
        PROPOSAL_VOLUME,
        PROPOSAL_TECHNICAL,
        PROPOSAL_MANAGEMENT,
        PROPOSAL_COST,
        PROPOSAL_PAST_PERFORMANCE,
        COVER_LETTER,
        EXECUTIVE_SUMMARY,

        // Contract Documents
        CONTRACT,
        TASK_ORDER,
        MODIFICATION,
        STATEMENT_OF_WORK,
        PERFORMANCE_WORK_STATEMENT,
        CONTRACT_DATA_REQUIREMENTS_LIST,
        QUALITY_ASSURANCE_PLAN,
        SECURITY_PLAN,

        // Administrative Documents
        NDA,
        TEAMING_AGREEMENT,
        SUBCONTRACT,
        LETTER_OF_INTENT,
        ORGANIZATIONAL_CHART,

        // Compliance Documents
        CERTIFICATE,
        LICENSE,
        POLICY,
        PROCEDURE,
        AUDIT_REPORT,

        // Financial Documents
        INVOICE,
        RECEIPT,
        PURCHASE_ORDER,
        BUDGET_DOCUMENT,
        RATE_SCHEDULE,

        // Personnel Documents
        RESUME,
        BIOGRAPHY,
        TRAINING_CERTIFICATE,
        CLEARANCE_VERIFICATION,

        // Deliverables
        DELIVERABLE,
        REPORT,
        PRESENTATION,
        MEETING_MINUTES,
        STATUS_REPORT,

        // General
        CORRESPONDENCE,
        EMAIL,
        ATTACHMENT,
        TEMPLATE,
        OTHER
    }

    public enum DocumentStatus {
        DRAFT,
        PENDING_REVIEW,
        IN_REVIEW,
        APPROVED,
        REJECTED,
        ARCHIVED,
        SUPERSEDED
    }

    public enum AccessLevel {
        PUBLIC,
        INTERNAL,
        RESTRICTED,
        CONFIDENTIAL,
        SECRET
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private DocumentFolder folder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id")
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false)
    private AccessLevel accessLevel = AccessLevel.INTERNAL;

    // File information
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_hash")
    private String fileHash;

    // Versioning
    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_document_id")
    private Document parentDocument;

    @Column(name = "is_latest_version", nullable = false)
    private Boolean isLatestVersion = true;

    // Check-in/Check-out
    @Column(name = "is_checked_out", nullable = false)
    private Boolean isCheckedOut = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_out_by")
    private User checkedOutBy;

    @Column(name = "checked_out_at")
    private Instant checkedOutAt;

    // Metadata
    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    @Column(name = "author")
    private String author;

    @Column(name = "source")
    private String source;

    @Column(name = "effective_date")
    private Instant effectiveDate;

    @Column(name = "expiration_date")
    private Instant expirationDate;

    // Approval workflow
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "approval_notes", length = 2000)
    private String approvalNotes;

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

    // Retention
    @Column(name = "retention_date")
    private Instant retentionDate;

    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = false;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
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

    public DocumentFolder getFolder() {
        return folder;
    }

    public void setFolder(DocumentFolder folder) {
        this.folder = folder;
    }

    public Opportunity getOpportunity() {
        return opportunity;
    }

    public void setOpportunity(Opportunity opportunity) {
        this.opportunity = opportunity;
    }

    public Contract getContract() {
        return contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
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

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(DocumentStatus status) {
        this.status = status;
    }

    public AccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
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

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public Document getParentDocument() {
        return parentDocument;
    }

    public void setParentDocument(Document parentDocument) {
        this.parentDocument = parentDocument;
    }

    public Boolean getIsLatestVersion() {
        return isLatestVersion;
    }

    public void setIsLatestVersion(Boolean isLatestVersion) {
        this.isLatestVersion = isLatestVersion;
    }

    public Boolean getIsCheckedOut() {
        return isCheckedOut;
    }

    public void setIsCheckedOut(Boolean isCheckedOut) {
        this.isCheckedOut = isCheckedOut;
    }

    public User getCheckedOutBy() {
        return checkedOutBy;
    }

    public void setCheckedOutBy(User checkedOutBy) {
        this.checkedOutBy = checkedOutBy;
    }

    public Instant getCheckedOutAt() {
        return checkedOutAt;
    }

    public void setCheckedOutAt(Instant checkedOutAt) {
        this.checkedOutAt = checkedOutAt;
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

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Instant getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(Instant effectiveDate) {
        this.effectiveDate = effectiveDate;
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

    public String getApprovalNotes() {
        return approvalNotes;
    }

    public void setApprovalNotes(String approvalNotes) {
        this.approvalNotes = approvalNotes;
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

    public Instant getRetentionDate() {
        return retentionDate;
    }

    public void setRetentionDate(Instant retentionDate) {
        this.retentionDate = retentionDate;
    }

    public Boolean getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Boolean isArchived) {
        this.isArchived = isArchived;
    }
}
