# Wave 1: OpenAPI Type Generation Complete

## Overview

OpenAPI type generation is now set up to automatically generate TypeScript types from the backend API specification.

## Files Created/Modified

### New Files
- `sam-dashboard/scripts/generate-api-types.js` - Generation script with fetch/save/offline modes
- `sam-dashboard/src/services/apiClient.ts` - Type-safe API client wrapper
- `sam-dashboard/src/types/api.generated.ts` - Generated types (placeholder until backend runs)

### Modified Files
- `sam-dashboard/package.json` - Updated npm scripts

## Usage

### Generate Types (requires running backend)

```bash
# Start backend
./gradlew bootRun

# In another terminal, generate types
cd sam-dashboard
npm run generate:types
```

### Save Spec for Offline Generation

```bash
# Save the OpenAPI spec locally
npm run generate:types:save

# Later, generate from saved spec (no backend needed)
npm run generate:types:offline
```

### NPM Scripts

| Script | Description |
|--------|-------------|
| `generate:types` | Fetch spec from backend and generate types |
| `generate:types:save` | Fetch spec and save to `openapi.json` |
| `generate:types:offline` | Generate from saved `openapi.json` |

## API Client Usage

```typescript
import { apiClient } from '@/services/apiClient';
import type { AuthenticationResponse, UserDto } from '@/types/api.generated';

// GET request
const result = await apiClient.get<UserDto>('/users/me');
if (result.success) {
  console.log(result.data.email);
} else {
  console.error(result.error.message);
}

// POST request
const authResult = await apiClient.post<AuthenticationResponse>(
  '/auth/login',
  { email: 'user@example.com', password: 'secret' },
  { auth: false }
);
```

## Type Safety

The generated types provide:
- Request body type checking
- Response type inference
- Query parameter types
- Path parameter types

## Backend Configuration

OpenAPI is already configured in the backend:
- `src/main/java/com/samgov/ingestor/config/OpenApiConfig.java`
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI spec: http://localhost:8080/v3/api-docs

## Dependencies

- `openapi-typescript` (devDependency) - Generates TypeScript from OpenAPI spec

## Notes

- The `api.generated.ts` file contains placeholder types until the backend runs
- Common types like `PageResponse`, `ErrorResponse`, and `AuthenticationResponse` are manually maintained for convenience
- The apiClient uses the Result pattern for type-safe error handling
