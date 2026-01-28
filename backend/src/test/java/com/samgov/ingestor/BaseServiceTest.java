package com.samgov.ingestor;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Base class for service layer integration tests.
 *
 * Provides:
 * - Real PostgreSQL database via Testcontainers
 * - Tenant context management for multi-tenant tests
 * - Common repository access
 * - Transactional test isolation
 *
 * Usage:
 * <pre>
 * class MyServiceTest extends BaseServiceTest {
 *     @Autowired
 *     private MyService myService;
 *
 *     @Test
 *     void shouldDoSomething() {
 *         // Test using testTenant and testUser from base class
 *         var result = myService.doSomething();
 *         assertThat(result).isNotNull();
 *     }
 * }
 * </pre>
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class BaseServiceTest {

    @Autowired
    protected TenantRepository tenantRepository;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected RoleRepository roleRepository;

    @Autowired
    protected TenantMembershipRepository tenantMembershipRepository;

    protected Tenant testTenant;
    protected User testUser;
    protected Role testUserRole;
    protected TenantMembership testMembership;

    /**
     * Set up a default test tenant and user before each test.
     * Subclasses can override and call super.setUp() to extend.
     */
    @BeforeEach
    protected void setUp() {
        // Create a test tenant
        testTenant = createTestTenant();

        // Create test role
        testUserRole = createTestRole(testTenant, Role.USER);

        // Create a test user
        testUser = createTestUser();

        // Create tenant membership
        testMembership = createTestMembership(testUser, testTenant, testUserRole);

        // Set tenant context for the test
        setTenantContext(testTenant.getId(), testUser.getId());
    }

    /**
     * Clear tenant context after each test.
     */
    @AfterEach
    protected void tearDown() {
        TenantContext.clear();
    }

    /**
     * Create a test tenant with default values.
     * Override to customize tenant properties.
     */
    protected Tenant createTestTenant() {
        Tenant tenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        return tenantRepository.save(tenant);
    }

    /**
     * Create a test role.
     */
    protected Role createTestRole(Tenant tenant, String roleName) {
        Role role = Role.builder()
            .tenant(tenant)
            .name(roleName)
            .description("Test " + roleName + " role")
            .isSystemRole(false)
            .build();
        return roleRepository.save(role);
    }

    /**
     * Create a test user with default values.
     * Override to customize user properties.
     */
    protected User createTestUser() {
        User user = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        return userRepository.save(user);
    }

    /**
     * Create a tenant membership linking a user to a tenant with a role.
     */
    protected TenantMembership createTestMembership(User user, Tenant tenant, Role role) {
        TenantMembership membership = TenantMembership.builder()
            .user(user)
            .tenant(tenant)
            .role(role)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        return tenantMembershipRepository.save(membership);
    }

    /**
     * Create an admin user for tests requiring admin privileges.
     */
    protected User createTestAdmin() {
        User admin = User.builder()
            .email("admin-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Admin")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        admin = userRepository.save(admin);

        // Create admin role if needed
        Role adminRole = createTestRole(testTenant, Role.TENANT_ADMIN);
        createTestMembership(admin, testTenant, adminRole);

        return admin;
    }

    /**
     * Set the tenant context for the current test.
     */
    protected void setTenantContext(UUID tenantId, UUID userId) {
        TenantContext.setCurrentTenantId(tenantId);
        TenantContext.setCurrentUserId(userId);
    }

    /**
     * Clear the tenant context.
     */
    protected void clearTenantContext() {
        TenantContext.clear();
    }

    /**
     * Switch the current user context (e.g., for testing user-specific operations).
     */
    protected void switchUser(User user) {
        TenantContext.setCurrentUserId(user.getId());
    }

    /**
     * Switch to a different tenant context.
     */
    protected void switchTenant(Tenant tenant) {
        TenantContext.setCurrentTenantId(tenant.getId());
    }
}
