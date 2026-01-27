# Wave 5: API Documentation Complete

## Overview

Enhanced API documentation with OpenAPI/Swagger annotations and standardized response formats.

## Files Created

### Backend
- [x] `src/main/java/com/samgov/ingestor/config/OpenApiEnhancedConfig.java`
- [x] `src/main/java/com/samgov/ingestor/dto/ApiErrorResponse.java`

## Swagger UI Access

```
http://localhost:8080/swagger-ui.html
```

## OpenAPI Spec

```
http://localhost:8080/v3/api-docs
```

## Features

### 1. Comprehensive API Info
- Description with markdown formatting
- Authentication guide
- Rate limiting documentation
- Error handling examples

### 2. Server Definitions
- Development
- Staging
- Production

### 3. Tag Grouping
- Authentication
- Opportunities
- Contracts
- Pipeline
- Users
- Tenants
- Reports
- Export
- Search

### 4. Security Scheme
JWT Bearer token authentication documented

### 5. Common Schemas
- ErrorResponse
- PageResponse

## Standard Error Response

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/opportunities",
  "fieldErrors": [
    {
      "field": "email",
      "message": "must be a valid email address",
      "rejectedValue": "invalid"
    }
  ],
  "requestId": "abc-123-def-456"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| BAD_REQUEST | 400 | Invalid request |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Access denied |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service unavailable |

## Usage

Add OpenAPI annotations to controllers:

```java
@Operation(
    summary = "Get opportunity by ID",
    description = "Retrieves a single opportunity by its unique identifier"
)
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Success"),
    @ApiResponse(responseCode = "404", description = "Not found",
        content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
@GetMapping("/{id}")
public ResponseEntity<OpportunityDTO> getById(@PathVariable UUID id) { ... }
```
