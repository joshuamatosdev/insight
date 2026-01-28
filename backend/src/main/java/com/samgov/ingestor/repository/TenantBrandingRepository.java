package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.TenantBranding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantBrandingRepository extends JpaRepository<TenantBranding, UUID> {

    Optional<TenantBranding> findByTenantId(UUID tenantId);

    boolean existsByTenantId(UUID tenantId);

    void deleteByTenantId(UUID tenantId);
}
