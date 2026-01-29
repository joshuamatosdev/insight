package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.ComplianceItem;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.ContractDeliverable;
import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Milestone;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ComplianceItemRepository;
import com.samgov.ingestor.repository.ContractDeliverableRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.InvoiceRepository;
import com.samgov.ingestor.repository.MilestoneRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for PortalDeadlineController REST API.
 *
 * Tests the /portal/deadlines/upcoming endpoint that aggregates
 * deadlines from multiple sources:
 * - Contract deliverables
 * - Invoices
 * - Milestones
 * - Compliance items
 */
@DisplayName("PortalDeadlineController")
class PortalDeadlineControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/portal/deadlines";

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractDeliverableRepository deliverableRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private ComplianceItemRepository complianceItemRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    private Tenant testTenant;
    private User testUser;
    private Role testRole;
    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .permissions("CONTRACT_READ")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        // Create test user
        testUser = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        // Create membership
        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(membership);

        // Create test contract
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("CTRL-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Test Contract")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .build();
        testContract = contractRepository.save(testContract);

        // Set tenant context
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("GET /portal/deadlines/upcoming")
    @WithMockUser(roles = "USER")
    class GetUpcomingDeadlines {

        @Test
        @DisplayName("should return empty list when no deadlines exist")
        void shouldReturnEmptyListWhenNoDeadlines() throws Exception {
            performGet(BASE_URL + "/upcoming")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("should return deliverable deadlines")
        void shouldReturnDeliverableDeadlines() throws Exception {
            // Given - create a deliverable with due date in 10 days
            ContractDeliverable deliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Monthly Status Report")
                .deliverableType(ContractDeliverable.DeliverableType.REPORT)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(10))
                .build();
            deliverableRepository.save(deliverable);

            // When/Then
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Monthly Status Report")))
                .andExpect(jsonPath("$[0].type", is("DELIVERABLE")))
                .andExpect(jsonPath("$[0].contractNumber", is(testContract.getContractNumber())));
        }

        @Test
        @DisplayName("should return invoice deadlines")
        void shouldReturnInvoiceDeadlines() throws Exception {
            // Given - create an invoice with due date in 5 days
            Invoice invoice = Invoice.builder()
                .tenant(testTenant)
                .contract(testContract)
                .invoiceNumber("INV-001")
                .invoiceType(Invoice.InvoiceType.PROGRESS)
                .status(Invoice.InvoiceStatus.DRAFT)
                .invoiceDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(5))
                .subtotal(new BigDecimal("10000.00"))
                .totalAmount(new BigDecimal("10000.00"))
                .build();
            invoiceRepository.save(invoice);

            // When/Then
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", containsString("INV-001")))
                .andExpect(jsonPath("$[0].type", is("INVOICE")));
        }

        @Test
        @DisplayName("should return milestone deadlines")
        void shouldReturnMilestoneDeadlines() throws Exception {
            // Given - create a milestone with due date in 15 days
            Milestone milestone = Milestone.builder()
                .tenant(testTenant)
                .contract(testContract)
                .name("Phase 1 Complete")
                .status(Milestone.MilestoneStatus.IN_PROGRESS)
                .dueDate(LocalDate.now().plusDays(15))
                .priority(Milestone.MilestonePriority.HIGH)
                .build();
            milestoneRepository.save(milestone);

            // When/Then
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Phase 1 Complete")))
                .andExpect(jsonPath("$[0].type", is("MILESTONE")));
        }

        @Test
        @DisplayName("should return compliance item deadlines")
        void shouldReturnComplianceItemDeadlines() throws Exception {
            // Given - create a compliance item with due date in 20 days
            ComplianceItem complianceItem = ComplianceItem.builder()
                .tenant(testTenant)
                .contract(testContract)
                .title("CMMC Assessment Due")
                .complianceType(ComplianceItem.ComplianceType.CMMC)
                .status(ComplianceItem.ComplianceStatus.IN_PROGRESS)
                .priority(ComplianceItem.CompliancePriority.HIGH)
                .dueDate(LocalDate.now().plusDays(20))
                .build();
            complianceItemRepository.save(complianceItem);

            // When/Then
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("CMMC Assessment Due")))
                .andExpect(jsonPath("$[0].type", is("COMPLIANCE")));
        }

        @Test
        @DisplayName("should aggregate deadlines from all sources sorted by due date")
        void shouldAggregateDeadlinesFromAllSourcesSortedByDueDate() throws Exception {
            // Given - create deadlines from different sources
            ContractDeliverable deliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Deliverable Report")
                .deliverableType(ContractDeliverable.DeliverableType.REPORT)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(15)) // Middle
                .build();
            deliverableRepository.save(deliverable);

            Invoice invoice = Invoice.builder()
                .tenant(testTenant)
                .contract(testContract)
                .invoiceNumber("INV-002")
                .invoiceType(Invoice.InvoiceType.PROGRESS)
                .status(Invoice.InvoiceStatus.DRAFT)
                .invoiceDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(5)) // Earliest
                .subtotal(new BigDecimal("5000.00"))
                .totalAmount(new BigDecimal("5000.00"))
                .build();
            invoiceRepository.save(invoice);

            Milestone milestone = Milestone.builder()
                .tenant(testTenant)
                .contract(testContract)
                .name("Milestone Review")
                .status(Milestone.MilestoneStatus.NOT_STARTED)
                .dueDate(LocalDate.now().plusDays(25)) // Latest
                .build();
            milestoneRepository.save(milestone);

            // When/Then - should be sorted by due date ascending
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].type", is("INVOICE"))) // 5 days
                .andExpect(jsonPath("$[1].type", is("DELIVERABLE"))) // 15 days
                .andExpect(jsonPath("$[2].type", is("MILESTONE"))); // 25 days
        }

        @Test
        @DisplayName("should filter deadlines by daysAhead parameter")
        void shouldFilterDeadlinesByDaysAhead() throws Exception {
            // Given - create deadlines at different times
            ContractDeliverable nearDeliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Near Deliverable")
                .deliverableType(ContractDeliverable.DeliverableType.REPORT)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(5))
                .build();
            deliverableRepository.save(nearDeliverable);

            ContractDeliverable farDeliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Far Deliverable")
                .deliverableType(ContractDeliverable.DeliverableType.DATA)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(45))
                .build();
            deliverableRepository.save(farDeliverable);

            // When/Then - only near deliverable should be returned
            performGet(BASE_URL + "/upcoming?daysAhead=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Near Deliverable")));
        }

        @Test
        @DisplayName("should use default of 30 days when daysAhead not specified")
        void shouldUseDefaultDaysAhead() throws Exception {
            // Given - create deliverable within 30 days
            ContractDeliverable deliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Within Default Range")
                .deliverableType(ContractDeliverable.DeliverableType.REPORT)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(25))
                .build();
            deliverableRepository.save(deliverable);

            // When/Then - no daysAhead parameter, should default to 30
            performGet(BASE_URL + "/upcoming")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("should exclude completed/accepted items")
        void shouldExcludeCompletedItems() throws Exception {
            // Given - create completed deliverable
            ContractDeliverable completedDeliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Completed Deliverable")
                .deliverableType(ContractDeliverable.DeliverableType.REPORT)
                .status(ContractDeliverable.DeliverableStatus.ACCEPTED)
                .dueDate(LocalDate.now().plusDays(10))
                .build();
            deliverableRepository.save(completedDeliverable);

            // Create pending deliverable
            ContractDeliverable pendingDeliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Pending Deliverable")
                .deliverableType(ContractDeliverable.DeliverableType.DATA)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(10))
                .build();
            deliverableRepository.save(pendingDeliverable);

            // When/Then - only pending should be returned
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Pending Deliverable")));
        }

        @Test
        @DisplayName("should exclude past due dates")
        void shouldExcludePastDueDates() throws Exception {
            // Given - create overdue deliverable
            ContractDeliverable overdueDeliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Overdue Deliverable")
                .deliverableType(ContractDeliverable.DeliverableType.REPORT)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().minusDays(5))
                .build();
            deliverableRepository.save(overdueDeliverable);

            // Create future deliverable
            ContractDeliverable futureDeliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("Future Deliverable")
                .deliverableType(ContractDeliverable.DeliverableType.DATA)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(10))
                .build();
            deliverableRepository.save(futureDeliverable);

            // When/Then - only future should be returned
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Future Deliverable")));
        }

        @Test
        @DisplayName("should include priority in response")
        void shouldIncludePriorityInResponse() throws Exception {
            // Given - create milestone with HIGH priority
            Milestone milestone = Milestone.builder()
                .tenant(testTenant)
                .contract(testContract)
                .name("Critical Milestone")
                .status(Milestone.MilestoneStatus.IN_PROGRESS)
                .dueDate(LocalDate.now().plusDays(5))
                .priority(Milestone.MilestonePriority.CRITICAL)
                .build();
            milestoneRepository.save(milestone);

            // When/Then
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].priority", is("CRITICAL")));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    @WithMockUser(roles = "USER")
    class TenantIsolation {

        @Test
        @DisplayName("should only return deadlines for current tenant")
        void shouldOnlyReturnDeadlinesForCurrentTenant() throws Exception {
            // Given - create deliverable for current tenant
            ContractDeliverable myDeliverable = ContractDeliverable.builder()
                .contract(testContract)
                .title("My Deliverable")
                .deliverableType(ContractDeliverable.DeliverableType.REPORT)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(10))
                .build();
            deliverableRepository.save(myDeliverable);

            // Create second tenant with contract and deliverable
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            Contract contract2 = Contract.builder()
                .tenant(tenant2)
                .contractNumber("CTRL2-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Other Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("100000.00"))
                .build();
            contract2 = contractRepository.save(contract2);

            ContractDeliverable otherDeliverable = ContractDeliverable.builder()
                .contract(contract2)
                .title("Other Tenant Deliverable")
                .deliverableType(ContractDeliverable.DeliverableType.REPORT)
                .status(ContractDeliverable.DeliverableStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(10))
                .build();
            deliverableRepository.save(otherDeliverable);

            // When/Then - should only see my deliverable
            performGet(BASE_URL + "/upcoming?daysAhead=30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("My Deliverable")));
        }
    }
}
