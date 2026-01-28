package com.samgov.ingestor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * Service for logging security-relevant events.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityEventService {

    private final AuditService auditService;

    /**
     * Log a failed login attempt.
     */
    public void logFailedLogin(String email, String ipAddress, String reason) {
        log.warn("SECURITY: Failed login attempt for {} from {} - {}", email, ipAddress, reason);
        
        SecurityEvent event = new SecurityEvent(
            SecurityEventType.LOGIN_FAILED,
            email,
            ipAddress,
            reason,
            Instant.now()
        );
        
        // In production, store to database for analysis
        logSecurityEvent(event);
    }

    /**
     * Log a successful login.
     */
    public void logSuccessfulLogin(UUID userId, String email, String ipAddress) {
        log.info("SECURITY: Successful login for {} from {}", email, ipAddress);
        
        SecurityEvent event = new SecurityEvent(
            SecurityEventType.LOGIN_SUCCESS,
            email,
            ipAddress,
            "User ID: " + userId,
            Instant.now()
        );
        
        logSecurityEvent(event);
    }

    /**
     * Log a password reset request.
     */
    public void logPasswordResetRequest(String email, String ipAddress) {
        log.info("SECURITY: Password reset requested for {} from {}", email, ipAddress);
        
        SecurityEvent event = new SecurityEvent(
            SecurityEventType.PASSWORD_RESET_REQUESTED,
            email,
            ipAddress,
            null,
            Instant.now()
        );
        
        logSecurityEvent(event);
    }

    /**
     * Log a suspicious activity.
     */
    public void logSuspiciousActivity(String identifier, String ipAddress, String description) {
        log.warn("SECURITY: Suspicious activity detected - {} from {} - {}", 
            identifier, ipAddress, description);
        
        SecurityEvent event = new SecurityEvent(
            SecurityEventType.SUSPICIOUS_ACTIVITY,
            identifier,
            ipAddress,
            description,
            Instant.now()
        );
        
        logSecurityEvent(event);
    }

    /**
     * Log an access denied event.
     */
    public void logAccessDenied(UUID userId, String resource, String action) {
        log.warn("SECURITY: Access denied for user {} to {} ({})", userId, resource, action);
        
        SecurityEvent event = new SecurityEvent(
            SecurityEventType.ACCESS_DENIED,
            userId != null ? userId.toString() : "anonymous",
            null,
            resource + ":" + action,
            Instant.now()
        );
        
        logSecurityEvent(event);
    }

    /**
     * Log MFA events.
     */
    public void logMfaEvent(UUID userId, MfaEventType type, boolean success) {
        SecurityEventType eventType = success 
            ? SecurityEventType.MFA_SUCCESS 
            : SecurityEventType.MFA_FAILED;
            
        log.info("SECURITY: MFA {} {} for user {}", type, success ? "succeeded" : "failed", userId);
        
        SecurityEvent event = new SecurityEvent(
            eventType,
            userId.toString(),
            null,
            type.name(),
            Instant.now()
        );
        
        logSecurityEvent(event);
    }

    private void logSecurityEvent(SecurityEvent event) {
        // Log to structured format for SIEM integration
        log.info("SECURITY_EVENT: type={}, identifier={}, ip={}, details={}, timestamp={}",
            event.type, event.identifier, event.ipAddress, event.details, event.timestamp);
    }

    public enum SecurityEventType {
        LOGIN_SUCCESS,
        LOGIN_FAILED,
        LOGOUT,
        PASSWORD_RESET_REQUESTED,
        PASSWORD_CHANGED,
        MFA_ENABLED,
        MFA_DISABLED,
        MFA_SUCCESS,
        MFA_FAILED,
        ACCESS_DENIED,
        SUSPICIOUS_ACTIVITY,
        ACCOUNT_LOCKED,
        API_KEY_CREATED,
        API_KEY_REVOKED
    }

    public enum MfaEventType {
        SETUP_STARTED,
        SETUP_COMPLETED,
        VERIFICATION,
        BACKUP_CODE_USED,
        DISABLED
    }

    private record SecurityEvent(
        SecurityEventType type,
        String identifier,
        String ipAddress,
        String details,
        Instant timestamp
    ) {}
}
