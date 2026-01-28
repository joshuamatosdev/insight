package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.Sprint.SprintStatus;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

@Builder
public record SprintSummaryDto(
    UUID sprintId,
    String sprintName,
    SprintStatus status,
    long totalTasks,
    long todoCount,
    long inProgressCount,
    long inReviewCount,
    long doneCount,
    long blockedCount,
    int totalStoryPoints,
    int completedStoryPoints,
    LocalDate startDate,
    LocalDate endDate
) {}
