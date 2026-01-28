package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.FeatureVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeatureVoteRepository extends JpaRepository<FeatureVote, UUID> {

    /**
     * Find a vote by feature request and user.
     */
    Optional<FeatureVote> findByFeatureRequestIdAndUserId(UUID featureRequestId, UUID userId);

    /**
     * Count total votes for a feature request.
     */
    long countByFeatureRequestId(UUID featureRequestId);

    /**
     * Delete a vote by feature request and user.
     */
    void deleteByFeatureRequestIdAndUserId(UUID featureRequestId, UUID userId);

    /**
     * Check if a user has already voted for a feature request.
     */
    boolean existsByFeatureRequestIdAndUserId(UUID featureRequestId, UUID userId);
}
