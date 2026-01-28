package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.ContentLibraryItem;
import com.samgov.ingestor.model.ContentLibraryItem.ContentType;
import com.samgov.ingestor.model.Document;
import com.samgov.ingestor.model.Document.DocumentStatus;
import com.samgov.ingestor.model.DocumentFolder;
import com.samgov.ingestor.model.DocumentTemplate;
import com.samgov.ingestor.model.DocumentTemplate.TemplateType;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.DocumentService;
import com.samgov.ingestor.service.DocumentService.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@Validated
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    // ==================== Document Endpoints ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<Document>> listDocuments(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.listDocuments(tenantId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Document> getDocument(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return documentService.getDocument(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Document> createDocument(
            @Valid @RequestBody CreateDocumentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        Document document = documentService.createDocument(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Document> updateDocument(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDocumentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        return documentService.updateDocument(tenantId, id, userId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = documentService.deleteDocument(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Document> checkoutDocument(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        return documentService.checkoutDocument(tenantId, id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping("/{id}/checkin")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Document> checkinDocument(
            @PathVariable UUID id,
            @RequestParam @NotBlank @Size(max = 500) @Pattern(regexp = "^[a-zA-Z0-9/_.-]+$", message = "Invalid file path") String newFilePath,
            @RequestParam Long newFileSize,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        return documentService.checkinDocument(tenantId, id, userId, newFilePath, newFileSize)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<Document> updateDocumentStatus(
            @PathVariable UUID id,
            @RequestParam DocumentStatus status,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        return documentService.updateDocumentStatus(tenantId, id, status, userId, notes)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<Document>> searchDocuments(
            @RequestParam @NotBlank @Size(max = 200) String keyword,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.searchDocuments(tenantId, keyword, pageable));
    }

    @GetMapping("/folder/{folderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<Document>> getDocumentsByFolder(
            @PathVariable UUID folderId,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getDocumentsByFolder(folderId, pageable));
    }

    @GetMapping("/opportunity/{opportunityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<Document>> getDocumentsByOpportunity(
            @PathVariable @Size(max = 100) String opportunityId,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getDocumentsByOpportunity(opportunityId, pageable));
    }

    @GetMapping("/contract/{contractId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<Document>> getDocumentsByContract(
            @PathVariable UUID contractId,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getDocumentsByContract(contractId, pageable));
    }

    @GetMapping("/{id}/versions")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<Document>> getDocumentVersions(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getDocumentVersions(id));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<Document>> getExpiringDocuments(
            @RequestParam(defaultValue = "30") int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getExpiringDocuments(tenantId, daysAhead));
    }

    @GetMapping("/storage-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<DocumentStorageSummary> getStorageSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getDocumentStorageSummary(tenantId));
    }

    // ==================== Folder Endpoints ====================

    @GetMapping("/folders")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<DocumentFolder>> getRootFolders() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getRootFolders(tenantId));
    }

    @GetMapping("/folders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<DocumentFolder> getFolder(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return documentService.getFolder(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/folders/{id}/children")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<DocumentFolder>> getChildFolders(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getChildFolders(id));
    }

    @PostMapping("/folders")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<DocumentFolder> createFolder(
            @Valid @RequestBody CreateFolderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        DocumentFolder folder = documentService.createFolder(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(folder);
    }

    @PutMapping("/folders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<DocumentFolder> updateFolder(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateFolderRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return documentService.updateFolder(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/folders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<Void> deleteFolder(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = documentService.deleteFolder(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/folders/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<DocumentFolder>> searchFolders(@RequestParam String keyword) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.searchFolders(tenantId, keyword));
    }

    @GetMapping("/folders/{id}/breadcrumb")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<DocumentFolder>> getFolderBreadcrumb(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getFolderBreadcrumb(id));
    }

    // ==================== Template Endpoints ====================

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<DocumentTemplate>> listTemplates(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.listTemplates(tenantId, pageable));
    }

    @GetMapping("/templates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<DocumentTemplate> getTemplate(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return documentService.getTemplate(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<DocumentTemplate> createTemplate(
            @Valid @RequestBody CreateTemplateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        DocumentTemplate template = documentService.createTemplate(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    @PutMapping("/templates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<DocumentTemplate> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTemplateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        return documentService.updateTemplate(tenantId, id, userId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/templates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = documentService.deleteTemplate(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/templates/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<DocumentTemplate> approveTemplate(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        return documentService.approveTemplate(tenantId, id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/templates/{id}/set-default")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<DocumentTemplate> setDefaultTemplate(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return documentService.setDefaultTemplate(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/templates/{id}/use")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Void> recordTemplateUsage(@PathVariable UUID id) {
        documentService.recordTemplateUsage(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/templates/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<DocumentTemplate>> searchTemplates(
            @RequestParam String keyword,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.searchTemplates(tenantId, keyword, pageable));
    }

    @GetMapping("/templates/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<DocumentTemplate>> getTemplatesByType(@PathVariable TemplateType type) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getTemplatesByType(tenantId, type));
    }

    @GetMapping("/templates/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<String>> getTemplateCategories() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getTemplateCategories(tenantId));
    }

    // ==================== Content Library Endpoints ====================

    @GetMapping("/content-library")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<ContentLibraryItem>> listContentLibrary(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.listContentLibrary(tenantId, pageable));
    }

    @GetMapping("/content-library/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<ContentLibraryItem> getContentLibraryItem(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return documentService.getContentLibraryItem(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/content-library")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<ContentLibraryItem> createContentLibraryItem(
            @Valid @RequestBody CreateContentLibraryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        ContentLibraryItem item = documentService.createContentLibraryItem(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PutMapping("/content-library/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<ContentLibraryItem> updateContentLibraryItem(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateContentLibraryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        return documentService.updateContentLibraryItem(tenantId, id, userId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/content-library/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<Void> deleteContentLibraryItem(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = documentService.deleteContentLibraryItem(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/content-library/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    public ResponseEntity<ContentLibraryItem> approveContentLibraryItem(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        return documentService.approveContentLibraryItem(tenantId, id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/content-library/{id}/use")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Void> recordContentUsage(
            @PathVariable UUID id,
            @RequestParam String proposalName) {
        documentService.recordContentUsage(id, proposalName);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/content-library/{id}/win")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Void> recordContentWin(@PathVariable UUID id) {
        documentService.recordContentWin(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/content-library/{id}/loss")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<Void> recordContentLoss(@PathVariable UUID id) {
        documentService.recordContentLoss(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/content-library/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<ContentLibraryItem>> searchContentLibrary(
            @RequestParam String keyword,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.searchContentLibrary(tenantId, keyword, pageable));
    }

    @GetMapping("/content-library/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<ContentLibraryItem>> getContentByType(@PathVariable ContentType type) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getContentByType(tenantId, type));
    }

    @GetMapping("/content-library/most-used")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<ContentLibraryItem>> getMostUsedContent(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getMostUsedContent(tenantId, pageable));
    }

    @GetMapping("/content-library/highest-win-rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<Page<ContentLibraryItem>> getHighestWinRateContent(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getHighestWinRateContent(tenantId, pageable));
    }

    @GetMapping("/content-library/{id}/versions")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<ContentLibraryItem>> getContentVersions(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getContentVersions(id));
    }

    @GetMapping("/content-library/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<String>> getContentCategories() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getContentCategories(tenantId));
    }

    @GetMapping("/content-library/categories/{category}/subcategories")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    public ResponseEntity<List<String>> getContentSubCategories(@PathVariable String category) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getContentSubCategories(tenantId, category));
    }

    @GetMapping("/content-library/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    public ResponseEntity<ContentLibrarySummary> getContentLibrarySummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(documentService.getContentLibrarySummary(tenantId));
    }

    // Helper method
    private UUID getUserId(UserDetails userDetails) {
        if (userDetails instanceof com.samgov.ingestor.model.User user) {
            return user.getId();
        }
        return null;
    }
}
