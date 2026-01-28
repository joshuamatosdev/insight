package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.builder.ContractTestBuilder;
import com.samgov.ingestor.builder.InvoiceTestBuilder;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.Invoice.InvoiceType;
import com.samgov.ingestor.model.InvoiceLineItem.LineType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.InvoiceRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.InvoiceService.CreateInvoiceRequest;
import com.samgov.ingestor.service.InvoiceService.LineItemRequest;
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
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for InvoiceController.
 * Tests HTTP endpoints, request/response handling, and authentication.
 */
@DisplayName("InvoiceController Integration Tests")
class InvoiceControllerTest extends BaseControllerTest {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository tenantMembershipRepository;

    private Tenant testTenant;
    private User testUser;
    private Contract testContract;

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

        // Create role and membership
        Role role = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .isSystemRole(false)
            .build();
        role = roleRepository.save(role);

        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(role)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        tenantMembershipRepository.save(membership);

        // Create test contract
        testContract = ContractTestBuilder.anActiveContract()
            .withTenant(testTenant)
            .withContractNumber("TEST-CONTRACT-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testContract = contractRepository.save(testContract);

        // Set tenant context for tests
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    protected void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("POST /invoices - Create Invoice")
    @WithMockUser
    class CreateInvoiceTests {

        @Test
        @DisplayName("should create invoice and return 200 OK")
        void shouldCreateInvoiceAndReturn200() throws Exception {
            // Given
            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-API-001",
                InvoiceType.PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                LocalDate.now().minusMonths(1),
                LocalDate.now().minusDays(1),
                List.of(),
                "Test invoice via API"
            );

            // When/Then
            performPost("/invoices", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.invoiceNumber").value("INV-API-001"))
                .andExpect(jsonPath("$.invoiceType").value("PROGRESS"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.contractId").value(testContract.getId().toString()))
                .andExpect(jsonPath("$.contractNumber").value(testContract.getContractNumber()));
        }

        @Test
        @DisplayName("should create invoice with line items")
        void shouldCreateInvoiceWithLineItems() throws Exception {
            // Given
            List<LineItemRequest> lineItems = List.of(
                new LineItemRequest(
                    "Senior Developer - 80 hours",
                    null,
                    LineType.DIRECT_LABOR,
                    new BigDecimal("80.00"),
                    "Hour",
                    new BigDecimal("150.00"),
                    new BigDecimal("12000.00")
                ),
                new LineItemRequest(
                    "Travel expenses",
                    null,
                    LineType.TRAVEL,
                    new BigDecimal("1"),
                    "Trip",
                    new BigDecimal("1500.00"),
                    new BigDecimal("1500.00")
                )
            );

            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-API-002",
                InvoiceType.PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                LocalDate.now().minusMonths(1),
                LocalDate.now().minusDays(1),
                lineItems,
                "Invoice with line items"
            );

            // When/Then
            performPost("/invoices", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lineItems").isArray())
                .andExpect(jsonPath("$.lineItems", hasSize(2)))
                .andExpect(jsonPath("$.totalAmount").value(13500.00))
                .andExpect(jsonPath("$.subtotal").value(13500.00));
        }
    }

    @Nested
    @DisplayName("GET /invoices - List Invoices")
    @WithMockUser
    class ListInvoicesTests {

        @Test
        @DisplayName("should return paginated list of invoices")
        void shouldReturnPaginatedListOfInvoices() throws Exception {
            // Given
            for (int i = 1; i <= 5; i++) {
                createAndSaveInvoice("INV-LIST-" + String.format("%03d", i));
            }

            // When/Then
            performGet("/invoices?page=0&size=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.totalElements").value(5))
                .andExpect(jsonPath("$.totalPages").value(1));
        }

        @Test
        @DisplayName("should filter invoices by status")
        void shouldFilterInvoicesByStatus() throws Exception {
            // Given
            createAndSaveInvoice("INV-DRAFT-1", InvoiceStatus.DRAFT);
            createAndSaveInvoice("INV-DRAFT-2", InvoiceStatus.DRAFT);
            createAndSaveInvoice("INV-SUBMITTED-1", InvoiceStatus.SUBMITTED);

            // When/Then
            performGet("/invoices?status=DRAFT&page=0&size=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].status", everyItem(is("DRAFT"))));
        }

        @Test
        @DisplayName("should return empty page when no invoices exist")
        void shouldReturnEmptyPageWhenNoInvoicesExist() throws Exception {
            // When/Then
            performGet("/invoices?page=0&size=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements").value(0));
        }
    }

    @Nested
    @DisplayName("GET /invoices/{id} - Get Invoice By ID")
    @WithMockUser
    class GetInvoiceByIdTests {

        @Test
        @DisplayName("should return invoice by ID")
        void shouldReturnInvoiceById() throws Exception {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-GET-001");

            // When/Then
            performGet("/invoices/" + invoice.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(invoice.getId().toString()))
                .andExpect(jsonPath("$.invoiceNumber").value("INV-GET-001"));
        }

