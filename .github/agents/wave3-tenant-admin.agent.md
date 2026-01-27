---
name: "wave3-tenant-admin"
description: "Wave 3: Tenant Admin Portal - Tenant settings, branding, and user management."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create tenant administration pages for settings, branding, and subscription management.

## Branch

`claude/wave3/tenant-admin`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/model/TenantSettings.java`
- `src/main/java/com/samgov/ingestor/model/TenantBranding.java`
- `src/main/java/com/samgov/ingestor/repository/TenantSettingsRepository.java`
- `src/main/java/com/samgov/ingestor/service/TenantAdminService.java`
- `src/main/java/com/samgov/ingestor/controller/TenantAdminController.java`
- `src/main/java/com/samgov/ingestor/dto/TenantSettingsDTO.java`
- `src/main/java/com/samgov/ingestor/dto/TenantBrandingDTO.java`

### Frontend
- `sam-dashboard/src/pages/admin/TenantSettingsPage.tsx`
- `sam-dashboard/src/pages/admin/TenantSettingsPage.types.ts`
- `sam-dashboard/src/pages/admin/TenantBrandingPage.tsx`
- `sam-dashboard/src/pages/admin/TenantBrandingPage.types.ts`
- `sam-dashboard/src/pages/admin/TenantUsersPage.tsx`
- `sam-dashboard/src/pages/admin/InvitationsPage.tsx`
- `sam-dashboard/src/components/domain/admin/BrandingPreview.tsx`
- `sam-dashboard/src/components/domain/admin/ColorPicker.tsx`
- `sam-dashboard/src/components/domain/admin/LogoUpload.tsx`
- `sam-dashboard/src/services/tenantAdminService.ts`
- `sam-dashboard/src/hooks/useTenantSettings.ts`

### Tests
- `src/test/java/com/samgov/ingestor/service/TenantAdminServiceTest.java`
- `sam-dashboard/src/pages/admin/TenantSettingsPage.test.tsx`

## Data Model

### TenantSettings
```java
@Entity
public class TenantSettings {
    UUID id;
    UUID tenantId;
    String timezone;
    String dateFormat;
    String currency;
    boolean mfaRequired;
    int sessionTimeoutMinutes;
    int passwordExpiryDays;
    boolean ssoEnabled;
    String ssoProvider;
}
```

### TenantBranding
```java
@Entity
public class TenantBranding {
    UUID id;
    UUID tenantId;
    String logoUrl;
    String faviconUrl;
    String primaryColor;
    String secondaryColor;
    String companyName;
    String supportEmail;
    String customCss;
}
```

## Features

1. **Tenant Settings**
   - General settings (timezone, date format)
   - Security settings (MFA requirement, session timeout)
   - SSO configuration

2. **Branding**
   - Logo upload
   - Color customization
   - Preview changes before saving

3. **User Management**
   - View all tenant users
   - Invite new users
   - Manage pending invitations

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE3_TENANT_ADMIN_COMPLETE.md`
