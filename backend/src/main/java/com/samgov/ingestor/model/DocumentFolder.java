package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "document_folders", indexes = {
    @Index(name = "idx_folder_tenant", columnList = "tenant_id"),
    @Index(name = "idx_folder_parent", columnList = "parent_folder_id"),
    @Index(name = "idx_folder_name", columnList = "name"),
    @Index(name = "idx_folder_path", columnList = "path")
})
public class DocumentFolder {

    public enum FolderType {
        ROOT,
        OPPORTUNITY,
        CONTRACT,
        PROPOSAL,
        COMPLIANCE,
        FINANCIAL,
        PERSONNEL,
        TEMPLATE,
        ARCHIVE,
        CUSTOM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_folder_id")
    private DocumentFolder parentFolder;

    @OneToMany(mappedBy = "parentFolder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentFolder> subFolders = new ArrayList<>();

    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id")
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "folder_type", nullable = false)
    private FolderType folderType = FolderType.CUSTOM;

    // Full path from root (e.g., "/Opportunities/ABC-123/Technical")
    @Column(nullable = false, length = 1000)
    private String path;

    // Depth level in hierarchy (0 = root)
    @Column(nullable = false)
    private Integer depth = 0;

    // Sort order within parent
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    // Access control
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "is_system_folder", nullable = false)
    private Boolean isSystemFolder = false;

    // Metadata
    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(name = "icon")
    private String icon;

    @Column(name = "color")
    private String color;

    // Retention policy
    @Column(name = "retention_days")
    private Integer retentionDays;

    // Audit fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = false;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (path == null) {
            path = "/" + name;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Helper methods
    public void addSubFolder(DocumentFolder folder) {
        subFolders.add(folder);
        folder.setParentFolder(this);
        folder.setDepth(this.depth + 1);
        folder.setPath(this.path + "/" + folder.getName());
    }

    public void removeSubFolder(DocumentFolder folder) {
        subFolders.remove(folder);
        folder.setParentFolder(null);
    }

    public void addDocument(Document document) {
        documents.add(document);
        document.setFolder(this);
    }

    public void removeDocument(Document document) {
        documents.remove(document);
        document.setFolder(null);
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

    public DocumentFolder getParentFolder() {
        return parentFolder;
    }

    public void setParentFolder(DocumentFolder parentFolder) {
        this.parentFolder = parentFolder;
    }

    public List<DocumentFolder> getSubFolders() {
        return subFolders;
    }

    public void setSubFolders(List<DocumentFolder> subFolders) {
        this.subFolders = subFolders;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
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

    public FolderType getFolderType() {
        return folderType;
    }

    public void setFolderType(FolderType folderType) {
        this.folderType = folderType;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Integer getDepth() {
        return depth;
    }

    public void setDepth(Integer depth) {
        this.depth = depth;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Boolean getIsSystemFolder() {
        return isSystemFolder;
    }

    public void setIsSystemFolder(Boolean isSystemFolder) {
        this.isSystemFolder = isSystemFolder;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getRetentionDays() {
        return retentionDays;
    }

    public void setRetentionDays(Integer retentionDays) {
        this.retentionDays = retentionDays;
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

    public Boolean getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Boolean isArchived) {
        this.isArchived = isArchived;
    }
}
