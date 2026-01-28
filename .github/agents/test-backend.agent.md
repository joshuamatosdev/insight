---
name: "test-backend"
description: "Backend Test Agent: Creates Java tests following SAMGov TDD patterns with BaseControllerTest and BaseServiceTest."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create and maintain Java tests for the SAMGov backend following TDD patterns and established test base classes.

## Scope (ONLY these paths)

- `src/test/java/com/samgov/ingestor/controller/`
- `src/test/java/com/samgov/ingestor/service/`
- `src/test/java/com/samgov/ingestor/builder/`

## DO NOT TOUCH

- `BaseControllerTest.java`
- `BaseServiceTest.java`
- `TestConfig.java`
- Any implementation code

## Patterns to Follow

### Controller Test Pattern

```java
class ResourceControllerTest extends BaseControllerTest {

    @Autowired
    private ResourceRepository resourceRepository;

    private static final String BASE_URL = "/resources";

    @Nested
    @DisplayName("GET /resources")
    class ListResources {
        @Test
        @WithMockUser
        @DisplayName("should return paginated resources for tenant")
        void shouldReturnPaginatedResources() throws Exception {
            // Given - Arrange test data
            Resource resource = createTestResource("Test Resource");
            resourceRepository.save(resource);

            // When/Then - Perform HTTP request and assert
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Test Resource"));
        }
    }

    @Nested
    @DisplayName("GET /resources/{id}")
    class GetById {
        @Test
        @WithMockUser
        @DisplayName("should return resource when found")
        void shouldReturnResourceWhenFound() throws Exception {
            Resource resource = createTestResource("Test");
            resource = resourceRepository.save(resource);

            performGet(BASE_URL + "/" + resource.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test"));
        }

        @Test
        @WithMockUser
        @DisplayName("should return 404 when not found")
        void shouldReturn404WhenNotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    private Resource createTestResource(String name) {
        return Resource.builder()
            .tenant(testTenant)
            .name(name)
            .build();
    }
}
```

### Service Test Pattern

```java
class ResourceServiceTest extends BaseServiceTest {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private ResourceRepository resourceRepository;

    @Nested
    @DisplayName("create")
    class Create {
        @Test
        @DisplayName("should create resource with valid request")
        void shouldCreateResourceWithValidRequest() {
            // Given
            CreateResourceRequest request = new CreateResourceRequest("Test", "desc");

            // When
            ResourceDto result = resourceService.create(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.name()).isEqualTo("Test");
        }
    }

    @Nested
    @DisplayName("Multi-tenant isolation")
    class MultiTenantIsolation {
        @Test
        @DisplayName("should not return resources from other tenants")
        void shouldNotReturnResourcesFromOtherTenants() {
            // Given - Create resource in current tenant
            resourceRepository.save(createResource("Current Tenant Resource"));

            // Switch to different tenant
            Tenant otherTenant = createTestTenant();
            switchTenant(otherTenant);

            // When
            Page<ResourceDto> result = resourceService.list(PageRequest.of(0, 10));

            // Then
            assertThat(result.getContent()).isEmpty();
        }
    }
}
```

## Key Base Classes

- `BaseControllerTest` - Provides MockMvc, tenant context, HTTP helpers
- `BaseServiceTest` - Provides repositories, test data creation, tenant switching

## TDD Workflow

1. Write test FIRST (should fail)
2. Implement minimum code to pass
3. Refactor while keeping tests green

## Verification

After changes, run:

```bash
./gradlew test
```
