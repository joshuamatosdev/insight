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
import com.samgov.ingestor.service.ScopeService.CreateScopeItemRequest;
import com.samgov.ingestor.service.ScopeService.CreateScopeChangeRequest;
import com.samgov.ingestor.model.ScopeChange.ChangeStatus;
import com.samgov.ingestor.service.ScopeService.ScopeItemDto;
import com.samgov.ingestor.model.ScopeItem.ScopeStatus;
import com.samgov.ingestor.service.ScopeService.ScopeSummaryDto;
import com.samgov.ingestor.service.ScopeService.UpdateScopeItemRequest;
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
 * Behavioral tests for ScopeService.
 *
 * Tests the business logic of scope management for contract portals:
 * - Scope item CRUD operations
 * - WBS tree structure management
 * - Scope change workflow (request, approve, reject)
 * - Summary calculations (completion %, remaining work)
 * - Multi-tenant isolation
 */
@DisplayName("ScopeService")
class ScopeServiceTest extends BaseServiceTest {

    @Autowired
    private ScopeService scopeService;

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

        // Create a test contract
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("SCOPE-TEST-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Scope Test Contract")
            .description("Contract for testing scope management")
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

    private CreateScopeItemRequest createDefaultRequest(String wbsNumber, String name, UUID parentId) {
        return new CreateScopeItemRequest(
            testContract.getId(),
            parentId,
            wbsNumber,
            name,
            "Description for " + name,
            new BigDecimal("100000.00"),
            40, // estimated hours
            testUser.getId()
        );
    }

    @Nested
    @DisplayName("Scope Item CRUD Operations")
    class ScopeItemCrudOperations {

        @Test
        @DisplayName("should create a new scope item successfully")
        void shouldCreateScopeItemSuccessfully() {
            // Given
            CreateScopeItemRequest request = createDefaultRequest("1.0", "Phase 1", null);

            // When
            ScopeItemDto result = scopeService.createScopeItem(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.wbsNumber()).isEqualTo("1.0");
            assertThat(result.name()).isEqualTo("Phase 1");
            assertThat(result.estimatedValue()).isEqualByComparingTo(new BigDecimal("100000.00"));
            assertThat(result.estimatedHours()).isEqualTo(40);
            assertThat(result.status()).isEqualTo(ScopeItemStatus.NOT_STARTED);
            assertThat(result.contractId()).isEqualTo(testContract.getId());
        }

        @Test
        @DisplayName("should retrieve scope item by ID")
        void shouldRetrieveScopeItemById() {
            // Given
            ScopeItemDto created = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Phase 1", null)
            );

            // When
            ScopeItemDto result = scopeService.getScopeItem(created.id());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(created.id());
            assertThat(result.name()).isEqualTo("Phase 1");
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException for non-existent scope item")
        void shouldThrowExceptionForNonExistentScopeItem() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> scopeService.getScopeItem(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Scope item not found");
        }

        @Test
        @DisplayName("should list scope items for a contract")
        void shouldListScopeItemsForContract() {
            // Given
            scopeService.createScopeItem(createDefaultRequest("1.0", "Phase 1", null));
            scopeService.createScopeItem(createDefaultRequest("2.0", "Phase 2", null));
            scopeService.createScopeItem(createDefaultRequest("3.0", "Phase 3", null));

            // When
            Page<ScopeItemDto> items = scopeService.getScopeItems(
                testContract.getId(),
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(items.getContent()).hasSize(3);
        }

        @Test
        @DisplayName("should update scope item details")
        void shouldUpdateScopeItemDetails() {
            // Given
            ScopeItemDto created = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Original Name", null)
            );

            UpdateScopeItemRequest updateRequest = new UpdateScopeItemRequest(
                "Updated Name",
                "Updated description",
                new BigDecimal("150000.00"),
                60,
                ScopeItemStatus.IN_PROGRESS,
                50, // 50% complete
                null
            );

            // When
            ScopeItemDto result = scopeService.updateScopeItem(created.id(), updateRequest);

            // Then
            assertThat(result.name()).isEqualTo("Updated Name");
            assertThat(result.description()).isEqualTo("Updated description");
            assertThat(result.estimatedValue()).isEqualByComparingTo(new BigDecimal("150000.00"));
            assertThat(result.estimatedHours()).isEqualTo(60);
            assertThat(result.status()).isEqualTo(ScopeItemStatus.IN_PROGRESS);
            assertThat(result.percentComplete()).isEqualTo(50);
        }

