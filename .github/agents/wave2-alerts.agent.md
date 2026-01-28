---
name: "wave2-alerts"
description: "Wave 2: Opportunity Alerts System - Configurable alerts for opportunity matching."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement opportunity alerts system with configurable rules and delivery channels.

## Branch

`claude/wave2/alerts`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/model/Alert.java`
- `src/main/java/com/samgov/ingestor/model/AlertRule.java`
- `src/main/java/com/samgov/ingestor/model/AlertDelivery.java`
- `src/main/java/com/samgov/ingestor/model/AlertType.java`
- `src/main/java/com/samgov/ingestor/repository/AlertRepository.java`
- `src/main/java/com/samgov/ingestor/repository/AlertRuleRepository.java`
- `src/main/java/com/samgov/ingestor/service/AlertService.java`
- `src/main/java/com/samgov/ingestor/service/AlertMatcherService.java`
- `src/main/java/com/samgov/ingestor/controller/AlertController.java`
- `src/main/java/com/samgov/ingestor/dto/AlertDTO.java`
- `src/main/java/com/samgov/ingestor/dto/AlertRuleDTO.java`

### Frontend
- `sam-dashboard/src/pages/alerts/AlertsPage.tsx`
- `sam-dashboard/src/pages/alerts/AlertRulesPage.tsx`
- `sam-dashboard/src/components/domain/alerts/AlertList.tsx`
- `sam-dashboard/src/components/domain/alerts/AlertRuleForm.tsx`
- `sam-dashboard/src/components/domain/alerts/AlertCard.tsx`
- `sam-dashboard/src/services/alertService.ts`
- `sam-dashboard/src/hooks/useAlerts.ts`

### Tests
- `src/test/java/com/samgov/ingestor/service/AlertServiceTest.java`
- `src/test/java/com/samgov/ingestor/service/AlertMatcherServiceTest.java`
- `sam-dashboard/src/pages/alerts/AlertsPage.test.tsx`

## Data Model

### AlertRule
```java
@Entity
public class AlertRule {
    UUID id;
    UUID tenantId;
    UUID userId;
    String name;
    boolean isActive;
    
    // Match criteria
    List<String> naicsCodes;
    List<String> keywords;
    List<String> setAsideCodes;
    String placeOfPerformance;
    BigDecimal minValue;
    BigDecimal maxValue;
    
    // Delivery
    boolean emailEnabled;
    boolean inAppEnabled;
    String frequency; // IMMEDIATE, DAILY_DIGEST, WEEKLY_DIGEST
    
    Instant createdAt;
    Instant updatedAt;
}
```

### Alert
```java
@Entity
public class Alert {
    UUID id;
    UUID tenantId;
    UUID userId;
    UUID alertRuleId;
    UUID opportunityId;
    String title;
    String message;
    AlertType type; // NEW_MATCH, DEADLINE_APPROACHING, AMENDMENT
    boolean isRead;
    boolean isDelivered;
    Instant createdAt;
}
```

## API Endpoints

- `GET /alerts` - List user's alerts
- `PUT /alerts/{id}/read` - Mark as read
- `DELETE /alerts/{id}` - Dismiss alert
- `GET /alert-rules` - List user's rules
- `POST /alert-rules` - Create rule
- `PUT /alert-rules/{id}` - Update rule
- `DELETE /alert-rules/{id}` - Delete rule

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE2_ALERTS_COMPLETE.md`
