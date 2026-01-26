package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.ContentLibraryItem.ContentType;
import com.samgov.ingestor.model.Document.AccessLevel;
import com.samgov.ingestor.model.Document.DocumentStatus;
import com.samgov.ingestor.model.Document.DocumentType;
import com.samgov.ingestor.model.DocumentFolder.FolderType;
import com.samgov.ingestor.model.DocumentTemplate.TemplateFormat;
import com.samgov.ingestor.model.DocumentTemplate.TemplateType;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentFolderRepository folderRepository;
    private final DocumentTemplateRepository templateRepository;
    private final ContentLibraryItemRepository contentLibraryRepository;
    private final TenantRepository tenantRepository;
    private final ContractRepository contractRepository;
    private final OpportunityRepository opportunityRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DocumentService(
            DocumentRepository documentRepository,
            DocumentFolderRepository folderRepository,
            DocumentTemplateRepository templateRepository,
            ContentLibraryItemRepository contentLibraryRepository,
            TenantRepository tenantRepository,
            ContractRepository contractRepository,
            OpportunityRepository opportunityRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.documentRepository = documentRepository;
        this.folderRepository = folderRepository;
        this.templateRepository = templateRepository;
        this.contentLibraryRepository = contentLibraryRepository;
        this.tenantRepository = tenantRepository;
        this.contractRepository = contractRepository;
        this.opportunityRepository = opportunityRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    // ==================== Document DTOs ====================

    public record CreateDocumentRequest(
        UUID folderId,
        String opportunityId,
        UUID contractId,
        String name,
        String description,
        DocumentType documentType,
        AccessLevel accessLevel,
        String fileName,
        String filePath,
        Long fileSize,
        String contentType,
        String tags,
        String keywords,
        String author
    ) {}

    public record UpdateDocumentRequest(
        UUID folderId,
        String name,
        String description,
        DocumentType documentType,
        AccessLevel accessLevel,
        String tags,
        String keywords,
        String author
    ) {}

    public record CreateFolderRequest(
        UUID parentFolderId,
        String opportunityId,
        UUID contractId,
        String name,
        String description,
        FolderType folderType,
        String tags,
        Integer retentionDays
    ) {}

    public record UpdateFolderRequest(
        String name,
        String description,
        String tags,
        Integer retentionDays,
        String icon,
        String color
    ) {}

    public record CreateTemplateRequest(
        String name,
        String description,
        TemplateType templateType,
        TemplateFormat templateFormat,
        String category,
        String fileName,
        String filePath,
        Long fileSize,
        String contentType,
        String templateContent,
        String mergeFields,
        String tags,
        String keywords
    ) {}

    public record UpdateTemplateRequest(
        String name,
        String description,
        String category,
        String templateContent,
        String mergeFields,
        String tags,
        String keywords,
        String version,
        String versionNotes
    ) {}

    public record CreateContentLibraryRequest(
        String title,
        String description,
        ContentType contentType,
        String category,
        String subCategory,
        String content,
        String contentHtml,
        UUID contractId,
        UUID employeeId,
        String customerName,
        String customerAgency,
        String contractNumber,
        String contractValue,
        String periodOfPerformance,
        String tags,
        String keywords,
        String naicsCodes,
        String pscCodes
    ) {}

    public record UpdateContentLibraryRequest(
        String title,
        String description,
        String category,
        String subCategory,
        String content,
        String contentHtml,
        String customerName,
        String customerAgency,
        String contractNumber,
        String contractValue,
        String periodOfPerformance,
        String tags,
        String keywords,
        String naicsCodes,
        String pscCodes,
        String versionNotes
    ) {}

    public record DocumentStorageSummary(
        long totalDocuments,
        long totalStorageBytes,
        long documentsInReview,
        long expiringSoon
    ) {}

    public record ContentLibrarySummary(
        long totalItems,
        long totalWordCount,
        long pastPerformanceCount,
        long resumeCount,
        long pendingApproval
    ) {}

    // ==================== Document Operations ====================

    public Page<Document> listDocuments(UUID tenantId, Pageable pageable) {
        return documentRepository.findByTenantIdAndIsArchivedFalse(tenantId, pageable);
    }

    public Optional<Document> getDocument(UUID tenantId, UUID documentId) {
        return documentRepository.findByTenantIdAndId(tenantId, documentId);
    }

    public Document createDocument(UUID tenantId, UUID userId, CreateDocumentRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Document document = new Document();
        document.setTenant(tenant);
        document.setName(request.name());
        document.setDescription(request.description());
        document.setDocumentType(request.documentType());
        document.setAccessLevel(request.accessLevel() != null ? request.accessLevel() : AccessLevel.INTERNAL);
        document.setFileName(request.fileName());
        document.setFilePath(request.filePath());
        document.setFileSize(request.fileSize());
        document.setContentType(request.contentType());
        document.setTags(request.tags());
        document.setKeywords(request.keywords());
        document.setAuthor(request.author());
        document.setStatus(DocumentStatus.DRAFT);
        document.setVersionNumber(1);
        document.setIsLatestVersion(true);

        if (request.folderId() != null) {
            folderRepository.findById(request.folderId()).ifPresent(document::setFolder);
        }

        if (request.opportunityId() != null) {
            opportunityRepository.findById(request.opportunityId()).ifPresent(document::setOpportunity);
        }

        if (request.contractId() != null) {
            contractRepository.findById(request.contractId()).ifPresent(document::setContract);
        }

        if (userId != null) {
            userRepository.findById(userId).ifPresent(document::setCreatedBy);
        }

        Document saved = documentRepository.save(document);
        auditService.logAction(AuditAction.DOCUMENT_CREATED, "Document", saved.getId().toString(),
                "Created document: " + saved.getName());
        return saved;
    }

    public Optional<Document> updateDocument(UUID tenantId, UUID documentId, UUID userId, UpdateDocumentRequest request) {
        return documentRepository.findByTenantIdAndId(tenantId, documentId)
                .map(document -> {
                    if (request.folderId() != null) {
                        folderRepository.findById(request.folderId()).ifPresent(document::setFolder);
                    }
                    if (request.name() != null) document.setName(request.name());
                    if (request.description() != null) document.setDescription(request.description());
                    if (request.documentType() != null) document.setDocumentType(request.documentType());
                    if (request.accessLevel() != null) document.setAccessLevel(request.accessLevel());
                    if (request.tags() != null) document.setTags(request.tags());
                    if (request.keywords() != null) document.setKeywords(request.keywords());
                    if (request.author() != null) document.setAuthor(request.author());

                    if (userId != null) {
                        userRepository.findById(userId).ifPresent(document::setUpdatedBy);
                    }

                    Document saved = documentRepository.save(document);
                    auditService.logAction(AuditAction.DOCUMENT_UPDATED, "Document", saved.getId().toString(),
                            "Updated document: " + saved.getName());
                    return saved;
                });
    }

    public boolean deleteDocument(UUID tenantId, UUID documentId) {
        return documentRepository.findByTenantIdAndId(tenantId, documentId)
                .map(document -> {
                    document.setIsArchived(true);
                    documentRepository.save(document);
                    auditService.logAction(AuditAction.DOCUMENT_DELETED, "Document", documentId.toString(),
                            "Archived document: " + document.getName());
                    return true;
                })
                .orElse(false);
    }

    // Check-in/Check-out
    public Optional<Document> checkoutDocument(UUID tenantId, UUID documentId, UUID userId) {
        return documentRepository.findByTenantIdAndId(tenantId, documentId)
                .filter(doc -> !doc.getIsCheckedOut())
                .map(document -> {
                    document.setIsCheckedOut(true);
                    document.setCheckedOutAt(Instant.now());
                    userRepository.findById(userId).ifPresent(document::setCheckedOutBy);
                    return documentRepository.save(document);
                });
    }

    public Optional<Document> checkinDocument(UUID tenantId, UUID documentId, UUID userId, String newFilePath, Long newFileSize) {
        return documentRepository.findByTenantIdAndId(tenantId, documentId)
                .filter(Document::getIsCheckedOut)
                .map(document -> {
                    // Create new version
                    Document newVersion = new Document();
                    newVersion.setTenant(document.getTenant());
                    newVersion.setFolder(document.getFolder());
                    newVersion.setOpportunity(document.getOpportunity());
                    newVersion.setContract(document.getContract());
                    newVersion.setName(document.getName());
                    newVersion.setDescription(document.getDescription());
                    newVersion.setDocumentType(document.getDocumentType());
                    newVersion.setAccessLevel(document.getAccessLevel());
                    newVersion.setFileName(document.getFileName());
                    newVersion.setFilePath(newFilePath);
                    newVersion.setFileSize(newFileSize);
                    newVersion.setContentType(document.getContentType());
                    newVersion.setTags(document.getTags());
                    newVersion.setKeywords(document.getKeywords());
                    newVersion.setAuthor(document.getAuthor());
                    newVersion.setStatus(DocumentStatus.DRAFT);
                    newVersion.setVersionNumber(document.getVersionNumber() + 1);
                    newVersion.setParentDocument(document.getParentDocument() != null ? document.getParentDocument() : document);
                    newVersion.setIsLatestVersion(true);

                    userRepository.findById(userId).ifPresent(newVersion::setCreatedBy);

                    // Mark old version as not latest
                    document.setIsLatestVersion(false);
                    document.setIsCheckedOut(false);
                    document.setCheckedOutBy(null);
                    document.setCheckedOutAt(null);
                    documentRepository.save(document);

                    return documentRepository.save(newVersion);
                });
    }

    // Document status
    public Optional<Document> updateDocumentStatus(UUID tenantId, UUID documentId, DocumentStatus status, UUID userId, String notes) {
        return documentRepository.findByTenantIdAndId(tenantId, documentId)
                .map(document -> {
                    document.setStatus(status);
                    if (status == DocumentStatus.APPROVED && userId != null) {
                        userRepository.findById(userId).ifPresent(document::setApprovedBy);
                        document.setApprovedAt(Instant.now());
                        document.setApprovalNotes(notes);
                    }
                    return documentRepository.save(document);
                });
    }

    // Document queries
    public Page<Document> searchDocuments(UUID tenantId, String keyword, Pageable pageable) {
        return documentRepository.searchDocuments(tenantId, keyword, pageable);
    }

    public Page<Document> getDocumentsByFolder(UUID folderId, Pageable pageable) {
        return documentRepository.findByFolderIdAndIsArchivedFalse(folderId, pageable);
    }

    public Page<Document> getDocumentsByOpportunity(String opportunityId, Pageable pageable) {
        return documentRepository.findByOpportunityIdAndIsArchivedFalse(opportunityId, pageable);
    }

    public Page<Document> getDocumentsByContract(UUID contractId, Pageable pageable) {
        return documentRepository.findByContractIdAndIsArchivedFalse(contractId, pageable);
    }

    public List<Document> getDocumentVersions(UUID documentId) {
        return documentRepository.findAllVersions(documentId);
    }

    public List<Document> getExpiringDocuments(UUID tenantId, int daysAhead) {
        Instant expirationBefore = Instant.now().plus(daysAhead, ChronoUnit.DAYS);
        return documentRepository.findExpiringDocuments(tenantId, expirationBefore);
    }

    // ==================== Folder Operations ====================

    public List<DocumentFolder> getRootFolders(UUID tenantId) {
        return folderRepository.findRootFolders(tenantId);
    }

    public Optional<DocumentFolder> getFolder(UUID tenantId, UUID folderId) {
        return folderRepository.findByTenantIdAndId(tenantId, folderId);
    }

    public List<DocumentFolder> getChildFolders(UUID parentFolderId) {
        return folderRepository.findByParentFolderIdAndIsArchivedFalseOrderBySortOrderAscNameAsc(parentFolderId);
    }

    public DocumentFolder createFolder(UUID tenantId, UUID userId, CreateFolderRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        DocumentFolder folder = new DocumentFolder();
        folder.setTenant(tenant);
        folder.setName(request.name());
        folder.setDescription(request.description());
        folder.setFolderType(request.folderType() != null ? request.folderType() : FolderType.CUSTOM);
        folder.setTags(request.tags());
        folder.setRetentionDays(request.retentionDays());

        if (request.parentFolderId() != null) {
            folderRepository.findById(request.parentFolderId()).ifPresent(parent -> {
                folder.setParentFolder(parent);
                folder.setDepth(parent.getDepth() + 1);
                folder.setPath(parent.getPath() + "/" + request.name());
            });
        } else {
            folder.setPath("/" + request.name());
            folder.setDepth(0);
        }

        if (request.opportunityId() != null) {
            opportunityRepository.findById(request.opportunityId()).ifPresent(folder::setOpportunity);
        }

        if (request.contractId() != null) {
            contractRepository.findById(request.contractId()).ifPresent(folder::setContract);
        }

        if (userId != null) {
            userRepository.findById(userId).ifPresent(folder::setCreatedBy);
        }

        return folderRepository.save(folder);
    }

    public Optional<DocumentFolder> updateFolder(UUID tenantId, UUID folderId, UpdateFolderRequest request) {
        return folderRepository.findByTenantIdAndId(tenantId, folderId)
                .map(folder -> {
                    if (request.name() != null) {
                        folder.setName(request.name());
                        // Update path
                        String oldPath = folder.getPath();
                        String newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + request.name();
                        folder.setPath(newPath);
                    }
                    if (request.description() != null) folder.setDescription(request.description());
                    if (request.tags() != null) folder.setTags(request.tags());
                    if (request.retentionDays() != null) folder.setRetentionDays(request.retentionDays());
                    if (request.icon() != null) folder.setIcon(request.icon());
                    if (request.color() != null) folder.setColor(request.color());

                    return folderRepository.save(folder);
                });
    }

    public boolean deleteFolder(UUID tenantId, UUID folderId) {
        return folderRepository.findByTenantIdAndId(tenantId, folderId)
                .map(folder -> {
                    folder.setIsArchived(true);
                    folderRepository.save(folder);
                    return true;
                })
                .orElse(false);
    }

    public List<DocumentFolder> searchFolders(UUID tenantId, String keyword) {
        return folderRepository.searchFolders(tenantId, keyword);
    }

    public List<DocumentFolder> getFolderBreadcrumb(UUID folderId) {
        return folderRepository.findAncestors(folderId);
    }

    // ==================== Template Operations ====================

    public Page<DocumentTemplate> listTemplates(UUID tenantId, Pageable pageable) {
        return templateRepository.findByTenantIdAndIsActiveTrue(tenantId, pageable);
    }

    public Optional<DocumentTemplate> getTemplate(UUID tenantId, UUID templateId) {
        return templateRepository.findByTenantIdAndId(tenantId, templateId);
    }

    public DocumentTemplate createTemplate(UUID tenantId, UUID userId, CreateTemplateRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        DocumentTemplate template = new DocumentTemplate();
        template.setTenant(tenant);
        template.setName(request.name());
        template.setDescription(request.description());
        template.setTemplateType(request.templateType());
        template.setTemplateFormat(request.templateFormat());
        template.setCategory(request.category());
        template.setFileName(request.fileName());
        template.setFilePath(request.filePath());
        template.setFileSize(request.fileSize());
        template.setContentType(request.contentType());
        template.setTemplateContent(request.templateContent());
        template.setMergeFields(request.mergeFields());
        template.setTags(request.tags());
        template.setKeywords(request.keywords());

        if (userId != null) {
            userRepository.findById(userId).ifPresent(template::setCreatedBy);
        }

        DocumentTemplate saved = templateRepository.save(template);
        auditService.logAction(AuditAction.TEMPLATE_CREATED, "DocumentTemplate", saved.getId().toString(),
                "Created template: " + saved.getName());
        return saved;
    }

    public Optional<DocumentTemplate> updateTemplate(UUID tenantId, UUID templateId, UUID userId, UpdateTemplateRequest request) {
        return templateRepository.findByTenantIdAndId(tenantId, templateId)
                .map(template -> {
                    if (request.name() != null) template.setName(request.name());
                    if (request.description() != null) template.setDescription(request.description());
                    if (request.category() != null) template.setCategory(request.category());
                    if (request.templateContent() != null) template.setTemplateContent(request.templateContent());
                    if (request.mergeFields() != null) template.setMergeFields(request.mergeFields());
                    if (request.tags() != null) template.setTags(request.tags());
                    if (request.keywords() != null) template.setKeywords(request.keywords());
                    if (request.version() != null) template.setVersion(request.version());
                    if (request.versionNotes() != null) template.setVersionNotes(request.versionNotes());

                    if (userId != null) {
                        userRepository.findById(userId).ifPresent(template::setUpdatedBy);
                    }

                    return templateRepository.save(template);
                });
    }

    public boolean deleteTemplate(UUID tenantId, UUID templateId) {
        return templateRepository.findByTenantIdAndId(tenantId, templateId)
                .map(template -> {
                    template.setIsActive(false);
                    templateRepository.save(template);
                    auditService.logAction(AuditAction.TEMPLATE_DELETED, "DocumentTemplate", templateId.toString(),
                            "Deactivated template: " + template.getName());
                    return true;
                })
                .orElse(false);
    }

    public Optional<DocumentTemplate> approveTemplate(UUID tenantId, UUID templateId, UUID userId) {
        return templateRepository.findByTenantIdAndId(tenantId, templateId)
                .map(template -> {
                    template.setIsApproved(true);
                    template.setApprovedAt(Instant.now());
                    if (userId != null) {
                        userRepository.findById(userId).ifPresent(template::setApprovedBy);
                    }
                    return templateRepository.save(template);
                });
    }

    public Optional<DocumentTemplate> setDefaultTemplate(UUID tenantId, UUID templateId) {
        return templateRepository.findByTenantIdAndId(tenantId, templateId)
                .map(template -> {
                    // Clear existing default for this type
                    templateRepository.findByTenantIdAndTemplateTypeAndIsDefaultTrueAndIsActiveTrue(
                            tenantId, template.getTemplateType()
                    ).ifPresent(existing -> {
                        existing.setIsDefault(false);
                        templateRepository.save(existing);
                    });

                    template.setIsDefault(true);
                    return templateRepository.save(template);
                });
    }

    public void recordTemplateUsage(UUID templateId) {
        templateRepository.findById(templateId).ifPresent(template -> {
            template.recordUsage();
            templateRepository.save(template);
        });
    }

    public Page<DocumentTemplate> searchTemplates(UUID tenantId, String keyword, Pageable pageable) {
        return templateRepository.searchTemplates(tenantId, keyword, pageable);
    }

    public List<DocumentTemplate> getTemplatesByType(UUID tenantId, TemplateType type) {
        return templateRepository.findByTenantIdAndTemplateTypeAndIsActiveTrue(tenantId, type);
    }

    public List<String> getTemplateCategories(UUID tenantId) {
        return templateRepository.findDistinctCategories(tenantId);
    }

    // ==================== Content Library Operations ====================

    public Page<ContentLibraryItem> listContentLibrary(UUID tenantId, Pageable pageable) {
        return contentLibraryRepository.findByTenantIdAndIsActiveTrueAndIsLatestVersionTrue(tenantId, pageable);
    }

    public Optional<ContentLibraryItem> getContentLibraryItem(UUID tenantId, UUID itemId) {
        return contentLibraryRepository.findByTenantIdAndId(tenantId, itemId);
    }

    public ContentLibraryItem createContentLibraryItem(UUID tenantId, UUID userId, CreateContentLibraryRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        ContentLibraryItem item = new ContentLibraryItem();
        item.setTenant(tenant);
        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setContentType(request.contentType());
        item.setCategory(request.category());
        item.setSubCategory(request.subCategory());
        item.setContent(request.content());
        item.setContentHtml(request.contentHtml());
        item.setCustomerName(request.customerName());
        item.setCustomerAgency(request.customerAgency());
        item.setContractNumber(request.contractNumber());
        item.setContractValue(request.contractValue());
        item.setPeriodOfPerformance(request.periodOfPerformance());
        item.setTags(request.tags());
        item.setKeywords(request.keywords());
        item.setNaicsCodes(request.naicsCodes());
        item.setPscCodes(request.pscCodes());

        if (request.contractId() != null) {
            contractRepository.findById(request.contractId()).ifPresent(item::setContract);
        }

        if (request.employeeId() != null) {
            userRepository.findById(request.employeeId()).ifPresent(item::setEmployee);
        }

        if (userId != null) {
            userRepository.findById(userId).ifPresent(item::setCreatedBy);
        }

        ContentLibraryItem saved = contentLibraryRepository.save(item);
        auditService.logAction(AuditAction.CONTENT_CREATED, "ContentLibraryItem", saved.getId().toString(),
                "Created content: " + saved.getTitle());
        return saved;
    }

    public Optional<ContentLibraryItem> updateContentLibraryItem(UUID tenantId, UUID itemId, UUID userId, UpdateContentLibraryRequest request) {
        return contentLibraryRepository.findByTenantIdAndId(tenantId, itemId)
                .map(item -> {
                    // Create new version
                    ContentLibraryItem newVersion = new ContentLibraryItem();
                    newVersion.setTenant(item.getTenant());
                    newVersion.setTitle(request.title() != null ? request.title() : item.getTitle());
                    newVersion.setDescription(request.description() != null ? request.description() : item.getDescription());
                    newVersion.setContentType(item.getContentType());
                    newVersion.setCategory(request.category() != null ? request.category() : item.getCategory());
                    newVersion.setSubCategory(request.subCategory() != null ? request.subCategory() : item.getSubCategory());
                    newVersion.setContent(request.content() != null ? request.content() : item.getContent());
                    newVersion.setContentHtml(request.contentHtml() != null ? request.contentHtml() : item.getContentHtml());
                    newVersion.setContract(item.getContract());
                    newVersion.setEmployee(item.getEmployee());
                    newVersion.setCustomerName(request.customerName() != null ? request.customerName() : item.getCustomerName());
                    newVersion.setCustomerAgency(request.customerAgency() != null ? request.customerAgency() : item.getCustomerAgency());
                    newVersion.setContractNumber(request.contractNumber() != null ? request.contractNumber() : item.getContractNumber());
                    newVersion.setContractValue(request.contractValue() != null ? request.contractValue() : item.getContractValue());
                    newVersion.setPeriodOfPerformance(request.periodOfPerformance() != null ? request.periodOfPerformance() : item.getPeriodOfPerformance());
                    newVersion.setTags(request.tags() != null ? request.tags() : item.getTags());
                    newVersion.setKeywords(request.keywords() != null ? request.keywords() : item.getKeywords());
                    newVersion.setNaicsCodes(request.naicsCodes() != null ? request.naicsCodes() : item.getNaicsCodes());
                    newVersion.setPscCodes(request.pscCodes() != null ? request.pscCodes() : item.getPscCodes());
                    newVersion.setVersion(item.getVersion() + 1);
                    newVersion.setVersionNotes(request.versionNotes());
                    newVersion.setParentVersion(item.getParentVersion() != null ? item.getParentVersion() : item);
                    newVersion.setIsLatestVersion(true);
                    newVersion.setUsageCount(item.getUsageCount());
                    newVersion.setWinCount(item.getWinCount());
                    newVersion.setLossCount(item.getLossCount());

                    if (userId != null) {
                        userRepository.findById(userId).ifPresent(newVersion::setCreatedBy);
                    }

                    // Mark old version as not latest
                    item.setIsLatestVersion(false);
                    contentLibraryRepository.save(item);

                    return contentLibraryRepository.save(newVersion);
                });
    }

    public boolean deleteContentLibraryItem(UUID tenantId, UUID itemId) {
        return contentLibraryRepository.findByTenantIdAndId(tenantId, itemId)
                .map(item -> {
                    item.setIsActive(false);
                    contentLibraryRepository.save(item);
                    return true;
                })
                .orElse(false);
    }

    public Optional<ContentLibraryItem> approveContentLibraryItem(UUID tenantId, UUID itemId, UUID userId) {
        return contentLibraryRepository.findByTenantIdAndId(tenantId, itemId)
                .map(item -> {
                    item.setIsApproved(true);
                    item.setApprovedAt(Instant.now());
                    if (userId != null) {
                        userRepository.findById(userId).ifPresent(item::setApprovedBy);
                    }
                    return contentLibraryRepository.save(item);
                });
    }

    public void recordContentUsage(UUID itemId, String proposalName) {
        contentLibraryRepository.findById(itemId).ifPresent(item -> {
            item.recordUsage(proposalName);
            contentLibraryRepository.save(item);
        });
    }

    public void recordContentWin(UUID itemId) {
        contentLibraryRepository.findById(itemId).ifPresent(item -> {
            item.recordWin();
            contentLibraryRepository.save(item);
        });
    }

    public void recordContentLoss(UUID itemId) {
        contentLibraryRepository.findById(itemId).ifPresent(item -> {
            item.recordLoss();
            contentLibraryRepository.save(item);
        });
    }

    public Page<ContentLibraryItem> searchContentLibrary(UUID tenantId, String keyword, Pageable pageable) {
        return contentLibraryRepository.searchContent(tenantId, keyword, pageable);
    }

    public List<ContentLibraryItem> getContentByType(UUID tenantId, ContentType type) {
        return contentLibraryRepository.findByTenantIdAndContentTypeAndIsActiveTrueAndIsLatestVersionTrue(tenantId, type);
    }

    public Page<ContentLibraryItem> getMostUsedContent(UUID tenantId, Pageable pageable) {
        return contentLibraryRepository.findMostUsed(tenantId, pageable);
    }

    public Page<ContentLibraryItem> getHighestWinRateContent(UUID tenantId, Pageable pageable) {
        return contentLibraryRepository.findHighestWinRate(tenantId, pageable);
    }

    public List<ContentLibraryItem> getContentVersions(UUID itemId) {
        return contentLibraryRepository.findAllVersions(itemId);
    }

    public List<String> getContentCategories(UUID tenantId) {
        return contentLibraryRepository.findDistinctCategories(tenantId);
    }

    public List<String> getContentSubCategories(UUID tenantId, String category) {
        return contentLibraryRepository.findDistinctSubCategories(tenantId, category);
    }

    // ==================== Summary Operations ====================

    public DocumentStorageSummary getDocumentStorageSummary(UUID tenantId) {
        long totalDocuments = documentRepository.count();
        long totalStorage = documentRepository.sumFileSizeByTenantId(tenantId);
        List<Document> inReview = documentRepository.findDocumentsPendingReview(tenantId);
        List<Document> expiring = documentRepository.findExpiringDocuments(tenantId, Instant.now().plus(30, ChronoUnit.DAYS));

        return new DocumentStorageSummary(totalDocuments, totalStorage, inReview.size(), expiring.size());
    }

    public ContentLibrarySummary getContentLibrarySummary(UUID tenantId) {
        Page<ContentLibraryItem> items = contentLibraryRepository.findByTenantIdAndIsActiveTrueAndIsLatestVersionTrue(
                tenantId, Pageable.unpaged());
        long totalWordCount = contentLibraryRepository.sumWordCountByTenantId(tenantId);
        long pastPerformance = contentLibraryRepository.countByTenantIdAndContentType(tenantId, ContentType.PAST_PERFORMANCE_NARRATIVE);
        long resumes = contentLibraryRepository.countByTenantIdAndContentType(tenantId, ContentType.RESUME);
        List<ContentLibraryItem> pending = contentLibraryRepository.findPendingApproval(tenantId);

        return new ContentLibrarySummary(items.getTotalElements(), totalWordCount, pastPerformance, resumes, pending.size());
    }
}
