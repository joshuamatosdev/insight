package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.model.FeatureRequest.FeatureRequestPriority;
import com.samgov.ingestor.model.FeatureRequest.FeatureRequestStatus;
import com.samgov.ingestor.service.FeatureRequestService.CreateFeatureRequestRequest;
import com.samgov.ingestor.service.FeatureRequestService.FeatureRequestDto;
import com.samgov.ingestor.service.FeatureRequestService.UpdateFeatureRequestRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for FeatureRequestService.
 *
 * Tests the business logic of feature request management for contractor portals:
 * - Feature request CRUD operations
 * - Voting functionality (vote/unvote)
 * - Status management (admin only)
 * - Ordering by votes
 * - Duplicate vote prevention
 * - Multi-tenant isolation
 */
@DisplayName("FeatureRequestService")
class FeatureRequestServiceTest extends BaseServiceTest {

    @Autowired
    private FeatureRequestService featureRequestService;

    @Autowired
    private ContractRepository contractRepository;

    private Contract testContract;
    private User adminUser;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();

        // Create admin user
        adminUser = User.builder()
            .email("admin-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Admin")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        adminUser = userRepository.save(adminUser);

        // Create admin role and membership
        Role adminRole = createTestRole(testTenant, Role.TENANT_ADMIN);
        TenantMembership adminMembership = TenantMembership.builder()
            .user(adminUser)
            .tenant(testTenant)
            .role(adminRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        tenantMembershipRepository.save(adminMembership);

        // Create a test contract for feature requests
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("FEATURE-TEST-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Feature Request Test Contract")
            .description("Contract for testing feature requests")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("Department of Defense")
            .agencyCode("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .build();
        testContract = contractRepository.save(testContract);
    }

    private CreateFeatureRequestRequest createDefaultRequest(String title) {
        return new CreateFeatureRequestRequest(
            testContract.getId(),
            title,
            "Description for " + title,
            FeatureRequestPriority.MEDIUM,
            null // category
        );
    }

    @Nested
    @DisplayName("Feature Request CRUD Operations")
    class FeatureRequestCrudOperations {

        @Test
        @DisplayName("should create a new feature request successfully")
        void shouldCreateFeatureRequestSuccessfully() {
            // Given
            CreateFeatureRequestRequest request = createDefaultRequest("Add dark mode");

            // When
            FeatureRequestDto result = featureRequestService.createFeatureRequest(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.title()).isEqualTo("Add dark mode");
            assertThat(result.description()).isEqualTo("Description for Add dark mode");
            assertThat(result.priority()).isEqualTo(FeatureRequestPriority.MEDIUM);
            assertThat(result.status()).isEqualTo(FeatureRequestStatus.SUBMITTED);
            assertThat(result.voteCount()).isZero();
            assertThat(result.submitterId()).isEqualTo(testUser.getId());
            assertThat(result.contractId()).isEqualTo(testContract.getId());
        }

        @Test
        @DisplayName("should retrieve feature request by ID")
        void shouldRetrieveFeatureRequestById() {
            // Given
            FeatureRequestDto created = featureRequestService.createFeatureRequest(
                createDefaultRequest("Feature to Get")
            );

            // When
            FeatureRequestDto result = featureRequestService.getFeatureRequest(created.id());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(created.id());
            assertThat(result.title()).isEqualTo("Feature to Get");
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException for non-existent feature request")
        void shouldThrowExceptionForNonExistentFeatureRequest() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> featureRequestService.getFeatureRequest(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Feature request not found");
        }

        @Test
        @DisplayName("should list feature requests for a contract")
        void shouldListFeatureRequestsForContract() {
            // Given
            featureRequestService.createFeatureRequest(createDefaultRequest("Feature 1"));
            featureRequestService.createFeatureRequest(createDefaultRequest("Feature 2"));
            featureRequestService.createFeatureRequest(createDefaultRequest("Feature 3"));

            // When
            Page<FeatureRequestDto> requests = featureRequestService.getFeatureRequests(
                testContract.getId(),
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(requests.getContent()).hasSize(3);
            assertThat(requests.getContent())
                .extracting(FeatureRequestDto::title)
                .containsExactlyInAnyOrder("Feature 1", "Feature 2", "Feature 3");
        }

        @Test
        @DisplayName("should update feature request")
        void shouldUpdateFeatureRequest() {
            // Given
            FeatureRequestDto created = featureRequestService.createFeatureRequest(
                createDefaultRequest("Original Title")
            );

            UpdateFeatureRequestRequest updateRequest = new UpdateFeatureRequestRequest(
                "Updated Title",
                "Updated description",
                FeatureRequestPriority.HIGH,
                "UI/UX"
            );

            // When
            FeatureRequestDto result = featureRequestService.updateFeatureRequest(
                created.id(),
                updateRequest
            );

            // Then
            assertThat(result.title()).isEqualTo("Updated Title");
            assertThat(result.description()).isEqualTo("Updated description");
            assertThat(result.priority()).isEqualTo(FeatureRequestPriority.HIGH);
            assertThat(result.category()).isEqualTo("UI/UX");
        }

        @Test
        @DisplayName("should delete feature request")
        void shouldDeleteFeatureRequest() {
            // Given
            FeatureRequestDto created = featureRequestService.createFeatureRequest(
                createDefaultRequest("Feature to Delete")
            );

            // When
            featureRequestService.deleteFeatureRequest(created.id());

            // Then
            assertThatThrownBy(() -> featureRequestService.getFeatureRequest(created.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Voting Functionality")
    class VotingFunctionality {

        private FeatureRequestDto featureRequest;

        @BeforeEach
        void createFeatureRequest() {
            featureRequest = featureRequestService.createFeatureRequest(
                createDefaultRequest("Feature to Vote")
            );
        }

        @Test
        @DisplayName("should increment vote count when voting")
        void shouldIncrementVoteCountWhenVoting() {
            // Given
            assertThat(featureRequest.voteCount()).isZero();

            // When
            FeatureRequestDto result = featureRequestService.vote(featureRequest.id());

            // Then
            assertThat(result.voteCount()).isEqualTo(1);
            assertThat(result.hasVoted()).isTrue();
        }

        @Test
        @DisplayName("should decrement vote count when unvoting")
        void shouldDecrementVoteCountWhenUnvoting() {
            // Given - vote first
            featureRequestService.vote(featureRequest.id());
            FeatureRequestDto afterVote = featureRequestService.getFeatureRequest(featureRequest.id());
            assertThat(afterVote.voteCount()).isEqualTo(1);

            // When
            FeatureRequestDto result = featureRequestService.unvote(featureRequest.id());

            // Then
            assertThat(result.voteCount()).isZero();
            assertThat(result.hasVoted()).isFalse();
        }

        @Test
        @DisplayName("should prevent duplicate votes from same user")
        void shouldPreventDuplicateVotes() {
            // Given - vote once
            featureRequestService.vote(featureRequest.id());

            // When/Then - try to vote again
            assertThatThrownBy(() -> featureRequestService.vote(featureRequest.id()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already voted");
        }

        @Test
        @DisplayName("should allow different users to vote")
        void shouldAllowDifferentUsersToVote() {
            // Given - first user votes
            featureRequestService.vote(featureRequest.id());

            // Create second user
            User user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .firstName("User")
                .lastName("Two")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            var role2 = createTestRole(testTenant, Role.USER);
            TenantMembership membership2 = TenantMembership.builder()
                .user(user2)
                .tenant(testTenant)
                .role(role2)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(membership2);

            // Switch to second user
            switchUser(user2);

            // When - second user votes
            FeatureRequestDto result = featureRequestService.vote(featureRequest.id());

            // Then
            assertThat(result.voteCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("should not allow unvoting if user has not voted")
        void shouldNotAllowUnvotingIfNotVoted() {
            // When/Then - try to unvote without voting
            assertThatThrownBy(() -> featureRequestService.unvote(featureRequest.id()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("has not voted");
        }

        @Test
        @DisplayName("should not allow vote count to go negative")
        void shouldNotAllowNegativeVoteCount() {
            // When/Then - try to unvote on feature with no votes
            assertThatThrownBy(() -> featureRequestService.unvote(featureRequest.id()))
                .isInstanceOf(IllegalStateException.class);

            // Verify vote count is still 0
            FeatureRequestDto result = featureRequestService.getFeatureRequest(featureRequest.id());
            assertThat(result.voteCount()).isZero();
        }
    }

    @Nested
    @DisplayName("Status Management")
    class StatusManagement {

        private FeatureRequestDto featureRequest;

        @BeforeEach
        void createFeatureRequest() {
            featureRequest = featureRequestService.createFeatureRequest(
                createDefaultRequest("Feature for Status Test")
            );
        }

        @Test
        @DisplayName("should update status to UNDER_REVIEW when admin")
        void shouldUpdateStatusToUnderReviewWhenAdmin() {
            // Given - switch to admin user
            switchUser(adminUser);

            // When
            FeatureRequestDto result = featureRequestService.updateStatus(
                featureRequest.id(),
                FeatureRequestStatus.UNDER_REVIEW
            );

            // Then
            assertThat(result.status()).isEqualTo(FeatureRequestStatus.UNDER_REVIEW);
        }

        @Test
        @DisplayName("should update status to APPROVED when admin")
        void shouldUpdateStatusToApprovedWhenAdmin() {
            // Given - switch to admin user
            switchUser(adminUser);

            // When
            FeatureRequestDto result = featureRequestService.updateStatus(
                featureRequest.id(),
                FeatureRequestStatus.APPROVED
            );

            // Then
            assertThat(result.status()).isEqualTo(FeatureRequestStatus.APPROVED);
        }

        @Test
        @DisplayName("should update status to REJECTED when admin")
        void shouldUpdateStatusToRejectedWhenAdmin() {
            // Given - switch to admin user
            switchUser(adminUser);

            // When
            FeatureRequestDto result = featureRequestService.updateStatus(
                featureRequest.id(),
                FeatureRequestStatus.REJECTED
            );

            // Then
            assertThat(result.status()).isEqualTo(FeatureRequestStatus.REJECTED);
        }

        @Test
        @DisplayName("should update status to IMPLEMENTED when admin")
        void shouldUpdateStatusToImplementedWhenAdmin() {
            // Given - switch to admin user
            switchUser(adminUser);

            // First approve
            featureRequestService.updateStatus(featureRequest.id(), FeatureRequestStatus.APPROVED);

            // When
            FeatureRequestDto result = featureRequestService.updateStatus(
                featureRequest.id(),
                FeatureRequestStatus.IMPLEMENTED
            );

            // Then
            assertThat(result.status()).isEqualTo(FeatureRequestStatus.IMPLEMENTED);
        }

        @Test
        @DisplayName("should reject status update from non-admin user")
        void shouldRejectStatusUpdateFromNonAdminUser() {
            // Given - using regular test user (not admin)

            // When/Then
            assertThatThrownBy(() -> featureRequestService.updateStatus(
                featureRequest.id(),
                FeatureRequestStatus.APPROVED
            ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only admins can update status");
        }
    }

    @Nested
    @DisplayName("Top Voted Feature Requests")
    class TopVotedFeatureRequests {

        @Test
        @DisplayName("should return feature requests ordered by vote count descending")
        void shouldReturnOrderedByVoteCount() {
            // Given - create feature requests with different vote counts
            FeatureRequestDto feature1 = featureRequestService.createFeatureRequest(
                createDefaultRequest("Low votes")
            );
            FeatureRequestDto feature2 = featureRequestService.createFeatureRequest(
                createDefaultRequest("High votes")
            );
            FeatureRequestDto feature3 = featureRequestService.createFeatureRequest(
                createDefaultRequest("Medium votes")
            );

            // Vote for feature2 (3 times with different users)
            featureRequestService.vote(feature2.id());

            // Create additional users to vote
            for (int i = 0; i < 2; i++) {
                User voter = User.builder()
                    .email("voter" + i + "-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                    .passwordHash("$2a$10$test.hash")
                    .firstName("Voter")
                    .lastName(String.valueOf(i))
                    .status(User.UserStatus.ACTIVE)
                    .emailVerified(true)
                    .build();
                voter = userRepository.save(voter);

                var voterRole = createTestRole(testTenant, Role.USER);
                TenantMembership voterMembership = TenantMembership.builder()
                    .user(voter)
                    .tenant(testTenant)
                    .role(voterRole)
                    .isDefault(true)
                    .acceptedAt(Instant.now())
                    .build();
                tenantMembershipRepository.save(voterMembership);

                switchUser(voter);
                featureRequestService.vote(feature2.id());
            }

            // Vote for feature3 once
            switchUser(testUser);
            featureRequestService.vote(feature3.id());

            // When
            List<FeatureRequestDto> topVoted = featureRequestService.getTopVoted(
                testContract.getId(),
                10
            );

            // Then
            assertThat(topVoted).hasSize(3);
            assertThat(topVoted.get(0).title()).isEqualTo("High votes");
            assertThat(topVoted.get(0).voteCount()).isEqualTo(3);
            assertThat(topVoted.get(1).title()).isEqualTo("Medium votes");
            assertThat(topVoted.get(1).voteCount()).isEqualTo(1);
            assertThat(topVoted.get(2).title()).isEqualTo("Low votes");
            assertThat(topVoted.get(2).voteCount()).isZero();
        }

        @Test
        @DisplayName("should limit results when requested")
        void shouldLimitResults() {
            // Given - create more feature requests than the limit
            for (int i = 0; i < 10; i++) {
                featureRequestService.createFeatureRequest(
                    createDefaultRequest("Feature " + i)
                );
            }

            // When
            List<FeatureRequestDto> topVoted = featureRequestService.getTopVoted(
                testContract.getId(),
                5
            );

            // Then
            assertThat(topVoted).hasSize(5);
        }
    }

    @Nested
    @DisplayName("Filter by Status")
    class FilterByStatus {

        @Test
        @DisplayName("should filter feature requests by status")
        void shouldFilterByStatus() {
            // Given - create features with different statuses
            FeatureRequestDto submitted = featureRequestService.createFeatureRequest(
                createDefaultRequest("Submitted Feature")
            );
            FeatureRequestDto approved = featureRequestService.createFeatureRequest(
                createDefaultRequest("Approved Feature")
            );
            FeatureRequestDto rejected = featureRequestService.createFeatureRequest(
                createDefaultRequest("Rejected Feature")
            );

            // Update statuses as admin
            switchUser(adminUser);
            featureRequestService.updateStatus(approved.id(), FeatureRequestStatus.APPROVED);
            featureRequestService.updateStatus(rejected.id(), FeatureRequestStatus.REJECTED);

            // When - filter by SUBMITTED
            switchUser(testUser);
            Page<FeatureRequestDto> submittedRequests = featureRequestService.getFeatureRequestsByStatus(
                testContract.getId(),
                FeatureRequestStatus.SUBMITTED,
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(submittedRequests.getContent()).hasSize(1);
            assertThat(submittedRequests.getContent().get(0).title()).isEqualTo("Submitted Feature");

            // When - filter by APPROVED
            Page<FeatureRequestDto> approvedRequests = featureRequestService.getFeatureRequestsByStatus(
                testContract.getId(),
                FeatureRequestStatus.APPROVED,
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(approvedRequests.getContent()).hasSize(1);
            assertThat(approvedRequests.getContent().get(0).title()).isEqualTo("Approved Feature");
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        private Tenant tenant2;
        private User user2;
        private Contract tenant2Contract;

        @BeforeEach
        void setUpSecondTenant() {
            // Create second tenant
            tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Create second user
            user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Second")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            // Create role and membership for tenant2
            var role2 = createTestRole(tenant2, Role.USER);
            TenantMembership membership2 = TenantMembership.builder()
                .user(user2)
                .tenant(tenant2)
                .role(role2)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(membership2);

            // Create contract in tenant 2
            tenant2Contract = Contract.builder()
                .tenant(tenant2)
                .contractNumber("T2-CONTRACT-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Tenant 2 Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .agency("GSA")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("300000.00"))
                .build();
            tenant2Contract = contractRepository.save(tenant2Contract);
        }

        @Test
        @DisplayName("should isolate feature requests between tenants")
        void shouldIsolateFeatureRequestsBetweenTenants() {
            // Given - Create feature request in tenant 1
            FeatureRequestDto tenant1Feature = featureRequestService.createFeatureRequest(
                createDefaultRequest("Tenant 1 Feature")
            );

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // Create feature request in tenant 2
            FeatureRequestDto tenant2Feature = featureRequestService.createFeatureRequest(
                new CreateFeatureRequestRequest(
                    tenant2Contract.getId(),
                    "Tenant 2 Feature",
                    "Description",
                    FeatureRequestPriority.MEDIUM,
                    null
                )
            );

            // Then - Each tenant should only see their own feature requests
            Page<FeatureRequestDto> tenant2Features = featureRequestService.getFeatureRequests(
                tenant2Contract.getId(),
                PageRequest.of(0, 10)
            );
            assertThat(tenant2Features.getContent())
                .extracting(FeatureRequestDto::title)
                .contains("Tenant 2 Feature")
                .doesNotContain("Tenant 1 Feature");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            Page<FeatureRequestDto> tenant1Features = featureRequestService.getFeatureRequests(
                testContract.getId(),
                PageRequest.of(0, 10)
            );
            assertThat(tenant1Features.getContent())
                .extracting(FeatureRequestDto::title)
                .contains("Tenant 1 Feature")
                .doesNotContain("Tenant 2 Feature");
        }

        @Test
        @DisplayName("should not allow access to other tenant's feature request by ID")
        void shouldNotAllowCrossTenantFeatureRequestAccess() {
            // Given - Create feature request in tenant 1
            FeatureRequestDto tenant1Feature = featureRequestService.createFeatureRequest(
                createDefaultRequest("Cross Tenant Test")
            );

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then - Attempting to access tenant 1's feature request should fail
            assertThatThrownBy(() -> featureRequestService.getFeatureRequest(tenant1Feature.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
