package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.OnboardingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for managing OnboardingProgress entities.
 */
@Repository
public interface OnboardingProgressRepository extends JpaRepository<OnboardingProgress, UUID> {

    /**
     * Find onboarding progress by tenant ID.
     */
    Optional<OnboardingProgress> findByTenantId(UUID tenantId);

    /**
     * Check if onboarding exists for a tenant.
     */
    boolean existsByTenantId(UUID tenantId);

    /**
     * Delete onboarding progress by tenant ID.
     */
    void deleteByTenantId(UUID tenantId);
}
