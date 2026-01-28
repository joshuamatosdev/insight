package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.UserInvitation;
import com.samgov.ingestor.model.UserInvitation.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserInvitationRepository extends JpaRepository<UserInvitation, UUID> {

    Optional<UserInvitation> findByTokenHash(String tokenHash);

    @Query("""
        SELECT ui FROM UserInvitation ui
        WHERE ui.email = :email
        AND ui.tenant.id = :tenantId
        AND ui.status = :status
        """)
    Optional<UserInvitation> findByEmailAndTenantIdAndStatus(
        @Param("email") String email,
        @Param("tenantId") UUID tenantId,
        @Param("status") InvitationStatus status
    );

    @Query("""
        SELECT ui FROM UserInvitation ui
        WHERE ui.tenant.id = :tenantId
        AND ui.status = :status
        """)
    List<UserInvitation> findByTenantIdAndStatus(
        @Param("tenantId") UUID tenantId,
        @Param("status") InvitationStatus status
    );

    @Query("""
        SELECT ui FROM UserInvitation ui
        WHERE ui.tenant.id = :tenantId
        ORDER BY ui.createdAt DESC
        """)
    List<UserInvitation> findByTenantId(@Param("tenantId") UUID tenantId);

    @Modifying
    @Query("""
        UPDATE UserInvitation ui
        SET ui.status = 'EXPIRED'
        WHERE ui.status = 'PENDING'
        AND ui.expiresAt < :now
        """)
    int expireOldInvitations(@Param("now") Instant now);

    boolean existsByEmailAndTenantIdAndStatus(String email, UUID tenantId, InvitationStatus status);
}
