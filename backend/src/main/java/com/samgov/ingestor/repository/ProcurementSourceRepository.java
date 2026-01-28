package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.ProcurementSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProcurementSourceRepository extends JpaRepository<ProcurementSource, UUID> {

    Optional<ProcurementSource> findByShortCode(String shortCode);

    List<ProcurementSource> findByIsActiveTrue();

    List<ProcurementSource> findByContractLevel(Opportunity.ContractLevel level);

    List<ProcurementSource> findByContractLevelAndIsActiveTrue(Opportunity.ContractLevel level);

    List<ProcurementSource> findByStateCode(String stateCode);

    List<ProcurementSource> findByStateCodeAndIsActiveTrue(String stateCode);

    List<ProcurementSource> findBySourceType(ProcurementSource.SourceType sourceType);

    @Query("SELECT ps FROM ProcurementSource ps WHERE ps.isActive = true AND " +
           "(ps.lastIngestionAt IS NULL OR ps.lastIngestionAt < :cutoff)")
    List<ProcurementSource> findDueForIngestion(@Param("cutoff") Instant cutoff);

    @Query("SELECT DISTINCT ps.stateCode FROM ProcurementSource ps WHERE ps.stateCode IS NOT NULL ORDER BY ps.stateCode")
    List<String> findDistinctStateCodes();

    long countByIsActiveTrue();

    long countByContractLevel(Opportunity.ContractLevel level);
}
