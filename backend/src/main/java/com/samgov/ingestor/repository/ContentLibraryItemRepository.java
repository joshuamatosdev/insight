package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ContentLibraryItem;
import com.samgov.ingestor.model.ContentLibraryItem.ContentType;
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
public interface ContentLibraryItemRepository extends JpaRepository<ContentLibraryItem, UUID>, JpaSpecificationExecutor<ContentLibraryItem> {

    Page<ContentLibraryItem> findByTenantIdAndIsActiveTrueAndIsLatestVersionTrue(UUID tenantId, Pageable pageable);

    Optional<ContentLibraryItem> findByTenantIdAndId(UUID tenantId, UUID id);

    // By content type
    List<ContentLibraryItem> findByTenantIdAndContentTypeAndIsActiveTrueAndIsLatestVersionTrue(
        UUID tenantId,
        ContentType contentType
    );

    Page<ContentLibraryItem> findByTenantIdAndContentTypeAndIsActiveTrueAndIsLatestVersionTrue(
        UUID tenantId,
        ContentType contentType,
        Pageable pageable
    );

    // By category
    List<ContentLibraryItem> findByTenantIdAndCategoryAndIsActiveTrueAndIsLatestVersionTrue(
        UUID tenantId,
        String category
    );

    Page<ContentLibraryItem> findByTenantIdAndCategoryAndIsActiveTrueAndIsLatestVersionTrue(
        UUID tenantId,
        String category,
        Pageable pageable
    );

    // By subcategory
    List<ContentLibraryItem> findByTenantIdAndCategoryAndSubCategoryAndIsActiveTrueAndIsLatestVersionTrue(
        UUID tenantId,
        String category,
        String subCategory
    );

    // Approved content
    Page<ContentLibraryItem> findByTenantIdAndIsApprovedTrueAndIsActiveTrueAndIsLatestVersionTrue(
        UUID tenantId,
        Pageable pageable
    );

    // Pending approval
    @Query("""
        SELECT c FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.isApproved = false
        AND c.isActive = true
        AND c.isLatestVersion = true
        ORDER BY c.createdAt DESC
        """)
    List<ContentLibraryItem> findPendingApproval(@Param("tenantId") UUID tenantId);

    // Past performance by contract
    List<ContentLibraryItem> findByContractIdAndIsActiveTrueAndIsLatestVersionTrue(UUID contractId);

    // Personnel content by employee
    List<ContentLibraryItem> findByEmployeeIdAndIsActiveTrueAndIsLatestVersionTrue(UUID employeeId);

    // Most used
    @Query("""
        SELECT c FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.isActive = true
        AND c.isLatestVersion = true
        ORDER BY c.usageCount DESC
        """)
    Page<ContentLibraryItem> findMostUsed(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Highest win rate
    @Query("""
        SELECT c FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.isActive = true
        AND c.isLatestVersion = true
        AND (c.winCount + c.lossCount) > 0
        ORDER BY (CAST(c.winCount AS double) / (c.winCount + c.lossCount)) DESC
        """)
    Page<ContentLibraryItem> findHighestWinRate(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Recently used
    @Query("""
        SELECT c FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.isActive = true
        AND c.isLatestVersion = true
        AND c.lastUsedAt IS NOT NULL
        ORDER BY c.lastUsedAt DESC
        """)
    Page<ContentLibraryItem> findRecentlyUsed(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Search
    @Query("""
        SELECT c FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.isActive = true
        AND c.isLatestVersion = true
        AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.tags) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.keywords) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.customerName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.customerAgency) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<ContentLibraryItem> searchContent(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    // Search by NAICS
    @Query("""
        SELECT c FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.isActive = true
        AND c.isLatestVersion = true
        AND c.naicsCodes LIKE CONCAT('%', :naicsCode, '%')
        """)
    List<ContentLibraryItem> findByNaicsCode(@Param("tenantId") UUID tenantId, @Param("naicsCode") String naicsCode);

    // Search by PSC
    @Query("""
        SELECT c FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.isActive = true
        AND c.isLatestVersion = true
        AND c.pscCodes LIKE CONCAT('%', :pscCode, '%')
        """)
    List<ContentLibraryItem> findByPscCode(@Param("tenantId") UUID tenantId, @Param("pscCode") String pscCode);

    // Expiring content
    @Query("""
        SELECT c FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.isActive = true
        AND c.isLatestVersion = true
        AND c.expirationDate IS NOT NULL
        AND c.expirationDate <= :expirationBefore
        ORDER BY c.expirationDate ASC
        """)
    List<ContentLibraryItem> findExpiring(
        @Param("tenantId") UUID tenantId,
        @Param("expirationBefore") Instant expirationBefore
    );

    // Versioning
    List<ContentLibraryItem> findByParentVersionIdOrderByVersionDesc(UUID parentVersionId);

    @Query("SELECT c FROM ContentLibraryItem c WHERE c.parentVersion.id = :parentId OR c.id = :parentId ORDER BY c.version DESC")
    List<ContentLibraryItem> findAllVersions(@Param("parentId") UUID parentId);

    // Distinct categories
    @Query("SELECT DISTINCT c.category FROM ContentLibraryItem c WHERE c.tenant.id = :tenantId AND c.isActive = true ORDER BY c.category")
    List<String> findDistinctCategories(@Param("tenantId") UUID tenantId);

    // Distinct subcategories for category
    @Query("""
        SELECT DISTINCT c.subCategory FROM ContentLibraryItem c
        WHERE c.tenant.id = :tenantId
        AND c.category = :category
        AND c.subCategory IS NOT NULL
        AND c.isActive = true
        ORDER BY c.subCategory
        """)
    List<String> findDistinctSubCategories(@Param("tenantId") UUID tenantId, @Param("category") String category);

    // Count by type
    @Query("SELECT COUNT(c) FROM ContentLibraryItem c WHERE c.tenant.id = :tenantId AND c.contentType = :type AND c.isActive = true AND c.isLatestVersion = true")
    long countByTenantIdAndContentType(@Param("tenantId") UUID tenantId, @Param("type") ContentType type);

    // Word count totals
    @Query("SELECT COALESCE(SUM(c.wordCount), 0) FROM ContentLibraryItem c WHERE c.tenant.id = :tenantId AND c.isActive = true AND c.isLatestVersion = true")
    long sumWordCountByTenantId(@Param("tenantId") UUID tenantId);
}
