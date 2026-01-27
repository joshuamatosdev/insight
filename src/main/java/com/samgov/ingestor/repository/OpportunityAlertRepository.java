package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.OpportunityAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OpportunityAlertRepository extends JpaRepository<OpportunityAlert, UUID> {

    /**
     * Find all alerts for a user.
     */
    Page<OpportunityAlert> findByUserId(UUID userId, Pageable pageable);

    /**
     * Find all enabled alerts for a user.
     */
    List<OpportunityAlert> findByUserIdAndEnabledTrue(UUID userId);

    /**
     * Find all enabled alerts (for background processing).
     */
    List<OpportunityAlert> findByEnabledTrue();

    /**
     * Find alert by id and user id (for ownership validation).
     */
    Optional<OpportunityAlert> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Count alerts for a user.
     */
    long countByUserId(UUID userId);

    /**
     * Count enabled alerts for a user.
     */
    long countByUserIdAndEnabledTrue(UUID userId);

    /**
     * Find alerts by tenant.
     */
    Page<OpportunityAlert> findByTenantId(UUID tenantId, Pageable pageable);

    /**
     * Find enabled alerts by tenant.
     */
    List<OpportunityAlert> findByTenantIdAndEnabledTrue(UUID tenantId);

    /**
     * Check if alert name exists for user (to prevent duplicates).
     */
    boolean existsByUserIdAndName(UUID userId, String name);

    /**
     * Check if alert name exists for user, excluding a specific alert (for updates).
     */
    @Query("SELECT COUNT(a) > 0 FROM OpportunityAlert a WHERE a.user.id = :userId AND a.name = :name AND a.id != :excludeId")
    boolean existsByUserIdAndNameExcludingId(@Param("userId") UUID userId, @Param("name") String name, @Param("excludeId") UUID excludeId);
}
