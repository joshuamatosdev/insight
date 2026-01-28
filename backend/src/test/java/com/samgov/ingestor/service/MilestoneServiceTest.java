package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.Milestone.MilestonePriority;
import com.samgov.ingestor.model.Milestone.MilestoneType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.service.MilestoneService.CreateMilestoneRequest;
import com.samgov.ingestor.service.MilestoneService.MilestoneDto;
import com.samgov.ingestor.model.Milestone.MilestoneStatus;
import com.samgov.ingestor.service.MilestoneService.UpdateMilestoneRequest;
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
 * Behavioral tests for MilestoneService.
 *
 * Tests the business logic of milestone management for contract portals:
 * - Milestone CRUD operations
 * - Critical path calculation
 * - Upcoming and overdue milestone queries
 * - Dependency management
 * - Multi-tenant isolation
 */
@DisplayName("MilestoneService")
class MilestoneServiceTest extends BaseServiceTest {

    @Autowired
    private MilestoneService milestoneService;

    @Autowired
    private ContractRepository contractRepository;

    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();

        // Create a test contract for milestones
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("MILESTONE-TEST-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Milestone Test Contract")
            .description("Contract for testing milestones")
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

    private CreateMilestoneRequest createDefaultRequest(String name, LocalDate dueDate) {
        return new CreateMilestoneRequest(
            testContract.getId(),
            name,
            "Description for " + name,
            MilestoneType.DEVELOPMENT,
            null, // plannedStartDate
            null, // plannedEndDate
            dueDate,
            false, // isCriticalPath
            null, // paymentAmount
            false, // isPaymentMilestone
            testUser.getId(),
            MilestonePriority.MEDIUM,
            null, // sortOrder
            null, // deliverableId
            null, // dependsOnIds
            null  // notes
        );
    }

    @Nested
    @DisplayName("Milestone CRUD Operations")
    class MilestoneCrudOperations {

        @Test
        @DisplayName("should create a new milestone successfully")
        void shouldCreateMilestoneSuccessfully() {
            // Given
            CreateMilestoneRequest request = createDefaultRequest(
                "Phase 1 Complete",
                LocalDate.now().plusMonths(3)
            );

            // When
            MilestoneDto result = milestoneService.createMilestone(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.name()).isEqualTo("Phase 1 Complete");
            assertThat(result.description()).isEqualTo("Description for Phase 1 Complete");
            assertThat(result.dueDate()).isEqualTo(LocalDate.now().plusMonths(3));
            assertThat(result.status()).isEqualTo(MilestoneStatus.NOT_STARTED);
            assertThat(result.ownerId()).isEqualTo(testUser.getId());
            assertThat(result.contractId()).isEqualTo(testContract.getId());
        }

