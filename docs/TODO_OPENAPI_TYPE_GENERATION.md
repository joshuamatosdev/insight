# TODO: Switch to OpenAPI Type Generation

## Overview

Replace manually-written TypeScript types with auto-generated types from the backend's OpenAPI specification. This ensures type safety and eliminates manual synchronization between frontend and backend.

---

## Current Problem

- Frontend types are manually written in `src/auth/Auth.types.ts`, `src/services/auth.ts`, etc.
- API response format (snake_case, wrapped in `{success, data}`) differs from frontend types
- Manual transformation functions needed to map API responses to frontend types
- Risk of types drifting out of sync with actual API

---

## Solution: OpenAPI Codegen

### 1. Backend: Generate OpenAPI Spec

Spring Boot can auto-generate OpenAPI spec with Springdoc:

```xml
<!-- pom.xml or build.gradle -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

Access at: `http://localhost:8080/v3/api-docs`

### 2. Frontend: Generate TypeScript Types

Use `openapi-typescript` or `openapi-generator`:

```bash
# Option 1: openapi-typescript (lightweight, types only)
npm install -D openapi-typescript
npx openapi-typescript http://localhost:8080/v3/api-docs -o src/types/api.d.ts

# Option 2: openapi-generator (full client generation)
npm install -D @openapitools/openapi-generator-cli
npx openapi-generator-cli generate -i http://localhost:8080/v3/api-docs -g typescript-fetch -o src/api
```

### 3. Add to Build Process

```json
// package.json
{
  "scripts": {
    "generate:types": "openapi-typescript http://localhost:8080/v3/api-docs -o src/types/api.d.ts",
    "prebuild": "npm run generate:types"
  }
}
```

---

## Implementation Steps

1. [ ] Add Springdoc OpenAPI to backend
2. [ ] Configure OpenAPI annotations on controllers/DTOs
3. [ ] Verify spec generation at `/v3/api-docs`
4. [ ] Choose codegen tool (openapi-typescript recommended)
5. [ ] Add npm script for type generation
6. [ ] Replace manual types with generated types
7. [ ] Remove transformation functions (or simplify)
8. [ ] Add to CI/CD pipeline

---

## Files to Update

### Backend
- `build.gradle` - Add springdoc dependency
- Controller classes - Add OpenAPI annotations
- DTO classes - Add schema annotations

### Frontend
- `package.json` - Add codegen script
- `src/types/api.d.ts` - Generated types (new)
- `src/services/auth.ts` - Use generated types
- `src/auth/Auth.types.ts` - May become obsolete

---

## Benefits

- **Type Safety**: Guaranteed sync between frontend and backend
- **Developer Experience**: No manual type maintenance
- **Documentation**: OpenAPI spec serves as API documentation
- **Client Generation**: Can generate full API client if needed

---

## Considerations

- Backend must be running to generate types (or save spec to file)
- Consider committing generated types vs generating at build time
- May need custom configuration for snake_case → camelCase conversion

---

*Created: 2026-01-26*
*Priority: Medium*
*Estimate: 2-4 hours*
