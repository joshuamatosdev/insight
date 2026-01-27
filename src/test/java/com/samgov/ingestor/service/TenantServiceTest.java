package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.dto.CreateTenantRequest;
import com.samgov.ingestor.dto.TenantDto;
import com.samgov.ingestor.dto.TenantMembershipDto;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.Tenant.SubscriptionTier;
import com.samgov.ingestor.model.Tenant.TenantStatus;
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
 * Behavioral tests for TenantService.
 *
 * Tests focus on:
 * - Tenant CRUD operations
 * - Slug generation and uniqueness
 * - Subscription tier management
 * - Tenant isolation
 */
@DisplayName("TenantService")
class TenantServiceTest extends BaseServiceTest {

    @Autowired
    private TenantService tenantService;

    @Nested
    @DisplayName("Tenant Creation")
    class TenantCreation {

        @Test
        @DisplayName("should create tenant with valid data")
        void shouldCreateTenantWithValidData() {
            // Given
            CreateTenantRequest request = CreateTenantRequest.builder()
                .name("Acme Corporation")
                .slug("acme-corp")
                .domain("acme.com")
                .logoUrl("https://example.com/logo.png")
                .primaryColor("#3B82F6")
                .build();

            // When
            TenantDto createdTenant = tenantService.createTenant(request);

            // Then
            assertThat(createdTenant).isNotNull();
            assertThat(createdTenant.getId()).isNotNull();
            assertThat(createdTenant.getName()).isEqualTo("Acme Corporation");
            assertThat(createdTenant.getSlug()).isEqualTo("acme-corp");
            assertThat(createdTenant.getDomain()).isEqualTo("acme.com");
            assertThat(createdTenant.getLogoUrl()).isEqualTo("https://example.com/logo.png");
            assertThat(createdTenant.getPrimaryColor()).isEqualTo("#3B82F6");
            assertThat(createdTenant.getStatus()).isEqualTo(TenantStatus.ACTIVE);
            assertThat(createdTenant.getSubscriptionTier()).isEqualTo(SubscriptionTier.FREE);
            assertThat(createdTenant.getTrialEndsAt()).isNotNull();
        }

        @Test
        @DisplayName("should auto-generate slug from name when not provided")
        void shouldAutoGenerateSlugFromNameWhenNotProvided() {
            // Given
            CreateTenantRequest request = CreateTenantRequest.builder()
                .name("New Company Inc.")
                .build();

            // When
            TenantDto createdTenant = tenantService.createTenant(request);

            // Then
            assertThat(createdTenant.getSlug()).isEqualTo("new-company-inc");
        }

        @Test
        @DisplayName("should generate unique slug when name conflicts")
        void shouldGenerateUniqueSlugWhenNameConflicts() {
            // Given - create first tenant
            CreateTenantRequest firstRequest = CreateTenantRequest.builder()
                .name("Duplicate Name")
                .build();
            TenantDto firstTenant = tenantService.createTenant(firstRequest);

            // Create second tenant with same name
            CreateTenantRequest secondRequest = CreateTenantRequest.builder()
                .name("Duplicate Name")
                .build();

            // When
            TenantDto secondTenant = tenantService.createTenant(secondRequest);

            // Then
            assertThat(secondTenant.getSlug()).isNotEqualTo(firstTenant.getSlug());
            assertThat(secondTenant.getSlug()).startsWith("duplicate-name");
        }

