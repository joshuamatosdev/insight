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
 * End-to-End tests for User management flows.
 * Tests user lifecycle, profile management, and preferences.
 */
@DisplayName("User Management E2E Tests")
class UserManagementE2ETest extends BaseControllerTest {

    private static final String USERS_URL = "/users";
    private static final String USER_PREFS_URL = "/user-preferences";
    private static final String NOTIFICATIONS_URL = "/notifications";

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
            .name("E2E User Tenant " + UUID.randomUUID())
            .slug("e2e-user-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-user-mgmt-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("E2E")
            .lastName("UserMgmt")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("User Profile Flow")
    class UserProfileFlow {

        @Test
        @DisplayName("should retrieve current user profile")
        void should_RetrieveCurrentUserProfile() throws Exception {
            performGet(USERS_URL + "/me")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserId.toString()))
                .andExpect(jsonPath("$.email").value(testUser.getEmail()));
        }

        @Test
        @DisplayName("should update current user profile")
        void should_UpdateCurrentUserProfile() throws Exception {
            java.util.Map<String, Object> updateRequest = java.util.Map.of(
                "firstName", "UpdatedFirst",
                "lastName", "UpdatedLast",
                "phone", "+1-555-123-4567"
            );

            performPut(USERS_URL + "/me", updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("UpdatedFirst"))
                .andExpect(jsonPath("$.lastName").value("UpdatedLast"));
        }

        @Test
        @DisplayName("should retrieve user by ID")
        void should_RetrieveUserById() throws Exception {
            performGet(USERS_URL + "/" + testUserId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserId.toString()));
        }
    }

    @Nested
    @DisplayName("User CRUD Flow")
    class UserCRUDFlow {

        @Test
        @DisplayName("should list users in tenant")
        void should_ListUsersInTenant() throws Exception {
            performGet(USERS_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create new user")
        void should_CreateNewUser() throws Exception {
            java.util.Map<String, Object> userRequest = java.util.Map.of(
                "email", "new-user-" + UUID.randomUUID() + "@example.com",
                "password", "NewUserPass123!",
                "firstName", "New",
                "lastName", "User",
                "role", "MEMBER"
            );

            performPost(USERS_URL, userRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("New"));
        }

        @Test
        @DisplayName("should update user")
        void should_UpdateUser() throws Exception {
            // Create a user to update
            User userToUpdate = User.builder()
                .email("update-user-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("ToUpdate")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .tenantId(testTenantId)
                .build();
            userToUpdate = userRepository.save(userToUpdate);

            java.util.Map<String, Object> updateRequest = java.util.Map.of(
                "firstName", "Updated",
                "lastName", "Name"
            );

            performPut(USERS_URL + "/" + userToUpdate.getId(), updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"));
        }

        @Test
        @DisplayName("should deactivate user")
        void should_DeactivateUser() throws Exception {
            // Create a user to deactivate
            User userToDeactivate = User.builder()
                .email("deactivate-user-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("ToDeactivate")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .tenantId(testTenantId)
                .build();
            userToDeactivate = userRepository.save(userToDeactivate);

            performDelete(USERS_URL + "/" + userToDeactivate.getId())
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("User Status Flow")
    class UserStatusFlow {

        @Test
        @DisplayName("should suspend user")
        void should_SuspendUser() throws Exception {
            User userToSuspend = User.builder()
                .email("suspend-user-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("ToSuspend")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .mfaEnabled(false)
                .tenantId(testTenantId)
                .build();
            userToSuspend = userRepository.save(userToSuspend);

            java.util.Map<String, Object> statusRequest = java.util.Map.of(
                "status", "SUSPENDED",
                "reason", "Policy violation"
            );

            performPatch(USERS_URL + "/" + userToSuspend.getId() + "/status", statusRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should reactivate suspended user")
        void should_ReactivateSuspendedUser() throws Exception {
            User suspendedUser = User.builder()
                .email("reactivate-user-" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("TestPass123!"))
                .firstName("ToReactivate")
                .lastName("User")
                .status(UserStatus.SUSPENDED)
                .emailVerified(true)
                .mfaEnabled(false)
                .tenantId(testTenantId)
                .build();
            suspendedUser = userRepository.save(suspendedUser);

            java.util.Map<String, Object> statusRequest = java.util.Map.of(
                "status", "ACTIVE"
            );

            performPatch(USERS_URL + "/" + suspendedUser.getId() + "/status", statusRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("User Preferences Flow")
    class UserPreferencesFlow {

        @Test
        @DisplayName("should retrieve user preferences")
        void should_RetrieveUserPreferences() throws Exception {
            performGet(USER_PREFS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update user preferences")
        void should_UpdateUserPreferences() throws Exception {
            java.util.Map<String, Object> prefsRequest = java.util.Map.of(
                "theme", "dark",
                "language", "en-US",
                "emailNotifications", true,
                "pushNotifications", false
            );

            performPut(USER_PREFS_URL, prefsRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update specific preference")
        void should_UpdateSpecificPreference() throws Exception {
            java.util.Map<String, Object> prefUpdate = java.util.Map.of(
                "value", "dark"
            );

            performPatch(USER_PREFS_URL + "/theme", prefUpdate)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Notifications Flow")
    class NotificationsFlow {

        @Test
        @DisplayName("should list user notifications")
        void should_ListUserNotifications() throws Exception {
            performGet(NOTIFICATIONS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get unread notification count")
        void should_GetUnreadNotificationCount() throws Exception {
            performGet(NOTIFICATIONS_URL + "/unread/count")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should mark notification as read")
        void should_MarkNotificationAsRead() throws Exception {
            // This would need a notification ID - using a placeholder
            // In real test, create notification first
            performPatch(NOTIFICATIONS_URL + "/mark-all-read")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Password Change Flow")
    class PasswordChangeFlow {

        @Test
        @DisplayName("should change password with valid current password")
        void should_ChangePasswordWithValidCurrentPassword() throws Exception {
            java.util.Map<String, Object> passwordRequest = java.util.Map.of(
                "currentPassword", "TestPass123!",
                "newPassword", "NewSecurePass456!"
            );

            performPost(USERS_URL + "/me/change-password", passwordRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should reject password change with invalid current password")
        void should_RejectPasswordChangeWithInvalidCurrentPassword() throws Exception {
            java.util.Map<String, Object> passwordRequest = java.util.Map.of(
                "currentPassword", "WrongPassword123!",
                "newPassword", "NewSecurePass456!"
            );

            performPost(USERS_URL + "/me/change-password", passwordRequest)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should reject weak new password")
        void should_RejectWeakNewPassword() throws Exception {
            java.util.Map<String, Object> passwordRequest = java.util.Map.of(
                "currentPassword", "TestPass123!",
                "newPassword", "weak"
            );

            performPost(USERS_URL + "/me/change-password", passwordRequest)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("User Search Flow")
    class UserSearchFlow {

        @Test
        @DisplayName("should search users by email")
        void should_SearchUsersByEmail() throws Exception {
            performGet(USERS_URL + "?email=" + testUser.getEmail())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should search users by name")
        void should_SearchUsersByName() throws Exception {
            performGet(USERS_URL + "?search=" + testUser.getFirstName())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should filter users by status")
        void should_FilterUsersByStatus() throws Exception {
            performGet(USERS_URL + "?status=ACTIVE")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }
}
