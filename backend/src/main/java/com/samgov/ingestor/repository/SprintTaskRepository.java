package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.SprintTask;
import com.samgov.ingestor.model.SprintTask.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SprintTaskRepository extends JpaRepository<SprintTask, UUID> {

    List<SprintTask> findBySprintIdOrderByPositionAsc(UUID sprintId);

    Page<SprintTask> findBySprintId(UUID sprintId, Pageable pageable);

    Optional<SprintTask> findBySprintIdAndId(UUID sprintId, UUID taskId);

    List<SprintTask> findBySprintIdAndStatus(UUID sprintId, TaskStatus status);

    List<SprintTask> findByAssigneeId(UUID assigneeId);

    long countBySprintId(UUID sprintId);

    long countBySprintIdAndStatus(UUID sprintId, TaskStatus status);

    @Query("SELECT MAX(t.position) FROM SprintTask t WHERE t.sprint.id = :sprintId")
    Optional<Integer> findMaxPositionBySprintId(@Param("sprintId") UUID sprintId);

    @Modifying
    @Query("UPDATE SprintTask t SET t.position = t.position + 1 WHERE t.sprint.id = :sprintId AND t.position >= :position")
    void incrementPositionsFrom(@Param("sprintId") UUID sprintId, @Param("position") int position);

    @Modifying
    @Query("UPDATE SprintTask t SET t.position = t.position - 1 WHERE t.sprint.id = :sprintId AND t.position > :position")
    void decrementPositionsAfter(@Param("sprintId") UUID sprintId, @Param("position") int position);

    @Modifying
    @Query("DELETE FROM SprintTask t WHERE t.id = :taskId")
    void deleteTaskById(@Param("taskId") UUID taskId);

    @Query("SELECT COALESCE(SUM(t.storyPoints), 0) FROM SprintTask t WHERE t.sprint.id = :sprintId")
    Integer sumStoryPointsBySprintId(@Param("sprintId") UUID sprintId);

    @Query("SELECT COALESCE(SUM(t.storyPoints), 0) FROM SprintTask t WHERE t.sprint.id = :sprintId AND t.status = :status")
    Integer sumStoryPointsBySprintIdAndStatus(@Param("sprintId") UUID sprintId, @Param("status") TaskStatus status);
}
