package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.MessageDTO;
import com.samgov.ingestor.dto.MessageThreadDTO;
import com.samgov.ingestor.dto.SendMessageRequest;
import com.samgov.ingestor.dto.ThreadWithMessagesDTO;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Message;
import com.samgov.ingestor.model.MessageThread;
import com.samgov.ingestor.model.MessageThreadParticipant;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.MessageRepository;
import com.samgov.ingestor.repository.MessageThreadParticipantRepository;
import com.samgov.ingestor.repository.MessageThreadRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessagingService {

    private final MessageRepository messageRepository;
    private final MessageThreadRepository threadRepository;
    private final MessageThreadParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    /**
     * Get all threads for the current user with pagination.
     */
    @Transactional(readOnly = true)
    public Page<MessageThreadDTO> getThreads(Pageable pageable) {
        UUID userId = getCurrentUserIdOrThrow();

        return threadRepository.findThreadsByParticipantUserId(userId, pageable)
            .map(thread -> mapThreadToDTO(thread, userId));
    }

    /**
     * Get a thread by ID with all its messages.
     */
    @Transactional(readOnly = true)
    public ThreadWithMessagesDTO getThread(UUID threadId) {
        UUID userId = getCurrentUserIdOrThrow();

        MessageThread thread = threadRepository.findByIdAndParticipantUserId(threadId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Thread", threadId));

        List<MessageThreadParticipant> participants = participantRepository.findByThreadId(threadId);
        List<UUID> participantUserIds = participants.stream()
            .map(MessageThreadParticipant::getUserId)
            .toList();
        List<User> participantUsers = userRepository.findAllById(participantUserIds);
        List<Message> messages = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);

        return ThreadWithMessagesDTO.fromEntities(thread, participants, participantUsers, messages);
    }

    /**
     * Get messages in a thread with pagination.
     */
    @Transactional(readOnly = true)
    public Page<MessageDTO> getMessages(UUID threadId, Pageable pageable) {
        UUID userId = getCurrentUserIdOrThrow();

        MessageThread thread = threadRepository.findByIdAndParticipantUserId(threadId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Thread", threadId));

        return messageRepository.findByThreadOrderByCreatedAtDesc(thread, pageable)
            .map(MessageDTO::fromEntity);
    }

    /**
     * Send a new message, creating a thread if needed.
     */
    @Transactional
    public MessageDTO sendMessage(SendMessageRequest request) {
        UUID senderId = getCurrentUserIdOrThrow();
        UUID tenantId = getCurrentTenantIdOrThrow();

        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new IllegalStateException("Current user not found"));

        User recipient = userRepository.findById(request.recipientId())
            .orElseThrow(() -> new ResourceNotFoundException("Recipient", request.recipientId()));

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalStateException("Current tenant not found"));

        // Check if an existing thread exists between these users
        Optional<MessageThread> existingThread = threadRepository.findExistingThreadBetweenUsers(
            tenantId, senderId, request.recipientId()
        );

        MessageThread thread;
        if (existingThread.isPresent()) {
            thread = existingThread.get();
            thread.updateLastMessageAt();
            thread = threadRepository.save(thread);
        } else {
            // Create new thread
            thread = MessageThread.builder()
                .tenant(tenant)
                .creator(sender)
                .subject(request.subject())
                .build();
            thread = threadRepository.save(thread);

            // Add participants
            MessageThreadParticipant senderParticipant = MessageThreadParticipant.builder()
                .threadId(thread.getId())
                .userId(senderId)
                .unreadCount(0)
                .build();
            participantRepository.save(senderParticipant);

            MessageThreadParticipant recipientParticipant = MessageThreadParticipant.builder()
                .threadId(thread.getId())
                .userId(request.recipientId())
                .unreadCount(1)
                .build();
            participantRepository.save(recipientParticipant);
        }

        // Create message
        Message message = Message.builder()
            .tenant(tenant)
            .thread(thread)
            .sender(sender)
            .recipient(recipient)
            .content(request.content())
            .isRead(false)
            .build();
        message = messageRepository.save(message);

        // Update unread counts for other participants
        if (existingThread.isPresent()) {
            participantRepository.incrementUnreadForOtherParticipants(thread.getId(), senderId);
        }

        log.info("User {} sent message {} in thread {}", senderId, message.getId(), thread.getId());

        return MessageDTO.fromEntity(message);
    }

    /**
     * Reply to an existing thread.
     */
    @Transactional
    public MessageDTO replyToThread(UUID threadId, String content) {
        UUID senderId = getCurrentUserIdOrThrow();
        UUID tenantId = getCurrentTenantIdOrThrow();

        MessageThread thread = threadRepository.findByIdAndParticipantUserId(threadId, senderId)
            .orElseThrow(() -> new ResourceNotFoundException("Thread", threadId));

        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new IllegalStateException("Current user not found"));

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalStateException("Current tenant not found"));

        // Find other participant as recipient
        List<MessageThreadParticipant> participants = participantRepository.findByThreadId(threadId);
        User recipient = null;
        for (MessageThreadParticipant p : participants) {
            if (!p.getUserId().equals(senderId)) {
                recipient = userRepository.findById(p.getUserId()).orElse(null);
                break;
            }
        }

        // Update thread's last message time
        thread.updateLastMessageAt();
        threadRepository.save(thread);

        // Create message
        Message message = Message.builder()
            .tenant(tenant)
            .thread(thread)
            .sender(sender)
            .recipient(recipient)
            .content(content)
            .isRead(false)
            .build();
        message = messageRepository.save(message);

        // Update unread counts for other participants
        participantRepository.incrementUnreadForOtherParticipants(threadId, senderId);

        log.info("User {} replied with message {} in thread {}", senderId, message.getId(), threadId);

        return MessageDTO.fromEntity(message);
    }

    /**
     * Mark a message as read.
     */
    @Transactional
    public void markAsRead(UUID messageId) {
        UUID userId = getCurrentUserIdOrThrow();

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message", messageId));

        // Verify user is a participant in this thread
        if (!participantRepository.existsByThreadIdAndUserId(message.getThread().getId(), userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        message.markAsRead();
        messageRepository.save(message);

        log.debug("User {} marked message {} as read", userId, messageId);
    }

    /**
     * Mark all messages in a thread as read for the current user.
     */
    @Transactional
    public void markThreadAsRead(UUID threadId) {
        UUID userId = getCurrentUserIdOrThrow();

        // Verify user is a participant
        if (!participantRepository.existsByThreadIdAndUserId(threadId, userId)) {
            throw new ResourceNotFoundException("Thread", threadId);
        }

        participantRepository.markThreadAsReadForUser(threadId, userId);

        log.debug("User {} marked thread {} as read", userId, threadId);
    }

    /**
     * Get the count of unread messages for the current user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        UUID userId = getCurrentUserIdOrThrow();
        return participantRepository.getTotalUnreadCountForUser(userId);
    }

    /**
     * Delete a thread (soft delete).
     */
    @Transactional
    public void deleteThread(UUID threadId) {
        UUID userId = getCurrentUserIdOrThrow();

        MessageThread thread = threadRepository.findByIdAndParticipantUserId(threadId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Thread", threadId));

        // Verify user is the creator or implement other access control
        thread.markDeleted();
        threadRepository.save(thread);

        log.info("User {} deleted thread {}", userId, threadId);
    }

    /**
     * Search messages by content.
     */
    @Transactional(readOnly = true)
    public Page<MessageDTO> searchMessages(String query, Pageable pageable) {
        UUID userId = getCurrentUserIdOrThrow();

        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Search query cannot be empty");
        }

        return messageRepository.searchMessagesByContent(userId, query.trim(), pageable)
            .map(MessageDTO::fromEntity);
    }

    // Helper methods

    private UUID getCurrentUserIdOrThrow() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }
        return userId;
    }

    private UUID getCurrentTenantIdOrThrow() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context");
        }
        return tenantId;
    }

    private MessageThreadDTO mapThreadToDTO(MessageThread thread, UUID userId) {
        List<MessageThreadParticipant> participants = participantRepository.findByThreadId(thread.getId());
        List<UUID> participantUserIds = participants.stream()
            .map(MessageThreadParticipant::getUserId)
            .toList();
        List<User> participantUsers = userRepository.findAllById(participantUserIds);

        // Get unread count for current user
        int unreadCount = participants.stream()
            .filter(p -> p.getUserId().equals(userId))
            .findFirst()
            .map(MessageThreadParticipant::getUnreadCount)
            .orElse(0);

        // Get last message preview
        String lastMessagePreview = messageRepository.findFirstByThreadIdOrderByCreatedAtDesc(thread.getId())
            .map(m -> truncateContent(m.getContent(), 100))
            .orElse(null);

        return MessageThreadDTO.fromEntity(thread, participants, participantUsers, unreadCount, lastMessagePreview);
    }

    private String truncateContent(String content, int maxLength) {
        if (content == null || content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
}
