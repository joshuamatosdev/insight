package com.samgov.ingestor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.AuditLog;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Log an audit event using the current request context.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditAction action, String description) {
        logAction(action, null, null, description, null);
    }

    /**
     * Log an audit event with entity information.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditAction action, String entityType, String entityId, String description) {
        logAction(action, entityType, entityId, description, null);
    }

    /**
     * Log an audit event with entity information and additional details.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditAction action, String entityType, String entityId, String description, Map<String, Object> details) {
        try {
            UUID userId = TenantContext.getCurrentUserId();
            UUID tenantId = TenantContext.getCurrentTenantId();

            String ipAddress = null;
            String userAgent = null;

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = getClientIpAddress(request);
                userAgent = request.getHeader("User-Agent");
            }

            String detailsJson = null;
            if (details != null && !details.isEmpty()) {
                try {
                    detailsJson = objectMapper.writeValueAsString(details);
                } catch (JsonProcessingException e) {
                    log.warn("Failed to serialize audit details: {}", e.getMessage());
                }
            }

            AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .tenantId(tenantId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .details(detailsJson)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created: {} - {}", action, description);

        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage(), e);
        }
    }

    /**
     * Log an audit event with explicit user and tenant IDs.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActionForUser(
        UUID userId,
        UUID tenantId,
        AuditAction action,
        String description,
        String ipAddress
    ) {
        try {
            AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .tenantId(tenantId)
                .action(action)
                .description(description)
                .ipAddress(ipAddress)
                .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created for user {}: {} - {}", userId, action, description);

        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage(), e);
        }
    }

    /**
     * Get audit logs for a specific tenant.
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByTenant(UUID tenantId, Pageable pageable) {
        return auditLogRepository.findByTenantId(tenantId, pageable);
    }

    /**
     * Get audit logs for a specific user.
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByUser(UUID userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable);
    }

    /**
     * Get audit logs for a specific entity.
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsForEntity(String entityType, String entityId) {
        return auditLogRepository.findByEntity(entityType, entityId);
    }

    /**
     * Get audit logs for a tenant within a date range.
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByTenantAndDateRange(UUID tenantId, Instant startDate, Instant endDate) {
        return auditLogRepository.findByTenantIdAndDateRange(tenantId, startDate, endDate);
    }

    /**
     * Get login activity count for a tenant since a given date.
     */
    @Transactional(readOnly = true)
    public long getLoginCountSince(UUID tenantId, Instant since) {
        return auditLogRepository.countByTenantIdAndActionSince(tenantId, AuditAction.LOGIN, since);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // Take the first IP if there are multiple
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }
}