        @Test
        @DisplayName("should retrieve milestone by ID")
        void shouldRetrieveMilestoneById() {
            // Given
            MilestoneDto created = milestoneService.createMilestone(
                createDefaultRequest("Milestone to Get", LocalDate.now().plusMonths(1))
            );

            // When
            MilestoneDto result = milestoneService.getMilestone(created.id());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(created.id());
            assertThat(result.name()).isEqualTo("Milestone to Get");
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException for non-existent milestone")
        void shouldThrowExceptionForNonExistentMilestone() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> milestoneService.getMilestone(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Milestone not found");
        }

        @Test
        @DisplayName("should list milestones for a contract")
        void shouldListMilestonesForContract() {
            // Given
            milestoneService.createMilestone(createDefaultRequest("Milestone 1", LocalDate.now().plusMonths(1)));
            milestoneService.createMilestone(createDefaultRequest("Milestone 2", LocalDate.now().plusMonths(2)));
            milestoneService.createMilestone(createDefaultRequest("Milestone 3", LocalDate.now().plusMonths(3)));

            // When
            List<MilestoneDto> milestones = milestoneService.getMilestones(testContract.getId());

            // Then
            assertThat(milestones).hasSize(3);
            assertThat(milestones)
                .extracting(MilestoneDto::name)
                .containsExactlyInAnyOrder("Milestone 1", "Milestone 2", "Milestone 3");
        }

        @Test
        @DisplayName("should list milestones for a contract with pagination")
        void shouldListMilestonesForContractWithPagination() {
            // Given
            milestoneService.createMilestone(createDefaultRequest("Milestone 1", LocalDate.now().plusMonths(1)));
            milestoneService.createMilestone(createDefaultRequest("Milestone 2", LocalDate.now().plusMonths(2)));
            milestoneService.createMilestone(createDefaultRequest("Milestone 3", LocalDate.now().plusMonths(3)));

            // When
            Page<MilestoneDto> milestones = milestoneService.getMilestonesPaged(
                testContract.getId(),
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(milestones.getContent()).hasSize(3);
            assertThat(milestones.getContent())
                .extracting(MilestoneDto::name)
                .containsExactlyInAnyOrder("Milestone 1", "Milestone 2", "Milestone 3");
        }

        @Test
        @DisplayName("should update milestone details")
        void shouldUpdateMilestoneDetails() {
            // Given
            MilestoneDto created = milestoneService.createMilestone(
                createDefaultRequest("Original Milestone", LocalDate.now().plusMonths(1))
            );

            UpdateMilestoneRequest updateRequest = new UpdateMilestoneRequest(
                "Updated Milestone",
                "Updated description",
                MilestoneType.DEVELOPMENT,
                null, // plannedStartDate
                null, // plannedEndDate
                LocalDate.now().plusMonths(2),
                null, // actualStartDate
                null, // actualEndDate
                null, // percentComplete
                true, // isCriticalPath
                null, // paymentAmount
                null, // isPaymentMilestone
                null, // ownerId
                MilestonePriority.HIGH,
                null, // sortOrder
                null  // notes
            );

            // When
            MilestoneDto result = milestoneService.updateMilestone(created.id(), updateRequest);

            // Then
            assertThat(result.name()).isEqualTo("Updated Milestone");
            assertThat(result.description()).isEqualTo("Updated description");
            assertThat(result.dueDate()).isEqualTo(LocalDate.now().plusMonths(2));
            assertThat(result.isCriticalPath()).isTrue();
        }

        @Test
        @DisplayName("should delete milestone")
        void shouldDeleteMilestone() {
            // Given
            MilestoneDto created = milestoneService.createMilestone(
                createDefaultRequest("Milestone to Delete", LocalDate.now().plusMonths(1))
            );

            // When
            milestoneService.deleteMilestone(created.id());

            // Then
            assertThatThrownBy(() -> milestoneService.getMilestone(created.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should complete milestone")
        void shouldCompleteMilestone() {
            // Given
            MilestoneDto created = milestoneService.createMilestone(
                createDefaultRequest("Milestone to Complete", LocalDate.now().plusMonths(1))
            );

            // When
            MilestoneDto result = milestoneService.completeMilestone(created.id());

            // Then
            assertThat(result.status()).isEqualTo(MilestoneStatus.COMPLETED);
            assertThat(result.completedDate()).isEqualTo(LocalDate.now());
        }
    }

    @Nested
    @DisplayName("Critical Path Management")
    class CriticalPathManagement {

        @Test
        @DisplayName("should calculate critical path")
        void shouldCalculateCriticalPath() {
            // Given - create milestones with dependencies
            MilestoneDto m1 = milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Start",
                "Project kickoff",
                MilestoneType.DEVELOPMENT,
                null, null, // plannedStartDate, plannedEndDate
                LocalDate.now().plusWeeks(1),
                true, // isCriticalPath
                null, false, // paymentAmount, isPaymentMilestone
                testUser.getId(),
                MilestonePriority.MEDIUM,
                null, null, null, null
            ));

            MilestoneDto m2 = milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Design Complete",
                "Design phase complete",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(1),
                true, // isCriticalPath
                null, false,
                testUser.getId(),
                MilestonePriority.MEDIUM,
                null, null,
                List.of(m1.id()),
                null
            ));

            MilestoneDto m3 = milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Development Complete",
                "Development phase complete",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(3),
                true, // isCriticalPath
                null, false,
                testUser.getId(),
                MilestonePriority.MEDIUM,
                null, null,
                List.of(m2.id()),
                null
            ));

