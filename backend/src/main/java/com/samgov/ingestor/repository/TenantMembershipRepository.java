package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.TenantMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantMembershipRepository extends JpaRepository<TenantMembership, UUID> {

    @Query("""
        SELECT tm FROM TenantMembership tm
        LEFT JOIN FETCH tm.role
        WHERE tm.user.id = :userId AND tm.tenant.id = :tenantId
        """)
    Optional<TenantMembership> findByUserIdAndTenantId(
        @Param("userId") UUID userId,
        @Param("tenantId") UUID tenantId
    );

    @Query("""
        SELECT tm FROM TenantMembership tm
        LEFT JOIN FETCH tm.tenant
        LEFT JOIN FETCH tm.role
        WHERE tm.user.id = :userId
        """)
    List<TenantMembership> findByUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT tm FROM TenantMembership tm
        LEFT JOIN FETCH tm.user
        LEFT JOIN FETCH tm.role
        WHERE tm.tenant.id = :tenantId
        """)
    List<TenantMembership> findByTenantId(@Param("tenantId") UUID tenantId);

    @Query("""
        SELECT tm FROM TenantMembership tm
        LEFT JOIN FETCH tm.tenant
        LEFT JOIN FETCH tm.role
        WHERE tm.user.id = :userId AND tm.isDefault = true
        """)
    Optional<TenantMembership> findDefaultByUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT tm FROM TenantMembership tm
        LEFT JOIN FETCH tm.user
        WHERE tm.tenant.id = :tenantId AND tm.role.name = :roleName
        """)
    List<TenantMembership> findByTenantIdAndRoleName(
        @Param("tenantId") UUID tenantId,
        @Param("roleName") String roleName
    );

    @Query("SELECT COUNT(tm) FROM TenantMembership tm WHERE tm.tenant.id = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(tm) FROM TenantMembership tm WHERE tm.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);

    boolean existsByUserIdAndTenantId(UUID userId, UUID tenantId);

    void deleteByUserIdAndTenantId(UUID userId, UUID tenantId);
}
