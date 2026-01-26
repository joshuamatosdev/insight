package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.SavedOpportunity;
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
public interface SavedOpportunityRepository extends JpaRepository<SavedOpportunity, UUID> {

    Page<SavedOpportunity> findByUserId(UUID userId, Pageable pageable);

    Page<SavedOpportunity> findByUserIdAndTenantId(UUID userId, UUID tenantId, Pageable pageable);

    Optional<SavedOpportunity> findByUserIdAndOpportunityId(UUID userId, String opportunityId);

    boolean existsByUserIdAndOpportunityId(UUID userId, String opportunityId);

    void deleteByUserIdAndOpportunityId(UUID userId, String opportunityId);

    long countByUserId(UUID userId);

    @Query("""
        SELECT so FROM SavedOpportunity so
        JOIN FETCH so.opportunity o
        WHERE so.user.id = :userId
        AND o.responseDeadLine >= CURRENT_DATE
        ORDER BY o.responseDeadLine ASC
        """)
    List<SavedOpportunity> findActiveByUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT so.opportunity.id FROM SavedOpportunity so
        WHERE so.user.id = :userId
        """)
    List<String> findOpportunityIdsByUserId(@Param("userId") UUID userId);
}
