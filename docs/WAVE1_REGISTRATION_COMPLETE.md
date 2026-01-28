# Wave 1: Registration + Email Verification Complete

## Files Created

### Backend
- [x] `src/main/java/com/samgov/ingestor/model/EmailVerificationToken.java` - Token entity for email verification
- [x] `src/main/java/com/samgov/ingestor/repository/EmailVerificationTokenRepository.java` - Token repository
- [x] `src/main/java/com/samgov/ingestor/service/EmailVerificationService.java` - Email verification service
- [x] `src/main/java/com/samgov/ingestor/controller/EmailVerificationController.java` - API endpoints

### Frontend
- [x] `sam-dashboard/src/pages/RegisterPage.tsx` - Registration form
- [x] `sam-dashboard/src/pages/RegisterPage.types.ts` - Type definitions
- [x] `sam-dashboard/src/pages/VerifyEmailPage.tsx` - Email verification handler

## API Endpoints Added

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/verify-email` | Verify email with token |
| POST | `/auth/resend-verification` | Resend verification email |

## Routes to Add to App.tsx

```tsx
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';

// Add routes:
<Route path="/register" element={<RegisterPage />} />
<Route path="/verify-email" element={<VerifyEmailPage />} />
```

## Database Changes

New table: `email_verification_tokens`
- `id` (UUID, PK)
- `token_hash` (VARCHAR, unique)
- `user_id` (UUID, FK -> users)
- `expires_at` (TIMESTAMP)
- `used_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP)

## Configuration Properties

```yaml
app:
  email-verification:
    expiration-hours: 24
  frontend-url: http://localhost:5173
```

## Flow

1. User submits registration form at `/register`
2. Backend creates user (status: PENDING, emailVerified: false)
3. Backend creates verification token and sends email via EmailService
4. User clicks link in email → `/verify-email?token=...`
5. Frontend calls POST `/auth/verify-email`
6. Backend validates token, marks email verified, activates user
7. User redirected to login

## Notes

- Tokens are hashed with SHA-256 before storage (security best practice)
- Tokens expire after 24 hours (configurable)
- Existing registration endpoint in AuthController unchanged
- EmailVerificationService uses EmailService interface (works with ConsoleEmailService for dev)
