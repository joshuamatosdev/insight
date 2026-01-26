package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByStatus(UserStatus status);

    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.createdAt < :cutoff")
    List<User> findUnverifiedUsersBefore(@Param("cutoff") Instant cutoff);

    @Query("SELECT u FROM User u WHERE u.lastLoginAt < :cutoff AND u.status = 'ACTIVE'")
    List<User> findInactiveUsersBefore(@Param("cutoff") Instant cutoff);

    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatus(@Param("status") UserStatus status);

    @Query("""
        SELECT DISTINCT u FROM User u
        JOIN TenantMembership tm ON tm.user = u
        WHERE tm.tenant.id = :tenantId
        """)
    List<User> findByTenantId(@Param("tenantId") UUID tenantId);
}
