package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.PipelineStage;
import com.samgov.ingestor.model.PipelineStage.StageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PipelineStageRepository extends JpaRepository<PipelineStage, UUID> {

    List<PipelineStage> findByPipelineIdOrderByPositionAsc(UUID pipelineId);

    Optional<PipelineStage> findByPipelineIdAndId(UUID pipelineId, UUID id);

    Optional<PipelineStage> findByPipelineIdAndStageType(UUID pipelineId, StageType stageType);

    Optional<PipelineStage> findFirstByPipelineIdOrderByPositionAsc(UUID pipelineId);

    Optional<PipelineStage> findFirstByPipelineIdOrderByPositionDesc(UUID pipelineId);

    @Query("SELECT MAX(s.position) FROM PipelineStage s WHERE s.pipeline.id = :pipelineId")
    Optional<Integer> findMaxPositionByPipelineId(@Param("pipelineId") UUID pipelineId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE PipelineStage s SET s.position = s.position + 1 WHERE s.pipeline.id = :pipelineId AND s.position >= :position")
    void incrementPositionsFrom(@Param("pipelineId") UUID pipelineId, @Param("position") int position);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE PipelineStage s SET s.position = s.position - 1 WHERE s.pipeline.id = :pipelineId AND s.position > :position")
    void decrementPositionsAfter(@Param("pipelineId") UUID pipelineId, @Param("position") int position);

    long countByPipelineId(UUID pipelineId);

    boolean existsByPipelineIdAndName(UUID pipelineId, String name);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PipelineStage s WHERE s.id = :stageId")
    void deleteStageById(@Param("stageId") UUID stageId);
}
