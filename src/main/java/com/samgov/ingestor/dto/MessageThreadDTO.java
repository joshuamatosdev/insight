package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.MessageThread;
import com.samgov.ingestor.model.MessageThreadParticipant;
import com.samgov.ingestor.model.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for message thread data transfer.
 */
public record MessageThreadDTO(
    UUID id,
    String subject,
    UUID creatorId,
    List<ParticipantDTO> participants,
    int unreadCount,
    Instant lastMessageAt,
    Instant createdAt,
    String lastMessagePreview
) {
    /**
     * Create a MessageThreadDTO from a MessageThread entity.
     */
    public static MessageThreadDTO fromEntity(
        MessageThread entity,
        List<MessageThreadParticipant> participants,
        List<User> participantUsers,
        int unreadCount,
        String lastMessagePreview
    ) {
        List<ParticipantDTO> participantDTOs = participants.stream()
            .map(p -> {
                User user = participantUsers.stream()
                    .filter(u -> u.getId().equals(p.getUserId()))
                    .findFirst()
                    .orElse(null);
                return ParticipantDTO.fromEntity(p, user);
            })
            .toList();

        return new MessageThreadDTO(
            entity.getId(),
            entity.getSubject(),
            entity.getCreatorId(),
            participantDTOs,
            unreadCount,
            entity.getLastMessageAt(),
            entity.getCreatedAt(),
            lastMessagePreview
        );
    }

    /**
     * DTO for thread participant information.
     */
    public record ParticipantDTO(
        UUID userId,
        String name,
        String email,
        Instant joinedAt
    ) {
        public static ParticipantDTO fromEntity(MessageThreadParticipant participant, User user) {
            return new ParticipantDTO(
                participant.getUserId(),
                user != null ? user.getFullName() : "Unknown User",
                user != null ? user.getEmail() : null,
                participant.getJoinedAt()
            );
        }
    }
}
