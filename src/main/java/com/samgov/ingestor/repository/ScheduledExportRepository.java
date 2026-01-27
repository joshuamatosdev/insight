package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ScheduledExport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduledExportRepository extends JpaRepository<ScheduledExport, UUID> {

    List<ScheduledExport> findByTenantId(UUID tenantId);

    List<ScheduledExport> findByUserId(UUID userId);

    @Query("SELECT s FROM ScheduledExport s WHERE s.active = true AND s.nextRunAt <= :now")
    List<ScheduledExport> findDueExports(@Param("now") Instant now);
}
