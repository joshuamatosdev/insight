package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.SbirAward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for SbirAward entities.
 */
public interface SbirAwardRepository extends JpaRepository<SbirAward, String> {

    /**
     * Find by agency tracking number and agency.
     */
    Optional<SbirAward> findByAgencyTrackingNumberAndAgency(String agencyTrackingNumber, String agency);

    /**
     * Find all awards by agency.
     */
    List<SbirAward> findByAgency(String agency);

    /**
     * Find all awards by phase.
     */
    List<SbirAward> findByPhase(String phase);

    /**
     * Find SBIR awards only.
     */
    List<SbirAward> findByIsSbirTrue();

    /**
     * Find STTR awards only.
     */
    List<SbirAward> findByIsSttrTrue();

    /**
     * Find by award year.
     */
    List<SbirAward> findByAwardYear(Integer year);

    /**
     * Find by program type (SBIR or STTR).
     */
    List<SbirAward> findByProgram(String program);

    /**
     * Search by keyword in title, abstract, or research keywords.
     */
    @Query("SELECT a FROM SbirAward a WHERE " +
           "LOWER(a.awardTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.abstractText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.researchKeywords) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<SbirAward> searchByKeyword(@Param("keyword") String keyword);

    /**
     * Find recent awards (current and previous year).
     */
    @Query("SELECT a FROM SbirAward a WHERE a.awardYear >= :startYear ORDER BY a.proposalAwardDate DESC")
    List<SbirAward> findRecentAwards(@Param("startYear") Integer startYear);

    /**
     * Count by agency.
     */
    long countByAgency(String agency);

    /**
     * Count by phase.
     */
    long countByPhase(String phase);

    /**
     * Get distinct agencies.
     */
    @Query("SELECT DISTINCT a.agency FROM SbirAward a WHERE a.agency IS NOT NULL ORDER BY a.agency")
    List<String> findDistinctAgencies();

    /**
     * Get distinct phases.
     */
    @Query("SELECT DISTINCT a.phase FROM SbirAward a WHERE a.phase IS NOT NULL ORDER BY a.phase")
    List<String> findDistinctPhases();
}
