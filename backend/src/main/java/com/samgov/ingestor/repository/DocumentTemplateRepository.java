package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.DocumentTemplate;
import com.samgov.ingestor.model.DocumentTemplate.TemplateFormat;
import com.samgov.ingestor.model.DocumentTemplate.TemplateType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplate, UUID> {

    Page<DocumentTemplate> findByTenantIdAndIsActiveTrue(UUID tenantId, Pageable pageable);

    Optional<DocumentTemplate> findByTenantIdAndId(UUID tenantId, UUID id);

    // By type
    List<DocumentTemplate> findByTenantIdAndTemplateTypeAndIsActiveTrue(UUID tenantId, TemplateType templateType);

    Page<DocumentTemplate> findByTenantIdAndTemplateTypeAndIsActiveTrue(
        UUID tenantId,
        TemplateType templateType,
        Pageable pageable
    );

    // By format
    List<DocumentTemplate> findByTenantIdAndTemplateFormatAndIsActiveTrue(UUID tenantId, TemplateFormat format);

    // By category
    List<DocumentTemplate> findByTenantIdAndCategoryAndIsActiveTrue(UUID tenantId, String category);

    Page<DocumentTemplate> findByTenantIdAndCategoryAndIsActiveTrue(
        UUID tenantId,
        String category,
        Pageable pageable
    );

    // Default templates
    Optional<DocumentTemplate> findByTenantIdAndTemplateTypeAndIsDefaultTrueAndIsActiveTrue(
        UUID tenantId,
        TemplateType templateType
    );

    List<DocumentTemplate> findByTenantIdAndIsDefaultTrueAndIsActiveTrue(UUID tenantId);

    // System templates
    List<DocumentTemplate> findByTenantIdAndIsSystemTemplateTrueAndIsActiveTrue(UUID tenantId);

    // Approved templates
    List<DocumentTemplate> findByTenantIdAndIsApprovedTrueAndIsActiveTrue(UUID tenantId);

    Page<DocumentTemplate> findByTenantIdAndIsApprovedFalseAndIsActiveTrue(UUID tenantId, Pageable pageable);

    // Most used
    @Query("""
        SELECT t FROM DocumentTemplate t
        WHERE t.tenant.id = :tenantId
        AND t.isActive = true
        ORDER BY t.usageCount DESC
        """)
    Page<DocumentTemplate> findMostUsedTemplates(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Recently used
    @Query("""
        SELECT t FROM DocumentTemplate t
        WHERE t.tenant.id = :tenantId
        AND t.isActive = true
        AND t.lastUsedAt IS NOT NULL
        ORDER BY t.lastUsedAt DESC
        """)
    Page<DocumentTemplate> findRecentlyUsedTemplates(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Search
    @Query("""
        SELECT t FROM DocumentTemplate t
        WHERE t.tenant.id = :tenantId
        AND t.isActive = true
        AND (LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(t.tags) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(t.keywords) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<DocumentTemplate> searchTemplates(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    // Distinct categories
    @Query("SELECT DISTINCT t.category FROM DocumentTemplate t WHERE t.tenant.id = :tenantId AND t.isActive = true ORDER BY t.category")
    List<String> findDistinctCategories(@Param("tenantId") UUID tenantId);

    // Count by type
    @Query("SELECT COUNT(t) FROM DocumentTemplate t WHERE t.tenant.id = :tenantId AND t.templateType = :type AND t.isActive = true")
    long countByTenantIdAndTemplateType(@Param("tenantId") UUID tenantId, @Param("type") TemplateType type);

    // Pending approval
    @Query("""
        SELECT t FROM DocumentTemplate t
        WHERE t.tenant.id = :tenantId
        AND t.isApproved = false
        AND t.isActive = true
        ORDER BY t.createdAt DESC
        """)
    List<DocumentTemplate> findPendingApproval(@Param("tenantId") UUID tenantId);
}
