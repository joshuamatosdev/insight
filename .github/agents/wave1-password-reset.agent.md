---
name: "wave1-password-reset"
description: "Wave 1: Password Reset Flow - Forgot password and reset functionality."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement complete password reset flow with email tokens, expiration, and secure reset.

## Branch

`claude/wave1/password-reset`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/controller/PasswordResetController.java`
- `src/main/java/com/samgov/ingestor/service/PasswordResetService.java`
- `src/main/java/com/samgov/ingestor/model/PasswordResetToken.java`
- `src/main/java/com/samgov/ingestor/repository/PasswordResetTokenRepository.java`
- `src/main/java/com/samgov/ingestor/dto/ForgotPasswordRequest.java`
- `src/main/java/com/samgov/ingestor/dto/ResetPasswordRequest.java`

### Frontend
- `sam-dashboard/src/pages/ForgotPasswordPage.tsx`
- `sam-dashboard/src/pages/ForgotPasswordPage.types.ts`
- `sam-dashboard/src/pages/ResetPasswordPage.tsx`
- `sam-dashboard/src/pages/ResetPasswordPage.types.ts`
- `sam-dashboard/src/services/passwordResetService.ts`

### Tests
- `src/test/java/com/samgov/ingestor/controller/PasswordResetControllerTest.java`
- `src/test/java/com/samgov/ingestor/service/PasswordResetServiceTest.java`
- `sam-dashboard/src/pages/ForgotPasswordPage.test.tsx`
- `sam-dashboard/src/pages/ResetPasswordPage.test.tsx`

## DO NOT TOUCH

- `AuthController.java`
- `AuthenticationService.java`
- `SecurityConfig.java`
- `LoginPage.tsx`

## Features

1. **Forgot Password**
   - Email input form
   - Rate limiting (3 requests per hour)
   - Always show success (prevent email enumeration)

2. **Password Reset Token**
   - Secure random token
   - 1 hour expiration
   - Single use
   - Invalidate all previous tokens for user

3. **Reset Password**
   - Token validation
   - New password with strength requirements
   - Password confirmation
   - Redirect to login on success

## API Endpoints

- `POST /auth/forgot-password` - Request reset email
- `GET /auth/reset-password/validate/{token}` - Validate token
- `POST /auth/reset-password` - Set new password

## Security Requirements

- Tokens hashed before storage
- Constant-time token comparison
- Log password reset attempts
- Invalidate all sessions on password change

## Verification

```bash
./gradlew build
./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE1_PASSWORD_RESET_COMPLETE.md`
