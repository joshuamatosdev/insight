package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Opportunity entities.
 * No @Repository annotation needed - Spring Data auto-detects JpaRepository interfaces.
 */
public interface OpportunityRepository extends JpaRepository<Opportunity, String> {

    Optional<Opportunity> findBySolicitationNumber(String solicitationNumber);
    
    /**
     * Find all SBIR opportunities.
     */
    List<Opportunity> findByIsSbirTrue();
    
    /**
     * Find all STTR opportunities.
     */
    List<Opportunity> findByIsSttrTrue();
    
    /**
     * Find all SBIR or STTR opportunities.
     */
    @Query("SELECT o FROM Opportunity o WHERE o.isSbir = true OR o.isSttr = true")
    List<Opportunity> findAllSbirSttr();
    
    /**
     * Find SBIR/STTR opportunities by phase.
     */
    @Query("SELECT o FROM Opportunity o WHERE (o.isSbir = true OR o.isSttr = true) AND o.sbirPhase = :phase")
    List<Opportunity> findSbirSttrByPhase(@Param("phase") String phase);
    
    /**
     * Count SBIR opportunities.
     */
    long countByIsSbirTrue();
    
    /**
     * Count STTR opportunities.
     */
    long countByIsSttrTrue();
}
