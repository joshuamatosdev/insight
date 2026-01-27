package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.SprintTask.TaskPriority;
import com.samgov.ingestor.model.SprintTask.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CreateTaskRequest(
    @NotBlank(message = "Task title is required")
    @Size(max = 200, message = "Task title must be at most 200 characters")
    String title,

    @Size(max = 2000, message = "Description must be at most 2000 characters")
    String description,

    TaskStatus status,

    TaskPriority priority,

    Integer storyPoints,

    UUID assigneeId,

    Instant dueDate,

    @Size(max = 500, message = "Labels must be at most 500 characters")
    String labels
) {}
