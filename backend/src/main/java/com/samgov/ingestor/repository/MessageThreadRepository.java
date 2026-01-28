package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.MessageThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageThreadRepository extends JpaRepository<MessageThread, UUID> {

    /**
     * Find threads for a user (where they are a participant) with pagination.
     */
    @Query("""
        SELECT DISTINCT t FROM MessageThread t
        JOIN MessageThreadParticipant p ON p.threadId = t.id
        WHERE p.userId = :userId
        AND t.deleted = false
        ORDER BY t.lastMessageAt DESC
        """)
    Page<MessageThread> findThreadsByParticipantUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find a thread by ID if user is a participant.
     */
    @Query("""
        SELECT t FROM MessageThread t
        JOIN MessageThreadParticipant p ON p.threadId = t.id
        WHERE t.id = :threadId
        AND p.userId = :userId
        AND t.deleted = false
        """)
    Optional<MessageThread> findByIdAndParticipantUserId(
        @Param("threadId") UUID threadId,
        @Param("userId") UUID userId
    );

    /**
     * Find existing thread between two users.
     */
    @Query("""
        SELECT t FROM MessageThread t
        WHERE t.deleted = false
        AND t.tenant.id = :tenantId
        AND EXISTS (
            SELECT 1 FROM MessageThreadParticipant p1
            WHERE p1.threadId = t.id AND p1.userId = :userId1
        )
        AND EXISTS (
            SELECT 1 FROM MessageThreadParticipant p2
            WHERE p2.threadId = t.id AND p2.userId = :userId2
        )
        AND (SELECT COUNT(p) FROM MessageThreadParticipant p WHERE p.threadId = t.id) = 2
        ORDER BY t.lastMessageAt DESC
        """)
    Optional<MessageThread> findExistingThreadBetweenUsers(
        @Param("tenantId") UUID tenantId,
        @Param("userId1") UUID userId1,
        @Param("userId2") UUID userId2
    );

    /**
     * Search threads by subject containing query.
     */
    @Query("""
        SELECT DISTINCT t FROM MessageThread t
        JOIN MessageThreadParticipant p ON p.threadId = t.id
        WHERE p.userId = :userId
        AND t.deleted = false
        AND LOWER(t.subject) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY t.lastMessageAt DESC
        """)
    Page<MessageThread> searchThreadsBySubject(
        @Param("userId") UUID userId,
        @Param("query") String query,
        Pageable pageable
    );
}
