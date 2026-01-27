---
name: "wave3-mfa"
description: "Wave 3: Multi-Factor Authentication - TOTP and backup codes."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement TOTP-based multi-factor authentication with backup codes.

## Branch

`claude/wave3/mfa`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/service/MfaService.java`
- `src/main/java/com/samgov/ingestor/model/MfaSettings.java`
- `src/main/java/com/samgov/ingestor/model/MfaBackupCode.java`
- `src/main/java/com/samgov/ingestor/repository/MfaSettingsRepository.java`
- `src/main/java/com/samgov/ingestor/repository/MfaBackupCodeRepository.java`
- `src/main/java/com/samgov/ingestor/controller/MfaController.java`
- `src/main/java/com/samgov/ingestor/dto/MfaSetupResponse.java`
- `src/main/java/com/samgov/ingestor/dto/MfaVerifyRequest.java`

### Frontend
- `sam-dashboard/src/pages/MfaSetupPage.tsx`
- `sam-dashboard/src/pages/MfaSetupPage.types.ts`
- `sam-dashboard/src/pages/MfaVerifyPage.tsx`
- `sam-dashboard/src/pages/MfaVerifyPage.types.ts`
- `sam-dashboard/src/components/auth/QRCodeDisplay.tsx`
- `sam-dashboard/src/components/auth/BackupCodesDisplay.tsx`
- `sam-dashboard/src/components/auth/OtpInput.tsx`
- `sam-dashboard/src/services/mfaService.ts`

### Tests
- `src/test/java/com/samgov/ingestor/service/MfaServiceTest.java`
- `sam-dashboard/src/pages/MfaSetupPage.test.tsx`

## Data Model

### MfaSettings
```java
@Entity
public class MfaSettings {
    UUID id;
    UUID userId;
    boolean enabled;
    String secret;          // Encrypted TOTP secret
    String recoveryEmail;
    Instant enabledAt;
    Instant lastVerifiedAt;
}
```

### MfaBackupCode
```java
@Entity
public class MfaBackupCode {
    UUID id;
    UUID userId;
    String codeHash;        // Hashed backup code
    boolean used;
    Instant usedAt;
    Instant createdAt;
}
```

## Flow

### Setup Flow
1. User initiates MFA setup
2. Generate TOTP secret
3. Display QR code for authenticator app
4. User enters verification code
5. Generate 10 backup codes
6. Enable MFA

### Login Flow
1. User enters email/password
2. If MFA enabled, show verification page
3. User enters TOTP code or backup code
4. Verify and issue JWT

## API Endpoints

- `POST /api/v1/mfa/setup` - Start MFA setup (returns secret + QR)
- `POST /api/v1/mfa/verify-setup` - Complete setup with TOTP
- `POST /api/v1/mfa/verify` - Verify TOTP during login
- `POST /api/v1/mfa/backup-codes` - Generate new backup codes
- `DELETE /api/v1/mfa` - Disable MFA

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE3_MFA_COMPLETE.md`
