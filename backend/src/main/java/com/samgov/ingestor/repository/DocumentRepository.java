package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Document;
import com.samgov.ingestor.model.Document.AccessLevel;
import com.samgov.ingestor.model.Document.DocumentStatus;
import com.samgov.ingestor.model.Document.DocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID>, JpaSpecificationExecutor<Document> {

    Page<Document> findByTenantIdAndIsArchivedFalse(UUID tenantId, Pageable pageable);

    Optional<Document> findByTenantIdAndId(UUID tenantId, UUID id);

    List<Document> findByFolderId(UUID folderId);

    Page<Document> findByFolderIdAndIsArchivedFalse(UUID folderId, Pageable pageable);

    List<Document> findByOpportunityId(String opportunityId);

    Page<Document> findByOpportunityIdAndIsArchivedFalse(String opportunityId, Pageable pageable);

    List<Document> findByContractId(UUID contractId);

    Page<Document> findByContractIdAndIsArchivedFalse(UUID contractId, Pageable pageable);

    // By document type
    Page<Document> findByTenantIdAndDocumentTypeAndIsArchivedFalse(
        UUID tenantId,
        DocumentType documentType,
        Pageable pageable
    );

    // By status
    Page<Document> findByTenantIdAndStatusAndIsArchivedFalse(
        UUID tenantId,
        DocumentStatus status,
        Pageable pageable
    );

    // Versioning
    List<Document> findByParentDocumentIdOrderByVersionNumberDesc(UUID parentDocumentId);

    Optional<Document> findByParentDocumentIdAndIsLatestVersionTrue(UUID parentDocumentId);

    @Query("SELECT d FROM Document d WHERE d.parentDocument.id = :parentId OR d.id = :parentId ORDER BY d.versionNumber DESC")
    List<Document> findAllVersions(@Param("parentId") UUID parentId);

    // Checked out documents
    @Query("SELECT d FROM Document d WHERE d.tenant.id = :tenantId AND d.isCheckedOut = true")
    List<Document> findCheckedOutDocuments(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM Document d WHERE d.checkedOutBy.id = :userId AND d.isCheckedOut = true")
    List<Document> findDocumentsCheckedOutByUser(@Param("userId") UUID userId);

    // Pending review
    @Query("""
        SELECT d FROM Document d
        WHERE d.tenant.id = :tenantId
        AND d.status IN ('PENDING_REVIEW', 'IN_REVIEW')
        AND d.isArchived = false
        ORDER BY d.updatedAt DESC
        """)
    List<Document> findDocumentsPendingReview(@Param("tenantId") UUID tenantId);

    // Expiring documents
    @Query("""
        SELECT d FROM Document d
        WHERE d.tenant.id = :tenantId
        AND d.expirationDate IS NOT NULL
        AND d.expirationDate <= :expirationBefore
        AND d.isArchived = false
        ORDER BY d.expirationDate ASC
        """)
    List<Document> findExpiringDocuments(
        @Param("tenantId") UUID tenantId,
        @Param("expirationBefore") Instant expirationBefore
    );

    // Search by name
    @Query("""
        SELECT d FROM Document d
        WHERE d.tenant.id = :tenantId
        AND d.isArchived = false
        AND (LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(d.fileName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(d.tags) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(d.keywords) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Document> searchDocuments(@Param("tenantId") UUID tenantId, @Param("keyword") String keyword, Pageable pageable);

    // By access level
    Page<Document> findByTenantIdAndAccessLevelAndIsArchivedFalse(
        UUID tenantId,
        AccessLevel accessLevel,
        Pageable pageable
    );

    // Recent documents
    @Query("""
        SELECT d FROM Document d
        WHERE d.tenant.id = :tenantId
        AND d.isArchived = false
        ORDER BY d.updatedAt DESC
        """)
    Page<Document> findRecentDocuments(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Documents created by user
    Page<Document> findByCreatedByIdAndIsArchivedFalse(UUID userId, Pageable pageable);

    // Count by type
    @Query("SELECT COUNT(d) FROM Document d WHERE d.tenant.id = :tenantId AND d.documentType = :type AND d.isArchived = false")
    long countByTenantIdAndDocumentType(@Param("tenantId") UUID tenantId, @Param("type") DocumentType type);

    // Total storage used
    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM Document d WHERE d.tenant.id = :tenantId AND d.isArchived = false")
    long sumFileSizeByTenantId(@Param("tenantId") UUID tenantId);

    // Retention - documents past retention date
    @Query("""
        SELECT d FROM Document d
        WHERE d.tenant.id = :tenantId
        AND d.retentionDate IS NOT NULL
        AND d.retentionDate <= :now
        AND d.isArchived = false
        """)
    List<Document> findDocumentsPastRetention(@Param("tenantId") UUID tenantId, @Param("now") Instant now);

    void deleteByFolderId(UUID folderId);
}
