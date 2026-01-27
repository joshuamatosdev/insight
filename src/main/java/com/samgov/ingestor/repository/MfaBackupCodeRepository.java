package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.MfaBackupCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MfaBackupCodeRepository extends JpaRepository<MfaBackupCode, UUID> {

    /**
     * Find all backup codes for a user
     */
    List<MfaBackupCode> findByUserId(UUID userId);

    /**
     * Find unused backup codes for a user
     */
    List<MfaBackupCode> findByUserIdAndUsedFalse(UUID userId);

    /**
     * Count remaining unused backup codes
     */
    long countByUserIdAndUsedFalse(UUID userId);

    /**
     * Delete all backup codes for a user
     */
    @Modifying
    @Query("DELETE FROM MfaBackupCode c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}
