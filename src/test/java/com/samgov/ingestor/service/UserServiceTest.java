package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.dto.CreateUserRequest;
import com.samgov.ingestor.dto.TenantMembershipDto;
import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for UserService.
 *
 * Tests focus on:
 * - User CRUD operations
 * - Tenant membership management
 * - Role assignment
 * - Multi-tenant isolation
 */
@DisplayName("UserService")
class UserServiceTest extends BaseServiceTest {

    @Autowired
    private UserService userService;

    @Nested
    @DisplayName("User Creation")
    class UserCreation {

        @Test
        @DisplayName("should create a new user with valid data")
        void shouldCreateNewUserWithValidData() {
            // Given
            CreateUserRequest request = CreateUserRequest.builder()
                .email("newuser@example.com")
                .password("SecurePass123!")
                .firstName("John")
                .lastName("Doe")
                .build();

            // When
            UserDto createdUser = userService.createUser(request);

            // Then
            assertThat(createdUser).isNotNull();
            assertThat(createdUser.getId()).isNotNull();
            assertThat(createdUser.getEmail()).isEqualTo("newuser@example.com");
            assertThat(createdUser.getFirstName()).isEqualTo("John");
            assertThat(createdUser.getLastName()).isEqualTo("Doe");
            assertThat(createdUser.getStatus()).isEqualTo(User.UserStatus.PENDING);
            assertThat(createdUser.getEmailVerified()).isFalse();
        }

        @Test
        @DisplayName("should normalize email to lowercase")
        void shouldNormalizeEmailToLowercase() {
            // Given
            CreateUserRequest request = CreateUserRequest.builder()
                .email("UPPERCASE@EXAMPLE.COM")
                .password("SecurePass123!")
                .build();

            // When
            UserDto createdUser = userService.createUser(request);

            // Then
            assertThat(createdUser.getEmail()).isEqualTo("uppercase@example.com");
        }

