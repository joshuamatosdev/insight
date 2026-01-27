---
name: "wave1-registration"
description: "Wave 1: Registration Page with email verification and tenant creation flow."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement a complete user registration flow with email verification and automatic tenant creation.

## Branch

`claude/wave1/registration`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/controller/RegistrationController.java`
- `src/main/java/com/samgov/ingestor/service/RegistrationService.java`
- `src/main/java/com/samgov/ingestor/service/EmailVerificationService.java`
- `src/main/java/com/samgov/ingestor/dto/RegisterRequest.java`
- `src/main/java/com/samgov/ingestor/dto/VerifyEmailRequest.java`
- `src/main/java/com/samgov/ingestor/model/EmailVerificationToken.java`
- `src/main/java/com/samgov/ingestor/repository/EmailVerificationTokenRepository.java`

### Frontend
- `sam-dashboard/src/pages/RegisterPage.tsx`
- `sam-dashboard/src/pages/RegisterPage.types.ts`
- `sam-dashboard/src/pages/VerifyEmailPage.tsx`
- `sam-dashboard/src/services/registrationService.ts`

### Tests
- `src/test/java/com/samgov/ingestor/controller/RegistrationControllerTest.java`
- `src/test/java/com/samgov/ingestor/service/RegistrationServiceTest.java`
- `sam-dashboard/src/pages/RegisterPage.test.tsx`

## DO NOT TOUCH

- `AuthController.java`
- `AuthenticationService.java`
- `SecurityConfig.java`
- `LoginPage.tsx`
- `App.tsx`

## Features

1. **Registration Form**
   - Email, password, company name, full name
   - Password strength validation
   - Terms of service checkbox

2. **Email Verification**
   - Send verification email with token
   - Token expiration (24 hours)
   - Resend functionality

3. **Tenant Creation**
   - Auto-create tenant on registration
   - Assign user as ADMIN role

## API Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/verify-email` - Verify email token
- `POST /api/v1/auth/resend-verification` - Resend verification email

## Verification

```bash
./gradlew build
./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE1_REGISTRATION_COMPLETE.md`
