package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.SprintTask;
import com.samgov.ingestor.model.SprintTask.TaskPriority;
import com.samgov.ingestor.model.SprintTask.TaskStatus;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record SprintTaskDto(
    UUID id,
    UUID sprintId,
    String title,
    String description,
    TaskStatus status,
    TaskPriority priority,
    Integer storyPoints,
    Integer position,
    UUID assigneeId,
    String assigneeName,
    Instant dueDate,
    String labels,
    Instant createdAt,
    Instant updatedAt
) {
    public static SprintTaskDto fromEntity(SprintTask entity) {
        return SprintTaskDto.builder()
            .id(entity.getId())
            .sprintId(entity.getSprint().getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .status(entity.getStatus())
            .priority(entity.getPriority())
            .storyPoints(entity.getStoryPoints())
            .position(entity.getPosition())
            .assigneeId(entity.getAssignee() != null ? entity.getAssignee().getId() : null)
            .assigneeName(entity.getAssignee() != null
                ? entity.getAssignee().getFirstName() + " " + entity.getAssignee().getLastName()
                : null)
            .dueDate(entity.getDueDate())
            .labels(entity.getLabels())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
