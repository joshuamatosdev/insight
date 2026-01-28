package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.SavedSearch;
import com.samgov.ingestor.model.SavedSearch.AlertFrequency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedSearchRepository extends JpaRepository<SavedSearch, UUID> {

    List<SavedSearch> findByUserId(UUID userId);

    List<SavedSearch> findByUserIdAndTenantId(UUID userId, UUID tenantId);

    Optional<SavedSearch> findByUserIdAndIsDefaultTrue(UUID userId);

    @Query("""
        SELECT s FROM SavedSearch s
        WHERE s.alertEnabled = true
        AND s.alertFrequency = :frequency
        AND (s.lastAlertSentAt IS NULL OR s.lastAlertSentAt < :since)
        """)
    List<SavedSearch> findPendingAlerts(
        @Param("frequency") AlertFrequency frequency,
        @Param("since") Instant since
    );

    @Query("""
        SELECT s FROM SavedSearch s
        WHERE s.alertEnabled = true
        AND s.alertFrequency = 'INSTANT'
        """)
    List<SavedSearch> findInstantAlertSearches();

    long countByUserId(UUID userId);

    boolean existsByUserIdAndName(UUID userId, String name);
}
