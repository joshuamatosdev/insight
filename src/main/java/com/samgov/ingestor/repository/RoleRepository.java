package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    List<Role> findByIsSystemRole(Boolean isSystemRole);

    boolean existsByName(String name);

    // Tenant-specific queries
    List<Role> findByTenantId(UUID tenantId);

    Optional<Role> findByTenantIdAndName(UUID tenantId, String name);

    boolean existsByTenantIdAndName(UUID tenantId, String name);

    List<Role> findByTenantIdOrTenantIsNull(UUID tenantId);
}