        @Test
        @DisplayName("should return 404 when invoice not found")
        void shouldReturn404WhenInvoiceNotFound() throws Exception {
            // When/Then
            performGet("/invoices/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /invoices/contract/{contractId} - Get Invoices By Contract")
    @WithMockUser
    class GetInvoicesByContractTests {

        @Test
        @DisplayName("should return invoices for specific contract")
        void shouldReturnInvoicesForSpecificContract() throws Exception {
            // Given
            createAndSaveInvoice("INV-C1-001");
            createAndSaveInvoice("INV-C1-002");

            // Create another contract with invoice
            Contract contract2 = ContractTestBuilder.anActiveContract()
                .withTenant(testTenant)
                .withContractNumber("CONTRACT-2")
                .build();
            contract2 = contractRepository.save(contract2);

            Invoice c2Invoice = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(contract2)
                .withInvoiceNumber("INV-C2-001")
                .build();
            invoiceRepository.save(c2Invoice);

            // When/Then
            performGet("/invoices/contract/" + testContract.getId() + "?page=0&size=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].contractId",
                    everyItem(is(testContract.getId().toString()))));
        }
    }

    @Nested
    @DisplayName("GET /invoices/overdue - Get Overdue Invoices")
    @WithMockUser
    class GetOverdueInvoicesTests {

        @Test
        @DisplayName("should return overdue invoices")
        void shouldReturnOverdueInvoices() throws Exception {
            // Given - Create overdue invoice
            Invoice overdueInvoice = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("INV-OVERDUE")
                .withStatus(InvoiceStatus.SUBMITTED)
                .withDueDate(LocalDate.now().minusDays(15))
                .build();
            invoiceRepository.save(overdueInvoice);

            // Create non-overdue invoice
            Invoice currentInvoice = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("INV-CURRENT")
                .withStatus(InvoiceStatus.SUBMITTED)
                .withDueDate(LocalDate.now().plusDays(15))
                .build();
            invoiceRepository.save(currentInvoice);

            // When/Then
            performGet("/invoices/overdue")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].invoiceNumber").value("INV-OVERDUE"));
        }
    }

    @Nested
    @DisplayName("POST /invoices/{id}/submit - Submit Invoice")
    @WithMockUser
    class SubmitInvoiceTests {

