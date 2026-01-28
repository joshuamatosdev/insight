package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.Message;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for message data transfer.
 */
public record MessageDTO(
    UUID id,
    UUID threadId,
    UUID senderId,
    String senderName,
    String senderEmail,
    UUID recipientId,
    String recipientName,
    String recipientEmail,
    String content,
    boolean isRead,
    Instant createdAt
) {
    /**
     * Create a MessageDTO from a Message entity.
     */
    public static MessageDTO fromEntity(Message entity) {
        return new MessageDTO(
            entity.getId(),
            entity.getThread().getId(),
            entity.getSender().getId(),
            entity.getSender().getFullName(),
            entity.getSender().getEmail(),
            entity.getRecipient() != null ? entity.getRecipient().getId() : null,
            entity.getRecipient() != null ? entity.getRecipient().getFullName() : null,
            entity.getRecipient() != null ? entity.getRecipient().getEmail() : null,
            entity.getContent(),
            entity.getIsRead(),
            entity.getCreatedAt()
        );
    }
}
