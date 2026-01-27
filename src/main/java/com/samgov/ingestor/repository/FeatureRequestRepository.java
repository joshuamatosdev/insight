package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.FeatureRequest;
import com.samgov.ingestor.model.FeatureRequest.FeatureRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for FeatureRequest entities.
 */
public interface FeatureRequestRepository extends JpaRepository<FeatureRequest, UUID> {

    /**
     * Find a feature request by tenant and ID.
     */
    Optional<FeatureRequest> findByTenantIdAndId(UUID tenantId, UUID id);

    /**
     * Find all feature requests for a tenant.
     */
    Page<FeatureRequest> findByTenantId(UUID tenantId, Pageable pageable);

    /**
     * Find feature requests by tenant and status.
     */
    Page<FeatureRequest> findByTenantIdAndStatus(UUID tenantId, FeatureRequestStatus status, Pageable pageable);

    /**
     * Find feature requests submitted by a specific user.
     */
    Page<FeatureRequest> findByTenantIdAndSubmittedById(UUID tenantId, UUID submittedById, Pageable pageable);

    /**
     * Find top voted feature requests for a tenant.
     */
    @Query("""
        SELECT fr FROM FeatureRequest fr
        WHERE fr.tenant.id = :tenantId
        AND fr.status NOT IN ('COMPLETED', 'DECLINED', 'DUPLICATE')
        ORDER BY fr.voteCount DESC
        """)
    List<FeatureRequest> findTopVotedByTenantId(@Param("tenantId") UUID tenantId, Pageable pageable);

    /**
     * Find top voted feature requests across all tenants (for admin dashboard).
     */
    @Query("""
        SELECT fr FROM FeatureRequest fr
        WHERE fr.status NOT IN ('COMPLETED', 'DECLINED', 'DUPLICATE')
        ORDER BY fr.voteCount DESC
        """)
    List<FeatureRequest> findTopVoted(Pageable pageable);

    /**
     * Check if a user has voted for a feature request.
     */
    @Query("""
        SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END
        FROM FeatureRequest fr JOIN fr.voters v
        WHERE fr.id = :featureRequestId AND v.id = :userId
        """)
    boolean hasUserVoted(@Param("featureRequestId") UUID featureRequestId, @Param("userId") UUID userId);

    /**
     * Count feature requests by status for a tenant.
     */
    long countByTenantIdAndStatus(UUID tenantId, FeatureRequestStatus status);

    /**
     * Count all feature requests for a tenant.
     */
    long countByTenantId(UUID tenantId);

    /**
     * Search feature requests by keyword in title or description.
     */
    @Query("""
        SELECT fr FROM FeatureRequest fr
        WHERE fr.tenant.id = :tenantId
        AND (LOWER(fr.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(fr.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<FeatureRequest> searchByKeyword(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    /**
     * Find feature requests with a specific status, ordered by votes.
     */
    @Query("""
        SELECT fr FROM FeatureRequest fr
        WHERE fr.tenant.id = :tenantId
        AND fr.status = :status
        ORDER BY fr.voteCount DESC
        """)
    Page<FeatureRequest> findByTenantIdAndStatusOrderByVoteCountDesc(
        @Param("tenantId") UUID tenantId,
        @Param("status") FeatureRequestStatus status,
        Pageable pageable
    );

    /**
     * Find feature requests that the current user has voted for.
     */
    @Query("""
        SELECT fr FROM FeatureRequest fr
        JOIN fr.voters v
        WHERE fr.tenant.id = :tenantId AND v.id = :userId
        """)
    Page<FeatureRequest> findVotedByUser(
        @Param("tenantId") UUID tenantId,
        @Param("userId") UUID userId,
        Pageable pageable
    );
}
