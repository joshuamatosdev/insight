package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Message;
import com.samgov.ingestor.model.MessageThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    /**
     * Find all messages in a thread ordered by creation date ascending.
     */
    List<Message> findByThreadOrderByCreatedAtAsc(MessageThread thread);

    /**
     * Find all messages in a thread with pagination.
     */
    Page<Message> findByThreadOrderByCreatedAtDesc(MessageThread thread, Pageable pageable);

    /**
     * Find all messages in a thread by thread ID ordered by creation date ascending.
     */
    @Query("SELECT m FROM Message m WHERE m.thread.id = :threadId ORDER BY m.createdAt ASC")
    List<Message> findByThreadIdOrderByCreatedAtAsc(@Param("threadId") UUID threadId);

    /**
     * Count messages in a thread.
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.thread.id = :threadId")
    long countByThreadId(@Param("threadId") UUID threadId);

    /**
     * Search messages by content for a user's threads.
     */
    @Query("""
        SELECT m FROM Message m
        JOIN m.thread t
        JOIN MessageThreadParticipant p ON p.threadId = t.id
        WHERE p.userId = :userId
        AND t.deleted = false
        AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY m.createdAt DESC
        """)
    Page<Message> searchMessagesByContent(
        @Param("userId") UUID userId,
        @Param("query") String query,
        Pageable pageable
    );

    /**
     * Get the latest message in a thread.
     * Uses Spring Data derived query with automatic LIMIT 1 from findFirstBy prefix.
     */
    Optional<Message> findFirstByThreadIdOrderByCreatedAtDesc(UUID threadId);

    /**
     * Mark a message as read.
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.id = :messageId")
    int markAsRead(@Param("messageId") UUID messageId);

    /**
     * Find unread messages for a recipient.
     */
    @Query("SELECT m FROM Message m WHERE m.recipient.id = :recipientId AND m.isRead = false ORDER BY m.createdAt DESC")
    List<Message> findUnreadByRecipientId(@Param("recipientId") UUID recipientId);

    /**
     * Count unread messages for a recipient.
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient.id = :recipientId AND m.isRead = false")
    long countUnreadByRecipientId(@Param("recipientId") UUID recipientId);
}
