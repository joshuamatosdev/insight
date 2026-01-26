package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Competitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompetitorRepository extends JpaRepository<Competitor, UUID> {

    Page<Competitor> findByTenantId(UUID tenantId, Pageable pageable);

    List<Competitor> findByTenantIdAndIsActiveTrue(UUID tenantId);

    Optional<Competitor> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<Competitor> findByTenantIdAndUei(UUID tenantId, String uei);

    Optional<Competitor> findByTenantIdAndCageCode(UUID tenantId, String cageCode);

    @Query("SELECT c FROM Competitor c WHERE c.tenant.id = :tenantId AND " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Competitor> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT c FROM Competitor c WHERE c.tenant.id = :tenantId AND " +
           "c.primaryNaicsCodes LIKE %:naicsCode%")
    List<Competitor> findByTenantIdAndNaicsCode(@Param("tenantId") UUID tenantId, @Param("naicsCode") String naicsCode);

    @Query("SELECT c FROM Competitor c WHERE c.tenant.id = :tenantId ORDER BY c.totalContractValue DESC")
    List<Competitor> findTopCompetitorsByContractValue(@Param("tenantId") UUID tenantId, Pageable pageable);

    @Query("SELECT c FROM Competitor c WHERE c.tenant.id = :tenantId ORDER BY c.winRate DESC NULLS LAST")
    List<Competitor> findTopCompetitorsByWinRate(@Param("tenantId") UUID tenantId, Pageable pageable);

    long countByTenantId(UUID tenantId);

    long countByTenantIdAndIsActiveTrue(UUID tenantId);

    boolean existsByTenantIdAndUei(UUID tenantId, String uei);
}
