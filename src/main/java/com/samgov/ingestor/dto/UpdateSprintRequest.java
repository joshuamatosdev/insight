package com.samgov.ingestor.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateSprintRequest(
    @Size(max = 100, message = "Sprint name must be at most 100 characters")
    String name,

    @Size(max = 500, message = "Description must be at most 500 characters")
    String description,

    @Size(max = 500, message = "Goal must be at most 500 characters")
    String goal,

    LocalDate startDate,

    LocalDate endDate
) {}
