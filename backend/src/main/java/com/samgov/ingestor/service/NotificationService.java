package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Notification;
import com.samgov.ingestor.model.Notification.NotificationType;
import com.samgov.ingestor.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Create a new notification for a user.
     */
    @Transactional
    public NotificationDto createNotification(UUID userId, NotificationType type, String title, String message) {
        Notification notification = Notification.builder()
            .userId(userId)
            .type(type)
            .title(title)
            .message(message)
            .read(false)
            .build();

        notification = notificationRepository.save(notification);
        log.debug("Created notification {} for user {}", notification.getId(), userId);

        return NotificationDto.fromEntity(notification);
    }

    /**
     * Get all notifications for the current user.
     */
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(NotificationDto::fromEntity)
            .toList();
    }

    /**
     * Get notifications for the current user with pagination.
     */
    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(Pageable pageable) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(NotificationDto::fromEntity);
    }

    /**
     * Mark a notification as read.
     */
    @Transactional
    public NotificationDto markAsRead(UUID notificationId) {
        UUID userId = TenantContext.getCurrentUserId();

        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        notification.markAsRead();
        notification = notificationRepository.save(notification);

        return NotificationDto.fromEntity(notification);
    }

    /**
     * Mark all notifications as read for the current user.
     */
    @Transactional
    public int markAllAsRead() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        int count = notificationRepository.markAllAsReadByUserId(userId);
        log.debug("Marked {} notifications as read for user {}", count, userId);
        return count;
    }

    /**
     * Get the count of unread notifications for the current user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return 0;
        }

        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Get the count of unread notifications for a specific user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * DTO for notification data transfer.
     */
    public record NotificationDto(
        UUID id,
        UUID userId,
        NotificationType type,
        String title,
        String message,
        boolean read,
        Instant createdAt
    ) {
        public static NotificationDto fromEntity(Notification entity) {
            return new NotificationDto(
                entity.getId(),
                entity.getUserId(),
                entity.getType(),
                entity.getTitle(),
                entity.getMessage(),
                entity.isRead(),
                entity.getCreatedAt()
            );
        }
    }
}
