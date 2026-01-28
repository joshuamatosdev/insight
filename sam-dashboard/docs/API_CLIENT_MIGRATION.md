# API Client Migration Guide

## Overview

The project now uses **openapi-fetch** for type-safe API calls. All types are automatically inferred from the OpenAPI spec, eliminating manual type annotations.

## Current State

✅ **Phase 1 Complete** - Type-safe client installed and configured
- `openapi-fetch` installed
- Type-safe `apiClient` available for new code
- Legacy methods maintained for backward compatibility
- All existing services continue to work

## Migration Status

### Services Using Legacy Methods (14 files)
- [ ] `apiKeyService.ts`
- [ ] `complianceService.ts`
- [ ] `contractService.ts`
- [ ] `crmService.ts`
- [ ] `documentService.ts`
- [ ] `fileService.ts`
- [ ] `invitationService.ts`
- [ ] `notificationService.ts`
- [ ] `pipelineService.ts`
- [ ] `portalService.ts`
- [ ] `savedSearchService.ts`
- [ ] `userService.ts`
- [ ] `usage.ts`
- [ ] `webhookService.ts`

### Legacy api.ts Consumers (4 files)
- [ ] `hooks/useOpportunities.ts`
- [ ] `hooks/useOpportunities.test.ts`
- [ ] `pages/AlertsPage.tsx`
- [ ] `services/api.ts` (to be deleted after migration)

## How to Migrate a Service

### Before (Legacy)

```typescript
import { apiClient } from './apiClient';

export async function fetchContracts(page: number = 0): Promise<Contract[]> {
  const response = await apiClient.get<Contract[]>('/contracts', {
    params: { page }
  });

  if (response.success === false) {
    throw new Error(response.error.message);
  }

  return response.data;
}
```

### After (Type-Safe)

```typescript
import { apiClient } from './apiClient';

export async function fetchContracts(page: number = 0) {
  const { data, error } = await apiClient.GET('/contracts', {
    params: { query: { page } }
  });

  if (error !== undefined) {
    throw new Error(String(error));
  }

  // data is automatically typed from OpenAPI spec!
  return data;
}
```

### Key Changes

1. **No manual type parameters** - types are inferred
2. **Full paths** - use `/...` not relative paths
3. **Uppercase HTTP methods** - `GET`, `POST`, `PUT`, `DELETE`
4. **Params under `params.query`** - not top-level `params`
5. **Response format** - `{data, error}` instead of `{success, data/error}`

## Path Mapping Examples

| Legacy Path | New Path |
|-------------|----------|
| `/api-keys` | `/api-keys` |
| `/contracts` | `/contracts` |
| `/opportunities` | `/opportunities` |

## Benefits

✅ **100% Type Safety** - Types auto-inferred from OpenAPI spec
✅ **No Manual Annotations** - No more `<Contract[]>` parameters
✅ **Compile-Time Validation** - Wrong paths/params caught immediately
✅ **API Contract Enforcement** - Frontend stays in sync with backend
✅ **Better IntelliSense** - Auto-complete for all endpoints

## Testing After Migration

After migrating a service, run:

```bash
cd sam-dashboard

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Tests
npm test

# Manual testing
npm run dev
```

## Notes

- The legacy methods will be removed in a future PR after all services are migrated
- Each service should be migrated and tested individually
- The OpenAPI spec is regenerated with `npm run generate:types`
