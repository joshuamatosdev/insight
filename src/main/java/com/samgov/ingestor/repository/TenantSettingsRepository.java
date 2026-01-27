package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.TenantSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantSettingsRepository extends JpaRepository<TenantSettings, UUID> {

    Optional<TenantSettings> findByTenantId(UUID tenantId);

    boolean existsByTenantId(UUID tenantId);

    void deleteByTenantId(UUID tenantId);
}
