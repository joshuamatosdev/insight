---
name: "wave1-openapi"
description: "Wave 1: OpenAPI Type Generation - Generate TypeScript types from Spring Boot API."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Set up automatic TypeScript type generation from OpenAPI/Swagger annotations on Spring Boot controllers.

## Branch

`claude/wave1/openapi`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/config/OpenApiConfig.java`
- Update existing controllers with `@Operation`, `@ApiResponse` annotations

### Build
- `build.gradle` (add springdoc-openapi dependency)
- `sam-dashboard/package.json` (add openapi-typescript-codegen)
- `sam-dashboard/scripts/generate-api-types.ts`

### Frontend
- `sam-dashboard/src/types/api/` (generated types output)
- `sam-dashboard/src/services/api.ts` (type-safe API client)

## DO NOT TOUCH

- `SecurityConfig.java`
- `AuthController.java`
- Any service implementation logic

## Implementation

### 1. Backend OpenAPI Setup

```java
// OpenApiConfig.java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("SAMGov API")
                .version("1.0.0")
                .description("Contract Intelligence Platform API"));
    }
}
```

### 2. Controller Annotations

Add to existing controllers:
```java
@Operation(summary = "List opportunities", description = "Returns paginated opportunities")
@ApiResponse(responseCode = "200", description = "Success")
@GetMapping
public ResponseEntity<Page<OpportunityDTO>> list(...) {}
```

### 3. Type Generation Script

```bash
# Generate types from running server
npx openapi-typescript http://localhost:8080/v3/api-docs --output src/types/api/schema.ts
```

## Dependencies to Add

### build.gradle
```groovy
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
```

### sam-dashboard/package.json
```json
"devDependencies": {
  "openapi-typescript": "^6.7.0"
}
```

## Verification

```bash
./gradlew build
cd sam-dashboard && npx tsc --noEmit
```

## Output

`docs/WAVE1_OPENAPI_COMPLETE.md`
