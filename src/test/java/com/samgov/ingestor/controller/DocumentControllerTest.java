package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
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
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.DocumentService.CreateDocumentRequest;
import com.samgov.ingestor.service.DocumentService.UpdateDocumentRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for DocumentController REST API.
 *
 * Tests focus on HTTP behavior:
 * - Request/response formats
 * - HTTP status codes
 * - Pagination and filtering
 * - Document versioning workflow
 * - Multi-tenant isolation
 */
@DisplayName("DocumentController")
class DocumentControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/documents";

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentFolderRepository folderRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    private Tenant testTenant;
    private User testUser;
    private Role testRole;
    private DocumentFolder testFolder;

    @BeforeEach
    @Override
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role with DOCUMENT permissions
        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .permissions("DOCUMENT_CREATE,DOCUMENT_READ,DOCUMENT_UPDATE,DOCUMENT_DELETE")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        // Create test user
        testUser = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        // Create tenant membership
        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(membership);

        // Create a test folder
        testFolder = new DocumentFolder();
        testFolder.setTenant(testTenant);
        testFolder.setName("Test Folder");
        testFolder.setDescription("Test folder for documents");
        testFolder.setFolderType(FolderType.CUSTOM);
        testFolder.setPath("/Test Folder");
        testFolder.setDepth(0);
        testFolder = folderRepository.save(testFolder);

        // Set tenant context for ThreadLocal (service layer)
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers (controller layer via TenantContextFilter)
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
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

    private CreateDocumentRequest createDocumentRequest(String name) {
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
    @DisplayName("GET /api/documents")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class ListDocuments {

        @Test
        @DisplayName("should return paginated list of documents")
        void shouldReturnPaginatedDocuments() throws Exception {
            // Given
            for (int i = 1; i <= 5; i++) {
                createTestDocument("Document " + i, DocumentType.CONTRACT);
            }

            // When/Then
            mockMvc.perform(get(BASE_URL)
                    .param("page", "0")
                    .param("size", "3")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.totalPages", greaterThanOrEqualTo(2)));
        }

        @Test
        @DisplayName("should return empty page when no documents exist")
        void shouldReturnEmptyPageWhenNoDocuments() throws Exception {
            // When/Then
            mockMvc.perform(get(BASE_URL)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/documents/{id}")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class GetDocumentById {

        @Test
        @DisplayName("should return document by ID")
        void shouldReturnDocumentById() throws Exception {
            // Given
            Document document = createTestDocument("Get Test", DocumentType.CONTRACT);

            // When/Then
            performGet(BASE_URL + "/" + document.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(document.getId().toString())))
                .andExpect(jsonPath("$.name", is("Get Test")))
                .andExpect(jsonPath("$.documentType", is("CONTRACT")))
                .andExpect(jsonPath("$.status", is("DRAFT")));
        }

        @Test
        @DisplayName("should return 404 when document not found")
        void shouldReturn404WhenNotFound() throws Exception {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            performGet(BASE_URL + "/" + nonExistentId)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/documents")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class CreateDocument {

        @Test
        @DisplayName("should create document and return 201 CREATED")
        void shouldCreateDocumentSuccessfully() throws Exception {
            // Given
            CreateDocumentRequest request = createDocumentRequest("New Contract Document");

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("New Contract Document")))
                .andExpect(jsonPath("$.documentType", is("CONTRACT")))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.accessLevel", is("INTERNAL")))
                .andExpect(jsonPath("$.versionNumber", is(1)))
                .andExpect(jsonPath("$.tags", is("test, document")))
                .andExpect(jsonPath("$.author", is("Test Author")));
        }

        @Test
        @DisplayName("should create document with folder assignment")
        void shouldCreateDocumentWithFolder() throws Exception {
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

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Folder Document")))
                .andExpect(jsonPath("$.folder.id", is(testFolder.getId().toString())));
        }

        @Test
        @DisplayName("should validate required fields")
        void shouldValidateRequiredFields() throws Exception {
            // Given - Request with missing required fields
            String invalidJson = """
                {
                    "description": "Missing name and type"
                }
                """;

            // When/Then
            mockMvc.perform(post(BASE_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/documents/{id}")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class UpdateDocument {

        @Test
        @DisplayName("should update document successfully")
        void shouldUpdateDocumentSuccessfully() throws Exception {
            // Given
            Document document = createTestDocument("Update Test", DocumentType.CONTRACT);
            UpdateDocumentRequest updateRequest = new UpdateDocumentRequest(
                null,
                "Updated Document Name",
                "Updated description",
                DocumentType.PROPOSAL_TECHNICAL,
                AccessLevel.CONFIDENTIAL,
                "updated, tags",
                "new, keywords",
                "Updated Author"
            );

            // When/Then
            performPut(BASE_URL + "/" + document.getId(), updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Document Name")))
                .andExpect(jsonPath("$.description", is("Updated description")))
                .andExpect(jsonPath("$.documentType", is("PROPOSAL_TECHNICAL")))
                .andExpect(jsonPath("$.accessLevel", is("CONFIDENTIAL")))
                .andExpect(jsonPath("$.tags", is("updated, tags")))
                .andExpect(jsonPath("$.author", is("Updated Author")));
        }

        @Test
        @DisplayName("should return 404 when updating non-existent document")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            UpdateDocumentRequest updateRequest = new UpdateDocumentRequest(
                null, "Updated Name", null, null, null, null, null, null
            );

            // When/Then
            performPut(BASE_URL + "/" + nonExistentId, updateRequest)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/documents/{id}")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class DeleteDocument {

        @Test
        @DisplayName("should delete document and return 204 NO CONTENT")
        void shouldDeleteDocumentSuccessfully() throws Exception {
            // Given
            Document document = createTestDocument("Delete Test", DocumentType.CONTRACT);

            // When/Then
            performDelete(BASE_URL + "/" + document.getId())
                .andExpect(status().isNoContent());

            // Verify document is soft deleted (archived)
            Document deletedDoc = documentRepository.findById(document.getId()).orElse(null);
            if (deletedDoc != null) {
                assertThat(deletedDoc.getIsArchived()).isTrue();
            }
        }

        @Test
        @DisplayName("should return 404 when deleting non-existent document")
        void shouldReturn404WhenDeletingNonExistent() throws Exception {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            performDelete(BASE_URL + "/" + nonExistentId)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/documents/{id}/checkout")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class CheckoutDocument {

        @Test
        @DisplayName("should checkout document for editing")
        void shouldCheckoutDocument() throws Exception {
            // Given
            Document document = createTestDocument("Checkout Test", DocumentType.CONTRACT);

            // When/Then
            performPost(BASE_URL + "/" + document.getId() + "/checkout")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCheckedOut", is(true)))
                .andExpect(jsonPath("$.checkedOutAt", notNullValue()));
        }

        @Test
        @DisplayName("should return 400 when document is already checked out")
        void shouldReturn400WhenAlreadyCheckedOut() throws Exception {
            // Given
            Document document = createTestDocument("Already Checked Out", DocumentType.CONTRACT);
            document.setIsCheckedOut(true);
            document.setCheckedOutBy(testUser);
            document.setCheckedOutAt(Instant.now());
            documentRepository.save(document);

            // When/Then
            performPost(BASE_URL + "/" + document.getId() + "/checkout")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/documents/{id}/checkin")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class CheckinDocument {

        @Test
        @DisplayName("should checkin document and create new version")
        void shouldCheckinDocument() throws Exception {
            // Given
            Document document = createTestDocument("Checkin Test", DocumentType.CONTRACT);
            document.setIsCheckedOut(true);
            document.setCheckedOutBy(testUser);
            document.setCheckedOutAt(Instant.now());
            documentRepository.save(document);

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + document.getId() + "/checkin")
                    .param("newFilePath", "/documents/checkin_test_v2.pdf")
                    .param("newFileSize", "2048")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.versionNumber", is(2)))
                .andExpect(jsonPath("$.isLatestVersion", is(true)))
                .andExpect(jsonPath("$.isCheckedOut", is(false)))
                .andExpect(jsonPath("$.filePath", is("/documents/checkin_test_v2.pdf")));
        }

        @Test
        @DisplayName("should return 400 when document is not checked out")
        void shouldReturn400WhenNotCheckedOut() throws Exception {
            // Given
            Document document = createTestDocument("Not Checked Out", DocumentType.CONTRACT);
            assertThat(document.getIsCheckedOut()).isFalse();

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + document.getId() + "/checkin")
                    .param("newFilePath", "/documents/new_path.pdf")
                    .param("newFileSize", "2048")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/documents/{id}/versions")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class GetDocumentVersions {

        @Test
        @DisplayName("should return document versions")
        void shouldReturnVersions() throws Exception {
            // Given - Create document with versions
            Document original = createTestDocument("Version Test", DocumentType.CONTRACT);

            // Create version 2
            Document version2 = new Document();
            version2.setTenant(testTenant);
            version2.setName("Version Test");
            version2.setDescription("Version 2");
            version2.setDocumentType(DocumentType.CONTRACT);
            version2.setStatus(DocumentStatus.DRAFT);
            version2.setAccessLevel(AccessLevel.INTERNAL);
            version2.setFileName("version_test.pdf");
            version2.setFilePath("/documents/version_test_v2.pdf");
            version2.setFileSize(2048L);
            version2.setContentType("application/pdf");
            version2.setVersionNumber(2);
            version2.setParentDocument(original);
            version2.setIsLatestVersion(true);
            version2.setIsCheckedOut(false);
            version2.setIsArchived(false);
            documentRepository.save(version2);

            // Mark original as not latest
            original.setIsLatestVersion(false);
            documentRepository.save(original);

            // When/Then
            performGet(BASE_URL + "/" + original.getId() + "/versions")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }
    }

    @Nested
    @DisplayName("GET /api/documents/search")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class SearchDocuments {

        @Test
        @DisplayName("should search documents by keyword")
        void shouldSearchDocumentsByKeyword() throws Exception {
            // Given
            Document cybersecurityDoc = new Document();
            cybersecurityDoc.setTenant(testTenant);
            cybersecurityDoc.setName("Cybersecurity Assessment Report");
            cybersecurityDoc.setDescription("Security vulnerability assessment");
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
            documentRepository.save(cybersecurityDoc);

            createTestDocument("Other Document", DocumentType.CONTRACT);

            // When/Then
            mockMvc.perform(get(BASE_URL + "/search")
                    .param("keyword", "Cybersecurity")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.content[0].name", containsString("Cybersecurity")));
        }

        @Test
        @DisplayName("should search documents by tags")
        void shouldSearchByTags() throws Exception {
            // Given
            Document taggedDoc = createTestDocument("Tagged Document", DocumentType.REPORT);
            taggedDoc.setTags("important, confidential, quarterly");
            documentRepository.save(taggedDoc);

            // When/Then
            mockMvc.perform(get(BASE_URL + "/search")
                    .param("keyword", "important")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))));
        }

        @Test
        @DisplayName("should return empty results for non-matching keyword")
        void shouldReturnEmptyForNonMatchingKeyword() throws Exception {
            // Given
            createTestDocument("Test Document", DocumentType.CONTRACT);

            // When/Then
            mockMvc.perform(get(BASE_URL + "/search")
                    .param("keyword", "nonexistentkeywordxyz123")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/documents/folder/{folderId}")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class GetDocumentsByFolder {

        @Test
        @DisplayName("should return documents in folder")
        void shouldReturnDocumentsInFolder() throws Exception {
            // Given
            Document docInFolder = createTestDocument("In Folder", DocumentType.CONTRACT);
            docInFolder.setFolder(testFolder);
            documentRepository.save(docInFolder);

            createTestDocument("Not In Folder", DocumentType.CONTRACT);

            // When/Then
            performGet(BASE_URL + "/folder/" + testFolder.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("In Folder")));
        }
    }

    @Nested
    @DisplayName("POST /api/documents/{id}/status")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class UpdateDocumentStatus {

        @Test
        @DisplayName("should update document status")
        void shouldUpdateDocumentStatus() throws Exception {
            // Given
            Document document = createTestDocument("Status Test", DocumentType.CONTRACT);
            assertThat(document.getStatus()).isEqualTo(DocumentStatus.DRAFT);

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + document.getId() + "/status")
                    .param("status", "APPROVED")
                    .param("notes", "Approved by manager")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")));
        }

        @Test
        @DisplayName("should set approved fields when approving document")
        void shouldSetApprovedFieldsWhenApproving() throws Exception {
            // Given
            Document document = createTestDocument("Approval Test", DocumentType.CONTRACT);
            document.setStatus(DocumentStatus.IN_REVIEW);
            documentRepository.save(document);

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + document.getId() + "/status")
                    .param("status", "APPROVED")
                    .param("notes", "Looks good!")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.approvedAt", notNullValue()))
                .andExpect(jsonPath("$.approvalNotes", is("Looks good!")));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class TenantIsolation {

        @Test
        @DisplayName("should not return documents from other tenants")
        void shouldNotReturnDocumentsFromOtherTenants() throws Exception {
            // Given - Create document in current tenant
            Document tenant1Doc = createTestDocument("Tenant1 Document", DocumentType.CONTRACT);

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Create document in second tenant
            Document tenant2Doc = new Document();
            tenant2Doc.setTenant(tenant2);
            tenant2Doc.setName("Tenant2 Document");
            tenant2Doc.setDescription("Document in tenant 2");
            tenant2Doc.setDocumentType(DocumentType.CONTRACT);
            tenant2Doc.setStatus(DocumentStatus.DRAFT);
            tenant2Doc.setAccessLevel(AccessLevel.INTERNAL);
            tenant2Doc.setFileName("tenant2_document.pdf");
            tenant2Doc.setFilePath("/documents/tenant2_document.pdf");
            tenant2Doc.setFileSize(1024L);
            tenant2Doc.setContentType("application/pdf");
            tenant2Doc.setVersionNumber(1);
            tenant2Doc.setIsLatestVersion(true);
            tenant2Doc.setIsCheckedOut(false);
            tenant2Doc.setIsArchived(false);
            documentRepository.save(tenant2Doc);

            // When/Then - Query should only return tenant1's document
            mockMvc.perform(get(BASE_URL)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].name",
                    org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("Tenant2 Document"))));
        }

        @Test
        @DisplayName("should return 404 when accessing other tenant's document")
        void shouldReturn404ForOtherTenantDocument() throws Exception {
            // Given - Create second tenant with document
            Tenant tenant2 = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            Document otherTenantDoc = new Document();
            otherTenantDoc.setTenant(tenant2);
            otherTenantDoc.setName("Other Tenant Document");
            otherTenantDoc.setDescription("Document in other tenant");
            otherTenantDoc.setDocumentType(DocumentType.CONTRACT);
            otherTenantDoc.setStatus(DocumentStatus.DRAFT);
            otherTenantDoc.setAccessLevel(AccessLevel.INTERNAL);
            otherTenantDoc.setFileName("other_tenant_document.pdf");
            otherTenantDoc.setFilePath("/documents/other_tenant_document.pdf");
            otherTenantDoc.setFileSize(1024L);
            otherTenantDoc.setContentType("application/pdf");
            otherTenantDoc.setVersionNumber(1);
            otherTenantDoc.setIsLatestVersion(true);
            otherTenantDoc.setIsCheckedOut(false);
            otherTenantDoc.setIsArchived(false);
            otherTenantDoc = documentRepository.save(otherTenantDoc);

            // When/Then - Should return 404 as current tenant can't access it
            performGet(BASE_URL + "/" + otherTenantDoc.getId())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Storage Summary")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class StorageSummary {

        @Test
        @DisplayName("GET /api/documents/storage-summary - should return storage summary")
        void shouldReturnStorageSummary() throws Exception {
            // Given
            createTestDocument("Summary Doc 1", DocumentType.CONTRACT);
            createTestDocument("Summary Doc 2", DocumentType.REPORT);

            // When/Then
            performGet(BASE_URL + "/storage-summary")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDocuments", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.totalStorageBytes", greaterThan(0)));
        }
    }

    @Nested
    @DisplayName("Expiring Documents")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class ExpiringDocuments {

        @Test
        @DisplayName("GET /api/documents/expiring - should return expiring documents")
        void shouldReturnExpiringDocuments() throws Exception {
            // Given
            Document expiringDoc = createTestDocument("Expiring Document", DocumentType.CERTIFICATE);
            expiringDoc.setExpirationDate(Instant.now().plusSeconds(86400 * 15)); // 15 days from now
            documentRepository.save(expiringDoc);

            // When/Then
            mockMvc.perform(get(BASE_URL + "/expiring")
                    .param("daysAhead", "30")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    // AssertJ import for assertions in non-test methods
    private static void assertThat(Object actual) {
        org.assertj.core.api.Assertions.assertThat(actual);
    }

    private static org.assertj.core.api.BooleanAssert assertThat(Boolean actual) {
        return org.assertj.core.api.Assertions.assertThat(actual);
    }
}