        @Test
        @DisplayName("should delete scope item")
        void shouldDeleteScopeItem() {
            // Given
            ScopeItemDto created = scopeService.createScopeItem(
                createDefaultRequest("1.0", "To Delete", null)
            );

            // When
            scopeService.deleteScopeItem(created.id());

            // Then
            assertThatThrownBy(() -> scopeService.getScopeItem(created.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should reject duplicate WBS numbers within contract")
        void shouldRejectDuplicateWbsNumber() {
            // Given
            scopeService.createScopeItem(createDefaultRequest("1.0", "First Item", null));

            // When/Then
            assertThatThrownBy(() -> scopeService.createScopeItem(
                createDefaultRequest("1.0", "Duplicate WBS", null)
            ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("WBS number already exists");
        }
    }

    @Nested
    @DisplayName("WBS Tree Structure")
    class WbsTreeStructure {

        @Test
        @DisplayName("should create hierarchical scope items")
        void shouldCreateHierarchicalScopeItems() {
            // Given - create parent
            ScopeItemDto parent = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Phase 1", null)
            );

            // When - create children
            ScopeItemDto child1 = scopeService.createScopeItem(
                createDefaultRequest("1.1", "Task 1.1", parent.id())
            );
            ScopeItemDto child2 = scopeService.createScopeItem(
                createDefaultRequest("1.2", "Task 1.2", parent.id())
            );

            // Then
            assertThat(child1.parentId()).isEqualTo(parent.id());
            assertThat(child2.parentId()).isEqualTo(parent.id());

            // Verify parent has children
            ScopeItemDto parentWithChildren = scopeService.getScopeItem(parent.id());
            assertThat(parentWithChildren.children()).hasSize(2);
        }

        @Test
        @DisplayName("should return full WBS tree for contract")
        void shouldReturnFullWbsTree() {
            // Given - create WBS structure
            ScopeItemDto phase1 = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Phase 1", null)
            );
            scopeService.createScopeItem(createDefaultRequest("1.1", "Task 1.1", phase1.id()));
            scopeService.createScopeItem(createDefaultRequest("1.2", "Task 1.2", phase1.id()));

            ScopeItemDto phase2 = scopeService.createScopeItem(
                createDefaultRequest("2.0", "Phase 2", null)
            );
            scopeService.createScopeItem(createDefaultRequest("2.1", "Task 2.1", phase2.id()));

            // When
            List<ScopeItemDto> wbsTree = scopeService.getWbsTree(testContract.getId());

            // Then - should return top-level items with children
            assertThat(wbsTree).hasSize(2);
            assertThat(wbsTree)
                .extracting(ScopeItemDto::wbsNumber)
                .containsExactly("1.0", "2.0");

            // Verify children are included
            ScopeItemDto treePhase1 = wbsTree.stream()
                .filter(i -> i.wbsNumber().equals("1.0"))
                .findFirst()
                .orElseThrow();
            assertThat(treePhase1.children()).hasSize(2);
        }

        @Test
        @DisplayName("should calculate parent values from children")
        void shouldCalculateParentValuesFromChildren() {
            // Given - create parent with children
            ScopeItemDto parent = scopeService.createScopeItem(new CreateScopeItemRequest(
                testContract.getId(),
                null,
                "1.0",
                "Parent",
                "Description",
                null, // value will be calculated from children
                null, // hours will be calculated from children
                testUser.getId()
            ));

            scopeService.createScopeItem(new CreateScopeItemRequest(
                testContract.getId(),
                parent.id(),
                "1.1",
                "Child 1",
                "Description",
                new BigDecimal("50000.00"),
                20,
                testUser.getId()
            ));

            scopeService.createScopeItem(new CreateScopeItemRequest(
                testContract.getId(),
                parent.id(),
                "1.2",
                "Child 2",
                "Description",
                new BigDecimal("30000.00"),
                15,
                testUser.getId()
            ));

            // When
            ScopeItemDto updatedParent = scopeService.getScopeItem(parent.id());

            // Then
            assertThat(updatedParent.calculatedValue()).isEqualByComparingTo(new BigDecimal("80000.00"));
            assertThat(updatedParent.calculatedHours()).isEqualTo(35);
        }

        @Test
        @DisplayName("should prevent deletion of parent with children")
        void shouldPreventDeletionOfParentWithChildren() {
            // Given
            ScopeItemDto parent = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Parent", null)
            );
            scopeService.createScopeItem(
                createDefaultRequest("1.1", "Child", parent.id())
            );

            // When/Then
            assertThatThrownBy(() -> scopeService.deleteScopeItem(parent.id()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete scope item with children");
        }

        @Test
        @DisplayName("should move scope item to different parent")
        void shouldMoveScopeItemToDifferentParent() {
            // Given
            ScopeItemDto parent1 = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Parent 1", null)
            );
            ScopeItemDto parent2 = scopeService.createScopeItem(
                createDefaultRequest("2.0", "Parent 2", null)
            );
            ScopeItemDto child = scopeService.createScopeItem(
                createDefaultRequest("1.1", "Child", parent1.id())
            );

            // When
            ScopeItemDto moved = scopeService.moveScopeItem(child.id(), parent2.id(), "2.1");

            // Then
            assertThat(moved.parentId()).isEqualTo(parent2.id());
            assertThat(moved.wbsNumber()).isEqualTo("2.1");

            // Verify parent1 no longer has children
            ScopeItemDto updatedParent1 = scopeService.getScopeItem(parent1.id());
            assertThat(updatedParent1.children()).isEmpty();

            // Verify parent2 now has the child
            ScopeItemDto updatedParent2 = scopeService.getScopeItem(parent2.id());
            assertThat(updatedParent2.children()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Scope Change Workflow")
    class ScopeChangeWorkflow {

        private ScopeItemDto scopeItem;

        @BeforeEach
        void createScopeItem() {
            scopeItem = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Original Scope", null)
            );
        }

        @Test
        @DisplayName("should request scope change")
        void shouldRequestScopeChange() {
            // Given
            ScopeChangeRequest request = new ScopeChangeRequest(
                scopeItem.id(),
                "Change Request",
                "Need to increase estimated hours due to complexity",
                new BigDecimal("120000.00"), // increased value
                60, // increased hours
                new BigDecimal("20000.00") // cost impact
            );

            // When
            var changeRequest = scopeService.requestScopeChange(request);

            // Then
            assertThat(changeRequest).isNotNull();
            assertThat(changeRequest.id()).isNotNull();
            assertThat(changeRequest.title()).isEqualTo("Change Request");
            assertThat(changeRequest.status()).isEqualTo(ScopeChangeStatus.PENDING);
            assertThat(changeRequest.requestedValue()).isEqualByComparingTo(new BigDecimal("120000.00"));
            assertThat(changeRequest.requestedHours()).isEqualTo(60);
            assertThat(changeRequest.costImpact()).isEqualByComparingTo(new BigDecimal("20000.00"));
            assertThat(changeRequest.requesterId()).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("should approve scope change")
        void shouldApproveScopeChange() {
            // Given - create change request
            ScopeChangeRequest request = new ScopeChangeRequest(
                scopeItem.id(),
                "Approved Change",
                "Justification",
                new BigDecimal("150000.00"),
                80,
                new BigDecimal("50000.00")
            );
            var changeRequest = scopeService.requestScopeChange(request);

            // Switch to admin
            switchUser(adminUser);

            // When
            var approved = scopeService.approveScopeChange(changeRequest.id(), "Approved by PM");

            // Then
            assertThat(approved.status()).isEqualTo(ScopeChangeStatus.APPROVED);
            assertThat(approved.reviewNotes()).isEqualTo("Approved by PM");
            assertThat(approved.reviewerId()).isEqualTo(adminUser.getId());
            assertThat(approved.reviewedAt()).isNotNull();

            // Verify scope item was updated
            ScopeItemDto updatedItem = scopeService.getScopeItem(scopeItem.id());
            assertThat(updatedItem.estimatedValue()).isEqualByComparingTo(new BigDecimal("150000.00"));
            assertThat(updatedItem.estimatedHours()).isEqualTo(80);
        }

        @Test
        @DisplayName("should reject scope change")
        void shouldRejectScopeChange() {
            // Given
            ScopeChangeRequest request = new ScopeChangeRequest(
                scopeItem.id(),
                "Rejected Change",
                "Justification",
                new BigDecimal("200000.00"),
                100,
                new BigDecimal("100000.00")
            );
            var changeRequest = scopeService.requestScopeChange(request);

            // Switch to admin
            switchUser(adminUser);

            // When
            var rejected = scopeService.rejectScopeChange(changeRequest.id(), "Budget constraints");

            // Then
            assertThat(rejected.status()).isEqualTo(ScopeChangeStatus.REJECTED);
            assertThat(rejected.reviewNotes()).isEqualTo("Budget constraints");

            // Verify scope item was NOT updated
            ScopeItemDto unchangedItem = scopeService.getScopeItem(scopeItem.id());
            assertThat(unchangedItem.estimatedValue()).isEqualByComparingTo(new BigDecimal("100000.00"));
            assertThat(unchangedItem.estimatedHours()).isEqualTo(40);
        }

        @Test
        @DisplayName("should reject scope change approval from non-admin")
        void shouldRejectApprovalFromNonAdmin() {
            // Given
            ScopeChangeRequest request = new ScopeChangeRequest(
                scopeItem.id(),
                "Change",
                "Justification",
                new BigDecimal("120000.00"),
                50,
                new BigDecimal("20000.00")
            );
            var changeRequest = scopeService.requestScopeChange(request);

            // When/Then - regular user tries to approve
            assertThatThrownBy(() -> scopeService.approveScopeChange(changeRequest.id(), "Approved"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only admins can approve");
        }

        @Test
        @DisplayName("should list pending scope changes")
        void shouldListPendingScopeChanges() {
            // Given - create multiple change requests
            scopeService.requestScopeChange(new ScopeChangeRequest(
                scopeItem.id(), "Change 1", "Desc", new BigDecimal("110000"), 45, new BigDecimal("10000")
            ));
            scopeService.requestScopeChange(new ScopeChangeRequest(
                scopeItem.id(), "Change 2", "Desc", new BigDecimal("120000"), 50, new BigDecimal("20000")
            ));

            // Approve one
            switchUser(adminUser);
            var changes = scopeService.getScopeChanges(scopeItem.id());
            scopeService.approveScopeChange(changes.get(0).id(), "OK");

            switchUser(testUser);

            // Create another
            scopeService.requestScopeChange(new ScopeChangeRequest(
                scopeItem.id(), "Change 3", "Desc", new BigDecimal("130000"), 55, new BigDecimal("30000")
            ));

            // When
            var pendingChanges = scopeService.getPendingScopeChanges(testContract.getId());

            // Then
            assertThat(pendingChanges).hasSize(2); // Change 2 and Change 3
            assertThat(pendingChanges).allMatch(c -> c.status() == ScopeChangeStatus.PENDING);
        }
    }

    @Nested
    @DisplayName("Summary Calculations")
    class SummaryCalculations {

        @Test
        @DisplayName("should calculate scope summary with completion percentage")
        void shouldCalculateScopeSummary() {
            // Given - create scope items with various completion states
            ScopeItemDto item1 = scopeService.createScopeItem(new CreateScopeItemRequest(
                testContract.getId(), null, "1.0", "Completed Item", "Desc",
                new BigDecimal("100000.00"), 40, testUser.getId()
            ));
            scopeService.updateScopeItem(item1.id(), new UpdateScopeItemRequest(
                null, null, null, null, ScopeItemStatus.COMPLETED, 100, null
            ));

            ScopeItemDto item2 = scopeService.createScopeItem(new CreateScopeItemRequest(
                testContract.getId(), null, "2.0", "In Progress Item", "Desc",
                new BigDecimal("200000.00"), 80, testUser.getId()
            ));
            scopeService.updateScopeItem(item2.id(), new UpdateScopeItemRequest(
                null, null, null, null, ScopeItemStatus.IN_PROGRESS, 50, null
            ));

            ScopeItemDto item3 = scopeService.createScopeItem(new CreateScopeItemRequest(
                testContract.getId(), null, "3.0", "Not Started Item", "Desc",
                new BigDecimal("100000.00"), 40, testUser.getId()
            ));

            // When
            ScopeSummaryDto summary = scopeService.getScopeSummary(testContract.getId());

            // Then
            assertThat(summary).isNotNull();
            assertThat(summary.totalItems()).isEqualTo(3);
            assertThat(summary.completedItems()).isEqualTo(1);
            assertThat(summary.inProgressItems()).isEqualTo(1);
            assertThat(summary.notStartedItems()).isEqualTo(1);

            assertThat(summary.totalEstimatedValue()).isEqualByComparingTo(new BigDecimal("400000.00"));
            assertThat(summary.totalEstimatedHours()).isEqualTo(160);

            // Completion: (100*100 + 200*50 + 100*0) / (100+200+100) = 200000/400000 = 50%
            assertThat(summary.overallCompletionPercentage()).isEqualTo(50);

            // Completed value = 100000 (item1) + 100000 (50% of item2) = 200000
            assertThat(summary.completedValue()).isEqualByComparingTo(new BigDecimal("200000.00"));
            assertThat(summary.remainingValue()).isEqualByComparingTo(new BigDecimal("200000.00"));

            // Completed hours = 40 (item1) + 40 (50% of item2) = 80
            assertThat(summary.completedHours()).isEqualTo(80);
            assertThat(summary.remainingHours()).isEqualTo(80);
        }

        @Test
        @DisplayName("should return zero counts for empty scope")
        void shouldReturnZeroCountsForEmptyScope() {
            // When
            ScopeSummaryDto summary = scopeService.getScopeSummary(testContract.getId());

            // Then
            assertThat(summary.totalItems()).isZero();
            assertThat(summary.completedItems()).isZero();
            assertThat(summary.totalEstimatedValue()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(summary.overallCompletionPercentage()).isZero();
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
                .contractNumber("T2-SCOPE-" + UUID.randomUUID().toString().substring(0, 8))
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
        @DisplayName("should isolate scope items between tenants")
        void shouldIsolateScopeItemsBetweenTenants() {
            // Given - Create scope item in tenant 1
            ScopeItemDto tenant1Item = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Tenant 1 Item", null)
            );

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // Create scope item in tenant 2
            ScopeItemDto tenant2Item = scopeService.createScopeItem(new CreateScopeItemRequest(
                tenant2Contract.getId(),
                null,
                "1.0", // Same WBS number - should be allowed in different tenant
                "Tenant 2 Item",
                "Description",
                new BigDecimal("50000.00"),
                20,
                user2.getId()
            ));

            // Then - Each tenant should only see their own scope items
            Page<ScopeItemDto> tenant2Items = scopeService.getScopeItems(
                tenant2Contract.getId(),
                PageRequest.of(0, 10)
            );
            assertThat(tenant2Items.getContent())
                .extracting(ScopeItemDto::name)
                .contains("Tenant 2 Item")
                .doesNotContain("Tenant 1 Item");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            Page<ScopeItemDto> tenant1Items = scopeService.getScopeItems(
                testContract.getId(),
                PageRequest.of(0, 10)
            );
            assertThat(tenant1Items.getContent())
                .extracting(ScopeItemDto::name)
                .contains("Tenant 1 Item")
                .doesNotContain("Tenant 2 Item");
        }

        @Test
        @DisplayName("should not allow access to other tenant's scope item by ID")
        void shouldNotAllowCrossTenantScopeItemAccess() {
            // Given - Create scope item in tenant 1
            ScopeItemDto tenant1Item = scopeService.createScopeItem(
                createDefaultRequest("1.0", "Cross Tenant Test", null)
            );

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then - Attempting to access tenant 1's scope item should fail
            assertThatThrownBy(() -> scopeService.getScopeItem(tenant1Item.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
