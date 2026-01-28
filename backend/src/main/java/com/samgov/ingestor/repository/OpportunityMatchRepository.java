package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.OpportunityMatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OpportunityMatchRepository extends JpaRepository<OpportunityMatch, UUID> {

    Optional<OpportunityMatch> findByTenantIdAndOpportunityId(UUID tenantId, String opportunityId);

    Page<OpportunityMatch> findByTenantId(UUID tenantId, Pageable pageable);

    Page<OpportunityMatch> findByTenantIdAndMatchStatus(UUID tenantId, OpportunityMatch.MatchStatus status, Pageable pageable);

    @Query("SELECT om FROM OpportunityMatch om WHERE om.tenant.id = :tenantId ORDER BY om.overallScore DESC")
    Page<OpportunityMatch> findByTenantIdOrderByScoreDesc(@Param("tenantId") UUID tenantId, Pageable pageable);

    @Query("SELECT om FROM OpportunityMatch om WHERE om.tenant.id = :tenantId AND om.overallScore >= :minScore ORDER BY om.overallScore DESC")
    List<OpportunityMatch> findHighScoreMatches(@Param("tenantId") UUID tenantId, @Param("minScore") BigDecimal minScore);

    @Query("SELECT om FROM OpportunityMatch om WHERE om.tenant.id = :tenantId AND om.matchStatus = 'NEW' ORDER BY om.overallScore DESC")
    List<OpportunityMatch> findNewMatchesForReview(@Param("tenantId") UUID tenantId, Pageable pageable);

    @Query("SELECT COUNT(om) FROM OpportunityMatch om WHERE om.tenant.id = :tenantId AND om.matchStatus = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") OpportunityMatch.MatchStatus status);

    @Query("SELECT AVG(om.overallScore) FROM OpportunityMatch om WHERE om.tenant.id = :tenantId")
    BigDecimal findAverageScoreByTenantId(@Param("tenantId") UUID tenantId);

    void deleteByTenantIdAndOpportunityId(UUID tenantId, String opportunityId);
}
