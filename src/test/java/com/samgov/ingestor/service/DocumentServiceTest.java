package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Document;
import com.samgov.ingestor.model.Document.AccessLevel;
import com.samgov.ingestor.model.Document.DocumentStatus;
import com.samgov.ingestor.model.Document.DocumentType;
import com.samgov.ingestor.model.DocumentFolder;
import com.samgov.ingestor.model.DocumentFolder.FolderType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.DocumentFolderRepository;
import com.samgov.ingestor.repository.DocumentRepository;
import com.samgov.ingestor.service.DocumentService.CreateDocumentRequest;
import com.samgov.ingestor.service.DocumentService.CreateFolderRequest;
import com.samgov.ingestor.service.DocumentService.UpdateDocumentRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for DocumentService.
 *
 * Tests focus on document management behaviors:
 * - CRUD operations
 * - Folder assignment
 * - Document versioning
 * - Check-in/Check-out workflow
 * - Search and filtering
 * - Multi-tenant isolation
 */
@DisplayName("DocumentService")
class DocumentServiceTest extends BaseServiceTest {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentFolderRepository folderRepository;

    private DocumentFolder testFolder;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        // Create a test folder for document tests
        testFolder = createTestFolder("Test Folder");
    }

    private DocumentFolder createTestFolder(String name) {
        DocumentFolder folder = new DocumentFolder();
        folder.setTenant(testTenant);
        folder.setName(name);
        folder.setDescription("Test folder description");
        folder.setFolderType(FolderType.CUSTOM);
        folder.setPath("/" + name);
        folder.setDepth(0);
        return folderRepository.save(folder);
    }

    private Document createTestDocument(String name, DocumentType type) {
        Document document = new Document();
        document.setTenant(testTenant);
        document.setName(name);
        document.setDescription("Test document description");
        document.setDocumentType(type);
        document.setStatus(DocumentStatus.DRAFT);
        document.setAccessLevel(AccessLevel.INTERNAL);
        document.setFileName(name.toLowerCase().replace(" ", "_") + ".pdf");
        document.setFilePath("/documents/" + name.toLowerCase().replace(" ", "_") + ".pdf");
        document.setFileSize(1024L);
        document.setContentType("application/pdf");
        document.setVersionNumber(1);
        document.setIsLatestVersion(true);
        document.setIsCheckedOut(false);
        document.setIsArchived(false);
        document.setCreatedBy(testUser);
        return documentRepository.save(document);
    }

    private CreateDocumentRequest createDefaultDocumentRequest(String name) {
        return new CreateDocumentRequest(
            null, // folderId
            null, // opportunityId
            null, // contractId
            name,
            "Test document description",
            DocumentType.CONTRACT,
            AccessLevel.INTERNAL,
            name.toLowerCase().replace(" ", "_") + ".pdf",
            "/documents/" + name.toLowerCase().replace(" ", "_") + ".pdf",
            1024L,
            "application/pdf",
            "test, document",
            "contract, testing",
            "Test Author"
        );
    }

    @Nested
    @DisplayName("Create Document Operations")
    class CreateDocumentOperations {

        @Test
        @DisplayName("should create document with metadata")
        void shouldCreateDocumentWithMetadata() {
            // Given
            CreateDocumentRequest request = createDefaultDocumentRequest("Test Contract Document");

            // When
            Document result = documentService.createDocument(testTenant.getId(), testUser.getId(), request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isNotNull();
            assertThat(result.getName()).isEqualTo("Test Contract Document");
            assertThat(result.getDescription()).isEqualTo("Test document description");
            assertThat(result.getDocumentType()).isEqualTo(DocumentType.CONTRACT);
            assertThat(result.getAccessLevel()).isEqualTo(AccessLevel.INTERNAL);
            assertThat(result.getFileName()).isEqualTo("test_contract_document.pdf");
            assertThat(result.getStatus()).isEqualTo(DocumentStatus.DRAFT);
            assertThat(result.getVersionNumber()).isEqualTo(1);
            assertThat(result.getIsLatestVersion()).isTrue();
            assertThat(result.getTags()).isEqualTo("test, document");
            assertThat(result.getKeywords()).isEqualTo("contract, testing");
            assertThat(result.getAuthor()).isEqualTo("Test Author");
            assertThat(result.getCreatedBy()).isNotNull();
            assertThat(result.getCreatedBy().getId()).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("should assign document to folder when folderId provided")
        void shouldAssignDocumentToFolderWhenFolderIdProvided() {
            // Given
            CreateDocumentRequest request = new CreateDocumentRequest(
                testFolder.getId(),
                null,
                null,
                "Folder Document",
                "Document in folder",
                DocumentType.REPORT,
                AccessLevel.INTERNAL,
                "folder_document.pdf",
                "/documents/folder_document.pdf",
                2048L,
                "application/pdf",
                null,
                null,
                null
            );

            // When
            Document result = documentService.createDocument(testTenant.getId(), testUser.getId(), request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getFolder()).isNotNull();
            assertThat(result.getFolder().getId()).isEqualTo(testFolder.getId());
            assertThat(result.getFolder().getName()).isEqualTo("Test Folder");
        }

        @Test
        @DisplayName("should throw exception when tenant not found")
        void shouldThrowExceptionWhenTenantNotFound() {
            // Given
            UUID nonExistentTenantId = UUID.randomUUID();
            CreateDocumentRequest request = createDefaultDocumentRequest("Invalid Tenant Document");

            // When/Then
            assertThatThrownBy(() -> documentService.createDocument(nonExistentTenantId, testUser.getId(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }
    }

    @Nested
    @DisplayName("Get Document Operations")
    class GetDocumentOperations {

        @Test
        @DisplayName("should return document by id")
        void shouldReturnDocumentById() {
            // Given
            Document saved = createTestDocument("Get Test Document", DocumentType.CONTRACT);

            // When
            Optional<Document> result = documentService.getDocument(testTenant.getId(), saved.getId());

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo(saved.getId());
            assertThat(result.get().getName()).isEqualTo("Get Test Document");
        }

        @Test
        @DisplayName("should return empty when document not found")
        void shouldReturnEmptyWhenNotFound() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When
            Optional<Document> result = documentService.getDocument(testTenant.getId(), nonExistentId);

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should enforce tenant isolation")
        void shouldEnforceTenantIsolation() {
            // Given - Create document in current tenant
            Document document = createTestDocument("Isolated Document", DocumentType.CONTRACT);

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // When - Try to access with different tenant ID
            Optional<Document> result = documentService.getDocument(tenant2.getId(), document.getId());

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("List Documents Operations")
    class ListDocumentsOperations {

        @Test
        @DisplayName("should return paginated list")
        void shouldReturnPaginatedList() {
            // Given
            for (int i = 1; i <= 5; i++) {
                createTestDocument("Document " + i, DocumentType.CONTRACT);
            }

            // When
            Page<Document> result = documentService.listDocuments(testTenant.getId(), PageRequest.of(0, 3));

            // Then
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getTotalElements()).isGreaterThanOrEqualTo(5);
            assertThat(result.getTotalPages()).isGreaterThanOrEqualTo(2);
        }

        @Test
        @DisplayName("should filter by type using repository")
        void shouldFilterByType() {
            // Given
            createTestDocument("Contract Doc", DocumentType.CONTRACT);
            createTestDocument("RFP Doc", DocumentType.RFP);
            createTestDocument("Invoice Doc", DocumentType.INVOICE);

            // When
            Page<Document> result = documentRepository.findByTenantIdAndDocumentTypeAndIsArchivedFalse(
                testTenant.getId(),
                DocumentType.CONTRACT,
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(result.getContent()).isNotEmpty();
            assertThat(result.getContent())
                .allMatch(doc -> doc.getDocumentType() == DocumentType.CONTRACT);
        }

        @Test
        @DisplayName("should filter by status using repository")
        void shouldFilterByStatus() {
            // Given
            Document draftDoc = createTestDocument("Draft Document", DocumentType.CONTRACT);
            Document approvedDoc = createTestDocument("Approved Document", DocumentType.CONTRACT);
            approvedDoc.setStatus(DocumentStatus.APPROVED);
            documentRepository.save(approvedDoc);

            // When
            Page<Document> result = documentRepository.findByTenantIdAndStatusAndIsArchivedFalse(
                testTenant.getId(),
                DocumentStatus.DRAFT,
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(result.getContent()).isNotEmpty();
            assertThat(result.getContent())
                .allMatch(doc -> doc.getStatus() == DocumentStatus.DRAFT);
        }

        @Test
        @DisplayName("should filter by folder")
        void shouldFilterByFolder() {
            // Given
            Document docInFolder = createTestDocument("Doc In Folder", DocumentType.CONTRACT);
            docInFolder.setFolder(testFolder);
            documentRepository.save(docInFolder);

            Document docNoFolder = createTestDocument("Doc No Folder", DocumentType.CONTRACT);

            // When
            Page<Document> result = documentService.getDocumentsByFolder(testFolder.getId(), PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("Doc In Folder");
        }
    }

    @Nested
    @DisplayName("Update Document Operations")
    class UpdateDocumentOperations {

        @Test
        @DisplayName("should update document fields")
        void shouldUpdateDocumentFields() {
            // Given
            Document document = createTestDocument("Original Document", DocumentType.CONTRACT);
            UpdateDocumentRequest request = new UpdateDocumentRequest(
                null, // folderId
                "Updated Document Name",
                "Updated description",
                DocumentType.PROPOSAL_TECHNICAL,
                AccessLevel.CONFIDENTIAL,
                "updated, tags",
                "new, keywords",
                "New Author"
            );

            // When
            Optional<Document> result = documentService.updateDocument(
                testTenant.getId(),
                document.getId(),
                testUser.getId(),
                request
            );

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().getName()).isEqualTo("Updated Document Name");
            assertThat(result.get().getDescription()).isEqualTo("Updated description");
            assertThat(result.get().getDocumentType()).isEqualTo(DocumentType.PROPOSAL_TECHNICAL);
            assertThat(result.get().getAccessLevel()).isEqualTo(AccessLevel.CONFIDENTIAL);
            assertThat(result.get().getTags()).isEqualTo("updated, tags");
            assertThat(result.get().getKeywords()).isEqualTo("new, keywords");
            assertThat(result.get().getAuthor()).isEqualTo("New Author");
        }

        @Test
        @DisplayName("should handle version increment after checkin")
        void shouldHandleVersionIncrement() {
            // Given
            Document document = createTestDocument("Versioned Document", DocumentType.CONTRACT);
            assertThat(document.getVersionNumber()).isEqualTo(1);

            // Checkout first
            documentService.checkoutDocument(testTenant.getId(), document.getId(), testUser.getId());

            // When - Checkin creates new version
            Optional<Document> newVersion = documentService.checkinDocument(
                testTenant.getId(),
                document.getId(),
                testUser.getId(),
                "/documents/versioned_document_v2.pdf",
                2048L
            );

            // Then
            assertThat(newVersion).isPresent();
            assertThat(newVersion.get().getVersionNumber()).isEqualTo(2);
            assertThat(newVersion.get().getIsLatestVersion()).isTrue();

            // Original document should no longer be latest
            Optional<Document> originalDoc = documentRepository.findById(document.getId());
            assertThat(originalDoc).isPresent();
            assertThat(originalDoc.get().getIsLatestVersion()).isFalse();
        }
    }

    @Nested
    @DisplayName("Delete Document Operations")
    class DeleteDocumentOperations {

        @Test
        @DisplayName("should soft delete document")
        void shouldSoftDeleteDocument() {
            // Given
            Document document = createTestDocument("To Delete", DocumentType.CONTRACT);
            assertThat(document.getIsArchived()).isFalse();

            // When
            boolean result = documentService.deleteDocument(testTenant.getId(), document.getId());

            // Then
            assertThat(result).isTrue();

            // Document should be marked as archived
            Optional<Document> deletedDoc = documentRepository.findById(document.getId());
            assertThat(deletedDoc).isPresent();
            assertThat(deletedDoc.get().getIsArchived()).isTrue();
        }

        @Test
        @DisplayName("should return false when document not found")
        void shouldReturnFalseWhenDocumentNotFound() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When
            boolean result = documentService.deleteDocument(testTenant.getId(), nonExistentId);

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should not delete other tenant's document")
        void shouldNotDeleteOtherTenantDocument() {
            // Given - Create document in current tenant
            Document document = createTestDocument("Tenant1 Document", DocumentType.CONTRACT);

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // When - Try to delete with different tenant ID
            boolean result = documentService.deleteDocument(tenant2.getId(), document.getId());

            // Then
            assertThat(result).isFalse();

            // Document should still exist and not be archived
            Optional<Document> existingDoc = documentRepository.findById(document.getId());
            assertThat(existingDoc).isPresent();
            assertThat(existingDoc.get().getIsArchived()).isFalse();
        }
    }

    @Nested
    @DisplayName("Search Documents Operations")
    class SearchDocumentsOperations {

        @Test
        @DisplayName("should search documents by keyword")
        void shouldSearchDocumentsByKeyword() {
            // Given
            Document cybersecurityDoc = new Document();
            cybersecurityDoc.setTenant(testTenant);
            cybersecurityDoc.setName("Cybersecurity Assessment Report");
            cybersecurityDoc.setDescription("Comprehensive security vulnerability assessment");
            cybersecurityDoc.setDocumentType(DocumentType.REPORT);
            cybersecurityDoc.setStatus(DocumentStatus.APPROVED);
            cybersecurityDoc.setAccessLevel(AccessLevel.CONFIDENTIAL);
            cybersecurityDoc.setFileName("cybersecurity_report.pdf");
            cybersecurityDoc.setFilePath("/documents/cybersecurity_report.pdf");
            cybersecurityDoc.setFileSize(5120L);
            cybersecurityDoc.setContentType("application/pdf");
            cybersecurityDoc.setVersionNumber(1);
            cybersecurityDoc.setIsLatestVersion(true);
            cybersecurityDoc.setIsCheckedOut(false);
            cybersecurityDoc.setIsArchived(false);
            cybersecurityDoc.setTags("security, assessment");
            cybersecurityDoc.setKeywords("vulnerability, penetration test");
            documentRepository.save(cybersecurityDoc);

            createTestDocument("Other Document", DocumentType.CONTRACT);

            // When
            Page<Document> results = documentService.searchDocuments(
                testTenant.getId(),
                "Cybersecurity",
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent()).isNotEmpty();
            assertThat(results.getContent().get(0).getName()).containsIgnoringCase("Cybersecurity");
        }

        @Test
        @DisplayName("should search by tags")
        void shouldSearchByTags() {
            // Given
            Document taggedDoc = createTestDocument("Tagged Document", DocumentType.REPORT);
            taggedDoc.setTags("important, confidential, quarterly");
            documentRepository.save(taggedDoc);

            createTestDocument("Untagged Document", DocumentType.CONTRACT);

            // When
            Page<Document> results = documentService.searchDocuments(
                testTenant.getId(),
                "important",
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent()).isNotEmpty();
            assertThat(results.getContent())
                .anyMatch(doc -> doc.getTags() != null && doc.getTags().contains("important"));
        }

        @Test
        @DisplayName("should search by keywords")
        void shouldSearchByKeywords() {
            // Given
            Document keywordDoc = createTestDocument("Keyword Document", DocumentType.PROPOSAL_TECHNICAL);
            keywordDoc.setKeywords("cloud, infrastructure, AWS");
            documentRepository.save(keywordDoc);

            createTestDocument("Other Document", DocumentType.CONTRACT);

            // When
            Page<Document> results = documentService.searchDocuments(
                testTenant.getId(),
                "AWS",
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent()).isNotEmpty();
            assertThat(results.getContent())
                .anyMatch(doc -> doc.getKeywords() != null && doc.getKeywords().contains("AWS"));
        }
    }

    @Nested
    @DisplayName("Checkout/Checkin Operations")
    class CheckoutCheckinOperations {

        @Test
        @DisplayName("should checkout document for editing")
        void shouldCheckoutDocumentForEditing() {
            // Given
            Document document = createTestDocument("Checkout Test", DocumentType.CONTRACT);
            assertThat(document.getIsCheckedOut()).isFalse();

            // When
            Optional<Document> result = documentService.checkoutDocument(
                testTenant.getId(),
                document.getId(),
                testUser.getId()
            );

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().getIsCheckedOut()).isTrue();
            assertThat(result.get().getCheckedOutBy()).isNotNull();
            assertThat(result.get().getCheckedOutBy().getId()).isEqualTo(testUser.getId());
            assertThat(result.get().getCheckedOutAt()).isNotNull();
        }

        @Test
        @DisplayName("should not checkout already checked out document")
        void shouldNotCheckoutAlreadyCheckedOutDocument() {
            // Given
            Document document = createTestDocument("Already Checked Out", DocumentType.CONTRACT);
            documentService.checkoutDocument(testTenant.getId(), document.getId(), testUser.getId());

            // Create another user
            User anotherUser = User.builder()
                .email("another-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Another")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            anotherUser = userRepository.save(anotherUser);

            // When - Another user tries to checkout
            Optional<Document> result = documentService.checkoutDocument(
                testTenant.getId(),
                document.getId(),
                anotherUser.getId()
            );

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should checkin document and create new version")
        void shouldCheckinDocumentAndCreateNewVersion() {
            // Given
            Document document = createTestDocument("Checkin Test", DocumentType.CONTRACT);
            documentService.checkoutDocument(testTenant.getId(), document.getId(), testUser.getId());

            // When
            Optional<Document> newVersion = documentService.checkinDocument(
                testTenant.getId(),
                document.getId(),
                testUser.getId(),
                "/documents/checkin_test_v2.pdf",
                3072L
            );

            // Then
            assertThat(newVersion).isPresent();
            assertThat(newVersion.get().getVersionNumber()).isEqualTo(2);
            assertThat(newVersion.get().getFilePath()).isEqualTo("/documents/checkin_test_v2.pdf");
            assertThat(newVersion.get().getFileSize()).isEqualTo(3072L);
            assertThat(newVersion.get().getIsLatestVersion()).isTrue();
            assertThat(newVersion.get().getIsCheckedOut()).isFalse();

            // Verify parent document relationship
            assertThat(newVersion.get().getParentDocument()).isNotNull();
            assertThat(newVersion.get().getParentDocument().getId()).isEqualTo(document.getId());
        }

        @Test
        @DisplayName("should not checkin document that is not checked out")
        void shouldNotCheckinDocumentNotCheckedOut() {
            // Given
            Document document = createTestDocument("Not Checked Out", DocumentType.CONTRACT);
            assertThat(document.getIsCheckedOut()).isFalse();

            // When
            Optional<Document> result = documentService.checkinDocument(
                testTenant.getId(),
                document.getId(),
                testUser.getId(),
                "/documents/new_path.pdf",
                2048L
            );

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Version History Operations")
    class VersionHistoryOperations {

        @Test
        @DisplayName("should return version history")
        void shouldReturnVersionHistory() {
            // Given - Create document and multiple versions
            Document original = createTestDocument("Version Test", DocumentType.CONTRACT);

            // Checkout and checkin to create version 2
            documentService.checkoutDocument(testTenant.getId(), original.getId(), testUser.getId());
            Optional<Document> version2 = documentService.checkinDocument(
                testTenant.getId(),
                original.getId(),
                testUser.getId(),
                "/documents/version_test_v2.pdf",
                2048L
            );
            assertThat(version2).isPresent();

            // Checkout and checkin to create version 3
            documentService.checkoutDocument(testTenant.getId(), version2.get().getId(), testUser.getId());
            Optional<Document> version3 = documentService.checkinDocument(
                testTenant.getId(),
                version2.get().getId(),
                testUser.getId(),
                "/documents/version_test_v3.pdf",
                3072L
            );
            assertThat(version3).isPresent();

            // When
            List<Document> versions = documentService.getDocumentVersions(original.getId());

            // Then
            assertThat(versions).hasSizeGreaterThanOrEqualTo(2);
            // Versions should be ordered by version number descending
            assertThat(versions)
                .extracting(Document::getVersionNumber)
                .containsAnyOf(1, 2, 3);
        }
    }

    @Nested
    @DisplayName("Archive Document Operations")
    class ArchiveDocumentOperations {

        @Test
        @DisplayName("should change status to archived")
        void shouldChangeStatusToArchived() {
            // Given
            Document document = createTestDocument("Archive Test", DocumentType.CONTRACT);
            document.setStatus(DocumentStatus.APPROVED);
            documentRepository.save(document);

            // When
            Optional<Document> result = documentService.updateDocumentStatus(
                testTenant.getId(),
                document.getId(),
                DocumentStatus.ARCHIVED,
                testUser.getId(),
                "Archiving for retention compliance"
            );

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().getStatus()).isEqualTo(DocumentStatus.ARCHIVED);
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        private Tenant tenant2;
        private User user2;

        @BeforeEach
        void setUpSecondTenant() {
            // Create second tenant
            tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Create second user
            user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Second")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            // Create role and membership for tenant2
            Role role2 = createTestRole(tenant2, Role.USER);
            TenantMembership membership2 = TenantMembership.builder()
                .user(user2)
                .tenant(tenant2)
                .role(role2)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(membership2);
        }

        @Test
        @DisplayName("should isolate documents between tenants")
        void shouldIsolateDocumentsBetweenTenants() {
            // Given - Create document in tenant 1
            Document tenant1Doc = createTestDocument("Tenant1 Document", DocumentType.CONTRACT);

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // Create document in tenant 2
            CreateDocumentRequest request = createDefaultDocumentRequest("Tenant2 Document");
            Document tenant2Doc = documentService.createDocument(tenant2.getId(), user2.getId(), request);

            // Then - Each tenant should only see their own documents
            Page<Document> tenant2Docs = documentService.listDocuments(tenant2.getId(), PageRequest.of(0, 100));
            assertThat(tenant2Docs.getContent())
                .extracting(Document::getName)
                .contains("Tenant2 Document")
                .doesNotContain("Tenant1 Document");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            Page<Document> tenant1Docs = documentService.listDocuments(testTenant.getId(), PageRequest.of(0, 100));
            assertThat(tenant1Docs.getContent())
                .extracting(Document::getName)
                .contains("Tenant1 Document")
                .doesNotContain("Tenant2 Document");
        }

        @Test
        @DisplayName("should not allow access to other tenant's document by ID")
        void shouldNotAllowCrossTenantAccessById() {
            // Given - Create document in tenant 1
            Document tenant1Doc = createTestDocument("Cross Tenant Document", DocumentType.CONTRACT);

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // When - Attempting to access tenant 1's document should return empty
            Optional<Document> result = documentService.getDocument(tenant2.getId(), tenant1Doc.getId());

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should not allow update of other tenant's document")
        void shouldNotAllowCrossTenantUpdate() {
            // Given - Create document in tenant 1
            Document tenant1Doc = createTestDocument("Update Cross Tenant", DocumentType.CONTRACT);

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            UpdateDocumentRequest updateRequest = new UpdateDocumentRequest(
                null,
                "Hacked Name",
                "Hacked Description",
                null, null, null, null, null
            );

            // When - Attempting to update tenant 1's document
            Optional<Document> result = documentService.updateDocument(
                tenant2.getId(),
                tenant1Doc.getId(),
                user2.getId(),
                updateRequest
            );

            // Then
            assertThat(result).isEmpty();

            // Verify original document is unchanged
            switchTenant(testTenant);
            Optional<Document> originalDoc = documentService.getDocument(testTenant.getId(), tenant1Doc.getId());
            assertThat(originalDoc).isPresent();
            assertThat(originalDoc.get().getName()).isEqualTo("Update Cross Tenant");
        }
    }
}
