# End-to-End (E2E) Tests

## Overview

This directory contains comprehensive E2E tests that validate the entire application stack with real database integration.

## Testing Philosophy

**Real Integration Over Mocking**

Our E2E tests follow these principles:
- ✅ **Real Database**: Uses PostgreSQL at localhost:5433
- ✅ **Full HTTP Cycle**: Tests actual HTTP requests through MockMvc
- ✅ **Multi-Tenant Validation**: Verifies tenant data isolation
- ✅ **Transactional Cleanup**: Each test auto-rollback (no pollution)
- ❌ **No Mocking**: Never mock internal services or repositories

## Test Architecture

### Base Class: `BaseControllerTest`

All E2E tests extend `BaseControllerTest` which provides:
- Spring Boot test context with random port
- MockMvc for HTTP request simulation
- Tenant context management
- Common test utilities (`performGet`, `performPost`, etc.)
- Transactional isolation per test

### Example Test Structure

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
@DisplayName("Feature E2E Tests")
class FeatureE2ETest extends BaseControllerTest {

    @Test
    @DisplayName("should perform operation successfully")
    void shouldPerformOperation() throws Exception {
        // Arrange: Create test data
        createTestData();

        // Act: Execute request
        performPost("/api/feature/action", requestBody)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").exists());

        // Assert: Verify database state
        assertEquals(1, repository.count());
    }

    private void createTestData() {
        // Create real entities in database
    }
}
```

## Analytics E2E Tests

**File**: `AnalyticsE2ETest.java`

### Coverage

Tests all analytics endpoints with comprehensive scenarios:

1. **Dashboard Statistics**
   - GET /api/analytics/dashboard
   - Validates KPIs, metrics, trend data
   - Tests authentication requirements

2. **Activity Feed**
   - GET /api/analytics/activity?limit=20
   - Tests various limit parameters (5, 20, 50, 100)
   - Validates pagination behavior

3. **Top Performers**
   - GET /api/analytics/top-performers?limit=10
   - Tests different user scenarios
   - Validates user aggregation logic

4. **Event Tracking**
   - POST /api/analytics/track
   - Tests all event types (27 types)
   - Validates event persistence

### Test Data Seeding

Each test run creates:
- **1 Test Tenant** - PRO tier, ACTIVE status
- **6 Test Users** - Primary user + 5 additional users
- **50+ Analytics Events** - Distributed across event types:
  - 10 PAGE_VIEW events
  - 15 OPPORTUNITY_VIEWED events
  - 10 SEARCH_PERFORMED events
  - 8 PIPELINE_OPPORTUNITY_ADDED events
  - 7 DOCUMENT_UPLOADED events

### Helper Methods

```java
createTestUsers()           // Creates 5 test users for top performers
createTestAnalyticsEvents() // Generates 50+ diverse events
```

## Running Tests

### Run All E2E Tests
```bash
./gradlew test --tests "*E2ETest"
```

### Run Specific Test Class
```bash
./gradlew test --tests "com.samgov.ingestor.e2e.AnalyticsE2ETest"
```

### Run Specific Test Method
```bash
./gradlew test --tests "com.samgov.ingestor.e2e.AnalyticsE2ETest.should_TrackPageViewEvent"
```

### Run Specific Nested Class
```bash
./gradlew test --tests "com.samgov.ingestor.e2e.AnalyticsE2ETest.EventTrackingFlow"
```

## Test Database Configuration

**Location**: `src/test/resources/application-test.yaml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/sam_test
    username: dev_user
    password: dev_pass

  jpa:
    hibernate:
      ddl-auto: create-drop  # Auto-creates schema per test
```

### Key Features:
- **Auto Schema Creation**: Tables created automatically from JPA entities
- **Transactional Rollback**: Each test rolled back automatically
- **No Manual Cleanup**: Spring handles all cleanup
- **Fast Execution**: Despite real DB, tests run in < 1 second each

## Multi-Tenant Testing

All tests validate tenant isolation:

```java
@Test
void shouldIsolateTenantData() throws Exception {
    // Create data for tenant1
    setTenantContext(tenant1.getId(), user1.getId());
    createTestData();

    // Switch to tenant2
    setTenantContext(tenant2.getId(), user2.getId());

    // Verify tenant1 data is not accessible
    performGet("/api/analytics/dashboard")
        .andExpect(jsonPath("$.count").value(0));
}
```

## Writing New E2E Tests

### Checklist

- [ ] Extend `BaseControllerTest`
- [ ] Add `@SpringBootTest`, `@ActiveProfiles("test")`, `@Transactional`
- [ ] Use descriptive test names (`should_DoSomething`)
- [ ] Create test data in `@BeforeEach` or helper methods
- [ ] Test both success and error cases
- [ ] Validate authentication requirements
- [ ] Test multi-tenant isolation
- [ ] Use `jsonPath()` for response validation

### Example Template

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
@DisplayName("Your Feature E2E Tests")
class YourFeatureE2ETest extends BaseControllerTest {

    @Autowired
    private YourRepository yourRepository;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        // Create your test data
    }

    @Nested
    @DisplayName("Happy Path Tests")
    class HappyPath {
        @Test
        @DisplayName("should perform action successfully")
        void shouldPerformAction() throws Exception {
            performPost("/api/your-endpoint", requestBody)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
        }
    }

    @Nested
    @DisplayName("Error Cases")
    class ErrorCases {
        @Test
        @DisplayName("should require authentication")
        void shouldRequireAuthentication() throws Exception {
            performGetWithoutAuth("/api/your-endpoint")
                .andExpect(status().isUnauthorized());
        }
    }
}
```

## Existing E2E Test Files

The following E2E test files exist (21 files total):

1. **AnalyticsE2ETest** - Analytics endpoints (dashboard, activity, tracking)
2. **ReportAnalyticsE2ETest** - Reports and analytics
3. **AuthE2ETest** - Authentication flows
4. **ContractE2ETest** - Contract operations
5. **CRME2ETest** - CRM (contacts, organizations)
6. **OnboardingE2ETest** - Onboarding wizard
7. **PipelineE2ETest** - Pipeline management
8. Plus 14 more...

## Best Practices

### DO ✅
- Test real database interactions
- Use descriptive test names
- Group related tests with `@Nested`
- Create helper methods for test data
- Validate JSON response structure
- Test authentication/authorization
- Test multi-tenant isolation
- Use builders for clean test data creation

### DON'T ❌
- Mock internal services or repositories
- Use hardcoded IDs or timestamps
- Skip authentication tests
- Forget to test error cases
- Leave test data in database (use `@Transactional`)
- Use `Thread.sleep()` for timing (use proper waits)

## Troubleshooting

### Tests Fail with Connection Error
- **Check**: PostgreSQL running at localhost:5433?
- **Fix**: Start PostgreSQL or update `application-test.yaml`

### Tests Pollute Database
- **Check**: Missing `@Transactional` annotation?
- **Fix**: Add `@Transactional` to test class

### Tests Are Slow
- **Check**: Creating too much test data?
- **Fix**: Minimize data creation, use focused queries

### Multi-Tenant Tests Fail
- **Check**: Tenant context set correctly?
- **Fix**: Call `setTenantContext()` before requests

## Additional Resources

- **BaseControllerTest**: See `BaseControllerTest.java` for common utilities
- **Test Annotations**: Spring Boot Testing documentation
- **MockMvc**: Spring MockMvc documentation
- **JUnit 5**: JUnit 5 User Guide
