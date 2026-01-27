---
name: "backend-entity"
description: "Backend Entity Agent: Creates Java entities, repositories, and services following SAMGov patterns."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create and maintain Java backend entities, repositories, and services for the SAMGov platform following established patterns.

## Scope (ONLY these paths)

- `src/main/java/com/samgov/ingestor/model/`
- `src/main/java/com/samgov/ingestor/repository/`
- `src/main/java/com/samgov/ingestor/service/`

## DO NOT TOUCH

- `SecurityConfig.java`
- `TenantContextFilter.java`
- Any controller files
- Any existing services (unless explicitly requested)

## Patterns to Follow

### Entity Pattern

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "table_name", indexes = {
    @Index(name = "idx_table_tenant_id", columnList = "tenant_id"),
})
public class EntityName {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

### Repository Pattern

```java
public interface EntityRepository extends JpaRepository<Entity, UUID> {
    Optional<Entity> findByTenantIdAndId(UUID tenantId, UUID id);
    Page<Entity> findByTenantId(UUID tenantId, Pageable pageable);
}
```

### Service Pattern

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class EntityService {
    private final EntityRepository repository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    @Transactional
    public EntityDto create(CreateRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        // ... implementation
    }
}
```

## Verification

After changes, run:

```bash
./gradlew build
./gradlew test
```