            // Non-critical path milestone
            milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Documentation",
                "User documentation",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(2),
                false, // not on critical path
                null, false,
                testUser.getId(),
                MilestonePriority.LOW,
                null, null, null, null
            ));

            // When
            List<MilestoneDto> criticalPath = milestoneService.getCriticalPath(testContract.getId());

            // Then
            assertThat(criticalPath).hasSize(3);
            assertThat(criticalPath)
                .extracting(MilestoneDto::name)
                .containsExactly("Start", "Design Complete", "Development Complete");
        }

        @Test
        @DisplayName("should recalculate critical path when milestone is completed")
        void shouldRecalculateCriticalPathOnCompletion() {
            // Given
            MilestoneDto m1 = milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Phase 1",
                "First phase",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(1),
                true, // isCriticalPath
                null, false,
                testUser.getId(),
                MilestonePriority.MEDIUM,
                null, null, null, null
            ));

            MilestoneDto m2 = milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Phase 2",
                "Second phase",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(2),
                true, // isCriticalPath
                null, false,
                testUser.getId(),
                MilestonePriority.MEDIUM,
                null, null,
                List.of(m1.id()),
                null
            ));

            // When - complete first milestone
            milestoneService.completeMilestone(m1.id());

            // Then - verify next milestone can start
            MilestoneDto updatedM2 = milestoneService.getMilestone(m2.id());
            assertThat(updatedM2.canStart()).isTrue();
        }
    }

    @Nested
    @DisplayName("Upcoming and Overdue Queries")
    class UpcomingAndOverdueQueries {

        @Test
        @DisplayName("should return upcoming milestones within threshold")
        void shouldReturnUpcomingMilestones() {
            // Given
            milestoneService.createMilestone(createDefaultRequest(
                "Upcoming in 7 days",
                LocalDate.now().plusDays(7)
            ));
            milestoneService.createMilestone(createDefaultRequest(
                "Upcoming in 14 days",
                LocalDate.now().plusDays(14)
            ));
            milestoneService.createMilestone(createDefaultRequest(
                "Far in future",
                LocalDate.now().plusDays(60)
            ));

            // When
            List<MilestoneDto> upcoming = milestoneService.getUpcomingMilestones(30);

            // Then
            assertThat(upcoming).hasSize(2);
            assertThat(upcoming)
                .extracting(MilestoneDto::name)
                .containsExactlyInAnyOrder("Upcoming in 7 days", "Upcoming in 14 days");
        }

        @Test
        @DisplayName("should return overdue milestones")
        void shouldReturnOverdueMilestones() {
            // Given - create past-due milestones (simulate by updating)
            MilestoneDto overdue1 = milestoneService.createMilestone(createDefaultRequest(
                "Overdue Milestone 1",
                LocalDate.now().minusDays(5)
            ));
            MilestoneDto overdue2 = milestoneService.createMilestone(createDefaultRequest(
                "Overdue Milestone 2",
                LocalDate.now().minusDays(10)
            ));
            MilestoneDto notOverdue = milestoneService.createMilestone(createDefaultRequest(
                "Future Milestone",
                LocalDate.now().plusDays(30)
            ));
            MilestoneDto completedButWasOverdue = milestoneService.createMilestone(createDefaultRequest(
                "Completed",
                LocalDate.now().minusDays(3)
            ));
            milestoneService.completeMilestone(completedButWasOverdue.id());

            // When
            List<MilestoneDto> overdue = milestoneService.getOverdueMilestones();

            // Then - should only include uncompleted, past-due milestones
            assertThat(overdue).hasSize(2);
            assertThat(overdue)
                .extracting(MilestoneDto::name)
                .containsExactlyInAnyOrder("Overdue Milestone 1", "Overdue Milestone 2");
        }
    }

    @Nested
    @DisplayName("Dependency Management")
    class DependencyManagement {

        @Test
        @DisplayName("should add dependency between milestones")
        void shouldAddDependency() {
            // Given
            MilestoneDto predecessor = milestoneService.createMilestone(
                createDefaultRequest("Predecessor", LocalDate.now().plusMonths(1))
            );
            MilestoneDto successor = milestoneService.createMilestone(
                createDefaultRequest("Successor", LocalDate.now().plusMonths(2))
            );

            // When
            milestoneService.addDependency(successor.id(), predecessor.id());

            // Then
            MilestoneDto updated = milestoneService.getMilestone(successor.id());
            assertThat(updated.dependencyIds()).hasSize(1);
            assertThat(updated.dependencyIds()).contains(predecessor.id());
        }

        @Test
        @DisplayName("should remove dependency between milestones")
        void shouldRemoveDependency() {
            // Given
            MilestoneDto predecessor = milestoneService.createMilestone(
                createDefaultRequest("Predecessor", LocalDate.now().plusMonths(1))
            );
            MilestoneDto successor = milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Successor",
                "Description",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(2),
                false, null, false,
                testUser.getId(),
                MilestonePriority.MEDIUM,
                null, null,
                List.of(predecessor.id()),
                null
            ));

            // Verify dependency exists
            MilestoneDto withDep = milestoneService.getMilestone(successor.id());
            assertThat(withDep.dependencyIds()).hasSize(1);

            // When
            milestoneService.removeDependency(successor.id(), predecessor.id());

            // Then
            MilestoneDto updated = milestoneService.getMilestone(successor.id());
            assertThat(updated.dependencyIds()).isEmpty();
        }

        @Test
        @DisplayName("should prevent circular dependencies")
        void shouldPreventCircularDependencies() {
            // Given
            MilestoneDto m1 = milestoneService.createMilestone(
                createDefaultRequest("Milestone 1", LocalDate.now().plusMonths(1))
            );
            MilestoneDto m2 = milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Milestone 2",
                "Description",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(2),
                false, null, false,
                testUser.getId(),
                MilestonePriority.MEDIUM,
                null, null,
                List.of(m1.id()),
                null
            ));

            // When/Then - trying to make m1 depend on m2 should fail
            assertThatThrownBy(() -> milestoneService.addDependency(m1.id(), m2.id()))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("circular");
        }

        @Test
        @DisplayName("should check if dependencies are met")
        void shouldCheckDependenciesMet() {
            // Given
            MilestoneDto m1 = milestoneService.createMilestone(
                createDefaultRequest("Predecessor", LocalDate.now().plusMonths(1))
            );
            MilestoneDto m2 = milestoneService.createMilestone(new CreateMilestoneRequest(
                testContract.getId(),
                "Successor",
                "Description",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(2),
                false, null, false,
                testUser.getId(),
                MilestonePriority.MEDIUM,
                null, null,
                List.of(m1.id()),
                null
            ));

            // Initially dependencies not met
            assertThat(milestoneService.getMilestone(m2.id()).canStart()).isFalse();

            // When - complete predecessor
            milestoneService.completeMilestone(m1.id());

            // Then
            assertThat(milestoneService.getMilestone(m2.id()).canStart()).isTrue();
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

            // Create role and membership
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
                .contractNumber("T2-MS-" + UUID.randomUUID().toString().substring(0, 8))
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
        @DisplayName("should isolate milestones between tenants")
        void shouldIsolateMilestonesBetweenTenants() {
            // Given - Create milestone in tenant 1
            MilestoneDto tenant1Milestone = milestoneService.createMilestone(
                createDefaultRequest("Tenant 1 Milestone", LocalDate.now().plusMonths(1))
            );

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // Create milestone in tenant 2
            MilestoneDto tenant2Milestone = milestoneService.createMilestone(new CreateMilestoneRequest(
                tenant2Contract.getId(),
                "Tenant 2 Milestone",
                "Description",
                MilestoneType.DEVELOPMENT,
                null, null,
                LocalDate.now().plusMonths(1),
                false, null, false,
                user2.getId(),
                MilestonePriority.MEDIUM,
                null, null, null, null
            ));

            // Then - Each tenant should only see their own milestones
            List<MilestoneDto> tenant2Milestones = milestoneService.getMilestones(tenant2Contract.getId());
            assertThat(tenant2Milestones)
                .extracting(MilestoneDto::name)
                .contains("Tenant 2 Milestone")
                .doesNotContain("Tenant 1 Milestone");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            List<MilestoneDto> tenant1Milestones = milestoneService.getMilestones(testContract.getId());
            assertThat(tenant1Milestones)
                .extracting(MilestoneDto::name)
                .contains("Tenant 1 Milestone")
                .doesNotContain("Tenant 2 Milestone");
        }

        @Test
        @DisplayName("should not allow access to other tenant's milestone by ID")
        void shouldNotAllowCrossTenantMilestoneAccess() {
            // Given - Create milestone in tenant 1
            MilestoneDto tenant1Milestone = milestoneService.createMilestone(
                createDefaultRequest("Cross Tenant Test", LocalDate.now().plusMonths(1))
            );

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then - Attempting to access tenant 1's milestone should fail
            assertThatThrownBy(() -> milestoneService.getMilestone(tenant1Milestone.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
