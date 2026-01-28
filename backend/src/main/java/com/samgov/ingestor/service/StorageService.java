package com.samgov.ingestor.service;

import com.samgov.ingestor.config.S3Config;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.FileMetadata;
import com.samgov.ingestor.model.FileMetadata.FileStatus;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.repository.FileMetadataRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing file uploads and downloads to/from S3.
 *
 * Features:
 * - Multi-tenant file isolation via S3 key prefixes
 * - Presigned URL generation for secure direct uploads/downloads
 * - File metadata tracking in database
 * - Checksum verification
 * - Soft delete with cleanup
 */
@Service
@Transactional
public class StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3Config s3Config;
    private final FileMetadataRepository fileMetadataRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public StorageService(
            S3Client s3Client,
            S3Presigner s3Presigner,
            S3Config s3Config,
            FileMetadataRepository fileMetadataRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.s3Config = s3Config;
        this.fileMetadataRepository = fileMetadataRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    // ==================== DTOs ====================

    public record FileUploadRequest(
        String fileName,
        String contentType,
        String description,
        String tags,
        String referenceType,
        String referenceId
    ) {}

    public record FileUploadResponse(
        UUID fileId,
        String fileName,
        String s3Key,
        String uploadUrl,
        Instant expiresAt
    ) {}

    public record FileDto(
        UUID id,
        String fileName,
        String originalFileName,
        String contentType,
        Long size,
        FileStatus status,
        String description,
        String tags,
        String referenceType,
        String referenceId,
        UUID uploadedBy,
        String uploadedByName,
        Instant uploadedAt
    ) {}

    public record PresignedUrlResponse(
        String url,
        Instant expiresAt
    ) {}

    public record StorageSummary(
        long totalFiles,
        long totalSizeBytes,
        long documentCount,
        long imageCount,
        long otherCount
    ) {}

    // ==================== Upload Operations ====================

    /**
     * Upload a file directly (for small files).
     */
    public FileDto uploadFile(MultipartFile file, FileUploadRequest request) throws IOException {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        String contentType = request.contentType() != null ? request.contentType() : file.getContentType();
        String fileName = sanitizeFileName(request.fileName() != null ? request.fileName() : file.getOriginalFilename());
        String originalFileName = file.getOriginalFilename();

        // Generate S3 key with tenant isolation
        UUID fileId = UUID.randomUUID();
        String s3Key = generateS3Key(tenantId, fileId, fileName);

        // Calculate checksum
        String checksum = calculateChecksum(file.getInputStream());

        // Upload to S3
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(s3Key)
                .contentType(contentType)
                .contentLength(file.getSize())
                .build();

        s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Save metadata
        FileMetadata metadata = new FileMetadata();
        metadata.setId(fileId);
        metadata.setTenant(tenant);
        metadata.setFileName(fileName);
        metadata.setOriginalFileName(originalFileName);
        metadata.setContentType(contentType);
        metadata.setSize(file.getSize());
        metadata.setS3Key(s3Key);
        metadata.setS3Bucket(s3Config.getBucket());
        metadata.setChecksum(checksum);
        metadata.setStatus(FileStatus.AVAILABLE);
        metadata.setDescription(request.description());
        metadata.setTags(request.tags());
        metadata.setReferenceType(request.referenceType());
        metadata.setReferenceId(request.referenceId());

        if (userId != null) {
            userRepository.findById(userId).ifPresent(metadata::setUploadedBy);
        }

        FileMetadata saved = fileMetadataRepository.save(metadata);

        auditService.logAction(AuditAction.FILE_UPLOADED, "FileMetadata", saved.getId().toString(),
                "Uploaded file: " + saved.getFileName() + " (" + formatFileSize(saved.getSize()) + ")");

        logger.info("File uploaded: {} ({})", s3Key, formatFileSize(file.getSize()));

        return toDto(saved);
    }

    /**
     * Initiate a presigned upload for large files.
     */
    public FileUploadResponse initiatePresignedUpload(FileUploadRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        String fileName = sanitizeFileName(request.fileName());
        UUID fileId = UUID.randomUUID();
        String s3Key = generateS3Key(tenantId, fileId, fileName);

        // Create pending metadata record
        FileMetadata metadata = new FileMetadata();
        metadata.setId(fileId);
        metadata.setTenant(tenant);
        metadata.setFileName(fileName);
        metadata.setOriginalFileName(fileName);
        metadata.setContentType(request.contentType());
        metadata.setSize(0L); // Will be updated after upload
        metadata.setS3Key(s3Key);
        metadata.setS3Bucket(s3Config.getBucket());
        metadata.setStatus(FileStatus.PENDING);
        metadata.setDescription(request.description());
        metadata.setTags(request.tags());
        metadata.setReferenceType(request.referenceType());
        metadata.setReferenceId(request.referenceId());

        if (userId != null) {
            userRepository.findById(userId).ifPresent(metadata::setUploadedBy);
        }

        fileMetadataRepository.save(metadata);

        // Generate presigned upload URL
        Duration expiration = Duration.ofMinutes(s3Config.getPresignedUrlExpirationMinutes());
        Instant expiresAt = Instant.now().plus(expiration);

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(s3Key)
                .contentType(request.contentType())
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .putObjectRequest(putRequest)
                .build();

        String presignedUrl = s3Presigner.presignPutObject(presignRequest).url().toString();

        logger.info("Initiated presigned upload for file: {}", s3Key);

        return new FileUploadResponse(fileId, fileName, s3Key, presignedUrl, expiresAt);
    }

    /**
     * Confirm that a presigned upload has completed.
     */
    public FileDto confirmUpload(UUID fileId) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        FileMetadata metadata = fileMetadataRepository.findByIdAndTenantId(fileId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));

        if (metadata.getStatus() != FileStatus.PENDING) {
            throw new IllegalStateException("File is not in PENDING status");
        }

        // Verify file exists in S3 and get size
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(s3Config.getBucket())
                    .key(metadata.getS3Key())
                    .build();

            HeadObjectResponse response = s3Client.headObject(headRequest);

            metadata.setSize(response.contentLength());
            metadata.setContentType(response.contentType());
            metadata.setStatus(FileStatus.AVAILABLE);

            FileMetadata saved = fileMetadataRepository.save(metadata);

            auditService.logAction(AuditAction.FILE_UPLOADED, "FileMetadata", saved.getId().toString(),
                    "Confirmed upload: " + saved.getFileName() + " (" + formatFileSize(saved.getSize()) + ")");

            logger.info("Confirmed upload: {} ({})", metadata.getS3Key(), formatFileSize(response.contentLength()));

            return toDto(saved);
        } catch (NoSuchKeyException e) {
            throw new ResourceNotFoundException("File not found in S3: " + metadata.getS3Key());
        }
    }

    // ==================== Download Operations ====================

    /**
     * Download a file directly.
     */
    public FileDownload downloadFile(UUID fileId) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        FileMetadata metadata = fileMetadataRepository.findByIdAndTenantId(fileId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));

        if (!metadata.isAvailable()) {
            throw new IllegalStateException("File is not available for download");
        }

        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(metadata.getS3Key())
                .build();

        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(getRequest);

        logger.info("File downloaded: {}", metadata.getS3Key());

        return new FileDownload(
                metadata.getFileName(),
                metadata.getContentType(),
                metadata.getSize(),
                response
        );
    }

    public record FileDownload(
        String fileName,
        String contentType,
        Long size,
        InputStream inputStream
    ) {}

    /**
     * Get a presigned download URL.
     */
    public PresignedUrlResponse getPresignedDownloadUrl(UUID fileId) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        FileMetadata metadata = fileMetadataRepository.findByIdAndTenantId(fileId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));

        if (!metadata.isAvailable()) {
            throw new IllegalStateException("File is not available for download");
        }

        Duration expiration = Duration.ofMinutes(s3Config.getPresignedUrlExpirationMinutes());
        Instant expiresAt = Instant.now().plus(expiration);

        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(metadata.getS3Key())
                .responseContentDisposition("attachment; filename=\"" + metadata.getFileName() + "\"")
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .getObjectRequest(getRequest)
                .build();

        String presignedUrl = s3Presigner.presignGetObject(presignRequest).url().toString();

        logger.info("Generated presigned download URL for: {}", metadata.getS3Key());

        return new PresignedUrlResponse(presignedUrl, expiresAt);
    }

    // ==================== Delete Operations ====================

    /**
     * Soft delete a file.
     */
    public boolean deleteFile(UUID fileId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        Optional<FileMetadata> optMetadata = fileMetadataRepository.findByIdAndTenantId(fileId, tenantId);

        if (optMetadata.isEmpty()) {
            return false;
        }

        FileMetadata metadata = optMetadata.get();

        if (metadata.isDeleted()) {
            return false;
        }

        User deletedBy = userId != null ? userRepository.findById(userId).orElse(null) : null;
        metadata.markAsDeleted(deletedBy);

        fileMetadataRepository.save(metadata);

        auditService.logAction(AuditAction.FILE_DELETED, "FileMetadata", fileId.toString(),
                "Deleted file: " + metadata.getFileName());

        logger.info("File marked as deleted: {}", metadata.getS3Key());

        return true;
    }

    /**
     * Permanently delete a file from S3 and database.
     * Used for cleanup of soft-deleted files.
     */
    public void purgeFile(UUID fileId) {
        FileMetadata metadata = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));

        // Delete from S3
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(s3Config.getBucket())
                    .key(metadata.getS3Key())
                    .build();

            s3Client.deleteObject(deleteRequest);
            logger.info("File purged from S3: {}", metadata.getS3Key());
        } catch (Exception e) {
            logger.warn("Failed to delete file from S3: {}. Error: {}", metadata.getS3Key(), e.getMessage());
        }

        // Delete from database
        fileMetadataRepository.delete(metadata);
    }

    /**
     * Cleanup files that have been soft-deleted for more than the retention period.
     */
    public int cleanupDeletedFiles(int retentionDays) {
        Instant cutoffDate = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
        List<FileMetadata> filesToPurge = fileMetadataRepository.findFilesForCleanup(cutoffDate);

        int purgedCount = 0;
        for (FileMetadata file : filesToPurge) {
            try {
                purgeFile(file.getId());
                purgedCount++;
            } catch (Exception e) {
                logger.error("Failed to purge file: {}. Error: {}", file.getId(), e.getMessage());
            }
        }

        if (purgedCount > 0) {
            logger.info("Cleaned up {} deleted files older than {} days", purgedCount, retentionDays);
        }

        return purgedCount;
    }

    // ==================== List Operations ====================

    /**
     * List files with pagination.
     */
    public Page<FileDto> listFiles(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return fileMetadataRepository.findByTenantIdAndNotDeleted(tenantId, pageable)
                .map(this::toDto);
    }

    /**
     * Get a file by ID.
     */
    public Optional<FileDto> getFile(UUID fileId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return fileMetadataRepository.findByIdAndTenantId(fileId, tenantId)
                .filter(f -> !f.isDeleted())
                .map(this::toDto);
    }

    /**
     * List files by reference.
     */
    public List<FileDto> listFilesByReference(String referenceType, String referenceId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return fileMetadataRepository.findByReference(tenantId, referenceType, referenceId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Search files by keyword.
     */
    public Page<FileDto> searchFiles(String keyword, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return fileMetadataRepository.searchFiles(tenantId, keyword, pageable)
                .map(this::toDto);
    }

    /**
     * Get storage summary for the current tenant.
     */
    public StorageSummary getStorageSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();

        long totalFiles = fileMetadataRepository.countByTenantId(tenantId);
        long totalSize = fileMetadataRepository.sumFileSizeByTenantId(tenantId);
        long documentCount = fileMetadataRepository.countByContentTypePrefix(tenantId, "application/pdf")
                + fileMetadataRepository.countByContentTypePrefix(tenantId, "application/msword")
                + fileMetadataRepository.countByContentTypePrefix(tenantId, "application/vnd");
        long imageCount = fileMetadataRepository.countByContentTypePrefix(tenantId, "image/");
        long otherCount = totalFiles - documentCount - imageCount;

        return new StorageSummary(totalFiles, totalSize, documentCount, imageCount, otherCount);
    }

    // ==================== Helper Methods ====================

    private String generateS3Key(UUID tenantId, UUID fileId, String fileName) {
        return String.format("tenants/%s/files/%s/%s", tenantId, fileId, fileName);
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "unnamed_file";
        }
        // Remove path separators and dangerous characters
        return fileName.replaceAll("[/\\\\:*?\"<>|]", "_").trim();
    }

    private String calculateChecksum(InputStream inputStream) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            inputStream.mark(Integer.MAX_VALUE);
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }
            inputStream.reset();
            return Base64.getEncoder().encodeToString(md.digest());
        } catch (NoSuchAlgorithmException | IOException e) {
            logger.warn("Failed to calculate checksum: {}", e.getMessage());
            return null;
        }
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    private FileDto toDto(FileMetadata metadata) {
        String uploadedByName = null;
        if (metadata.getUploadedBy() != null) {
            uploadedByName = metadata.getUploadedBy().getFirstName() + " " + metadata.getUploadedBy().getLastName();
        }

        return new FileDto(
                metadata.getId(),
                metadata.getFileName(),
                metadata.getOriginalFileName(),
                metadata.getContentType(),
                metadata.getSize(),
                metadata.getStatus(),
                metadata.getDescription(),
                metadata.getTags(),
                metadata.getReferenceType(),
                metadata.getReferenceId(),
                metadata.getUploadedBy() != null ? metadata.getUploadedBy().getId() : null,
                uploadedByName,
                metadata.getUploadedAt()
        );
    }
}
