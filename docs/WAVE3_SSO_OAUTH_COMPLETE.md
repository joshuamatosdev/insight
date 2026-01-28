# Wave 3: SSO/OAuth Integration Complete

## Overview

Implemented OAuth2/OIDC login integration with support for Google, Microsoft, and enterprise SAML SSO.

## Files Created

### Backend
- [x] `src/main/java/com/samgov/ingestor/model/OAuthConnection.java` - Entity for OAuth connections
- [x] `src/main/java/com/samgov/ingestor/repository/OAuthConnectionRepository.java` - Repository
- [x] `src/main/java/com/samgov/ingestor/config/OAuth2Properties.java` - Configuration properties
- [x] `src/main/java/com/samgov/ingestor/service/OAuth2UserService.java` - OAuth user service
- [x] `src/main/java/com/samgov/ingestor/controller/OAuth2Controller.java` - REST API

### Frontend
- [x] `sam-dashboard/src/services/oauthService.ts` - OAuth API service
- [x] `sam-dashboard/src/components/auth/SocialLoginButtons.tsx` - Social login UI
- [x] `sam-dashboard/src/pages/OAuthCallbackPage.tsx` - OAuth callback handler

### Tests
- [x] `src/test/java/com/samgov/ingestor/service/OAuth2UserServiceTest.java`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/oauth/providers` | Get enabled OAuth providers |
| POST | `/oauth/callback` | Process OAuth callback |
| GET | `/oauth/connections` | Get user's linked connections |
| POST | `/oauth/link` | Link a new provider |
| DELETE | `/oauth/connections/{provider}` | Unlink a provider |

## Routes to Add to App.tsx

```tsx
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';

<Route path="/oauth/callback" element={<OAuthCallbackPage />} />
```

## Configuration to Add

```yaml
# application.yaml
app:
  oauth2:
    enabled: true
    frontend-url: http://localhost:5173
    callback-path: /oauth/callback
    providers:
      google:
        enabled: true
        client-id: ${GOOGLE_CLIENT_ID:}
        client-secret: ${GOOGLE_CLIENT_SECRET:}
      microsoft:
        enabled: true
        client-id: ${MICROSOFT_CLIENT_ID:}
        client-secret: ${MICROSOFT_CLIENT_SECRET:}
      saml:
        enabled: false
```

## Database Changes

New table: `oauth_connections`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `provider` (VARCHAR) - google, microsoft, saml
- `provider_user_id` (VARCHAR)
- `email` (VARCHAR)
- `access_token` (TEXT, encrypted)
- `refresh_token` (TEXT, encrypted)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `last_login_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Supported Providers

1. **Google** - OAuth2/OIDC with Google accounts
2. **Microsoft** - Azure AD / Microsoft 365
3. **SAML** - Enterprise SSO (configurable per tenant)

## Usage

### Adding Social Login to LoginPage

```tsx
import { SocialLoginButtons } from '../components/auth/SocialLoginButtons';

// In LoginPage, add after the login form:
<SocialLoginButtons />
```

### Flow

1. User clicks "Continue with Google/Microsoft"
2. Redirected to provider authorization page
3. User authenticates with provider
4. Provider redirects to `/oauth/callback?provider=...&code=...`
5. Backend exchanges code for tokens, finds/creates user
6. JWT issued, user logged in

## Security Considerations

- OAuth tokens stored encrypted in database
- Provider user IDs used to prevent email-based account takeover
- Users can unlink providers only if they have another login method
- All OAuth endpoints require HTTPS in production
