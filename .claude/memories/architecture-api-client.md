# API Client Architecture

**Keyword:** `api_client_pattern`
**Category:** `architecture`, `api`
**Confidence:** 4/5

## Overview

SAMGov uses a centralized API client pattern for backend communication. All HTTP requests flow through a single point of control.

## Current Pattern

### API Base Import

All services import the API base URL from a central location:

```typescript
// src/services/apiClient.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
```

### Service Pattern

Each service (e.g., `opportunityService.ts`, `documentService.ts`) follows this pattern:

```typescript
import { API_BASE } from './apiClient';

async function fetchOpportunities() {
  const response = await fetch(`${API_BASE}/opportunities`);
  if (!response.ok) {
    throw new Error('Failed to fetch opportunities');
  }
  return response.json();
}
```

## Recent Changes

**Commit c68380e (2026-01-25):**
- Added `/api` prefix to all backend Spring Boot endpoints
- Backend controllers now expect `/api` prefix
- Example: `/opportunities` → `/api/opportunities`

**Commit 62e3b65 (2026-01-25):**
- Fixed frontend services to use `/api` prefix
- Centralized `API_BASE` import in all service files
- Removed hardcoded URLs scattered across components

## Benefits

1. **Single Source of Truth**: API base URL defined once
2. **Environment Flexibility**: Easy to change for dev/staging/prod
3. **Consistent Error Handling**: All requests flow through same patterns
4. **Type Safety**: Can add TypeScript fetch wrappers for better type inference

## Future Improvement: Centralized Network Governance

For a more robust architecture (similar to MasterBluePrint's `useControlPlane`), consider:

### Phase 1: Shared HTTP Client

Create a single `authFetch` wrapper that all services use:

```typescript
// src/services/apiClient.ts
export async function authFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response;
}
```

### Phase 2: Request Governance (Future)

Add capabilities to the shared client:

1. **Request Deduplication**: Same request in-flight → share promise
2. **Rate Limit Handling**: Detect 429 → backoff → retry
3. **Concurrency Control**: Cap max in-flight requests
4. **Polling Management**: Register polling jobs with visibility awareness
5. **Cross-Tab Coordination**: Single-leader polling across tabs

See `C:\Projects\MasterBluePrint\.claude\memories\architecture-use-control-plane.md` for full pattern.

## Current File Locations

```
sam-dashboard/src/services/
├── apiClient.ts              # Central API_BASE export
├── opportunityService.ts     # Opportunity data fetching
├── documentService.ts        # Document management
├── financialService.ts       # Budget/invoice data
├── complianceService.ts      # Compliance tracking
└── ... (other services)
```

## Error Pattern

When services encounter errors, they should:

1. Check response status explicitly
2. Throw descriptive errors (not generic "fetch failed")
3. Include context (endpoint, status code)
4. Let React Query handle retry logic at call site

```typescript
// ✅ GOOD - descriptive error
if (!response.ok) {
  throw new Error(`Failed to fetch opportunities: ${response.status} ${response.statusText}`);
}

// ❌ BAD - generic error
if (!response.ok) throw new Error('Error');
```

## Next Steps

When network issues arise (429s, bursts, polling), reference this pattern and consider implementing centralized governance incrementally.
