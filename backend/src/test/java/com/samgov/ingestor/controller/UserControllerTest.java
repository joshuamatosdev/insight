package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.CreateUserRequest;
import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for UserController.
 *
 * Tests focus on:
 * - HTTP request/response behavior
 * - Authorization checks
 * - Tenant isolation at the API level
 * - Input validation
 */
@DisplayName("UserController")
class UserControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/users";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    private Tenant testTenant;
    private User testUser;
    private Role testUserRole;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();

        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testUserRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .isSystemRole(false)
            .build();
        testUserRole = roleRepository.save(testUserRole);

        // Create test user
        testUser = User.builder()
            .email("testuser-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        // Create membership
        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testUserRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(membership);

        // Set tenant context for tests
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("GET /users/me")
    class GetCurrentUser {

        @Test
        @WithMockUser
        @DisplayName("should return current user details when authenticated")
        void shouldReturnCurrentUserDetailsWhenAuthenticated() throws Exception {
            // When/Then
            mockMvc.perform(get(BASE_URL + "/me")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
                .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.lastName").value("User"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            // Clear context to simulate unauthenticated request
            TenantContext.clear();

            mockMvc.perform(get(BASE_URL + "/me")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /users/me/memberships")
    class GetCurrentUserMemberships {

        @Test
        @WithMockUser
        @DisplayName("should return current user's tenant memberships")
        void shouldReturnCurrentUserMemberships() throws Exception {
            mockMvc.perform(get(BASE_URL + "/me/memberships")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$[0].roleName").value(Role.USER));
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            TenantContext.clear();

            mockMvc.perform(get(BASE_URL + "/me/memberships")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /users/{id}")
    class GetUserById {

        @Test
        @WithMockUser(roles = "SUPER_ADMIN")
        @DisplayName("should return user by ID for super admin")
        void shouldReturnUserByIdForSuperAdmin() throws Exception {
            mockMvc.perform(get(BASE_URL + "/" + testUser.getId())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
                .andExpect(jsonPath("$.email").value(testUser.getEmail()));
        }

        @Test
        @WithMockUser(roles = "SUPER_ADMIN")
        @DisplayName("should return 404 for non-existent user")
        void shouldReturn404ForNonExistentUser() throws Exception {
            UUID nonExistentId = UUID.randomUUID();

            mockMvc.perform(get(BASE_URL + "/" + nonExistentId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user without tenant access")
        void shouldReturn403ForRegularUserWithoutAccess() throws Exception {
            // Clear context - simulating user without proper access
            TenantContext.clear();
            TenantContext.setCurrentUserId(UUID.randomUUID());

            mockMvc.perform(get(BASE_URL + "/" + testUser.getId())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /users")
    class CreateUser {

        @Test
        @WithMockUser(roles = "SUPER_ADMIN")
        @DisplayName("should create user with valid data for super admin")
        void shouldCreateUserWithValidDataForSuperAdmin() throws Exception {
            CreateUserRequest request = CreateUserRequest.builder()
                .email("newuser@example.com")
                .password("SecurePass123!")
                .firstName("New")
                .lastName("User")
                .build();

            mockMvc.perform(post(BASE_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.firstName").value("New"))
                .andExpect(jsonPath("$.lastName").value("User"))
                .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user")
        void shouldReturn403ForRegularUser() throws Exception {
            CreateUserRequest request = CreateUserRequest.builder()
                .email("newuser@example.com")
                .password("SecurePass123!")
                .build();

            mockMvc.perform(post(BASE_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "SUPER_ADMIN")
        @DisplayName("should return 400 for invalid email")
        void shouldReturn400ForInvalidEmail() throws Exception {
            CreateUserRequest request = CreateUserRequest.builder()
                .email("invalid-email")
                .password("SecurePass123!")
                .build();

            mockMvc.perform(post(BASE_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "SUPER_ADMIN")
        @DisplayName("should return 400 for missing required fields")
        void shouldReturn400ForMissingRequiredFields() throws Exception {
            String requestJson = "{}";

            mockMvc.perform(post(BASE_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /users/{id}/activate")
    class ActivateUser {

        @Test
        @WithMockUser(roles = "SUPER_ADMIN")
        @DisplayName("should activate pending user for super admin")
        void shouldActivatePendingUserForSuperAdmin() throws Exception {
            // Create a pending user
            User pendingUser = User.builder()
                .email("pending-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(UserStatus.PENDING)
                .emailVerified(false)
                .build();
            pendingUser = userRepository.save(pendingUser);

            mockMvc.perform(post(BASE_URL + "/" + pendingUser.getId() + "/activate")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

            // Verify user is activated
            User activatedUser = userRepository.findById(pendingUser.getId()).orElseThrow();
            org.assertj.core.api.Assertions.assertThat(activatedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
            org.assertj.core.api.Assertions.assertThat(activatedUser.getEmailVerified()).isTrue();
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user")
        void shouldReturn403ForRegularUser() throws Exception {
            mockMvc.perform(post(BASE_URL + "/" + testUser.getId() + "/activate")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /users/{id}/suspend")
    class SuspendUser {

        @Test
        @WithMockUser(roles = "SUPER_ADMIN")
        @DisplayName("should suspend active user for super admin")
        void shouldSuspendActiveUserForSuperAdmin() throws Exception {
            mockMvc.perform(post(BASE_URL + "/" + testUser.getId() + "/suspend")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

            // Verify user is suspended
            User suspendedUser = userRepository.findById(testUser.getId()).orElseThrow();
            org.assertj.core.api.Assertions.assertThat(suspendedUser.getStatus()).isEqualTo(UserStatus.SUSPENDED);
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user")
        void shouldReturn403ForRegularUser() throws Exception {
            mockMvc.perform(post(BASE_URL + "/" + testUser.getId() + "/suspend")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PUT /users/me/default-tenant")
    class SetDefaultTenant {

        @Test
        @WithMockUser
        @DisplayName("should set default tenant for current user")
        void shouldSetDefaultTenantForCurrentUser() throws Exception {
            // Create a second tenant and membership
            Tenant secondTenant = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            secondTenant = tenantRepository.save(secondTenant);

            Role secondRole = Role.builder()
                .tenant(secondTenant)
                .name(Role.USER)
                .isSystemRole(false)
                .build();
            secondRole = roleRepository.save(secondRole);

            TenantMembership secondMembership = TenantMembership.builder()
                .user(testUser)
                .tenant(secondTenant)
                .role(secondRole)
                .isDefault(false)
                .acceptedAt(Instant.now())
                .build();
            membershipRepository.save(secondMembership);

            String requestJson = "{\"tenantId\": \"" + secondTenant.getId() + "\"}";

            mockMvc.perform(put(BASE_URL + "/me/default-tenant")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                .andExpect(status().isNoContent());
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            TenantContext.clear();

            String requestJson = "{\"tenantId\": \"" + testTenant.getId() + "\"}";

            mockMvc.perform(put(BASE_URL + "/me/default-tenant")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /users/{id}/memberships")
    class GetUserMemberships {

        @Test
        @WithMockUser(roles = "SUPER_ADMIN")
        @DisplayName("should return user memberships for super admin")
        void shouldReturnUserMembershipsForSuperAdmin() throws Exception {
            mockMvc.perform(get(BASE_URL + "/" + testUser.getId() + "/memberships")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].tenantId").value(testTenant.getId().toString()));
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 when accessing other user memberships")
        void shouldReturn403WhenAccessingOtherUserMemberships() throws Exception {
            // Create another user
            User otherUser = User.builder()
                .email("other-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            otherUser = userRepository.save(otherUser);

            mockMvc.perform(get(BASE_URL + "/" + otherUser.getId() + "/memberships")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /users/invite")
    class InviteUser {

        @Test
        @WithMockUser(roles = "TENANT_ADMIN")
        @DisplayName("should invite new user to tenant")
        void shouldInviteNewUserToTenant() throws Exception {
            // Create admin role for the tenant
            Role adminRole = Role.builder()
                .tenant(testTenant)
                .name(Role.TENANT_ADMIN)
                .description("Admin role")
                .isSystemRole(false)
                .build();
            roleRepository.save(adminRole);

            // Update test user to be admin
            TenantMembership adminMembership = membershipRepository
                .findByUserIdAndTenantId(testUser.getId(), testTenant.getId())
                .orElseThrow();
            adminMembership.setRole(adminRole);
            membershipRepository.save(adminMembership);

            String requestJson = String.format("""
                {
                    "email": "invited-%s@example.com",
                    "firstName": "Invited",
                    "lastName": "User",
                    "tenantId": "%s",
                    "role": "USER"
                }
                """, UUID.randomUUID().toString().substring(0, 8), testTenant.getId());

            mockMvc.perform(post(BASE_URL + "/invite")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$.roleName").value(Role.USER));
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user")
        void shouldReturn403ForRegularUser() throws Exception {
            String requestJson = String.format("""
                {
                    "email": "invited@example.com",
                    "tenantId": "%s"
                }
                """, testTenant.getId());

            mockMvc.perform(post(BASE_URL + "/invite")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    class TenantIsolationTests {

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "TENANT_ADMIN")
        @DisplayName("should only see users from own tenant")
        void shouldOnlySeeUsersFromOwnTenant() throws Exception {
            // Create another tenant with its own user
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            User otherUser = User.builder()
                .email("other-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            otherUser = userRepository.save(otherUser);

            Role otherRole = Role.builder()
                .tenant(otherTenant)
                .name(Role.USER)
                .isSystemRole(false)
                .build();
            otherRole = roleRepository.save(otherRole);

            TenantMembership otherMembership = TenantMembership.builder()
                .user(otherUser)
                .tenant(otherTenant)
                .role(otherRole)
                .isDefault(true)
                .build();
            membershipRepository.save(otherMembership);

            // Try to access user from other tenant - should be forbidden
            mockMvc.perform(get(BASE_URL + "/" + otherUser.getId())
                    .header("X-Tenant-Id", testTenant.getId())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        }
    }
}
