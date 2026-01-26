package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.DocumentFolder;
import com.samgov.ingestor.model.DocumentFolder.FolderType;
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
public interface DocumentFolderRepository extends JpaRepository<DocumentFolder, UUID> {

    Page<DocumentFolder> findByTenantIdAndIsArchivedFalse(UUID tenantId, Pageable pageable);

    Optional<DocumentFolder> findByTenantIdAndId(UUID tenantId, UUID id);

    // Root folders (no parent)
    @Query("""
        SELECT f FROM DocumentFolder f
        WHERE f.tenant.id = :tenantId
        AND f.parentFolder IS NULL
        AND f.isArchived = false
        ORDER BY f.sortOrder, f.name
        """)
    List<DocumentFolder> findRootFolders(@Param("tenantId") UUID tenantId);

    // Child folders
    List<DocumentFolder> findByParentFolderIdAndIsArchivedFalseOrderBySortOrderAscNameAsc(UUID parentFolderId);

    // By folder type
    List<DocumentFolder> findByTenantIdAndFolderTypeAndIsArchivedFalse(UUID tenantId, FolderType folderType);

    // By opportunity
    List<DocumentFolder> findByOpportunityIdAndIsArchivedFalse(String opportunityId);

    Optional<DocumentFolder> findByOpportunityIdAndFolderTypeAndIsArchivedFalse(
        String opportunityId,
        FolderType folderType
    );

    // By contract
    List<DocumentFolder> findByContractIdAndIsArchivedFalse(UUID contractId);

    Optional<DocumentFolder> findByContractIdAndFolderTypeAndIsArchivedFalse(
        UUID contractId,
        FolderType folderType
    );

    // By path
    Optional<DocumentFolder> findByTenantIdAndPathAndIsArchivedFalse(UUID tenantId, String path);

    @Query("""
        SELECT f FROM DocumentFolder f
        WHERE f.tenant.id = :tenantId
        AND f.path LIKE CONCAT(:pathPrefix, '%')
        AND f.isArchived = false
        ORDER BY f.path
        """)
    List<DocumentFolder> findByPathPrefix(@Param("tenantId") UUID tenantId, @Param("pathPrefix") String pathPrefix);

    // Search by name
    @Query("""
        SELECT f FROM DocumentFolder f
        WHERE f.tenant.id = :tenantId
        AND f.isArchived = false
        AND (LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY f.path
        """)
    List<DocumentFolder> searchFolders(@Param("tenantId") UUID tenantId, @Param("keyword") String keyword);

    // Count documents in folder (including subfolders)
    @Query("""
        SELECT COUNT(d) FROM Document d
        WHERE d.folder.id = :folderId
        AND d.isArchived = false
        """)
    long countDocumentsInFolder(@Param("folderId") UUID folderId);

    @Query("""
        SELECT COUNT(d) FROM Document d
        WHERE d.folder.path LIKE CONCAT(:folderPath, '%')
        AND d.isArchived = false
        """)
    long countDocumentsInFolderRecursive(@Param("folderPath") String folderPath);

    // Count subfolders
    @Query("SELECT COUNT(f) FROM DocumentFolder f WHERE f.parentFolder.id = :parentId AND f.isArchived = false")
    long countSubFolders(@Param("parentId") UUID parentId);

    // Get full hierarchy
    @Query(value = """
        WITH RECURSIVE folder_tree AS (
            SELECT id, tenant_id, parent_folder_id, name, path, depth, 0 as level
            FROM document_folders
            WHERE id = :folderId AND is_archived = false
            UNION ALL
            SELECT f.id, f.tenant_id, f.parent_folder_id, f.name, f.path, f.depth, ft.level + 1
            FROM document_folders f
            INNER JOIN folder_tree ft ON f.parent_folder_id = ft.id
            WHERE f.is_archived = false
        )
        SELECT * FROM folder_tree ORDER BY path
        """, nativeQuery = true)
    List<DocumentFolder> findFolderHierarchy(@Param("folderId") UUID folderId);

    // Get ancestor path (breadcrumb)
    @Query(value = """
        WITH RECURSIVE ancestors AS (
            SELECT id, tenant_id, parent_folder_id, name, path, depth
            FROM document_folders
            WHERE id = :folderId AND is_archived = false
            UNION ALL
            SELECT f.id, f.tenant_id, f.parent_folder_id, f.name, f.path, f.depth
            FROM document_folders f
            INNER JOIN ancestors a ON f.id = a.parent_folder_id
            WHERE f.is_archived = false
        )
        SELECT * FROM ancestors ORDER BY depth
        """, nativeQuery = true)
    List<DocumentFolder> findAncestors(@Param("folderId") UUID folderId);

    // System folders
    List<DocumentFolder> findByTenantIdAndIsSystemFolderTrueAndIsArchivedFalse(UUID tenantId);

    // Check if name exists in parent
    boolean existsByParentFolderIdAndNameAndIsArchivedFalse(UUID parentFolderId, String name);

    boolean existsByTenantIdAndNameAndParentFolderIsNullAndIsArchivedFalse(UUID tenantId, String name);
}
