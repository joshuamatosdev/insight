# Wave 3: Multi-Factor Authentication Complete

## Overview

Implemented TOTP-based multi-factor authentication with backup codes for account recovery.

## Files Created

### Backend
- [x] `src/main/java/com/samgov/ingestor/model/MfaSettings.java` - MFA settings entity
- [x] `src/main/java/com/samgov/ingestor/model/MfaBackupCode.java` - Backup codes entity
- [x] `src/main/java/com/samgov/ingestor/repository/MfaSettingsRepository.java` - Settings repository
- [x] `src/main/java/com/samgov/ingestor/repository/MfaBackupCodeRepository.java` - Backup codes repository
- [x] `src/main/java/com/samgov/ingestor/dto/MfaSetupResponse.java` - Setup response DTO
- [x] `src/main/java/com/samgov/ingestor/dto/MfaVerifyRequest.java` - Verify request DTO
- [x] `src/main/java/com/samgov/ingestor/service/MfaService.java` - Enhanced with backup codes
- [x] `src/main/java/com/samgov/ingestor/controller/MfaController.java` - MFA endpoints

### Frontend
- [x] `sam-dashboard/src/services/mfaService.ts` - MFA API service
- [x] `sam-dashboard/src/components/auth/OtpInput.tsx` - OTP digit input
- [x] `sam-dashboard/src/components/auth/QRCodeDisplay.tsx` - QR code display
- [x] `sam-dashboard/src/components/auth/BackupCodesDisplay.tsx` - Backup codes UI
- [x] `sam-dashboard/src/pages/MfaSetupPage.tsx` - MFA setup wizard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mfa/status` | Get MFA status |
| POST | `/mfa/setup` | Start MFA setup (returns QR) |
| POST | `/mfa/verify-setup` | Complete setup with TOTP |
| POST | `/mfa/verify` | Verify code during login |
| POST | `/mfa/backup-codes` | Generate new backup codes |
| DELETE | `/mfa` | Disable MFA |

## Routes to Add to App.tsx

```tsx
import { MfaSetupPage } from './pages/MfaSetupPage';

<Route path="/mfa/setup" element={<MfaSetupPage />} />
```

## Database Changes

### mfa_settings table
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users, unique)
- `enabled` (BOOLEAN)
- `secret` (TEXT, encrypted)
- `recovery_email` (VARCHAR)
- `enabled_at` (TIMESTAMP)
- `last_verified_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### mfa_backup_codes table
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `code_hash` (VARCHAR) - bcrypt hashed
- `used` (BOOLEAN)
- `used_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

## Setup Flow

1. User starts MFA setup from security settings
2. Backend generates TOTP secret
3. QR code displayed for authenticator app
4. User enters 6-digit verification code
5. Backend verifies code and enables MFA
6. 10 backup codes generated and displayed
7. User saves backup codes before completing

## Security Features

- TOTP secrets encrypted at rest
- Backup codes hashed with bcrypt
- Each backup code single-use
- MFA required for disabling MFA
- Audit logging for MFA events
