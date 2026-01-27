package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, UUID> {

    @Query("SELECT up FROM UserPreference up WHERE up.user.id = :userId")
    Optional<UserPreference> findByUserId(@Param("userId") UUID userId);

    boolean existsByUserId(UUID userId);
}
