---
name: "wave2-notifications"
description: "Wave 2: Notification System - In-app notifications with real-time updates."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement in-app notification system with bell icon, notification center, and read/unread state.

## Branch

`claude/wave2/notifications`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/model/Notification.java`
- `src/main/java/com/samgov/ingestor/model/NotificationType.java`
- `src/main/java/com/samgov/ingestor/repository/NotificationRepository.java`
- `src/main/java/com/samgov/ingestor/service/NotificationService.java`
- `src/main/java/com/samgov/ingestor/controller/NotificationController.java`
- `src/main/java/com/samgov/ingestor/dto/NotificationDTO.java`

### Frontend
- `sam-dashboard/src/components/layout/NotificationBell.tsx`
- `sam-dashboard/src/components/layout/NotificationCenter.tsx`
- `sam-dashboard/src/components/domain/notifications/NotificationItem.tsx`
- `sam-dashboard/src/components/domain/notifications/NotificationList.tsx`
- `sam-dashboard/src/services/notificationService.ts`
- `sam-dashboard/src/hooks/useNotifications.ts`

### Tests
- `src/test/java/com/samgov/ingestor/service/NotificationServiceTest.java`
- `sam-dashboard/src/hooks/useNotifications.test.ts`

## Data Model

### Notification
```java
@Entity
public class Notification {
    UUID id;
    UUID tenantId;
    UUID userId;
    NotificationType type;
    String title;
    String message;
    String link;          // Optional URL to navigate to
    String entityType;    // opportunity, contract, etc.
    UUID entityId;        // ID of related entity
    boolean isRead;
    Instant createdAt;
    Instant readAt;
}
```

### NotificationType
```java
public enum NotificationType {
    OPPORTUNITY_MATCH,
    DEADLINE_REMINDER,
    TASK_ASSIGNED,
    COMMENT_ADDED,
    DOCUMENT_SHARED,
    SYSTEM_ALERT,
    INVITATION
}
```

## Features

1. **Notification Bell** (Header component)
   - Unread count badge
   - Click to open notification center
   - Polling every 30 seconds (or WebSocket later)

2. **Notification Center** (Dropdown/Panel)
   - List recent notifications
   - Mark individual as read
   - Mark all as read
   - Link to full notification history

3. **Notification Item**
   - Icon based on type
   - Title and message
   - Relative time
   - Click to navigate + mark as read

## API Endpoints

- `GET /api/v1/notifications` - List notifications (paginated)
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PUT /api/v1/notifications/{id}/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE2_NOTIFICATIONS_COMPLETE.md`
