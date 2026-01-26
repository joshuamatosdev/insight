package com.samgov.ingestor.service;

import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.UserSession;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    private final UserSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Value("${jwt.refresh-expiration:604800000}")
    private long sessionExpirationMs;

    @Value("${app.session.max-per-user:10}")
    private int maxSessionsPerUser;

    /**
     * Create a new session for a user.
     */
    @Transactional
    public UserSession createSession(UUID userId, String refreshToken, HttpServletRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check and enforce max sessions per user
        long activeCount = sessionRepository.countActiveSessionsByUserId(userId);
        if (activeCount >= maxSessionsPerUser) {
            // Revoke oldest sessions
            List<UserSession> activeSessions = sessionRepository.findActiveSessionsByUserId(userId);
            int toRevoke = (int) (activeCount - maxSessionsPerUser + 1);
            for (int i = activeSessions.size() - toRevoke; i < activeSessions.size(); i++) {
                activeSessions.get(i).revoke("Max sessions exceeded");
                sessionRepository.save(activeSessions.get(i));
            }
        }

        String tokenHash = hashToken(refreshToken);
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        String deviceInfo = parseDeviceInfo(userAgent);

        UserSession session = UserSession.builder()
            .user(user)
            .tokenHash(tokenHash)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .deviceInfo(deviceInfo)
            .isActive(true)
            .expiresAt(Instant.now().plus(sessionExpirationMs, ChronoUnit.MILLIS))
            .build();

        session = sessionRepository.save(session);
        log.debug("Created session {} for user {}", session.getId(), userId);

        return session;
    }

    /**
     * Validate and update session activity.
     */
    @Transactional
    public Optional<UserSession> validateSession(String refreshToken) {
        String tokenHash = hashToken(refreshToken);
        Optional<UserSession> sessionOpt = sessionRepository.findByTokenHash(tokenHash);

        if (sessionOpt.isEmpty()) {
            return Optional.empty();
        }

        UserSession session = sessionOpt.get();
        if (!session.isValid()) {
            return Optional.empty();
        }

        // Update last activity
        session.setLastActivityAt(Instant.now());
        sessionRepository.save(session);

        return Optional.of(session);
    }

    /**
     * Revoke a specific session.
     */
    @Transactional
    public void revokeSession(UUID sessionId, String reason) {
        UserSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        session.revoke(reason);
        sessionRepository.save(session);
        log.info("Revoked session {}: {}", sessionId, reason);
    }

    /**
     * Revoke a session by token.
     */
    @Transactional
    public void revokeSessionByToken(String refreshToken, String reason) {
        String tokenHash = hashToken(refreshToken);
        Optional<UserSession> sessionOpt = sessionRepository.findByTokenHash(tokenHash);

        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            session.revoke(reason);
            sessionRepository.save(session);
            log.info("Revoked session by token: {}", reason);
        }
    }

    /**
     * Revoke all sessions for a user.
     */
    @Transactional
    public int revokeAllUserSessions(UUID userId, String reason) {
        int count = sessionRepository.revokeAllSessionsForUser(userId, Instant.now(), reason);
        log.info("Revoked {} sessions for user {}: {}", count, userId, reason);
        return count;
    }

    /**
     * Get all active sessions for a user.
     */
    @Transactional(readOnly = true)
    public List<SessionDto> getActiveUserSessions(UUID userId) {
        return sessionRepository.findActiveSessionsByUserId(userId)
            .stream()
            .map(SessionDto::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Get session count for a user.
     */
    @Transactional(readOnly = true)
    public long getActiveSessionCount(UUID userId) {
        return sessionRepository.countActiveSessionsByUserId(userId);
    }

    /**
     * Clean up expired sessions.
     */
    @Transactional
    public int expireSessions() {
        int expired = sessionRepository.expireSessions(Instant.now());
        if (expired > 0) {
            log.info("Expired {} sessions", expired);
        }
        return expired;
    }

    /**
     * Delete old revoked sessions.
     */
    @Transactional
    public int cleanupOldSessions(int daysOld) {
        Instant cutoff = Instant.now().minus(daysOld, ChronoUnit.DAYS);
        int deleted = sessionRepository.deleteRevokedSessionsBefore(cutoff);
        if (deleted > 0) {
            log.info("Deleted {} old revoked sessions", deleted);
        }
        return deleted;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String parseDeviceInfo(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Unknown";
        }

        // Simple device detection
        String lowerAgent = userAgent.toLowerCase();
        if (lowerAgent.contains("mobile") || lowerAgent.contains("android") || lowerAgent.contains("iphone")) {
            return "Mobile";
        } else if (lowerAgent.contains("tablet") || lowerAgent.contains("ipad")) {
            return "Tablet";
        } else {
            return "Desktop";
        }
    }

    public record SessionDto(
        UUID id,
        String deviceInfo,
        String ipAddress,
        String location,
        Instant lastActivityAt,
        Instant createdAt,
        boolean isCurrent
    ) {
        public static SessionDto fromEntity(UserSession session) {
            return new SessionDto(
                session.getId(),
                session.getDeviceInfo(),
                session.getIpAddress(),
                session.getLocation(),
                session.getLastActivityAt(),
                session.getCreatedAt(),
                false // Will be set by controller
            );
        }
    }
}
