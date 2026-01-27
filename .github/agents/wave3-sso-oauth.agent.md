---
name: "wave3-sso-oauth"
description: "Wave 3: SSO/OAuth Integration - Google, Microsoft, and SAML enterprise SSO."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement OAuth2/OIDC login with Google, Microsoft, and enterprise SAML SSO support.

## Branch

`claude/wave3/sso-oauth`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/config/OAuth2Config.java`
- `src/main/java/com/samgov/ingestor/config/OAuth2Properties.java`
- `src/main/java/com/samgov/ingestor/service/OAuth2UserService.java`
- `src/main/java/com/samgov/ingestor/service/SamlService.java`
- `src/main/java/com/samgov/ingestor/controller/OAuth2Controller.java`
- `src/main/java/com/samgov/ingestor/model/OAuthConnection.java`
- `src/main/java/com/samgov/ingestor/repository/OAuthConnectionRepository.java`

### Frontend
- `sam-dashboard/src/pages/OAuthCallbackPage.tsx`
- `sam-dashboard/src/components/auth/SocialLoginButtons.tsx`
- `sam-dashboard/src/pages/admin/SSOSettingsPage.tsx`
- `sam-dashboard/src/services/oauthService.ts`

### Tests
- `src/test/java/com/samgov/ingestor/service/OAuth2UserServiceTest.java`

## Supported Providers

1. **Google** - OAuth2/OIDC
2. **Microsoft Azure AD** - OAuth2/OIDC
3. **Enterprise SAML** - Configurable per tenant

## Data Model

### OAuthConnection
```java
@Entity
public class OAuthConnection {
    UUID id;
    UUID userId;
    String provider;        // google, microsoft, saml
    String providerUserId;
    String email;
    String accessToken;     // Encrypted
    String refreshToken;    // Encrypted
    Instant expiresAt;
    Instant createdAt;
    Instant lastLoginAt;
}
```

## Configuration

```yaml
# application.yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
          microsoft:
            client-id: ${MICROSOFT_CLIENT_ID}
            client-secret: ${MICROSOFT_CLIENT_SECRET}
```

## Flow

1. User clicks "Sign in with Google/Microsoft"
2. Redirect to provider
3. Provider redirects to callback URL
4. OAuth2UserService:
   - Find or create user by email
   - Link OAuth connection
   - Generate JWT
5. Redirect to dashboard with token

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE3_SSO_OAUTH_COMPLETE.md`
