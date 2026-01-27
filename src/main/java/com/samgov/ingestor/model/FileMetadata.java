package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Metadata for files stored in S3.
 *
 * Tracks file information for multi-tenant document storage with
 * tenant isolation via S3 key prefixes: tenants/{tenantId}/files/{fileId}/{fileName}
 */
@Entity
@Table(name = "file_metadata", indexes = {
    @Index(name = "idx_file_metadata_tenant", columnList = "tenant_id"),
    @Index(name = "idx_file_metadata_uploaded_by", columnList = "uploaded_by"),
    @Index(name = "idx_file_metadata_s3_key", columnList = "s3_key"),
    @Index(name = "idx_file_metadata_content_type", columnList = "content_type"),
    @Index(name = "idx_file_metadata_uploaded_at", columnList = "uploaded_at")
})
public class FileMetadata {

    public enum FileStatus {
        PENDING,      // Upload initiated but not completed
        UPLOADED,     // Successfully uploaded to S3
        PROCESSING,   // Being processed (e.g., virus scan, thumbnail generation)
        AVAILABLE,    // Ready for download
        QUARANTINED,  // Failed security scan
        DELETED       // Soft deleted
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long size;

    @Column(name = "s3_key", nullable = false, unique = true)
    private String s3Key;

    @Column(name = "s3_bucket", nullable = false)
    private String s3Bucket;

    @Column(name = "checksum")
    private String checksum;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileStatus status = FileStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    // Optional reference fields for linking files to entities
    @Column(name = "reference_type")
    private String referenceType;  // e.g., "OPPORTUNITY", "CONTRACT", "PROPOSAL"

    @Column(name = "reference_id")
    private String referenceId;

    @Column(length = 500)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @PrePersist
    protected void onCreate() {
        uploadedAt = Instant.now();
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getS3Key() {
        return s3Key;
    }

    public void setS3Key(String s3Key) {
        this.s3Key = s3Key;
    }

    public String getS3Bucket() {
        return s3Bucket;
    }

    public void setS3Bucket(String s3Bucket) {
        this.s3Bucket = s3Bucket;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public FileStatus getStatus() {
        return status;
    }

    public void setStatus(FileStatus status) {
        this.status = status;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }

    public User getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(User deletedBy) {
        this.deletedBy = deletedBy;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    /**
     * Check if the file is available for download.
     */
    public boolean isAvailable() {
        return status == FileStatus.AVAILABLE || status == FileStatus.UPLOADED;
    }

    /**
     * Check if the file has been deleted.
     */
    public boolean isDeleted() {
        return status == FileStatus.DELETED || deletedAt != null;
    }

    /**
     * Mark the file as deleted (soft delete).
     */
    public void markAsDeleted(User user) {
        this.status = FileStatus.DELETED;
        this.deletedAt = Instant.now();
        this.deletedBy = user;
    }
}