        @Test
        @DisplayName("should submit draft invoice")
        void shouldSubmitDraftInvoice() throws Exception {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-SUBMIT-001", InvoiceStatus.DRAFT);

            // When/Then
            performPost("/invoices/" + invoice.getId() + "/submit")
                .andExpect(status().isOk());

            // Verify status changed
            Invoice updated = invoiceRepository.findById(invoice.getId()).orElseThrow();
            org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.SUBMITTED);
        }
    }

    @Nested
    @DisplayName("POST /invoices/{id}/approve - Approve Invoice")
    @WithMockUser
    class ApproveInvoiceTests {

        @Test
        @DisplayName("should approve submitted invoice")
        void shouldApproveSubmittedInvoice() throws Exception {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-APPROVE-001", InvoiceStatus.SUBMITTED);

            // When/Then
            performPost("/invoices/" + invoice.getId() + "/approve")
                .andExpect(status().isOk());

            // Verify status changed
            Invoice updated = invoiceRepository.findById(invoice.getId()).orElseThrow();
            org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.APPROVED);
        }
    }

    @Nested
    @DisplayName("POST /invoices/{id}/pay - Mark Invoice Paid")
    @WithMockUser
    class MarkPaidTests {

        @Test
        @DisplayName("should mark approved invoice as paid")
        void shouldMarkApprovedInvoiceAsPaid() throws Exception {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-PAY-001", InvoiceStatus.APPROVED);
            LocalDate paidDate = LocalDate.now();
            BigDecimal paidAmount = new BigDecimal("10000.00");

            // When/Then
            mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                    .post("/invoices/" + invoice.getId() + "/pay")
                    .param("paidDate", paidDate.toString())
                    .param("paidAmount", paidAmount.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Verify status and payment details
            Invoice updated = invoiceRepository.findById(invoice.getId()).orElseThrow();
            org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.PAID);
            org.assertj.core.api.Assertions.assertThat(updated.getPaidDate()).isEqualTo(paidDate);
            org.assertj.core.api.Assertions.assertThat(updated.getAmountPaid()).isEqualByComparingTo(paidAmount);
        }
    }

    @Nested
    @DisplayName("POST /invoices/{id}/reject - Reject Invoice")
    @WithMockUser
    class RejectInvoiceTests {

        @Test
        @DisplayName("should reject invoice with reason")
        void shouldRejectInvoiceWithReason() throws Exception {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-REJECT-001", InvoiceStatus.SUBMITTED);
            String reason = "Missing documentation";

            // When/Then
            mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                    .post("/invoices/" + invoice.getId() + "/reject")
                    .param("reason", reason)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Verify status and rejection reason
            Invoice updated = invoiceRepository.findById(invoice.getId()).orElseThrow();
            org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.REJECTED);
            org.assertj.core.api.Assertions.assertThat(updated.getRejectionReason()).isEqualTo(reason);
        }
    }

    @Nested
    @DisplayName("DELETE /invoices/{id} - Delete Invoice")
    @WithMockUser
    class DeleteInvoiceTests {

        @Test
        @DisplayName("should delete draft invoice")
        void shouldDeleteDraftInvoice() throws Exception {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-DELETE-001", InvoiceStatus.DRAFT);
            UUID invoiceId = invoice.getId();

            // When/Then
            performDelete("/invoices/" + invoiceId)
                .andExpect(status().isOk());

            // Verify deleted
            org.assertj.core.api.Assertions.assertThat(invoiceRepository.findById(invoiceId)).isEmpty();
        }

        @Test
        @DisplayName("should return error when deleting non-draft invoice")
        void shouldReturnErrorWhenDeletingNonDraftInvoice() throws Exception {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-DELETE-002", InvoiceStatus.SUBMITTED);

            // When/Then - API returns 409 Conflict for business rule violations
            performDelete("/invoices/" + invoice.getId())
                .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("GET /invoices/summary - Get Invoice Summary")
    @WithMockUser
    class GetInvoiceSummaryTests {

        @Test
        @DisplayName("should return invoice summary with totals")
        void shouldReturnInvoiceSummaryWithTotals() throws Exception {
            // Given
            Invoice paid1 = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("INV-PAID-1")
                .withStatus(InvoiceStatus.PAID)
                .withTotalAmount(new BigDecimal("10000.00"))
                .withSubtotal(new BigDecimal("10000.00"))
                .withAmountPaid(new BigDecimal("10000.00"))
                .build();
            invoiceRepository.save(paid1);

            Invoice submitted = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("INV-SUBMITTED-1")
                .withStatus(InvoiceStatus.SUBMITTED)
                .withTotalAmount(new BigDecimal("15000.00"))
                .withSubtotal(new BigDecimal("15000.00"))
                .build();
            invoiceRepository.save(submitted);

            // When/Then
            performGet("/invoices/summary")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBilled").value(25000.00))
                .andExpect(jsonPath("$.totalPaid").value(10000.00))
                .andExpect(jsonPath("$.pendingCount").value(1));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation Tests")
    @WithMockUser
    class TenantIsolationTests {

        @Test
        @DisplayName("should not return invoices from other tenants in list")
        void shouldNotReturnInvoicesFromOtherTenantsInList() throws Exception {
            // Given - Create invoice for test tenant
            createAndSaveInvoice("INV-TENANT1-001");

            // Create second tenant with invoice
            Tenant tenant2 = Tenant.builder()
                .name("Tenant 2")
                .slug("tenant-2-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            Contract contract2 = ContractTestBuilder.anActiveContract()
                .withTenant(tenant2)
                .withContractNumber("T2-CONTRACT")
                .build();
            contract2 = contractRepository.save(contract2);

            Invoice tenant2Invoice = InvoiceTestBuilder.anInvoice()
                .withTenant(tenant2)
                .withContract(contract2)
                .withInvoiceNumber("INV-TENANT2-001")
                .build();
            invoiceRepository.save(tenant2Invoice);

            // When/Then - Should only see tenant 1's invoice
            performGet("/invoices?page=0&size=10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].invoiceNumber").value("INV-TENANT1-001"));
        }
    }

    @Nested
    @DisplayName("Financial Precision Tests")
    @WithMockUser
    class FinancialPrecisionTests {

        @Test
        @DisplayName("should preserve decimal precision in amounts")
        void shouldPreserveDecimalPrecisionInAmounts() throws Exception {
            // Given - Create invoice with precise decimal amounts
            List<LineItemRequest> lineItems = List.of(
                new LineItemRequest(
                    "Consulting - 37.5 hours @ $127.33",
                    null,
                    LineType.DIRECT_LABOR,
                    new BigDecimal("37.50"),
                    "Hour",
                    new BigDecimal("127.33"),
                    new BigDecimal("4774.88")
                )
            );

            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-PRECISION",
                InvoiceType.PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                null,
                null,
                lineItems,
                "Precision test"
            );

            // When/Then
            performPost("/invoices", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(4774.88))
                .andExpect(jsonPath("$.lineItems[0].amount").value(4774.88))
                .andExpect(jsonPath("$.lineItems[0].quantity").value(37.50))
                .andExpect(jsonPath("$.lineItems[0].unitPrice").value(127.33));
        }
    }

    // Helper methods

    private Invoice createAndSaveInvoice(String invoiceNumber) {
        return createAndSaveInvoice(invoiceNumber, InvoiceStatus.DRAFT);
    }

    private Invoice createAndSaveInvoice(String invoiceNumber, InvoiceStatus status) {
        Invoice invoice = InvoiceTestBuilder.anInvoice()
            .withTenant(testTenant)
            .withContract(testContract)
            .withInvoiceNumber(invoiceNumber)
            .withStatus(status)
            .build();
        return invoiceRepository.save(invoice);
    }

}
