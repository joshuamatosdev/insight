package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Opportunity entities.
 * No @Repository annotation needed - Spring Data auto-detects JpaRepository interfaces.
 */
public interface OpportunityRepository extends JpaRepository<Opportunity, String>, JpaSpecificationExecutor<Opportunity> {

    Optional<Opportunity> findBySolicitationNumber(String solicitationNumber);

    /**
     * Find opportunities by status.
     */
    Page<Opportunity> findByStatus(OpportunityStatus status, Pageable pageable);

    /**
     * Find opportunities by NAICS code.
     */
    Page<Opportunity> findByNaicsCode(String naicsCode, Pageable pageable);

    /**
     * Find opportunities by agency.
     */
    Page<Opportunity> findByAgencyContainingIgnoreCase(String agency, Pageable pageable);

    /**
     * Find opportunities by set-aside type.
     */
    Page<Opportunity> findBySetAsideType(String setAsideType, Pageable pageable);

    /**
     * Find all SBIR opportunities.
     */
    List<Opportunity> findByIsSbirTrue();

    Page<Opportunity> findByIsSbirTrue(Pageable pageable);

    /**
     * Find all STTR opportunities.
     */
    List<Opportunity> findByIsSttrTrue();

    Page<Opportunity> findByIsSttrTrue(Pageable pageable);

    /**
     * Find all SBIR or STTR opportunities.
     */
    @Query("SELECT o FROM Opportunity o WHERE o.isSbir = true OR o.isSttr = true")
    List<Opportunity> findAllSbirSttr();

    @Query("SELECT o FROM Opportunity o WHERE o.isSbir = true OR o.isSttr = true")
    Page<Opportunity> findAllSbirSttr(Pageable pageable);

    /**
     * Find SBIR/STTR opportunities by phase.
     */
    @Query("SELECT o FROM Opportunity o WHERE (o.isSbir = true OR o.isSttr = true) AND o.sbirPhase = :phase")
    List<Opportunity> findSbirSttrByPhase(@Param("phase") String phase);

    @Query("SELECT o FROM Opportunity o WHERE (o.isSbir = true OR o.isSttr = true) AND o.sbirPhase = :phase")
    Page<Opportunity> findSbirSttrByPhase(@Param("phase") String phase, Pageable pageable);

    /**
     * Find opportunities closing soon (within specified days).
     */
    @Query("""
        SELECT o FROM Opportunity o
        WHERE o.status = 'ACTIVE'
        AND o.responseDeadLine >= :today
        AND o.responseDeadLine <= :deadline
        ORDER BY o.responseDeadLine ASC
        """)
    List<Opportunity> findClosingSoon(
        @Param("today") LocalDate today,
        @Param("deadline") LocalDate deadline
    );

    /**
     * Find recently posted opportunities.
     */
    @Query("""
        SELECT o FROM Opportunity o
        WHERE o.status = 'ACTIVE'
        AND o.postedDate >= :since
        ORDER BY o.postedDate DESC
        """)
    Page<Opportunity> findRecentlyPosted(
        @Param("since") LocalDate since,
        Pageable pageable
    );

