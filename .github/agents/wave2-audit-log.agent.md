---
name: "wave2-audit-log"
description: "Wave 2: Audit Trail System - Track all changes with user, timestamp, and diff."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement comprehensive audit logging for all entity changes with before/after snapshots.

## Branch

`claude/wave2/audit-log`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/model/AuditLog.java`
- `src/main/java/com/samgov/ingestor/model/AuditAction.java`
- `src/main/java/com/samgov/ingestor/repository/AuditLogRepository.java`
- `src/main/java/com/samgov/ingestor/service/AuditService.java`
- `src/main/java/com/samgov/ingestor/interceptor/AuditInterceptor.java`
- `src/main/java/com/samgov/ingestor/annotation/Audited.java`
- `src/main/java/com/samgov/ingestor/controller/AuditLogController.java`
- `src/main/java/com/samgov/ingestor/dto/AuditLogDTO.java`

### Tests
- `src/test/java/com/samgov/ingestor/service/AuditServiceTest.java`
- `src/test/java/com/samgov/ingestor/interceptor/AuditInterceptorTest.java`

## Data Model

### AuditLog
```java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    UUID id;
    UUID tenantId;
    UUID userId;
    String userName;        // Denormalized for history
    AuditAction action;     // CREATE, UPDATE, DELETE, VIEW
    String entityType;      // opportunity, contract, etc.
    UUID entityId;
    String entityName;      // Human-readable name
    String previousValue;   // JSON snapshot before
    String newValue;        // JSON snapshot after
    String ipAddress;
    String userAgent;
    Instant createdAt;
}
```

### AuditAction
```java
public enum AuditAction {
    CREATE,
    READ,
    UPDATE,
    DELETE,
    LOGIN,
    LOGOUT,
    EXPORT,
    IMPORT
}
```

## Implementation Pattern

### @Audited Annotation
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Audited {
    String entityType();
    AuditAction action() default AuditAction.UPDATE;
}
```

### Usage in Service
```java
@Audited(entityType = "opportunity", action = AuditAction.UPDATE)
public OpportunityDTO update(UUID id, UpdateRequest request) {
    // Implementation
}
```

### AuditInterceptor
- Uses AOP to intercept @Audited methods
- Captures before/after state
- Extracts user from SecurityContext
- Writes to AuditLog async

## API Endpoints

- `GET /api/v1/audit-logs` - List audit logs (admin only)
- `GET /api/v1/audit-logs/entity/{type}/{id}` - Get logs for entity
- `GET /api/v1/audit-logs/user/{userId}` - Get logs by user

## Verification

```bash
./gradlew build && ./gradlew test
```

## Output

`docs/WAVE2_AUDIT_LOG_COMPLETE.md`
