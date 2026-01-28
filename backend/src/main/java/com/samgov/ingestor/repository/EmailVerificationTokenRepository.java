package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now OR t.usedAt IS NOT NULL")
    int deleteExpiredTokens(@Param("now") Instant now);

    boolean existsByUserIdAndUsedAtIsNull(UUID userId);
}
