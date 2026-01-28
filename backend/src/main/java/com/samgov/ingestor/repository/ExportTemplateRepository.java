package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ExportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExportTemplateRepository extends JpaRepository<ExportTemplate, UUID> {

    List<ExportTemplate> findByTenantId(UUID tenantId);

    List<ExportTemplate> findByTenantIdAndEntityType(UUID tenantId, String entityType);

    Optional<ExportTemplate> findByTenantIdAndIsDefaultTrueAndEntityType(
        UUID tenantId, String entityType);
}
