package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.LaborRate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LaborRateRepository extends JpaRepository<LaborRate, UUID> {

    Page<LaborRate> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<LaborRate> findByTenantIdAndId(UUID tenantId, UUID id);

    List<LaborRate> findByTenantIdAndIsActiveTrue(UUID tenantId);

    List<LaborRate> findByContractId(UUID contractId);

    List<LaborRate> findByContractIdAndIsActiveTrue(UUID contractId);

    // Active rates for a category
    @Query("""
        SELECT r FROM LaborRate r
        WHERE r.tenant.id = :tenantId
        AND r.laborCategory = :category
        AND r.isActive = true
        AND (r.effectiveDate IS NULL OR r.effectiveDate <= :asOfDate)
        AND (r.endDate IS NULL OR r.endDate >= :asOfDate)
        ORDER BY r.effectiveDate DESC
        """)
    List<LaborRate> findActiveRatesForCategory(
        @Param("tenantId") UUID tenantId,
        @Param("category") String category,
        @Param("asOfDate") LocalDate asOfDate
    );

    // Contract specific rate
    @Query("""
        SELECT r FROM LaborRate r
        WHERE r.contract.id = :contractId
        AND r.laborCategory = :category
        AND r.isActive = true
        AND (r.effectiveDate IS NULL OR r.effectiveDate <= :asOfDate)
        AND (r.endDate IS NULL OR r.endDate >= :asOfDate)
        ORDER BY r.effectiveDate DESC
        LIMIT 1
        """)
    Optional<LaborRate> findContractRateForCategory(
        @Param("contractId") UUID contractId,
        @Param("category") String category,
        @Param("asOfDate") LocalDate asOfDate
    );

    // Distinct labor categories
    @Query("SELECT DISTINCT r.laborCategory FROM LaborRate r WHERE r.tenant.id = :tenantId AND r.isActive = true ORDER BY r.laborCategory")
    List<String> findDistinctLaborCategoriesByTenantId(@Param("tenantId") UUID tenantId);

    // By fiscal year
    List<LaborRate> findByTenantIdAndFiscalYear(UUID tenantId, Integer fiscalYear);

    // Search
    @Query("""
        SELECT r FROM LaborRate r
        WHERE r.tenant.id = :tenantId
        AND (LOWER(r.laborCategory) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(r.laborCategoryDescription) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    List<LaborRate> searchByKeyword(@Param("tenantId") UUID tenantId, @Param("keyword") String keyword);

    List<LaborRate> findByTenantIdAndLaborCategoryContainingIgnoreCase(UUID tenantId, String keyword);

    Page<LaborRate> findByTenantIdAndIsActiveTrue(UUID tenantId, Pageable pageable);

    List<LaborRate> findByTenantIdAndLaborCategory(UUID tenantId, String laborCategory);

    // Find by contract vehicle through the Contract relationship
    @Query("""
        SELECT r FROM LaborRate r
        WHERE r.tenant.id = :tenantId
        AND r.contract IS NOT NULL
        AND r.contract.contractVehicle = :contractVehicle
        AND r.isActive = true
        """)
    List<LaborRate> findByTenantIdAndContractVehicle(
        @Param("tenantId") UUID tenantId,
        @Param("contractVehicle") String contractVehicle
    );

    // Get distinct contract vehicles for labor rates
    @Query("""
        SELECT DISTINCT r.contract.contractVehicle FROM LaborRate r
        WHERE r.tenant.id = :tenantId
        AND r.contract IS NOT NULL
        AND r.contract.contractVehicle IS NOT NULL
        AND r.isActive = true
        ORDER BY r.contract.contractVehicle
        """)
    List<String> findDistinctContractVehiclesByTenantId(@Param("tenantId") UUID tenantId);

    @Query("""
        SELECT r FROM LaborRate r
        WHERE r.tenant.id = :tenantId
        AND r.laborCategory = :category
        AND (r.contract IS NULL OR r.contract.id = :contractId)
        AND r.isActive = true
        AND (r.effectiveDate IS NULL OR r.effectiveDate <= :asOfDate)
        AND (r.endDate IS NULL OR r.endDate >= :asOfDate)
        ORDER BY r.contract.id DESC NULLS LAST, r.effectiveDate DESC
        """)
    Optional<LaborRate> findEffectiveRate(
        @Param("tenantId") UUID tenantId,
        @Param("category") String category,
        @Param("contractId") UUID contractId,
        @Param("asOfDate") LocalDate asOfDate
    );
}
