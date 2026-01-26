package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Interaction;
import com.samgov.ingestor.model.Interaction.InteractionOutcome;
import com.samgov.ingestor.model.Interaction.InteractionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, UUID> {

    Page<Interaction> findByTenantIdOrderByInteractionDateDesc(UUID tenantId, Pageable pageable);

    Optional<Interaction> findByTenantIdAndId(UUID tenantId, UUID id);

    // By contact
    Page<Interaction> findByContactIdOrderByInteractionDateDesc(UUID contactId, Pageable pageable);

    List<Interaction> findByContactIdOrderByInteractionDateDesc(UUID contactId);

    // By organization
    Page<Interaction> findByOrganizationIdOrderByInteractionDateDesc(UUID organizationId, Pageable pageable);

    List<Interaction> findByOrganizationIdOrderByInteractionDateDesc(UUID organizationId);

    // By opportunity
    List<Interaction> findByOpportunityIdOrderByInteractionDateDesc(String opportunityId);

    // By contract
    List<Interaction> findByContractIdOrderByInteractionDateDesc(UUID contractId);

    // By type
    Page<Interaction> findByTenantIdAndInteractionTypeOrderByInteractionDateDesc(
        UUID tenantId,
        InteractionType interactionType,
        Pageable pageable
    );

    // By outcome
    Page<Interaction> findByTenantIdAndOutcomeOrderByInteractionDateDesc(
        UUID tenantId,
        InteractionOutcome outcome,
        Pageable pageable
    );

    // By logged user
    Page<Interaction> findByLoggedByIdOrderByInteractionDateDesc(UUID userId, Pageable pageable);

    // Date range
    @Query("""
        SELECT i FROM Interaction i
        WHERE i.tenant.id = :tenantId
        AND i.interactionDate >= :startDate
        AND i.interactionDate <= :endDate
        ORDER BY i.interactionDate DESC
        """)
    Page<Interaction> findByDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    // Pending follow-ups
    @Query("""
        SELECT i FROM Interaction i
        WHERE i.tenant.id = :tenantId
        AND i.followUpRequired = true
        AND i.followUpCompleted = false
        AND i.followUpDate <= :date
        ORDER BY i.followUpDate ASC
        """)
    List<Interaction> findPendingFollowups(
        @Param("tenantId") UUID tenantId,
        @Param("date") LocalDate date
    );

    // Overdue follow-ups
    @Query("""
        SELECT i FROM Interaction i
        WHERE i.tenant.id = :tenantId
        AND i.followUpRequired = true
        AND i.followUpCompleted = false
        AND i.followUpDate < :today
        ORDER BY i.followUpDate ASC
        """)
    List<Interaction> findOverdueFollowups(
        @Param("tenantId") UUID tenantId,
        @Param("today") LocalDate today
    );

    // Search
    @Query("""
        SELECT i FROM Interaction i
        WHERE i.tenant.id = :tenantId
        AND (LOWER(i.subject) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(i.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY i.interactionDate DESC
        """)
    Page<Interaction> searchInteractions(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    // Count by type
    @Query("SELECT COUNT(i) FROM Interaction i WHERE i.tenant.id = :tenantId AND i.interactionType = :type")
    long countByTenantIdAndInteractionType(@Param("tenantId") UUID tenantId, @Param("type") InteractionType type);

    // Count interactions in date range
    @Query("""
        SELECT COUNT(i) FROM Interaction i
        WHERE i.tenant.id = :tenantId
        AND i.interactionDate >= :startDate
        AND i.interactionDate <= :endDate
        """)
    long countByDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Recent interactions for a contact
    @Query("""
        SELECT i FROM Interaction i
        WHERE i.contact.id = :contactId
        ORDER BY i.interactionDate DESC
        """)
    Page<Interaction> findRecentByContact(@Param("contactId") UUID contactId, Pageable pageable);

    // Activity feed (most recent across all)
    @Query("""
        SELECT i FROM Interaction i
        WHERE i.tenant.id = :tenantId
        ORDER BY i.createdAt DESC
        """)
    Page<Interaction> findActivityFeed(@Param("tenantId") UUID tenantId, Pageable pageable);
}