    /**
     * Search opportunities by keyword in title or description.
     */
    @Query("""
        SELECT o FROM Opportunity o
        WHERE o.status = 'ACTIVE'
        AND (LOWER(o.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Opportunity> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find opportunities by state (place of performance).
     */
    Page<Opportunity> findByPlaceOfPerformanceState(String state, Pageable pageable);

    /**
     * Count SBIR opportunities.
     */
    long countByIsSbirTrue();

    /**
     * Count STTR opportunities.
     */
    long countByIsSttrTrue();

    /**
     * Count active opportunities.
     */
    long countByStatus(OpportunityStatus status);

    /**
     * Count opportunities by NAICS code.
     */
    long countByNaicsCode(String naicsCode);

    /**
     * Get distinct agencies.
     */
    @Query("SELECT DISTINCT o.agency FROM Opportunity o WHERE o.agency IS NOT NULL ORDER BY o.agency")
    List<String> findDistinctAgencies();

    /**
     * Get distinct set-aside types.
     */
    @Query("SELECT DISTINCT o.setAsideType FROM Opportunity o WHERE o.setAsideType IS NOT NULL ORDER BY o.setAsideType")
    List<String> findDistinctSetAsideTypes();

    /**
     * Get distinct NAICS codes.
     */
    @Query("SELECT DISTINCT o.naicsCode FROM Opportunity o WHERE o.naicsCode IS NOT NULL ORDER BY o.naicsCode")
    List<String> findDistinctNaicsCodes();

    /**
     * Statistics query for dashboard.
     */
    @Query("""
        SELECT COUNT(o)
        FROM Opportunity o
        WHERE o.status = 'ACTIVE'
        AND o.responseDeadLine >= :today
        """)
    long countActiveOpportunities(@Param("today") LocalDate today);

    // ============================================
    // CONTRACT LEVEL QUERIES
    // ============================================

    /**
     * Find by contract level.
     */
    Page<Opportunity> findByContractLevel(Opportunity.ContractLevel level, Pageable pageable);

    /**
     * Find DoD opportunities (by level or flag).
     */
    @Query("SELECT o FROM Opportunity o WHERE o.contractLevel = :level OR o.isDod = true")
    Page<Opportunity> findByContractLevelOrIsDodTrue(@Param("level") Opportunity.ContractLevel level, Pageable pageable);

    /**
     * Find by status and deadline before date (for archival/expiration).
     */
    List<Opportunity> findByStatusAndResponseDeadLineBefore(OpportunityStatus status, LocalDate deadline);

    /**
     * Find opportunities requiring clearance.
     */
    Page<Opportunity> findByClearanceRequiredIsNotNull(Pageable pageable);

    /**
     * Find ITAR-controlled opportunities.
     */
    Page<Opportunity> findByItarControlledTrue(Pageable pageable);

    /**
     * Find CUI-required opportunities.
     */
    Page<Opportunity> findByCuiRequiredTrue(Pageable pageable);

    /**
     * Find by data source.
     */
    Page<Opportunity> findByDataSource(Opportunity.DataSource source, Pageable pageable);

    /**
     * Find by state agency (for state-level opportunities).
     */
    Page<Opportunity> findByStateAgencyContainingIgnoreCase(String stateAgency, Pageable pageable);

    /**
     * Find by local entity (for local-level opportunities).
     */
    Page<Opportunity> findByLocalEntityContainingIgnoreCase(String localEntity, Pageable pageable);

    /**
     * Count by contract level.
     */
    long countByContractLevel(Opportunity.ContractLevel level);

    /**
     * Count DoD opportunities.
     */
    long countByIsDodTrue();

    /**
     * Count ITAR opportunities.
     */
    long countByItarControlledTrue();

    /**
     * Get distinct state agencies.
     */
    @Query("SELECT DISTINCT o.stateAgency FROM Opportunity o WHERE o.stateAgency IS NOT NULL ORDER BY o.stateAgency")
    List<String> findDistinctStateAgencies();

    /**
     * Get distinct local entities.
     */
    @Query("SELECT DISTINCT o.localEntity FROM Opportunity o WHERE o.localEntity IS NOT NULL ORDER BY o.localEntity")
    List<String> findDistinctLocalEntities();

    /**
     * Full-text search across multiple fields (advanced search).
     */
    @Query("""
        SELECT o FROM Opportunity o
        WHERE o.status = 'ACTIVE'
        AND (LOWER(o.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.agency) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.naicsDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.solicitationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Opportunity> fullTextSearch(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find opportunities by multiple NAICS codes.
     */
    @Query("SELECT o FROM Opportunity o WHERE o.naicsCode IN :naicsCodes AND o.status = 'ACTIVE'")
    Page<Opportunity> findByNaicsCodeIn(@Param("naicsCodes") List<String> naicsCodes, Pageable pageable);

    /**
     * Find opportunities by estimated value range.
     */
    @Query("""
        SELECT o FROM Opportunity o
        WHERE o.status = 'ACTIVE'
        AND (o.estimatedValueLow >= :minValue OR o.estimatedValueHigh >= :minValue)
        AND (o.estimatedValueLow <= :maxValue OR o.estimatedValueHigh <= :maxValue)
        """)
    Page<Opportunity> findByEstimatedValueRange(
        @Param("minValue") java.math.BigDecimal minValue,
        @Param("maxValue") java.math.BigDecimal maxValue,
        Pageable pageable
    );
}