        @Test
        @DisplayName("should reject duplicate email addresses")
        void shouldRejectDuplicateEmailAddresses() {
            // Given
            String email = "duplicate@example.com";
            CreateUserRequest firstRequest = CreateUserRequest.builder()
                .email(email)
                .password("SecurePass123!")
                .build();
            userService.createUser(firstRequest);

            CreateUserRequest duplicateRequest = CreateUserRequest.builder()
                .email(email)
                .password("AnotherPass123!")
                .build();

            // When/Then
            assertThatThrownBy(() -> userService.createUser(duplicateRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("should create user without password for invited users")
        void shouldCreateUserWithoutPasswordForInvitedUsers() {
            // Given
            CreateUserRequest request = CreateUserRequest.builder()
                .email("invited@example.com")
                .firstName("Invited")
                .lastName("User")
                .build();

            // When
            UserDto createdUser = userService.createUser(request);

            // Then
            assertThat(createdUser).isNotNull();
            assertThat(createdUser.getEmail()).isEqualTo("invited@example.com");
        }
    }

    @Nested
    @DisplayName("User Retrieval")
    class UserRetrieval {

        @Test
        @DisplayName("should find user by ID")
        void shouldFindUserById() {
            // Given - testUser is set up in BaseServiceTest

            // When
            Optional<UserDto> foundUser = userService.getUserById(testUser.getId());

            // Then
            assertThat(foundUser).isPresent();
            assertThat(foundUser.get().getId()).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("should return empty for non-existent user ID")
        void shouldReturnEmptyForNonExistentUserId() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When
            Optional<UserDto> foundUser = userService.getUserById(nonExistentId);

            // Then
            assertThat(foundUser).isEmpty();
        }

        @Test
        @DisplayName("should find user by email")
        void shouldFindUserByEmail() {
            // When
            Optional<UserDto> foundUser = userService.getUserByEmail(testUser.getEmail());

            // Then
            assertThat(foundUser).isPresent();
            assertThat(foundUser.get().getEmail()).isEqualTo(testUser.getEmail());
        }

        @Test
        @DisplayName("should find user by email case-insensitively")
        void shouldFindUserByEmailCaseInsensitively() {
            // Given
            String uppercaseEmail = testUser.getEmail().toUpperCase();

            // When
            Optional<UserDto> foundUser = userService.getUserByEmail(uppercaseEmail);

            // Then
            assertThat(foundUser).isPresent();
        }
    }

    @Nested
    @DisplayName("Users by Tenant")
    class UsersByTenant {

        @Test
        @DisplayName("should return users belonging to a tenant")
        void shouldReturnUsersBelongingToTenant() {
            // Given - testUser is a member of testTenant (set up in BaseServiceTest)

            // When
            List<UserDto> users = userService.getUsersByTenantId(testTenant.getId());

            // Then
            assertThat(users).isNotEmpty();
            assertThat(users).anyMatch(u -> u.getId().equals(testUser.getId()));
        }

        @Test
        @DisplayName("should not return users from other tenants")
        void shouldNotReturnUsersFromOtherTenants() {
            // Given - create a second tenant with its own user
            Tenant otherTenantEntity = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant otherTenant = tenantRepository.save(otherTenantEntity);

            final User otherUser = userRepository.save(User.builder()
                .email("other-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .firstName("Other")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build());

            Role otherRole = createTestRole(otherTenant, Role.USER);
            createTestMembership(otherUser, otherTenant, otherRole);

            // When
            List<UserDto> testTenantUsers = userService.getUsersByTenantId(testTenant.getId());
            List<UserDto> otherTenantUsers = userService.getUsersByTenantId(otherTenant.getId());

            // Then - tenant isolation is enforced
            assertThat(testTenantUsers).noneMatch(u -> u.getId().equals(otherUser.getId()));
            assertThat(otherTenantUsers).noneMatch(u -> u.getId().equals(testUser.getId()));
        }

        @Test
        @DisplayName("should return empty list for tenant with no users")
        void shouldReturnEmptyListForTenantWithNoUsers() {
            // Given
            Tenant emptyTenant = Tenant.builder()
                .name("Empty Tenant")
                .slug("empty-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            emptyTenant = tenantRepository.save(emptyTenant);

            // When
            List<UserDto> users = userService.getUsersByTenantId(emptyTenant.getId());

            // Then
            assertThat(users).isEmpty();
        }
    }

    @Nested
    @DisplayName("User Status Management")
    class UserStatusManagement {

        @Test
        @DisplayName("should activate a pending user")
        void shouldActivatePendingUser() {
            // Given - create a pending user
            User pendingUser = User.builder()
                .email("pending-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(User.UserStatus.PENDING)
                .emailVerified(false)
                .build();
            pendingUser = userRepository.save(pendingUser);

            // When
            userService.activateUser(pendingUser.getId());

            // Then
            Optional<UserDto> activatedUser = userService.getUserById(pendingUser.getId());
            assertThat(activatedUser).isPresent();
            assertThat(activatedUser.get().getStatus()).isEqualTo(User.UserStatus.ACTIVE);
            assertThat(activatedUser.get().getEmailVerified()).isTrue();
        }

        @Test
        @DisplayName("should suspend an active user")
        void shouldSuspendActiveUser() {
            // Given - testUser is ACTIVE

            // When
            userService.suspendUser(testUser.getId());

            // Then
            Optional<UserDto> suspendedUser = userService.getUserById(testUser.getId());
            assertThat(suspendedUser).isPresent();
            assertThat(suspendedUser.get().getStatus()).isEqualTo(User.UserStatus.SUSPENDED);
        }

        @Test
        @DisplayName("should throw exception when activating non-existent user")
        void shouldThrowExceptionWhenActivatingNonExistentUser() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> userService.activateUser(nonExistentId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Tenant Membership Management")
    class TenantMembershipManagement {

        @Test
        @DisplayName("should add user to tenant with specified role")
        void shouldAddUserToTenantWithSpecifiedRole() {
            // Given - create a new user without membership
            User newUser = User.builder()
                .email("membership-test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            newUser = userRepository.save(newUser);

            // When
            TenantMembershipDto membership = userService.addUserToTenant(
                newUser.getId(),
                testTenant.getId(),
                Role.USER,
                testUser.getId()
            );

            // Then
            assertThat(membership).isNotNull();
            assertThat(membership.getUserId()).isEqualTo(newUser.getId());
            assertThat(membership.getTenantId()).isEqualTo(testTenant.getId());
            assertThat(membership.getRoleName()).isEqualTo(Role.USER);
            assertThat(membership.getIsDefault()).isTrue(); // First membership is default
        }

        @Test
        @DisplayName("should reject duplicate tenant membership")
        void shouldRejectDuplicateTenantMembership() {
            // Given - testUser is already a member of testTenant
            // Create the MANAGER role in testTenant so the membership check can be reached
            createTestRole(testTenant, Role.MANAGER);

            // When/Then
            assertThatThrownBy(() -> userService.addUserToTenant(
                testUser.getId(),
                testTenant.getId(),
                Role.MANAGER,
                testUser.getId()
            ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already a member");
        }

        @Test
        @DisplayName("should remove user from tenant")
        void shouldRemoveUserFromTenant() {
            // Given - create a second tenant membership for testUser
            Tenant secondTenantTemp = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant secondTenant = tenantRepository.save(secondTenantTemp);

            Role secondRole = createTestRole(secondTenant, Role.USER);
            createTestMembership(testUser, secondTenant, secondRole);

            // When
            userService.removeUserFromTenant(testUser.getId(), secondTenant.getId());

            // Then
            List<TenantMembershipDto> memberships = userService.getUserMemberships(testUser.getId());
            assertThat(memberships).noneMatch(m -> m.getTenantId().equals(secondTenant.getId()));
        }

        @Test
        @DisplayName("should reassign default when removing default tenant membership")
        void shouldReassignDefaultWhenRemovingDefaultTenantMembership() {
            // Given - create a second tenant membership
            Tenant secondTenantTemp = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant secondTenant = tenantRepository.save(secondTenantTemp);

            Role secondRole = createTestRole(secondTenant, Role.USER);
            TenantMembership secondMembership = createTestMembership(testUser, secondTenant, secondRole);

            // Make the second membership non-default
            secondMembership.setIsDefault(false);
            tenantMembershipRepository.save(secondMembership);

            // When - remove the default membership (testTenant)
            userService.removeUserFromTenant(testUser.getId(), testTenant.getId());

            // Then - second membership should become default
            List<TenantMembershipDto> memberships = userService.getUserMemberships(testUser.getId());
            assertThat(memberships).hasSize(1);
            assertThat(memberships.get(0).getIsDefault()).isTrue();
        }

        @Test
        @DisplayName("should get all user memberships")
        void shouldGetAllUserMemberships() {
            // Given - testUser has testMembership

            // When
            List<TenantMembershipDto> memberships = userService.getUserMemberships(testUser.getId());

            // Then
            assertThat(memberships).isNotEmpty();
            assertThat(memberships).anyMatch(m -> m.getTenantId().equals(testTenant.getId()));
        }
    }

    @Nested
    @DisplayName("Role Management")
    class RoleManagement {

        @Test
        @DisplayName("should update user role in tenant")
        void shouldUpdateUserRoleInTenant() {
            // Given - create manager role
            Role managerRole = createTestRole(testTenant, Role.MANAGER);

            // When
            userService.updateUserRole(testUser.getId(), testTenant.getId(), Role.MANAGER);

            // Then
            List<TenantMembershipDto> memberships = userService.getUserMemberships(testUser.getId());
            assertThat(memberships)
                .filteredOn(m -> m.getTenantId().equals(testTenant.getId()))
                .extracting(TenantMembershipDto::getRoleName)
                .containsExactly(Role.MANAGER);
        }

        @Test
        @DisplayName("should throw exception when updating role for non-member")
        void shouldThrowExceptionWhenUpdatingRoleForNonMember() {
            // Given
            final User nonMember = userRepository.save(User.builder()
                .email("nonmember-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build());

            // When/Then
            assertThatThrownBy(() -> userService.updateUserRole(
                nonMember.getId(),
                testTenant.getId(),
                Role.MANAGER
            ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a member");
        }
    }

    @Nested
    @DisplayName("Default Tenant Management")
    class DefaultTenantManagement {

        @Test
        @DisplayName("should set default tenant for user")
        void shouldSetDefaultTenantForUser() {
            // Given - create a second tenant membership
            final Tenant secondTenant = tenantRepository.save(Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build());

            Role secondRole = createTestRole(secondTenant, Role.USER);
            TenantMembership secondMembership = createTestMembership(testUser, secondTenant, secondRole);
            secondMembership.setIsDefault(false);
            tenantMembershipRepository.save(secondMembership);

            // When
            userService.setDefaultTenant(testUser.getId(), secondTenant.getId());

            // Then
            List<TenantMembershipDto> memberships = userService.getUserMemberships(testUser.getId());
            assertThat(memberships)
                .filteredOn(m -> m.getTenantId().equals(secondTenant.getId()))
                .extracting(TenantMembershipDto::getIsDefault)
                .containsExactly(true);
            assertThat(memberships)
                .filteredOn(m -> m.getTenantId().equals(testTenant.getId()))
                .extracting(TenantMembershipDto::getIsDefault)
                .containsExactly(false);
        }

        @Test
        @DisplayName("should throw exception when setting default to non-member tenant")
        void shouldThrowExceptionWhenSettingDefaultToNonMemberTenant() {
            // Given
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            // When/Then
            final UUID otherTenantId = otherTenant.getId();
            assertThatThrownBy(() -> userService.setDefaultTenant(testUser.getId(), otherTenantId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a member");
        }
    }

    @Nested
    @DisplayName("Email Existence Check")
    class EmailExistenceCheck {

        @Test
        @DisplayName("should return true for existing email")
        void shouldReturnTrueForExistingEmail() {
            // When
            boolean exists = userService.existsByEmail(testUser.getEmail());

            // Then
            assertThat(exists).isTrue();
        }

        @Test
        @DisplayName("should return true for existing email case-insensitively")
        void shouldReturnTrueForExistingEmailCaseInsensitively() {
            // When
            boolean exists = userService.existsByEmail(testUser.getEmail().toUpperCase());

            // Then
            assertThat(exists).isTrue();
        }

        @Test
        @DisplayName("should return false for non-existing email")
        void shouldReturnFalseForNonExistingEmail() {
            // When
            boolean exists = userService.existsByEmail("nonexistent@example.com");

            // Then
            assertThat(exists).isFalse();
        }
    }
}
