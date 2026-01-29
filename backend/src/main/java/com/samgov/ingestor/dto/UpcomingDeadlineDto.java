package com.samgov.ingestor.dto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO representing a unified deadline from various sources.
 * Aggregates deadlines from deliverables, invoices, milestones, and compliance items.
 */
public record UpcomingDeadlineDto(
    UUID id,
    String title,
    DeadlineType type,
    String contractNumber,
    UUID contractId,
    LocalDate dueDate,
    Priority priority,
    String status
) {
    /**
     * Types of deadlines aggregated from different sources.
     */
    public enum DeadlineType {
        DELIVERABLE,
        INVOICE,
        MILESTONE,
        COMPLIANCE,
        MEETING,
        REVIEW
    }

    /**
     * Priority levels for deadlines.
     */
    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}
