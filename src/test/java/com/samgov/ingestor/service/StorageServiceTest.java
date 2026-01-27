package com.samgov.ingestor.service;

import com.samgov.ingestor.config.S3Config;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.FileMetadata;
import com.samgov.ingestor.model.FileMetadata.FileStatus;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.FileMetadataRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.StorageService.FileDto;
import com.samgov.ingestor.service.StorageService.FileUploadRequest;
import com.samgov.ingestor.service.StorageService.FileUploadResponse;
import com.samgov.ingestor.service.StorageService.PresignedUrlResponse;
import com.samgov.ingestor.service.StorageService.StorageSummary;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for StorageService.
 *
 * Tests are designed as pure unit tests with mocked dependencies
 * to focus on service logic without requiring Spring context.
 *
 * Tests focus on:
 * - File upload operations (direct and presigned)
 * - File download operations
 * - File listing and search
 * - File deletion (soft delete)
 * - Multi-tenant isolation
 * - Storage summary calculation
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("StorageService")
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class StorageServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    @Mock
    private S3Config s3Config;

    @Mock
    private FileMetadataRepository fileMetadataRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private StorageService storageService;

    private UUID testTenantId;
    private UUID testUserId;
    private Tenant testTenant;
    private User testUser;

    @BeforeEach
    void setUp() {
        testTenantId = UUID.randomUUID();
        testUserId = UUID.randomUUID();

        testTenant = new Tenant();
        testTenant.setId(testTenantId);
        testTenant.setName("Test Tenant");

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setFirstName("Test");
        testUser.setLastName("User");

        // Set tenant context
        TenantContext.setCurrentTenantId(testTenantId);
        TenantContext.setCurrentUserId(testUserId);

        // Configure S3Config mock
        when(s3Config.getBucket()).thenReturn("test-bucket");
        when(s3Config.getPresignedUrlExpirationMinutes()).thenReturn(15);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private FileMetadata createTestFileMetadata(String fileName, long size) {
        FileMetadata metadata = new FileMetadata();
        metadata.setId(UUID.randomUUID());
        metadata.setTenant(testTenant);
        metadata.setFileName(fileName);
        metadata.setOriginalFileName(fileName);
        metadata.setContentType("application/pdf");
        metadata.setSize(size);
        metadata.setS3Key("tenants/" + testTenantId + "/files/" + metadata.getId() + "/" + fileName);
        metadata.setS3Bucket("test-bucket");
        metadata.setStatus(FileStatus.AVAILABLE);
        metadata.setUploadedBy(testUser);
        return metadata;
    }

    @Nested
    @DisplayName("File Upload Operations")
    class FileUploadOperations {

        @Test
        @DisplayName("should upload file directly and create metadata")
        void shouldUploadFileDirectly() throws IOException {
            // Given
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "test-document.pdf",
                    "application/pdf",
                    "Test file content".getBytes()
            );

            FileUploadRequest request = new FileUploadRequest(
                    "test-document.pdf",
                    "application/pdf",
                    "Test document description",
                    "test,document",
                    "OPPORTUNITY",
                    "OPP-001"
            );

            when(tenantRepository.findById(testTenantId)).thenReturn(Optional.of(testTenant));
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                    .thenReturn(PutObjectResponse.builder().build());
            when(fileMetadataRepository.save(any(FileMetadata.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            FileDto result = storageService.uploadFile(file, request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.fileName()).isEqualTo("test-document.pdf");
            assertThat(result.contentType()).isEqualTo("application/pdf");
            assertThat(result.size()).isEqualTo(file.getSize());
            assertThat(result.status()).isEqualTo(FileStatus.AVAILABLE);
            assertThat(result.description()).isEqualTo("Test document description");
            assertThat(result.tags()).isEqualTo("test,document");
            assertThat(result.referenceType()).isEqualTo("OPPORTUNITY");
            assertThat(result.referenceId()).isEqualTo("OPP-001");
            assertThat(result.uploadedBy()).isEqualTo(testUserId);

            verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
            verify(fileMetadataRepository).save(any(FileMetadata.class));
        }

        @Test
        @DisplayName("should sanitize file name to remove dangerous characters")
        void shouldSanitizeFileName() throws IOException {
            // Given
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "dangerous/path\\file:name*.pdf",
                    "application/pdf",
                    "content".getBytes()
            );

            FileUploadRequest request = new FileUploadRequest(
                    null, // Use original file name
                    "application/pdf",
                    null, null, null, null
            );

            when(tenantRepository.findById(testTenantId)).thenReturn(Optional.of(testTenant));
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                    .thenReturn(PutObjectResponse.builder().build());
            when(fileMetadataRepository.save(any(FileMetadata.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            FileDto result = storageService.uploadFile(file, request);

            // Then
            assertThat(result.fileName()).doesNotContain("/", "\\", ":", "*");
            assertThat(result.fileName()).isEqualTo("dangerous_path_file_name_.pdf");
        }

        @Test
        @DisplayName("should initiate presigned upload for large files")
        void shouldInitiatePresignedUpload() throws Exception {
            // Given
            FileUploadRequest request = new FileUploadRequest(
                    "large-file.zip",
                    "application/zip",
                    "Large file for presigned upload",
                    null, null, null
            );

            when(tenantRepository.findById(testTenantId)).thenReturn(Optional.of(testTenant));
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(fileMetadataRepository.save(any(FileMetadata.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Mock presigner
            PresignedPutObjectRequest mockPresignedRequest = mock(PresignedPutObjectRequest.class);
            when(mockPresignedRequest.url()).thenReturn(new URL("https://s3.amazonaws.com/test-bucket/presigned-url"));
            when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class)))
                    .thenReturn(mockPresignedRequest);

            // When
            FileUploadResponse response = storageService.initiatePresignedUpload(request);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.fileId()).isNotNull();
            assertThat(response.fileName()).isEqualTo("large-file.zip");
            assertThat(response.uploadUrl()).contains("presigned-url");
            assertThat(response.expiresAt()).isAfter(Instant.now());
        }

        @Test
        @DisplayName("should confirm presigned upload and update metadata")
        void shouldConfirmPresignedUpload() throws Exception {
            // Given - Create pending file metadata
            FileMetadata pendingFile = createTestFileMetadata("pending-file.zip", 0L);
            pendingFile.setStatus(FileStatus.PENDING);
            pendingFile.setContentType("application/zip");
            UUID fileId = pendingFile.getId();

            when(fileMetadataRepository.findByIdAndTenantId(fileId, testTenantId))
                    .thenReturn(Optional.of(pendingFile));
            when(fileMetadataRepository.save(any(FileMetadata.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Mock S3 head object to simulate file exists
            HeadObjectResponse headResponse = HeadObjectResponse.builder()
                    .contentLength(1024000L)
                    .contentType("application/zip")
                    .build();
            when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(headResponse);

            // When
            FileDto confirmed = storageService.confirmUpload(fileId);

            // Then
            assertThat(confirmed.status()).isEqualTo(FileStatus.AVAILABLE);
            assertThat(confirmed.size()).isEqualTo(1024000L);
        }
    }

    @Nested
    @DisplayName("File Download Operations")
    class FileDownloadOperations {

        @Test
        @DisplayName("should generate presigned download URL")
        void shouldGeneratePresignedDownloadUrl() throws Exception {
            // Given
            FileMetadata file = createTestFileMetadata("download-test.pdf", 5000L);

            when(fileMetadataRepository.findByIdAndTenantId(file.getId(), testTenantId))
                    .thenReturn(Optional.of(file));

            PresignedGetObjectRequest mockPresignedRequest = mock(PresignedGetObjectRequest.class);
            when(mockPresignedRequest.url()).thenReturn(new URL("https://s3.amazonaws.com/test-bucket/download-url"));
            when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class)))
                    .thenReturn(mockPresignedRequest);

            // When
            PresignedUrlResponse response = storageService.getPresignedDownloadUrl(file.getId());

            // Then
            assertThat(response).isNotNull();
            assertThat(response.url()).contains("download-url");
            assertThat(response.expiresAt()).isAfter(Instant.now());
        }

        @Test
        @DisplayName("should throw exception for non-existent file")
        void shouldThrowExceptionForNonExistentFile() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            when(fileMetadataRepository.findByIdAndTenantId(nonExistentId, testTenantId))
                    .thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> storageService.getPresignedDownloadUrl(nonExistentId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("File not found");
        }

        @Test
        @DisplayName("should throw exception for deleted file")
        void shouldThrowExceptionForDeletedFile() {
            // Given
            FileMetadata file = createTestFileMetadata("deleted-file.pdf", 1000L);
            file.markAsDeleted(testUser);

            when(fileMetadataRepository.findByIdAndTenantId(file.getId(), testTenantId))
                    .thenReturn(Optional.of(file));

            // When/Then
            assertThatThrownBy(() -> storageService.getPresignedDownloadUrl(file.getId()))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("not available for download");
        }
    }

    @Nested
    @DisplayName("File List and Search Operations")
    class FileListOperations {

        @Test
        @DisplayName("should list files with pagination")
        void shouldListFilesWithPagination() {
            // Given
            List<FileMetadata> files = List.of(
                    createTestFileMetadata("file-1.pdf", 1000L),
                    createTestFileMetadata("file-2.pdf", 2000L),
                    createTestFileMetadata("file-3.pdf", 3000L)
            );
            Page<FileMetadata> filePage = new PageImpl<>(files, PageRequest.of(0, 3), 5);

            when(fileMetadataRepository.findByTenantIdAndNotDeleted(eq(testTenantId), any(Pageable.class)))
                    .thenReturn(filePage);

            // When
            Page<FileDto> page = storageService.listFiles(PageRequest.of(0, 3));

            // Then
            assertThat(page.getContent()).hasSize(3);
            assertThat(page.getTotalElements()).isEqualTo(5);
        }

        @Test
        @DisplayName("should get file by ID")
        void shouldGetFileById() {
            // Given
            FileMetadata file = createTestFileMetadata("specific-file.pdf", 2000L);

            when(fileMetadataRepository.findByIdAndTenantId(file.getId(), testTenantId))
                    .thenReturn(Optional.of(file));

            // When
            Optional<FileDto> result = storageService.getFile(file.getId());

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().id()).isEqualTo(file.getId());
            assertThat(result.get().fileName()).isEqualTo("specific-file.pdf");
        }

        @Test
        @DisplayName("should list files by reference")
        void shouldListFilesByReference() {
            // Given
            FileMetadata file1 = createTestFileMetadata("opp-file-1.pdf", 1000L);
            file1.setReferenceType("OPPORTUNITY");
            file1.setReferenceId("OPP-123");

            FileMetadata file2 = createTestFileMetadata("opp-file-2.pdf", 2000L);
            file2.setReferenceType("OPPORTUNITY");
            file2.setReferenceId("OPP-123");

            when(fileMetadataRepository.findByReference(testTenantId, "OPPORTUNITY", "OPP-123"))
                    .thenReturn(List.of(file1, file2));

            // When
            List<FileDto> opportunityFiles = storageService.listFilesByReference("OPPORTUNITY", "OPP-123");

            // Then
            assertThat(opportunityFiles).hasSize(2);
            assertThat(opportunityFiles)
                    .extracting(FileDto::fileName)
                    .containsExactlyInAnyOrder("opp-file-1.pdf", "opp-file-2.pdf");
        }

        @Test
        @DisplayName("should search files by keyword")
        void shouldSearchFilesByKeyword() {
            // Given
            FileMetadata file1 = createTestFileMetadata("proposal-draft.pdf", 1000L);
            file1.setDescription("Draft proposal for cybersecurity project");

            Page<FileMetadata> searchResults = new PageImpl<>(List.of(file1));

            when(fileMetadataRepository.searchFiles(eq(testTenantId), eq("cybersecurity"), any(Pageable.class)))
                    .thenReturn(searchResults);

            // When
            Page<FileDto> results = storageService.searchFiles("cybersecurity", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).isNotEmpty();
            assertThat(results.getContent().get(0).fileName()).isEqualTo("proposal-draft.pdf");
        }
    }

    @Nested
    @DisplayName("File Delete Operations")
    class FileDeleteOperations {

        @Test
        @DisplayName("should soft delete file")
        void shouldSoftDeleteFile() {
            // Given
            FileMetadata file = createTestFileMetadata("to-delete.pdf", 1000L);
            UUID fileId = file.getId();

            when(fileMetadataRepository.findByIdAndTenantId(fileId, testTenantId))
                    .thenReturn(Optional.of(file));
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(fileMetadataRepository.save(any(FileMetadata.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            boolean deleted = storageService.deleteFile(fileId);

            // Then
            assertThat(deleted).isTrue();
            assertThat(file.getStatus()).isEqualTo(FileStatus.DELETED);
            assertThat(file.getDeletedAt()).isNotNull();
            assertThat(file.getDeletedBy()).isNotNull();
        }

        @Test
        @DisplayName("should return false when deleting non-existent file")
        void shouldReturnFalseForNonExistentFile() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            when(fileMetadataRepository.findByIdAndTenantId(nonExistentId, testTenantId))
                    .thenReturn(Optional.empty());

            // When
            boolean deleted = storageService.deleteFile(nonExistentId);

            // Then
            assertThat(deleted).isFalse();
        }

        @Test
        @DisplayName("should return false when deleting already deleted file")
        void shouldReturnFalseForAlreadyDeletedFile() {
            // Given
            FileMetadata file = createTestFileMetadata("already-deleted.pdf", 1000L);
            file.markAsDeleted(testUser);

            when(fileMetadataRepository.findByIdAndTenantId(file.getId(), testTenantId))
                    .thenReturn(Optional.of(file));

            // When
            boolean deleted = storageService.deleteFile(file.getId());

            // Then
            assertThat(deleted).isFalse();
        }
    }

    @Nested
    @DisplayName("Storage Summary")
    class StorageSummaryOperations {

        @Test
        @DisplayName("should calculate storage summary")
        void shouldCalculateStorageSummary() {
            // Given
            when(fileMetadataRepository.countByTenantId(testTenantId)).thenReturn(10L);
            when(fileMetadataRepository.sumFileSizeByTenantId(testTenantId)).thenReturn(35000L);
            when(fileMetadataRepository.countByContentTypePrefix(testTenantId, "application/pdf")).thenReturn(3L);
            when(fileMetadataRepository.countByContentTypePrefix(testTenantId, "application/msword")).thenReturn(2L);
            when(fileMetadataRepository.countByContentTypePrefix(testTenantId, "application/vnd")).thenReturn(1L);
            when(fileMetadataRepository.countByContentTypePrefix(testTenantId, "image/")).thenReturn(2L);

            // When
            StorageSummary summary = storageService.getStorageSummary();

            // Then
            assertThat(summary.totalFiles()).isEqualTo(10L);
            assertThat(summary.totalSizeBytes()).isEqualTo(35000L);
            assertThat(summary.documentCount()).isEqualTo(6L); // pdf + msword + vnd
            assertThat(summary.imageCount()).isEqualTo(2L);
            assertThat(summary.otherCount()).isEqualTo(2L); // 10 - 6 - 2
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        @Test
        @DisplayName("should not find file from different tenant")
        void shouldNotFindFileFromDifferentTenant() {
            // Given
            UUID fileId = UUID.randomUUID();
            when(fileMetadataRepository.findByIdAndTenantId(fileId, testTenantId))
                    .thenReturn(Optional.empty());

            // When
            Optional<FileDto> result = storageService.getFile(fileId);

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should not allow deletion of file from different tenant")
        void shouldNotAllowCrossTenantDeletion() {
            // Given
            UUID fileId = UUID.randomUUID();
            when(fileMetadataRepository.findByIdAndTenantId(fileId, testTenantId))
                    .thenReturn(Optional.empty());

            // When
            boolean deleted = storageService.deleteFile(fileId);

            // Then
            assertThat(deleted).isFalse();
        }
    }
}
