package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Administration functionality.
 * Tests Tenant, User, Role, and Invitation management.
 */
class AdministrationE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Tenant testTenant;
    private User adminUser;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Admin E2E Tenant")
            .slug("admin-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        adminUser = userRepository.save(User.builder()
            .email("admin-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("Admin")
            .lastName("User")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = adminUser.getId();
    }

    @Nested
    @DisplayName("Tenant Management")
    class TenantManagement {

        @Test
        @DisplayName("should get current tenant")
        void shouldGetCurrentTenant() throws Exception {
            performGet("/api/v1/tenants/current")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testTenantId.toString()));
        }

        @Test
        @DisplayName("should update tenant")
        void shouldUpdateTenant() throws Exception {
            Map<String, Object> update = Map.of(
                "name", "Updated Tenant Name"
            );

            performPut("/api/v1/tenants/" + testTenantId, update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Tenant Name"));
        }

        @Test
        @DisplayName("should list tenant members")
        void shouldListTenantMembers() throws Exception {
            performGet("/api/v1/tenants/" + testTenantId + "/members")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("User Management")
    class UserManagement {

        @Test
        @DisplayName("should list users")
        void shouldListUsers() throws Exception {
            performGet("/api/v1/users")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        @DisplayName("should get user by ID")
        void shouldGetUserById() throws Exception {
            performGet("/api/v1/users/" + adminUser.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(adminUser.getEmail()));
        }

        @Test
        @DisplayName("should update user")
        void shouldUpdateUser() throws Exception {
            Map<String, Object> update = Map.of(
                "firstName", "UpdatedFirst",
                "lastName", "UpdatedLast"
            );

            performPut("/api/v1/users/" + adminUser.getId(), update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("UpdatedFirst"));
        }

        @Test
        @DisplayName("should get current user profile")
        void shouldGetCurrentUserProfile() throws Exception {
            performGet("/api/v1/users/me")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(adminUser.getId().toString()));
        }

        @Test
        @DisplayName("should deactivate user")
        void shouldDeactivateUser() throws Exception {
            User toDeactivate = userRepository.save(User.builder()
                .email("deactivate-" + UUID.randomUUID() + "@example.com")
                .passwordHash("hashedpass")
                .firstName("To")
                .lastName("Deactivate")
                .tenant(testTenant)
                .status(User.UserStatus.ACTIVE)
                .build());

            performPatch("/api/v1/users/" + toDeactivate.getId() + "/deactivate")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));
        }
    }

    @Nested
    @DisplayName("Role Management")
    class RoleManagement {

        @Test
        @DisplayName("should list roles")
        void shouldListRoles() throws Exception {
            performGet("/api/v1/roles")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should create role")
        void shouldCreateRole() throws Exception {
            Map<String, Object> request = Map.of(
                "name", "E2E_TEST_ROLE_" + UUID.randomUUID().toString().substring(0, 8),
                "description", "E2E Test Role",
                "permissions", "read:opportunities,write:contracts"
            );

            performPost("/api/v1/roles", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(startsWith("E2E_TEST_ROLE_")));
        }

        @Test
        @DisplayName("should update role")
        void shouldUpdateRole() throws Exception {
            Role role = roleRepository.save(Role.builder()
                .name("UPDATE_ROLE_" + UUID.randomUUID().toString().substring(0, 8))
                .description("Original")
                .tenantId(testTenantId)
                .build());

            Map<String, Object> update = Map.of(
                "description", "Updated Description"
            );

            performPut("/api/v1/roles/" + role.getId(), update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated Description"));
        }

        @Test
        @DisplayName("should delete role")
        void shouldDeleteRole() throws Exception {
            Role role = roleRepository.save(Role.builder()
                .name("DELETE_ROLE_" + UUID.randomUUID().toString().substring(0, 8))
                .description("To Delete")
                .tenantId(testTenantId)
                .build());

            performDelete("/api/v1/roles/" + role.getId())
                .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("Invitation Management")
    class InvitationManagement {

        @Test
        @DisplayName("should create invitation")
        void shouldCreateInvitation() throws Exception {
            Map<String, Object> request = Map.of(
                "email", "invite-" + UUID.randomUUID() + "@example.com",
                "firstName", "Invited",
                "lastName", "User"
            );

            performPost("/api/v1/invitations", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(startsWith("invite-")));
        }

        @Test
        @DisplayName("should list pending invitations")
        void shouldListPendingInvitations() throws Exception {
            performGet("/api/v1/invitations")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should reject invitation to existing user")
        void shouldRejectInvitationToExistingUser() throws Exception {
            Map<String, Object> request = Map.of(
                "email", adminUser.getEmail(),
                "firstName", "Existing",
                "lastName", "User"
            );

            performPost("/api/v1/invitations", request)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Tenant Admin Settings")
    class TenantAdminSettings {

        @Test
        @DisplayName("should get tenant settings")
        void shouldGetTenantSettings() throws Exception {
            performGet("/api/v1/admin/tenant/settings")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update tenant settings")
        void shouldUpdateTenantSettings() throws Exception {
            Map<String, Object> settings = Map.of(
                "timezone", "America/New_York",
                "dateFormat", "MM/dd/yyyy"
            );

            performPut("/api/v1/admin/tenant/settings", settings)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get tenant branding")
        void shouldGetTenantBranding() throws Exception {
            performGet("/api/v1/admin/tenant/branding")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update tenant branding")
        void shouldUpdateTenantBranding() throws Exception {
            Map<String, Object> branding = Map.of(
                "companyName", "E2E Test Company",
                "primaryColor", "#336699"
            );

            performPut("/api/v1/admin/tenant/branding", branding)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Onboarding Progress")
    class OnboardingProgress {

        @Test
        @DisplayName("should get onboarding progress")
        void shouldGetOnboardingProgress() throws Exception {
            performGet("/api/v1/onboarding/progress")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update onboarding step")
        void shouldUpdateOnboardingStep() throws Exception {
            Map<String, Object> update = Map.of(
                "currentStep", 2,
                "companyProfileComplete", true
            );

            performPut("/api/v1/onboarding/progress", update)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Audit Logs")
    class AuditLogs {

        @Test
        @DisplayName("should list audit logs")
        void shouldListAuditLogs() throws Exception {
            performGet("/api/v1/audit-logs")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should filter audit logs by action")
        void shouldFilterAuditLogsByAction() throws Exception {
            performGet("/api/v1/audit-logs?action=LOGIN")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }
}
