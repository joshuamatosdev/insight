package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.Tenant.SubscriptionTier;
import com.samgov.ingestor.model.Tenant.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findBySlug(String slug);

    Optional<Tenant> findByDomain(String domain);

    boolean existsBySlug(String slug);

    boolean existsByDomain(String domain);

    List<Tenant> findByStatus(TenantStatus status);

    List<Tenant> findBySubscriptionTier(SubscriptionTier tier);

    @Query("SELECT t FROM Tenant t WHERE t.trialEndsAt IS NOT NULL AND t.trialEndsAt < :now AND t.status = 'ACTIVE'")
    List<Tenant> findExpiredTrials(@Param("now") Instant now);

    @Query("SELECT t FROM Tenant t WHERE t.subscriptionEndsAt IS NOT NULL AND t.subscriptionEndsAt < :now AND t.status = 'ACTIVE'")
    List<Tenant> findExpiredSubscriptions(@Param("now") Instant now);

    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.status = :status")
    long countByStatus(@Param("status") TenantStatus status);
}
