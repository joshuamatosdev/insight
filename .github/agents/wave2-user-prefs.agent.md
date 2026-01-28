---
name: "wave2-user-prefs"
description: "Wave 2: User Preferences - Theme, notifications, display settings per user."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement user preferences system for theme, notification settings, and display options.

## Branch

`claude/wave2/user-prefs`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/model/UserPreference.java`
- `src/main/java/com/samgov/ingestor/repository/UserPreferenceRepository.java`
- `src/main/java/com/samgov/ingestor/service/UserPreferenceService.java`
- `src/main/java/com/samgov/ingestor/controller/UserPreferenceController.java`
- `src/main/java/com/samgov/ingestor/dto/UserPreferenceDTO.java`
- `src/main/java/com/samgov/ingestor/dto/UpdatePreferencesRequest.java`

### Frontend
- `sam-dashboard/src/pages/settings/SettingsPage.tsx`
- `sam-dashboard/src/pages/settings/SettingsPage.types.ts`
- `sam-dashboard/src/pages/settings/ProfileSettingsPage.tsx`
- `sam-dashboard/src/pages/settings/NotificationSettingsPage.tsx`
- `sam-dashboard/src/pages/settings/DisplaySettingsPage.tsx`
- `sam-dashboard/src/components/domain/settings/SettingsSection.tsx`
- `sam-dashboard/src/components/domain/settings/ToggleSetting.tsx`
- `sam-dashboard/src/services/userPreferenceService.ts`
- `sam-dashboard/src/hooks/useUserPreferences.ts`
- `sam-dashboard/src/contexts/PreferencesContext.tsx`

### Tests
- `src/test/java/com/samgov/ingestor/service/UserPreferenceServiceTest.java`
- `sam-dashboard/src/pages/settings/SettingsPage.test.tsx`

## Data Model

### UserPreference
```java
@Entity
public class UserPreference {
    UUID id;
    UUID userId;  // One-to-one with User
    
    // Display
    String theme;           // light, dark, system
    String language;        // en, es, etc.
    String dateFormat;      // MM/DD/YYYY, DD/MM/YYYY
    String timezone;        // America/New_York
    int itemsPerPage;       // 10, 25, 50, 100
    
    // Notifications
    boolean emailNotifications;
    boolean browserNotifications;
    boolean opportunityAlerts;
    boolean deadlineReminders;
    boolean teamUpdates;
    
    // Dashboard
    String defaultDashboard;
    List<String> pinnedFilters;
    
    Instant createdAt;
    Instant updatedAt;
}
```

## Features

1. **Profile Settings**
   - Update name, email, password
   - Avatar upload

2. **Display Settings**
   - Theme toggle (light/dark/system)
   - Date format selector
   - Timezone selector
   - Items per page

3. **Notification Settings**
   - Email notifications toggle
   - Browser notifications toggle
   - Category-specific toggles

4. **PreferencesContext**
   - React context for app-wide preferences
   - Load on auth
   - Persist changes immediately

## API Endpoints

- `GET /users/me/preferences` - Get preferences
- `PUT /users/me/preferences` - Update preferences
- `PUT /users/me/preferences/{key}` - Update single preference

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE2_USER_PREFS_COMPLETE.md`
