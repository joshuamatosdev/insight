package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Pipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PipelineRepository extends JpaRepository<Pipeline, UUID> {

    List<Pipeline> findByTenantIdAndIsArchivedFalse(UUID tenantId);

    List<Pipeline> findByTenantId(UUID tenantId);

    Optional<Pipeline> findByTenantIdAndIsDefaultTrue(UUID tenantId);

    Optional<Pipeline> findByTenantIdAndId(UUID tenantId, UUID id);

    boolean existsByTenantIdAndName(UUID tenantId, String name);

    @Query("""
        SELECT p FROM Pipeline p
        LEFT JOIN FETCH p.stages
        WHERE p.tenantId = :tenantId AND p.id = :id
        """)
    Optional<Pipeline> findByTenantIdAndIdWithStages(
        @Param("tenantId") UUID tenantId,
        @Param("id") UUID id
    );

    long countByTenantId(UUID tenantId);
}
