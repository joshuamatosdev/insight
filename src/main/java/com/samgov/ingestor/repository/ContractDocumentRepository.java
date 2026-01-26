package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ContractDocument;
import com.samgov.ingestor.model.ContractDocument.DocumentType;
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
public interface ContractDocumentRepository extends JpaRepository<ContractDocument, UUID> {

    Page<ContractDocument> findByContractId(UUID contractId, Pageable pageable);

    List<ContractDocument> findByContractIdAndIsCurrentVersionTrue(UUID contractId);

    Optional<ContractDocument> findByContractIdAndId(UUID contractId, UUID id);

    Optional<ContractDocument> findByTenantIdAndId(UUID tenantId, UUID id);

    List<ContractDocument> findByContractIdAndDocumentType(UUID contractId, DocumentType documentType);

    List<ContractDocument> findByModificationId(UUID modificationId);

    List<ContractDocument> findByDeliverableId(UUID deliverableId);

    // Version history
    List<ContractDocument> findByParentDocumentIdOrderByVersionDesc(UUID parentDocumentId);

    @Query("SELECT MAX(d.version) FROM ContractDocument d WHERE d.parentDocument.id = :parentId")
    Optional<Integer> findMaxVersionByParentId(@Param("parentId") UUID parentId);

    // Search
    @Query("""
        SELECT d FROM ContractDocument d
        WHERE d.contract.id = :contractId
        AND d.isCurrentVersion = true
        AND (LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(d.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    List<ContractDocument> searchByKeyword(@Param("contractId") UUID contractId, @Param("keyword") String keyword);

    @Query("SELECT COUNT(d) FROM ContractDocument d WHERE d.contract.id = :contractId AND d.isCurrentVersion = true")
    long countCurrentVersionsByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(d.fileSize) FROM ContractDocument d WHERE d.contract.id = :contractId")
    Optional<Long> sumFileSizeByContractId(@Param("contractId") UUID contractId);

    void deleteByContractId(UUID contractId);
}
