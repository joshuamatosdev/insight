package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    Optional<UserSession> findByTokenHash(String tokenHash);

    @Query("""
        SELECT s FROM UserSession s
        WHERE s.user.id = :userId
        AND s.isActive = true
        AND s.revokedAt IS NULL
        ORDER BY s.lastActivityAt DESC
        """)
    List<UserSession> findActiveSessionsByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.user.id = :userId AND s.isActive = true AND s.revokedAt IS NULL")
    long countActiveSessionsByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("""
        UPDATE UserSession s
        SET s.isActive = false, s.revokedAt = :now, s.revokedReason = :reason
        WHERE s.user.id = :userId AND s.isActive = true
        """)
    int revokeAllSessionsForUser(
        @Param("userId") UUID userId,
        @Param("now") Instant now,
        @Param("reason") String reason
    );

    @Modifying
    @Query("""
        UPDATE UserSession s
        SET s.isActive = false, s.revokedAt = :now, s.revokedReason = 'Expired'
        WHERE s.isActive = true AND s.expiresAt < :now
        """)
    int expireSessions(@Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.revokedAt IS NOT NULL AND s.revokedAt < :cutoff")
    int deleteRevokedSessionsBefore(@Param("cutoff") Instant cutoff);

    @Query("""
        SELECT s FROM UserSession s
        WHERE s.user.id = :userId
        ORDER BY s.createdAt DESC
        """)
    List<UserSession> findAllSessionsByUserId(@Param("userId") UUID userId);
}
