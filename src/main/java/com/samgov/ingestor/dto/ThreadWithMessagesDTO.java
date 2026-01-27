package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.Message;
import com.samgov.ingestor.model.MessageThread;
import com.samgov.ingestor.model.MessageThreadParticipant;
import com.samgov.ingestor.model.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for a thread with all its messages.
 */
public record ThreadWithMessagesDTO(
    UUID id,
    String subject,
    UUID creatorId,
    List<MessageThreadDTO.ParticipantDTO> participants,
    List<MessageDTO> messages,
    int totalMessages,
    Instant lastMessageAt,
    Instant createdAt
) {
    /**
     * Create a ThreadWithMessagesDTO from entities.
     */
    public static ThreadWithMessagesDTO fromEntities(
        MessageThread thread,
        List<MessageThreadParticipant> participants,
        List<User> participantUsers,
        List<Message> messages
    ) {
        List<MessageThreadDTO.ParticipantDTO> participantDTOs = participants.stream()
            .map(p -> {
                User user = participantUsers.stream()
                    .filter(u -> u.getId().equals(p.getUserId()))
                    .findFirst()
                    .orElse(null);
                return MessageThreadDTO.ParticipantDTO.fromEntity(p, user);
            })
            .toList();

        List<MessageDTO> messageDTOs = messages.stream()
            .map(MessageDTO::fromEntity)
            .toList();

        return new ThreadWithMessagesDTO(
            thread.getId(),
            thread.getSubject(),
            thread.getCreatorId(),
            participantDTOs,
            messageDTOs,
            messages.size(),
            thread.getLastMessageAt(),
            thread.getCreatedAt()
        );
    }
}
