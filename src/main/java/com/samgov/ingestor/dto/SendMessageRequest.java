package com.samgov.ingestor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to send a new message or start a new thread.
 */
public record SendMessageRequest(
    @NotNull(message = "Recipient ID is required")
    UUID recipientId,

    @NotBlank(message = "Subject is required")
    String subject,

    @NotBlank(message = "Content is required")
    String content
) {}
