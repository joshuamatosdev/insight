package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Query("""
        SELECT prt FROM PasswordResetToken prt
        WHERE prt.user.id = :userId
        AND prt.usedAt IS NULL
        AND prt.expiresAt > :now
        ORDER BY prt.createdAt DESC
        """)
    Optional<PasswordResetToken> findValidTokenByUserId(
        @Param("userId") UUID userId,
        @Param("now") Instant now
    );

    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}
