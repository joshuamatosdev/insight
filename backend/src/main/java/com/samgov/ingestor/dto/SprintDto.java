package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.Sprint;
import com.samgov.ingestor.model.Sprint.SprintStatus;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record SprintDto(
    UUID id,
    String name,
    String description,
    String goal,
    SprintStatus status,
    LocalDate startDate,
    LocalDate endDate,
    List<SprintTaskDto> tasks,
    Instant createdAt,
    Instant updatedAt
) {
    public static SprintDto fromEntity(Sprint entity, List<SprintTaskDto> tasks) {
        return SprintDto.builder()
            .id(entity.getId())
            .name(entity.getName())
            .description(entity.getDescription())
            .goal(entity.getGoal())
            .status(entity.getStatus())
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .tasks(tasks)
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
