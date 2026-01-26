package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.PipelineOpportunity;
import com.samgov.ingestor.model.PipelineOpportunity.BidDecision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PipelineOpportunityRepository extends JpaRepository<PipelineOpportunity, UUID>, JpaSpecificationExecutor<PipelineOpportunity> {

    Page<PipelineOpportunity> findByPipelineId(UUID pipelineId, Pageable pageable);

    Page<PipelineOpportunity> findByPipelineIdAndStageId(UUID pipelineId, UUID stageId, Pageable pageable);

    List<PipelineOpportunity> findByStageId(UUID stageId);

    Optional<PipelineOpportunity> findByPipelineIdAndOpportunityId(UUID pipelineId, String opportunityId);

    Optional<PipelineOpportunity> findByTenantIdAndId(UUID tenantId, UUID id);

    boolean existsByPipelineIdAndOpportunityId(UUID pipelineId, String opportunityId);

    Page<PipelineOpportunity> findByTenantId(UUID tenantId, Pageable pageable);

    Page<PipelineOpportunity> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<PipelineOpportunity> findByPipelineIdAndDecision(UUID pipelineId, BidDecision decision, Pageable pageable);

    @Query("""
        SELECT po FROM PipelineOpportunity po
        LEFT JOIN FETCH po.opportunity
        LEFT JOIN FETCH po.stage
        WHERE po.pipeline.id = :pipelineId
        """)
    List<PipelineOpportunity> findByPipelineIdWithDetails(@Param("pipelineId") UUID pipelineId);

    @Query("SELECT SUM(po.estimatedValue) FROM PipelineOpportunity po WHERE po.pipeline.id = :pipelineId")
    Optional<BigDecimal> sumEstimatedValueByPipelineId(@Param("pipelineId") UUID pipelineId);

    @Query("SELECT SUM(po.weightedValue) FROM PipelineOpportunity po WHERE po.pipeline.id = :pipelineId")
    Optional<BigDecimal> sumWeightedValueByPipelineId(@Param("pipelineId") UUID pipelineId);

    @Query("SELECT SUM(po.estimatedValue) FROM PipelineOpportunity po WHERE po.stage.id = :stageId")
    Optional<BigDecimal> sumEstimatedValueByStageId(@Param("stageId") UUID stageId);

    @Query("SELECT SUM(po.weightedValue) FROM PipelineOpportunity po WHERE po.stage.id = :stageId")
    Optional<BigDecimal> sumWeightedValueByStageId(@Param("stageId") UUID stageId);

    @Query("SELECT COUNT(po) FROM PipelineOpportunity po WHERE po.pipeline.id = :pipelineId")
    long countByPipelineId(@Param("pipelineId") UUID pipelineId);

    @Query("SELECT COUNT(po) FROM PipelineOpportunity po WHERE po.stage.id = :stageId")
    long countByStageId(@Param("stageId") UUID stageId);

    @Query("SELECT COUNT(po) FROM PipelineOpportunity po WHERE po.pipeline.id = :pipelineId AND po.decision = :decision")
    long countByPipelineIdAndDecision(@Param("pipelineId") UUID pipelineId, @Param("decision") BidDecision decision);

    @Query("""
        SELECT po FROM PipelineOpportunity po
        LEFT JOIN FETCH po.opportunity
        LEFT JOIN FETCH po.stage
        WHERE po.pipeline.id = :pipelineId
        AND po.stageEnteredAt < :threshold
        """)
    List<PipelineOpportunity> findStaleOpportunities(
        @Param("pipelineId") UUID pipelineId,
        @Param("threshold") Instant threshold
    );

    @Query("""
        SELECT po FROM PipelineOpportunity po
        JOIN FETCH po.opportunity o
        LEFT JOIN FETCH po.stage
        WHERE po.pipeline.id = :pipelineId
        AND o.responseDeadLine IS NOT NULL
        AND o.responseDeadLine <= :deadline
        ORDER BY o.responseDeadLine ASC
        """)
    List<PipelineOpportunity> findApproachingDeadlines(
        @Param("pipelineId") UUID pipelineId,
        @Param("deadline") LocalDate deadline
    );

    void deleteByPipelineId(UUID pipelineId);

    void deleteByStageId(UUID stageId);

    // Analytics queries
    @Query("SELECT SUM(po.estimatedValue) FROM PipelineOpportunity po WHERE po.tenant.id = :tenantId")
    Optional<BigDecimal> sumEstimatedValueByTenantId(@Param("tenantId") UUID tenantId);

    @Query("""
        SELECT po FROM PipelineOpportunity po
        LEFT JOIN FETCH po.opportunity
        LEFT JOIN FETCH po.stage
        WHERE po.tenant.id = :tenantId
        """)
    List<PipelineOpportunity> findByTenantIdWithDetails(@Param("tenantId") UUID tenantId);
}
