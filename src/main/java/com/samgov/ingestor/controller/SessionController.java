package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.SessionService;
import com.samgov.ingestor.service.SessionService.SessionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<List<SessionDto>> getActiveSessions() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<SessionDto> sessions = sessionService.getActiveUserSessions(userId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/count")
    public ResponseEntity<SessionCountResponse> getSessionCount() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long count = sessionService.getActiveSessionCount(userId);
        return ResponseEntity.ok(new SessionCountResponse(count));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeSession(@PathVariable UUID id) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Verify session belongs to user
        List<SessionDto> sessions = sessionService.getActiveUserSessions(userId);
        boolean ownsSession = sessions.stream().anyMatch(s -> s.id().equals(id));

        if (!ownsSession) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        sessionService.revokeSession(id, "User revoked session");
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<RevokedSessionsResponse> revokeAllSessions() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        int count = sessionService.revokeAllUserSessions(userId, "User revoked all sessions");
        return ResponseEntity.ok(new RevokedSessionsResponse(count));
    }

    public record SessionCountResponse(long count) {}

    public record RevokedSessionsResponse(int revokedCount) {}
}
