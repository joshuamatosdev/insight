package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID>, JpaSpecificationExecutor<Contract> {

    Page<Contract> findByTenantId(UUID tenantId, Pageable pageable);

    List<Contract> findByTenantId(UUID tenantId);

    Optional<Contract> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<Contract> findByTenantIdAndContractNumber(UUID tenantId, String contractNumber);

    boolean existsByTenantIdAndContractNumber(UUID tenantId, String contractNumber);

    Page<Contract> findByTenantIdAndStatus(UUID tenantId, ContractStatus status, Pageable pageable);

    Page<Contract> findByTenantIdAndContractType(UUID tenantId, ContractType contractType, Pageable pageable);

    Page<Contract> findByTenantIdAndAgencyContainingIgnoreCase(UUID tenantId, String agency, Pageable pageable);

    // Active contracts
    @Query("SELECT c FROM Contract c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    Page<Contract> findActiveContracts(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Expiring contracts
    @Query("""
        SELECT c FROM Contract c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND c.popEndDate IS NOT NULL
        AND c.popEndDate <= :deadline
        ORDER BY c.popEndDate ASC
        """)
    List<Contract> findExpiringContracts(
        @Param("tenantId") UUID tenantId,
        @Param("deadline") LocalDate deadline
    );

    // Task orders under a parent contract (IDIQ/BPA)
    @Query("SELECT c FROM Contract c WHERE c.parentContract.id = :parentId ORDER BY c.contractNumber")
    List<Contract> findTaskOrdersByParent(@Param("parentId") UUID parentId);

    @Query("SELECT c FROM Contract c WHERE c.parentContract.id = :parentId")
    Page<Contract> findTaskOrdersByParent(@Param("parentId") UUID parentId, Pageable pageable);

    // Contracts by program manager
    Page<Contract> findByTenantIdAndProgramManagerId(UUID tenantId, UUID programManagerId, Pageable pageable);

    // Contracts by contract manager
    Page<Contract> findByTenantIdAndContractManagerId(UUID tenantId, UUID contractManagerId, Pageable pageable);

    // Summary queries
    @Query("SELECT SUM(c.totalValue) FROM Contract c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    Optional<BigDecimal> sumTotalValueByTenantIdAndStatusActive(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(c.fundedValue) FROM Contract c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    Optional<BigDecimal> sumFundedValueByTenantIdAndStatusActive(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.tenant.id = :tenantId AND c.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") ContractStatus status);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.tenant.id = :tenantId AND c.contractType = :type")
    long countByTenantIdAndContractType(@Param("tenantId") UUID tenantId, @Param("type") ContractType type);

    // Search
    @Query("""
        SELECT c FROM Contract c
        WHERE c.tenant.id = :tenantId
        AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.contractNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Contract> searchByKeyword(@Param("tenantId") UUID tenantId, @Param("keyword") String keyword, Pageable pageable);

    // Contracts with unexercised options
    @Query("""
        SELECT DISTINCT c FROM Contract c
        JOIN c.options o
        WHERE c.tenant.id = :tenantId
        AND o.status = 'PENDING'
        AND o.exerciseDeadline <= :deadline
        ORDER BY o.exerciseDeadline ASC
        """)
    List<Contract> findContractsWithApproachingOptionDeadlines(
        @Param("tenantId") UUID tenantId,
        @Param("deadline") LocalDate deadline
    );

    // Distinct agencies
    @Query("SELECT DISTINCT c.agency FROM Contract c WHERE c.tenant.id = :tenantId AND c.agency IS NOT NULL ORDER BY c.agency")
    List<String> findDistinctAgenciesByTenantId(@Param("tenantId") UUID tenantId);

    // Analytics queries
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.tenant.id = :tenantId AND c.status IN :statuses")
    long countByTenantIdAndStatusIn(@Param("tenantId") UUID tenantId, @Param("statuses") List<ContractStatus> statuses);

    @Query("SELECT SUM(c.totalValue) FROM Contract c WHERE c.tenant.id = :tenantId")
    Optional<BigDecimal> sumTotalValueByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(c.totalValue - COALESCE(c.fundedValue, 0)) FROM Contract c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    Optional<BigDecimal> sumRemainingValueByTenantId(@Param("tenantId") UUID tenantId);
}
