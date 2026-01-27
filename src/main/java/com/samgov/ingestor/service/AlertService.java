package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Alert;
import com.samgov.ingestor.model.Alert.AlertPriority;
import com.samgov.ingestor.model.Alert.AlertStatus;
import com.samgov.ingestor.model.Alert.AlertType;
import com.samgov.ingestor.model.SavedSearch;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.AlertRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    /**
     * Create a new alert for a user.
     */
    @Transactional
    public AlertDto createAlert(CreateAlertRequest request) {
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Tenant tenant = null;
        if (request.tenantId() != null) {
            tenant = tenantRepository.findById(request.tenantId()).orElse(null);
        }

        Alert alert = Alert.builder()
            .user(user)
            .tenant(tenant)
            .title(request.title())
            .message(request.message())
            .type(request.type())
            .priority(request.priority() != null ? request.priority() : AlertPriority.NORMAL)
            .link(request.link())
            .data(request.data())
            .matchCount(request.matchCount())
            .status(AlertStatus.UNREAD)
            .build();

        if (request.savedSearch() != null) {
            alert.setSavedSearch(request.savedSearch());
        }

        alert = alertRepository.save(alert);
        log.debug("Created alert {} for user {}", alert.getId(), request.userId());

        return AlertDto.fromEntity(alert);
    }

    /**
     * Get alerts for the current user.
     */
    @Transactional(readOnly = true)
    public Page<AlertDto> getMyAlerts(Pageable pageable) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return alertRepository.findByUserId(userId, pageable)
            .map(AlertDto::fromEntity);
    }

    /**
     * Get unread alerts for the current user.
     */
    @Transactional(readOnly = true)
    public Page<AlertDto> getUnreadAlerts(Pageable pageable) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return alertRepository.findByUserIdAndStatus(userId, AlertStatus.UNREAD, pageable)
            .map(AlertDto::fromEntity);
    }

    /**
     * Get unread alert count for the current user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return 0;
        }

        return alertRepository.countUnreadByUserId(userId, AlertStatus.UNREAD);
    }

    /**
     * Mark an alert as read.
     */
    @Transactional
    public AlertDto markAsRead(UUID alertId) {
        UUID userId = TenantContext.getCurrentUserId();

        Alert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new IllegalArgumentException("Alert not found"));

        if (!alert.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        alert.markAsRead();
        alert = alertRepository.save(alert);

        return AlertDto.fromEntity(alert);
    }

    /**
     * Mark all alerts as read for the current user.
     */
    @Transactional
    public int markAllAsRead() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return alertRepository.markAllAsRead(userId, AlertStatus.READ, AlertStatus.UNREAD, Instant.now());
    }

    /**
     * Dismiss an alert.
     */
    @Transactional
    public void dismissAlert(UUID alertId) {
        UUID userId = TenantContext.getCurrentUserId();

        Alert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new IllegalArgumentException("Alert not found"));

        if (!alert.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        alert.setStatus(AlertStatus.DISMISSED);
        alertRepository.save(alert);
    }

    /**
     * Clean up old alerts.
     */
    @Transactional
    public int cleanupOldAlerts(int daysOld) {
        Instant cutoff = Instant.now().minus(java.time.Duration.ofDays(daysOld));
        int deleted = alertRepository.deleteOldAlerts(cutoff);
        if (deleted > 0) {
            log.info("Deleted {} old alerts", deleted);
        }
        return deleted;
    }

    public record CreateAlertRequest(
        UUID userId,
        UUID tenantId,
        String title,
        String message,
        AlertType type,
        AlertPriority priority,
        String link,
        String data,
        Integer matchCount,
        SavedSearch savedSearch
    ) {}

    public record AlertDto(
        UUID id,
        String title,
        String message,
        AlertType type,
        AlertStatus status,
        AlertPriority priority,
        String link,
        Integer matchCount,
        UUID savedSearchId,
        Instant readAt,
        Instant createdAt
    ) {
        public static AlertDto fromEntity(Alert entity) {
            return new AlertDto(
                entity.getId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.getStatus(),
                entity.getPriority(),
                entity.getLink(),
                entity.getMatchCount(),
                entity.getSavedSearch() != null ? entity.getSavedSearch().getId() : null,
                entity.getReadAt(),
                entity.getCreatedAt()
            );
        }
    }
}
