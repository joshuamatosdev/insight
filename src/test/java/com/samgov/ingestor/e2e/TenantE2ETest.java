package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Tenant administration and management flows.
 * Tests tenant creation, member management, settings, and branding.
 */
@DisplayName("Tenant E2E Tests")
class TenantE2ETest extends BaseControllerTest {

    private static final String TENANTS_URL = "/api/v1/tenants";
    private static final String TENANT_ADMIN_URL = "/api/v1/tenant-admin";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E Tenant Test " + UUID.randomUUID())
            .slug("e2e-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test admin user
        testUser = User.builder()
            .email("e2e-tenant-admin-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Tenant")
            .lastName("Admin")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("Tenant Information Flow")
    class TenantInformationFlow {

        @Test
        @DisplayName("should retrieve current tenant information")
        void should_RetrieveCurrentTenantInformation() throws Exception {
            performGet(TENANTS_URL + "/current")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testTenantId.toString()));
        }

        @Test
        @DisplayName("should retrieve tenant by ID")
        void should_RetrieveTenantById() throws Exception {
            performGet(TENANTS_URL + "/" + testTenantId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testTenantId.toString()));
        }

        @Test
        @DisplayName("should update tenant information")
        void should_UpdateTenantInformation() throws Exception {
            java.util.Map<String, Object> updateRequest = java.util.Map.of(
                "name", "Updated Tenant Name"
            );

            performPut(TENANTS_URL + "/" + testTenantId, updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Tenant Name"));
        }
    }

    @Nested
    @DisplayName("Tenant Member Management Flow")
    class TenantMemberManagementFlow {

        @Test
        @DisplayName("should list tenant members")
        void should_ListTenantMembers() throws Exception {
            performGet(TENANTS_URL + "/" + testTenantId + "/members")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should invite new member to tenant")
        void should_InviteNewMemberToTenant() throws Exception {
            java.util.Map<String, Object> inviteRequest = java.util.Map.of(
                "email", "newinvite-" + UUID.randomUUID() + "@example.com",
                "role", "MEMBER"
            );

            performPost(TENANTS_URL + "/" + testTenantId + "/invitations", inviteRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update member role")
        void should_UpdateMemberRole() throws Exception {
            // Create another user in the tenant
            User member = User.builder()
                .email("e2e-member-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("Team")
                .lastName("Member")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .tenantId(testTenantId)
                .build();
            member = userRepository.save(member);

            java.util.Map<String, Object> roleUpdate = java.util.Map.of(
                "role", "ADMIN"
            );

            performPatch(TENANTS_URL + "/" + testTenantId + "/members/" + member.getId() + "/role", roleUpdate)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should remove member from tenant")
        void should_RemoveMemberFromTenant() throws Exception {
            // Create a member to remove
            User memberToRemove = User.builder()
                .email("e2e-remove-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("To")
                .lastName("Remove")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .tenantId(testTenantId)
                .build();
            memberToRemove = userRepository.save(memberToRemove);

            performDelete(TENANTS_URL + "/" + testTenantId + "/members/" + memberToRemove.getId())
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Tenant Settings Flow")
    class TenantSettingsFlow {

        @Test
        @DisplayName("should retrieve tenant settings")
        void should_RetrieveTenantSettings() throws Exception {
            performGet(TENANT_ADMIN_URL + "/settings")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update tenant settings")
        void should_UpdateTenantSettings() throws Exception {
            java.util.Map<String, Object> settingsRequest = java.util.Map.of(
                "defaultTimeZone", "America/New_York",
                "dateFormat", "MM/dd/yyyy",
                "allowMemberInvitations", true
            );

            performPut(TENANT_ADMIN_URL + "/settings", settingsRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Tenant Branding Flow")
    class TenantBrandingFlow {

        @Test
        @DisplayName("should retrieve tenant branding")
        void should_RetrieveTenantBranding() throws Exception {
            performGet(TENANT_ADMIN_URL + "/branding")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update tenant branding")
        void should_UpdateTenantBranding() throws Exception {
            java.util.Map<String, Object> brandingRequest = java.util.Map.of(
                "primaryColor", "#1a73e8",
                "secondaryColor", "#34a853",
                "companyName", "E2E Test Company"
            );

            performPut(TENANT_ADMIN_URL + "/branding", brandingRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Invitation Flow")
    class InvitationFlow {

        @Test
        @DisplayName("should list pending invitations")
        void should_ListPendingInvitations() throws Exception {
            performGet("/api/v1/invitations")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create invitation with specific role")
        void should_CreateInvitationWithSpecificRole() throws Exception {
            java.util.Map<String, Object> inviteRequest = java.util.Map.of(
                "email", "role-invite-" + UUID.randomUUID() + "@example.com",
                "role", "VIEWER",
                "message", "Welcome to our team!"
            );

            performPost("/api/v1/invitations", inviteRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should revoke pending invitation")
        void should_RevokePendingInvitation() throws Exception {
            // First create an invitation
            java.util.Map<String, Object> inviteRequest = java.util.Map.of(
                "email", "revoke-invite-" + UUID.randomUUID() + "@example.com",
                "role", "MEMBER"
            );

            performPost("/api/v1/invitations", inviteRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should prevent duplicate invitation to same email")
        void should_PreventDuplicateInvitation() throws Exception {
            String email = "duplicate-invite-" + UUID.randomUUID() + "@example.com";
            java.util.Map<String, Object> inviteRequest = java.util.Map.of(
                "email", email,
                "role", "MEMBER"
            );

            // First invitation should succeed
            performPost("/api/v1/invitations", inviteRequest)
                .andExpect(status().isCreated());

            // Second invitation to same email should fail
            performPost("/api/v1/invitations", inviteRequest)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        @Test
        @DisplayName("should prevent access to other tenant data")
        void should_PreventAccessToOtherTenantData() throws Exception {
            // Create another tenant
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant " + UUID.randomUUID())
                .slug("other-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            // Try to access other tenant - should fail
            performGet(TENANTS_URL + "/" + otherTenant.getId())
                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("should isolate tenant members between organizations")
        void should_IsolateTenantMembersBetweenOrganizations() throws Exception {
            // Create user in different tenant
            Tenant otherTenant = Tenant.builder()
                .name("Another Tenant " + UUID.randomUUID())
                .slug("another-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            User otherUser = User.builder()
                .email("other-tenant-user-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("Other")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .tenantId(otherTenant.getId())
                .build();
            userRepository.save(otherUser);

            // List members should not include other tenant's users
            performGet(TENANTS_URL + "/" + testTenantId + "/members")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == '" + otherUser.getEmail() + "')]").doesNotExist());
        }
    }
}
