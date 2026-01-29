# Technical Debt

This document tracks known technical debt items that should be addressed in future iterations.

## OpenAPI Type Safety Refactoring

### Status: IN PROGRESS

### Background

The codebase uses `openapi-fetch` with auto-generated types from the OpenAPI spec. However, many services use manual type assertions (`as Type`) which bypass TypeScript's type safety and defeat the purpose of using `openapi-fetch`.

### Completed (✅)

1. **Type Helper Utilities** (`src/types/openapi-helpers.ts`)
   - Created reusable type helpers for extracting types from OpenAPI spec
   - `GetResponse<T>`, `PostResponse<T>`, `PutResponse<T>`, etc.
   - `PostRequestBody<T>`, `PutRequestBody<T>`, etc.

2. **complianceService.ts** (REFACTORED)
   - Removed all manual type assertions (20+ functions)
   - Now uses OpenAPI-generated types exclusively
   - Full type safety from spec

3. **OpenAPI Spec Regeneration**
   - Regenerated `api.generated.ts` from latest backend
   - All `/portal/` endpoints now included
   - Spec synchronized with backend controllers

### Remaining Work (❌)

The following services still use manual type assertions and need refactoring:

**High Priority (>10 assertions):**
- `crmService.ts` - 20 assertions (Contact, Organization, Interaction)
- `opportunityService.ts` - Multiple assertions
- `contractService.ts` - Multiple assertions
- `pipelineService.ts` - Multiple assertions
- `financialService.ts` - Multiple assertions

**Medium Priority (5-10 assertions):**
- `documentService.ts`
- `portalService.ts`
- `notificationService.ts`
- `userService.ts`
- `sbirService.ts`

**Low Priority (<5 assertions):**
- `alertService.ts`
- `apiKeyService.ts`
- `invitationService.ts`
- `savedSearchService.ts`
- `webhookService.ts`
- `fileService.ts`
- `auth.ts`
- `rbac.ts`
- `usage.ts`

### Refactoring Pattern

For each service:

1. **Import type helpers:**
```typescript
import type {GetResponse, PostResponse, PutResponse, PostRequestBody, PutRequestBody} from '../types/openapi-helpers';
```

2. **Update return types:**
```typescript
// Before:
export async function fetchItem(id: string): Promise<Item> {
    const {data, error} = await apiClient.GET('/items/{id}', ...);
    return data as Item;  // ❌ Manual assertion
}

// After:
export async function fetchItem(id: string): Promise<GetResponse<'/items/{id}'>> {
    const {data, error} = await apiClient.GET('/items/{id}', ...);
    return data;  // ✅ Automatically typed
}
```

3. **Update request types:**
```typescript
// Before:
export async function createItem(request: CreateItemRequest): Promise<Item> {
    const {data, error} = await apiClient.POST('/items', {body: request});
    return data as Item;  // ❌ Manual assertion
}

// After:
export async function createItem(
    request: PostRequestBody<'/items'>
): Promise<PostResponse<'/items'>> {
    const {data, error} = await apiClient.POST('/items', {body: request});
    return data;  // ✅ Automatically typed
}
```

### Benefits of Refactoring

- ✅ **True type safety** - No bypassing with `as`
- ✅ **Automatic updates** - Types update when backend changes
- ✅ **Compile-time errors** - API mismatches caught at build time
- ✅ **Better IDE support** - Accurate autocomplete and type hints
- ✅ **Self-documenting** - Return types show exact API response structure

### Estimated Effort

- **High Priority services:** 30-45 minutes each
- **Medium Priority services:** 15-30 minutes each
- **Low Priority services:** 5-15 minutes each
- **Total:** 6-8 hours

### Notes

- Test files (`*.test.ts`) can keep manual assertions for mocking flexibility
- Some services may use custom wrappers that need special handling
- Always run `npx tsc --noEmit` after refactoring to verify type safety

---

## Other Technical Debt Items

(Add other technical debt items here as they are identified)

