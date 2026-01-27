package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.FileMetadata;
import com.samgov.ingestor.model.FileMetadata.FileStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for FileMetadata entities.
 *
 * All queries enforce tenant isolation for multi-tenant security.
 */
@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID> {

    /**
     * Find a file by ID within a specific tenant.
     */
    Optional<FileMetadata> findByIdAndTenantId(UUID id, UUID tenantId);

    /**
     * Find a file by S3 key within a specific tenant.
     */
    Optional<FileMetadata> findByS3KeyAndTenantId(String s3Key, UUID tenantId);

    /**
     * List all non-deleted files for a tenant with pagination.
     */
    @Query("""
        SELECT f FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.status != 'DELETED'
        ORDER BY f.uploadedAt DESC
        """)
    Page<FileMetadata> findByTenantIdAndNotDeleted(
            @Param("tenantId") UUID tenantId,
            Pageable pageable
    );

    /**
     * List files for a tenant by status.
     */
    Page<FileMetadata> findByTenantIdAndStatus(
            UUID tenantId,
            FileStatus status,
            Pageable pageable
    );

    /**
     * List files by reference (e.g., all files for a specific opportunity).
     */
    @Query("""
        SELECT f FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.referenceType = :referenceType
        AND f.referenceId = :referenceId
        AND f.status != 'DELETED'
        ORDER BY f.uploadedAt DESC
        """)
    List<FileMetadata> findByReference(
            @Param("tenantId") UUID tenantId,
            @Param("referenceType") String referenceType,
            @Param("referenceId") String referenceId
    );

    /**
     * List files uploaded by a specific user.
     */
    @Query("""
        SELECT f FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.uploadedBy.id = :userId
        AND f.status != 'DELETED'
        ORDER BY f.uploadedAt DESC
        """)
    Page<FileMetadata> findByTenantIdAndUploadedBy(
            @Param("tenantId") UUID tenantId,
            @Param("userId") UUID userId,
            Pageable pageable
    );

    /**
     * Search files by name.
     */
    @Query("""
        SELECT f FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.status != 'DELETED'
        AND (LOWER(f.fileName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(f.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY f.uploadedAt DESC
        """)
    Page<FileMetadata> searchFiles(
            @Param("tenantId") UUID tenantId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * List files by content type.
     */
    @Query("""
        SELECT f FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.status != 'DELETED'
        AND f.contentType LIKE CONCAT(:contentTypePrefix, '%')
        ORDER BY f.uploadedAt DESC
        """)
    Page<FileMetadata> findByContentTypePrefix(
            @Param("tenantId") UUID tenantId,
            @Param("contentTypePrefix") String contentTypePrefix,
            Pageable pageable
    );

    /**
     * Get total storage used by a tenant.
     */
    @Query("""
        SELECT COALESCE(SUM(f.size), 0) FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.status != 'DELETED'
        """)
    long sumFileSizeByTenantId(@Param("tenantId") UUID tenantId);

    /**
     * Count files by tenant.
     */
    @Query("""
        SELECT COUNT(f) FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.status != 'DELETED'
        """)
    long countByTenantId(@Param("tenantId") UUID tenantId);

    /**
     * Count files by content type for a tenant.
     */
    @Query("""
        SELECT COUNT(f) FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.status != 'DELETED'
        AND f.contentType LIKE CONCAT(:contentTypePrefix, '%')
        """)
    long countByContentTypePrefix(
            @Param("tenantId") UUID tenantId,
            @Param("contentTypePrefix") String contentTypePrefix
    );

    /**
     * Find files pending cleanup (deleted more than X days ago).
     */
    @Query("""
        SELECT f FROM FileMetadata f
        WHERE f.status = 'DELETED'
        AND f.deletedAt < :cutoffDate
        """)
    List<FileMetadata> findFilesForCleanup(@Param("cutoffDate") Instant cutoffDate);

    /**
     * Find files with quarantined status for review.
     */
    @Query("""
        SELECT f FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.status = 'QUARANTINED'
        ORDER BY f.uploadedAt DESC
        """)
    List<FileMetadata> findQuarantinedFiles(@Param("tenantId") UUID tenantId);

    /**
     * Find recent files for a tenant.
     */
    @Query("""
        SELECT f FROM FileMetadata f
        WHERE f.tenant.id = :tenantId
        AND f.status != 'DELETED'
        AND f.uploadedAt >= :since
        ORDER BY f.uploadedAt DESC
        """)
    List<FileMetadata> findRecentFiles(
            @Param("tenantId") UUID tenantId,
            @Param("since") Instant since
    );
}
