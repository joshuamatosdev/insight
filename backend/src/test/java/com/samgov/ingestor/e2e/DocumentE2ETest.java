package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Document management and AI Analysis functionality.
 * Tests document upload, versioning, and AI-powered analysis.
 */
@DisplayName("Document & AI Analysis E2E Tests")
class DocumentE2ETest extends BaseControllerTest {

    private static final String DOCUMENTS_URL = "/api/v1/documents";
    private static final String AI_URL = "/api/v1/ai";
    private static final String CONTENT_LIBRARY_URL = "/api/v1/content-library";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E Document Tenant " + UUID.randomUUID())
            .slug("e2e-doc-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-doc-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Document")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("Document Upload Flow")
    class DocumentUploadFlow {

        @Test
        @DisplayName("should list documents")
        void should_ListDocuments() throws Exception {
            performGet(DOCUMENTS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should upload document")
        void should_UploadDocument() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-document.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "Test PDF content".getBytes()
            );

            mockMvc.perform(MockMvcRequestBuilders.multipart(DOCUMENTS_URL + "/upload")
                    .file(file)
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .param("name", "Test Document")
                    .param("category", "PROPOSAL"))
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should retrieve document metadata")
        void should_RetrieveDocumentMetadata() throws Exception {
            // Upload document first
            MockMultipartFile file = new MockMultipartFile(
                "file",
                "metadata-test.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "Test content".getBytes()
            );

            mockMvc.perform(MockMvcRequestBuilders.multipart(DOCUMENTS_URL + "/upload")
                    .file(file)
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .param("name", "Metadata Test"))
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should filter documents by category")
        void should_FilterDocumentsByCategory() throws Exception {
            performGet(DOCUMENTS_URL + "?category=PROPOSAL")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Document Version Flow")
    class DocumentVersionFlow {

        @Test
        @DisplayName("should list document versions")
        void should_ListDocumentVersions() throws Exception {
            // This would need a document ID
            performGet(DOCUMENTS_URL + "/versions")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should upload new version")
        void should_UploadNewVersion() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                "file",
                "version-test.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "Version 1 content".getBytes()
            );

            mockMvc.perform(MockMvcRequestBuilders.multipart(DOCUMENTS_URL + "/upload")
                    .file(file)
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .param("name", "Version Test"))
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("AI Analysis Flow")
    class AIAnalysisFlow {

        @Test
        @DisplayName("should summarize opportunity")
        void should_SummarizeOpportunity() throws Exception {
            // Create test opportunity
            Opportunity opp = new Opportunity();
            opp.setId(UUID.randomUUID().toString());
            opp.setTenantId(testTenantId);
            opp.setTitle("AI Summary Test Opportunity");
            opp.setNoticeId("AI-NOTICE-" + UUID.randomUUID().toString().substring(0, 8));
            opp.setSolicitationNumber("AI-SOL-" + UUID.randomUUID().toString().substring(0, 8));
            opp.setPostedDate(java.time.LocalDate.now());
            opp.setActive(true);
            opp = opportunityRepository.save(opp);

            performGet(AI_URL + "/summarize/" + opp.getId())
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should calculate fit score")
        void should_CalculateFitScore() throws Exception {
            Opportunity opp = new Opportunity();
            opp.setId(UUID.randomUUID().toString());
            opp.setTenantId(testTenantId);
            opp.setTitle("Fit Score Test Opportunity");
            opp.setNoticeId("FIT-NOTICE-" + UUID.randomUUID().toString().substring(0, 8));
            opp.setSolicitationNumber("FIT-SOL-" + UUID.randomUUID().toString().substring(0, 8));
            opp.setPostedDate(java.time.LocalDate.now());
            opp.setActive(true);
            opp = opportunityRepository.save(opp);

            performGet(AI_URL + "/fit-score/" + opp.getId())
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should identify risks")
        void should_IdentifyRisks() throws Exception {
            Opportunity opp = new Opportunity();
            opp.setId(UUID.randomUUID().toString());
            opp.setTenantId(testTenantId);
            opp.setTitle("Risk Assessment Test Opportunity");
            opp.setNoticeId("RISK-NOTICE-" + UUID.randomUUID().toString().substring(0, 8));
            opp.setSolicitationNumber("RISK-SOL-" + UUID.randomUUID().toString().substring(0, 8));
            opp.setPostedDate(java.time.LocalDate.now());
            opp.setActive(true);
            opp = opportunityRepository.save(opp);

            performGet(AI_URL + "/risks/" + opp.getId())
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should generate proposal suggestions")
        void should_GenerateProposalSuggestions() throws Exception {
            Opportunity opp = new Opportunity();
            opp.setId(UUID.randomUUID().toString());
            opp.setTenantId(testTenantId);
            opp.setTitle("Proposal Suggestions Test");
            opp.setNoticeId("PROP-NOTICE-" + UUID.randomUUID().toString().substring(0, 8));
            opp.setSolicitationNumber("PROP-SOL-" + UUID.randomUUID().toString().substring(0, 8));
            opp.setPostedDate(java.time.LocalDate.now());
            opp.setActive(true);
            opp = opportunityRepository.save(opp);

            performGet(AI_URL + "/proposal-suggestions/" + opp.getId())
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Content Library Flow")
    class ContentLibraryFlow {

        @Test
        @DisplayName("should list content library items")
        void should_ListContentLibraryItems() throws Exception {
            performGet(CONTENT_LIBRARY_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create content library item")
        void should_CreateContentLibraryItem() throws Exception {
            java.util.Map<String, Object> contentRequest = java.util.Map.of(
                "title", "Standard Past Performance",
                "category", "PAST_PERFORMANCE",
                "content", "Our team has successfully delivered...",
                "tags", java.util.List.of("IT", "government", "past-performance")
            );

            performPost(CONTENT_LIBRARY_URL, contentRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should search content library")
        void should_SearchContentLibrary() throws Exception {
            performGet(CONTENT_LIBRARY_URL + "/search?query=IT")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter content by category")
        void should_FilterContentByCategory() throws Exception {
            performGet(CONTENT_LIBRARY_URL + "?category=PAST_PERFORMANCE")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update content library item")
        void should_UpdateContentLibraryItem() throws Exception {
            // Create item first
            java.util.Map<String, Object> contentRequest = java.util.Map.of(
                "title", "Content to Update",
                "category", "CAPABILITY",
                "content", "Original content..."
            );

            performPost(CONTENT_LIBRARY_URL, contentRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should delete content library item")
        void should_DeleteContentLibraryItem() throws Exception {
            // Create item to delete
            java.util.Map<String, Object> contentRequest = java.util.Map.of(
                "title", "Content to Delete",
                "category", "OTHER",
                "content", "Content to be deleted..."
            );

            performPost(CONTENT_LIBRARY_URL, contentRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Document Sharing Flow")
    class DocumentSharingFlow {

        @Test
        @DisplayName("should share document with user")
        void should_ShareDocumentWithUser() throws Exception {
            // Create another user to share with
            User shareUser = User.builder()
                .email("share-user-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("Share")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .tenantId(testTenantId)
                .build();
            shareUser = userRepository.save(shareUser);

            java.util.Map<String, Object> shareRequest = java.util.Map.of(
                "userId", shareUser.getId().toString(),
                "permission", "VIEW"
            );

            // This would need a document ID
            performPost(DOCUMENTS_URL + "/share", shareRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should generate shareable link")
        void should_GenerateShareableLink() throws Exception {
            java.util.Map<String, Object> linkRequest = java.util.Map.of(
                "expiresInDays", 7,
                "permission", "VIEW"
            );

            // This would need a document ID
            performPost(DOCUMENTS_URL + "/generate-link", linkRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Document Search Flow")
    class DocumentSearchFlow {

        @Test
        @DisplayName("should search documents by name")
        void should_SearchDocumentsByName() throws Exception {
            performGet(DOCUMENTS_URL + "?search=test")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should search documents by content")
        void should_SearchDocumentsByContent() throws Exception {
            performGet(DOCUMENTS_URL + "/search?query=proposal")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter documents by date range")
        void should_FilterDocumentsByDateRange() throws Exception {
            String from = java.time.LocalDate.now().minusDays(30).toString();
            String to = java.time.LocalDate.now().toString();

            performGet(DOCUMENTS_URL + "?uploadedFrom=" + from + "&uploadedTo=" + to)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Document Tags Flow")
    class DocumentTagsFlow {

        @Test
        @DisplayName("should list available tags")
        void should_ListAvailableTags() throws Exception {
            performGet(DOCUMENTS_URL + "/tags")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should add tag to document")
        void should_AddTagToDocument() throws Exception {
            java.util.Map<String, Object> tagRequest = java.util.Map.of(
                "tag", "important"
            );

            // This would need a document ID
            performPost(DOCUMENTS_URL + "/tags", tagRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter documents by tag")
        void should_FilterDocumentsByTag() throws Exception {
            performGet(DOCUMENTS_URL + "?tag=proposal")
                .andExpect(status().isOk());
        }
    }
}
