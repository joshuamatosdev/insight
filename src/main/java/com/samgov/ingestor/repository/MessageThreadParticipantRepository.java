package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.MessageThreadParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageThreadParticipantRepository extends JpaRepository<MessageThreadParticipant, UUID> {

    /**
     * Find all participants in a thread.
     */
    List<MessageThreadParticipant> findByThreadId(UUID threadId);

    /**
     * Find a specific participant by thread and user.
     */
    Optional<MessageThreadParticipant> findByThreadIdAndUserId(UUID threadId, UUID userId);

    /**
     * Check if a user is a participant in a thread.
     */
    boolean existsByThreadIdAndUserId(UUID threadId, UUID userId);

    /**
     * Get total unread count for a user across all threads.
     */
    @Query("SELECT COALESCE(SUM(p.unreadCount), 0) FROM MessageThreadParticipant p WHERE p.userId = :userId")
    long getTotalUnreadCountForUser(@Param("userId") UUID userId);

    /**
     * Increment unread count for all participants except the sender.
     */
    @Modifying
    @Query("""
        UPDATE MessageThreadParticipant p
        SET p.unreadCount = p.unreadCount + 1
        WHERE p.threadId = :threadId
        AND p.userId != :senderId
        """)
    int incrementUnreadForOtherParticipants(@Param("threadId") UUID threadId, @Param("senderId") UUID senderId);

    /**
     * Mark all messages in a thread as read for a user.
     */
    @Modifying
    @Query("""
        UPDATE MessageThreadParticipant p
        SET p.unreadCount = 0, p.lastReadAt = CURRENT_TIMESTAMP
        WHERE p.threadId = :threadId
        AND p.userId = :userId
        """)
    int markThreadAsReadForUser(@Param("threadId") UUID threadId, @Param("userId") UUID userId);

    /**
     * Delete all participants for a thread.
     */
    void deleteByThreadId(UUID threadId);
}
