package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Sprint;
import com.samgov.ingestor.model.Sprint.SprintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, UUID> {

    Page<Sprint> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<Sprint> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<Sprint> findByTenantIdAndStatus(UUID tenantId, SprintStatus status);

    boolean existsByTenantIdAndName(UUID tenantId, String name);

    @Query("""
        SELECT s FROM Sprint s
        LEFT JOIN FETCH s.tasks
        WHERE s.tenant.id = :tenantId AND s.id = :id
        """)
    Optional<Sprint> findByTenantIdAndIdWithTasks(
        @Param("tenantId") UUID tenantId,
        @Param("id") UUID id
    );

    @Query("""
        SELECT s FROM Sprint s
        LEFT JOIN FETCH s.tasks
        WHERE s.tenant.id = :tenantId AND s.status = :status
        """)
    Optional<Sprint> findByTenantIdAndStatusWithTasks(
        @Param("tenantId") UUID tenantId,
        @Param("status") SprintStatus status
    );

    long countByTenantId(UUID tenantId);

    long countByTenantIdAndStatus(UUID tenantId, SprintStatus status);
}
