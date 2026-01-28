package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.AuditLog;
import com.samgov.ingestor.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("@tenantSecurityService.isTenantAdmin(#tenantId)")
    public ResponseEntity<Page<AuditLog>> getTenantAuditLogs(
        @PathVariable UUID tenantId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logs = auditService.getAuditLogsByTenant(tenantId, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/tenant/{tenantId}/range")
    @PreAuthorize("@tenantSecurityService.isTenantAdmin(#tenantId)")
    public ResponseEntity<List<AuditLog>> getTenantAuditLogsByDateRange(
        @PathVariable UUID tenantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Instant start = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = endDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<AuditLog> logs = auditService.getAuditLogsByTenantAndDateRange(tenantId, start, end);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or #userId == @tenantContext.currentUserId")
    public ResponseEntity<Page<AuditLog>> getUserAuditLogs(
        @PathVariable UUID userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logs = auditService.getAuditLogsByUser(userId, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<AuditLog>> getMyAuditLogs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logs = auditService.getAuditLogsByUser(userId, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurityService.canAccessTenant(@tenantContext.currentTenantId)")
    public ResponseEntity<List<AuditLog>> getEntityAuditLogs(
        @PathVariable String entityType,
        @PathVariable String entityId
    ) {
        List<AuditLog> logs = auditService.getAuditLogsForEntity(entityType, entityId);
        return ResponseEntity.ok(logs);
    }
}
