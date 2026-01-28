package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.MfaSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MfaSettingsRepository extends JpaRepository<MfaSettings, UUID> {

    /**
     * Find MFA settings by user ID
     */
    Optional<MfaSettings> findByUserId(UUID userId);

    /**
     * Check if MFA is enabled for a user
     */
    boolean existsByUserIdAndEnabledTrue(UUID userId);

    /**
     * Delete MFA settings for a user
     */
    void deleteByUserId(UUID userId);
}
