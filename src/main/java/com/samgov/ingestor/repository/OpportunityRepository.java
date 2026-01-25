package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA repository for Opportunity entities.
 * No @Repository annotation needed - Spring Data auto-detects JpaRepository interfaces.
 */
public interface OpportunityRepository extends JpaRepository<Opportunity, String> {

    Optional<Opportunity> findBySolicitationNumber(String solicitationNumber);
}
