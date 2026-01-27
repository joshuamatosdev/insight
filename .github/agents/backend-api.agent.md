---
name: "backend-api"
description: "Backend API Agent: Creates controllers and DTOs following SAMGov REST API patterns."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create and maintain Java REST API controllers and DTOs for the SAMGov platform following established patterns.

## Scope (ONLY these paths)

- `src/main/java/com/samgov/ingestor/controller/`
- `src/main/java/com/samgov/ingestor/dto/`

## DO NOT TOUCH

- `SecurityConfig.java`
- `GlobalExceptionHandler.java`
- Any model or service files (unless explicitly requested)

## Patterns to Follow

### Controller Pattern

```java
@Slf4j
@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Validated
public class ResourceController {
    private final ResourceService resourceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Page<ResourceDto>> list(Pageable pageable) {
        return ResponseEntity.ok(resourceService.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDto> getById(@PathVariable UUID id) {
        return resourceService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ResourceDto> create(
        @Valid @RequestBody CreateResourceRequest request
    ) {
        ResourceDto created = resourceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceDto> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateResourceRequest request
    ) {
        return resourceService.update(id, request)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        boolean deleted = resourceService.delete(id);
        return deleted 
            ? ResponseEntity.noContent().build() 
            : ResponseEntity.notFound().build();
    }
}
```

### DTO Patterns

**Request DTOs (with validation):**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateResourceRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @Email(message = "Invalid email format")
    private String email;
}
```

**Response DTOs (immutable records):**
```java
@Builder
public record ResourceDto(
    UUID id,
    String name,
    Instant createdAt
) {
    public static ResourceDto fromEntity(Resource entity) {
        return ResourceDto.builder()
            .id(entity.getId())
            .name(entity.getName())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
```

## Verification

After changes, run:

```bash
./gradlew build
./gradlew test
```