        @Test
        @DisplayName("should reject duplicate slug")
        void shouldRejectDuplicateSlug() {
            // Given
            CreateTenantRequest firstRequest = CreateTenantRequest.builder()
                .name("First Tenant")
                .slug("unique-slug")
                .build();
            tenantService.createTenant(firstRequest);

            CreateTenantRequest duplicateRequest = CreateTenantRequest.builder()
                .name("Second Tenant")
                .slug("unique-slug")
                .build();

            // When/Then
            assertThatThrownBy(() -> tenantService.createTenant(duplicateRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("should reject duplicate domain")
        void shouldRejectDuplicateDomain() {
            // Given
            CreateTenantRequest firstRequest = CreateTenantRequest.builder()
                .name("First Tenant")
                .slug("first-tenant")
                .domain("unique-domain.com")
                .build();
            tenantService.createTenant(firstRequest);

            CreateTenantRequest duplicateRequest = CreateTenantRequest.builder()
                .name("Second Tenant")
                .slug("second-tenant")
                .domain("unique-domain.com")
                .build();

            // When/Then
            assertThatThrownBy(() -> tenantService.createTenant(duplicateRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("should normalize slug to lowercase with hyphens")
        void shouldNormalizeSlugToLowercaseWithHyphens() {
            // Given
            CreateTenantRequest request = CreateTenantRequest.builder()
                .name("Company With SPACES & Symbols!")
                .build();

            // When
            TenantDto createdTenant = tenantService.createTenant(request);

            // Then
            assertThat(createdTenant.getSlug()).matches("[a-z0-9-]+");
            assertThat(createdTenant.getSlug()).doesNotContain(" ");
            assertThat(createdTenant.getSlug()).doesNotContain("&");
            assertThat(createdTenant.getSlug()).doesNotContain("!");
        }
    }

    @Nested
    @DisplayName("Tenant Retrieval")
    class TenantRetrieval {

        @Test
        @DisplayName("should find tenant by ID")
        void shouldFindTenantById() {
            // When
            Optional<TenantDto> foundTenant = tenantService.getTenantById(testTenant.getId());

            // Then
            assertThat(foundTenant).isPresent();
            assertThat(foundTenant.get().getId()).isEqualTo(testTenant.getId());
        }

        @Test
        @DisplayName("should return empty for non-existent tenant ID")
        void shouldReturnEmptyForNonExistentTenantId() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When
            Optional<TenantDto> foundTenant = tenantService.getTenantById(nonExistentId);

            // Then
            assertThat(foundTenant).isEmpty();
        }

        @Test
        @DisplayName("should find tenant by slug")
        void shouldFindTenantBySlug() {
            // When
            Optional<TenantDto> foundTenant = tenantService.getTenantBySlug(testTenant.getSlug());

            // Then
            assertThat(foundTenant).isPresent();
            assertThat(foundTenant.get().getSlug()).isEqualTo(testTenant.getSlug());
        }

        @Test
        @DisplayName("should return empty for non-existent slug")
        void shouldReturnEmptyForNonExistentSlug() {
            // When
            Optional<TenantDto> foundTenant = tenantService.getTenantBySlug("non-existent-slug");

            // Then
            assertThat(foundTenant).isEmpty();
        }

        @Test
        @DisplayName("should get all active tenants")
        void shouldGetAllActiveTenants() {
            // Given - testTenant is active
            // Create a suspended tenant
            Tenant suspendedTenant = Tenant.builder()
                .name("Suspended Tenant")
                .slug("suspended-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .status(TenantStatus.SUSPENDED)
                .build();
            tenantRepository.save(suspendedTenant);

            // When
            List<TenantDto> activeTenants = tenantService.getAllActiveTenants();

            // Then
            assertThat(activeTenants).anyMatch(t -> t.getId().equals(testTenant.getId()));
            assertThat(activeTenants).noneMatch(t -> t.getId().equals(suspendedTenant.getId()));
        }
    }

    @Nested
    @DisplayName("Tenant Update")
    class TenantUpdate {

        @Test
        @DisplayName("should update tenant name")
        void shouldUpdateTenantName() {
            // Given
            CreateTenantRequest updateRequest = CreateTenantRequest.builder()
                .name("Updated Tenant Name")
                .build();

            // When
            TenantDto updatedTenant = tenantService.updateTenant(testTenant.getId(), updateRequest);

            // Then
            assertThat(updatedTenant.getName()).isEqualTo("Updated Tenant Name");
        }

        @Test
        @DisplayName("should update tenant domain")
        void shouldUpdateTenantDomain() {
            // Given
            CreateTenantRequest updateRequest = CreateTenantRequest.builder()
                .domain("new-domain.com")
                .build();

            // When
            TenantDto updatedTenant = tenantService.updateTenant(testTenant.getId(), updateRequest);

            // Then
            assertThat(updatedTenant.getDomain()).isEqualTo("new-domain.com");
        }

        @Test
        @DisplayName("should reject update with existing domain")
        void shouldRejectUpdateWithExistingDomain() {
            // Given - create another tenant with a domain
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .domain("taken-domain.com")
                .build();
            tenantRepository.save(otherTenant);

            CreateTenantRequest updateRequest = CreateTenantRequest.builder()
                .domain("taken-domain.com")
                .build();

            // When/Then
            assertThatThrownBy(() -> tenantService.updateTenant(testTenant.getId(), updateRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already in use");
        }

        @Test
        @DisplayName("should allow update with same domain")
        void shouldAllowUpdateWithSameDomain() {
            // Given - set domain on testTenant
            testTenant.setDomain("existing-domain.com");
            tenantRepository.save(testTenant);

            CreateTenantRequest updateRequest = CreateTenantRequest.builder()
                .name("New Name")
                .domain("existing-domain.com") // Same domain
                .build();

            // When
            TenantDto updatedTenant = tenantService.updateTenant(testTenant.getId(), updateRequest);

            // Then
            assertThat(updatedTenant.getDomain()).isEqualTo("existing-domain.com");
            assertThat(updatedTenant.getName()).isEqualTo("New Name");
        }

        @Test
        @DisplayName("should update logo and primary color")
        void shouldUpdateLogoAndPrimaryColor() {
            // Given
            CreateTenantRequest updateRequest = CreateTenantRequest.builder()
                .logoUrl("https://new-logo.com/logo.png")
                .primaryColor("#FF5733")
                .build();

            // When
            TenantDto updatedTenant = tenantService.updateTenant(testTenant.getId(), updateRequest);

            // Then
            assertThat(updatedTenant.getLogoUrl()).isEqualTo("https://new-logo.com/logo.png");
            assertThat(updatedTenant.getPrimaryColor()).isEqualTo("#FF5733");
        }

        @Test
        @DisplayName("should throw exception when updating non-existent tenant")
        void shouldThrowExceptionWhenUpdatingNonExistentTenant() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            CreateTenantRequest updateRequest = CreateTenantRequest.builder()
                .name("New Name")
                .build();

            // When/Then
            assertThatThrownBy(() -> tenantService.updateTenant(nonExistentId, updateRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }
    }

    @Nested
    @DisplayName("Subscription Tier Management")
    class SubscriptionTierManagement {

        @Test
        @DisplayName("should update subscription tier to PRO")
        void shouldUpdateSubscriptionTierToPro() {
            // When
            tenantService.updateSubscriptionTier(testTenant.getId(), SubscriptionTier.PRO);

            // Then
            Optional<TenantDto> updatedTenant = tenantService.getTenantById(testTenant.getId());
            assertThat(updatedTenant).isPresent();
            assertThat(updatedTenant.get().getSubscriptionTier()).isEqualTo(SubscriptionTier.PRO);
        }

        @Test
        @DisplayName("should update subscription tier to ENTERPRISE")
        void shouldUpdateSubscriptionTierToEnterprise() {
            // When
            tenantService.updateSubscriptionTier(testTenant.getId(), SubscriptionTier.ENTERPRISE);

            // Then
            Optional<TenantDto> updatedTenant = tenantService.getTenantById(testTenant.getId());
            assertThat(updatedTenant).isPresent();
            assertThat(updatedTenant.get().getSubscriptionTier()).isEqualTo(SubscriptionTier.ENTERPRISE);
        }

        @Test
        @DisplayName("should downgrade subscription tier")
        void shouldDowngradeSubscriptionTier() {
            // Given - upgrade first
            tenantService.updateSubscriptionTier(testTenant.getId(), SubscriptionTier.ENTERPRISE);

            // When - downgrade
            tenantService.updateSubscriptionTier(testTenant.getId(), SubscriptionTier.FREE);

            // Then
            Optional<TenantDto> updatedTenant = tenantService.getTenantById(testTenant.getId());
            assertThat(updatedTenant).isPresent();
            assertThat(updatedTenant.get().getSubscriptionTier()).isEqualTo(SubscriptionTier.FREE);
        }

        @Test
        @DisplayName("should throw exception when updating tier for non-existent tenant")
        void shouldThrowExceptionWhenUpdatingTierForNonExistentTenant() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> tenantService.updateSubscriptionTier(nonExistentId, SubscriptionTier.PRO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }
    }

    @Nested
    @DisplayName("Tenant Status Management")
    class TenantStatusManagement {

        @Test
        @DisplayName("should suspend an active tenant")
        void shouldSuspendActiveTenant() {
            // When
            tenantService.suspendTenant(testTenant.getId());

            // Then
            Optional<TenantDto> suspendedTenant = tenantService.getTenantById(testTenant.getId());
            assertThat(suspendedTenant).isPresent();
            assertThat(suspendedTenant.get().getStatus()).isEqualTo(TenantStatus.SUSPENDED);
        }

        @Test
        @DisplayName("should activate a suspended tenant")
        void shouldActivateSuspendedTenant() {
            // Given
            tenantService.suspendTenant(testTenant.getId());

            // When
            tenantService.activateTenant(testTenant.getId());

            // Then
            Optional<TenantDto> activatedTenant = tenantService.getTenantById(testTenant.getId());
            assertThat(activatedTenant).isPresent();
            assertThat(activatedTenant.get().getStatus()).isEqualTo(TenantStatus.ACTIVE);
        }

        @Test
        @DisplayName("should throw exception when suspending non-existent tenant")
        void shouldThrowExceptionWhenSuspendingNonExistentTenant() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> tenantService.suspendTenant(nonExistentId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }
    }

    @Nested
    @DisplayName("Tenant Membership")
    class TenantMembership {

        @Test
        @DisplayName("should get all memberships for tenant")
        void shouldGetAllMembershipsForTenant() {
            // Given - testUser is a member of testTenant
            // Add another user to the tenant
            User secondUserEntity = User.builder()
                .email("second-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            final User secondUser = userRepository.save(secondUserEntity);

            Role managerRole = createTestRole(testTenant, Role.MANAGER);
            createTestMembership(secondUser, testTenant, managerRole);

            // When
            List<TenantMembershipDto> memberships = tenantService.getTenantMemberships(testTenant.getId());

            // Then
            assertThat(memberships).hasSize(2);
            assertThat(memberships).anyMatch(m -> m.getUserId().equals(testUser.getId()));
            assertThat(memberships).anyMatch(m -> m.getUserId().equals(secondUser.getId()));
        }

        @Test
        @DisplayName("should return empty list for tenant with no members")
        void shouldReturnEmptyListForTenantWithNoMembers() {
            // Given
            Tenant emptyTenant = Tenant.builder()
                .name("Empty Tenant")
                .slug("empty-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            emptyTenant = tenantRepository.save(emptyTenant);

            // When
            List<TenantMembershipDto> memberships = tenantService.getTenantMemberships(emptyTenant.getId());

            // Then
            assertThat(memberships).isEmpty();
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    class TenantIsolation {

        @Test
        @DisplayName("should maintain data isolation between tenants")
        void shouldMaintainDataIsolationBetweenTenants() {
            // Given - create two tenants with their own users
            Tenant tenantAEntity = Tenant.builder()
                .name("Tenant A")
                .slug("tenant-a-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant tenantA = tenantRepository.save(tenantAEntity);

            Tenant tenantBEntity = Tenant.builder()
                .name("Tenant B")
                .slug("tenant-b-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant tenantB = tenantRepository.save(tenantBEntity);

            User userAEntity = User.builder()
                .email("usera-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            final User userA = userRepository.save(userAEntity);

            User userBEntity = User.builder()
                .email("userb-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            final User userB = userRepository.save(userBEntity);

            Role roleA = createTestRole(tenantA, Role.USER);
            Role roleB = createTestRole(tenantB, Role.USER);
            createTestMembership(userA, tenantA, roleA);
            createTestMembership(userB, tenantB, roleB);

            // When
            List<TenantMembershipDto> tenantAMembers = tenantService.getTenantMemberships(tenantA.getId());
            List<TenantMembershipDto> tenantBMembers = tenantService.getTenantMemberships(tenantB.getId());

            // Then - each tenant only sees its own members
            assertThat(tenantAMembers).anyMatch(m -> m.getUserId().equals(userA.getId()));
            assertThat(tenantAMembers).noneMatch(m -> m.getUserId().equals(userB.getId()));
            assertThat(tenantBMembers).anyMatch(m -> m.getUserId().equals(userB.getId()));
            assertThat(tenantBMembers).noneMatch(m -> m.getUserId().equals(userA.getId()));
        }

        @Test
        @DisplayName("should allow user to belong to multiple tenants")
        void shouldAllowUserToBelongToMultipleTenants() {
            // Given
            Tenant secondTenant = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            secondTenant = tenantRepository.save(secondTenant);

            Role secondRole = createTestRole(secondTenant, Role.MANAGER);
            createTestMembership(testUser, secondTenant, secondRole);

            // When
            List<TenantMembershipDto> firstTenantMembers = tenantService.getTenantMemberships(testTenant.getId());
            List<TenantMembershipDto> secondTenantMembers = tenantService.getTenantMemberships(secondTenant.getId());

            // Then
            assertThat(firstTenantMembers).anyMatch(m -> m.getUserId().equals(testUser.getId()));
            assertThat(secondTenantMembers).anyMatch(m -> m.getUserId().equals(testUser.getId()));
        }
    }

    @Nested
    @DisplayName("Tenant Existence Check")
    class TenantExistenceCheck {

        @Test
        @DisplayName("should return true for existing tenant")
        void shouldReturnTrueForExistingTenant() {
            // When
            boolean exists = tenantService.existsById(testTenant.getId());

            // Then
            assertThat(exists).isTrue();
        }

        @Test
        @DisplayName("should return false for non-existing tenant")
        void shouldReturnFalseForNonExistingTenant() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When
            boolean exists = tenantService.existsById(nonExistentId);

            // Then
            assertThat(exists).isFalse();
        }
    }
}
