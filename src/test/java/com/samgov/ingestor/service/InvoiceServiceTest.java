package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.builder.ContractTestBuilder;
import com.samgov.ingestor.builder.InvoiceTestBuilder;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.Invoice.InvoiceType;
import com.samgov.ingestor.model.InvoiceLineItem.LineType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.InvoiceRepository;
import com.samgov.ingestor.service.InvoiceService.CreateInvoiceRequest;
import com.samgov.ingestor.service.InvoiceService.InvoiceResponse;
import com.samgov.ingestor.service.InvoiceService.InvoiceSummary;
import com.samgov.ingestor.service.InvoiceService.LineItemRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for InvoiceService.
 * Tests invoice lifecycle, calculations, and business rules using real PostgreSQL.
 */
@DisplayName("InvoiceService Integration Tests")
class InvoiceServiceTest extends BaseServiceTest {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ContractRepository contractRepository;

    private Contract testContract;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        // Create a test contract for invoice tests
        testContract = ContractTestBuilder.anActiveContract()
            .withTenant(testTenant)
            .withContractNumber("TEST-CONTRACT-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testContract = contractRepository.save(testContract);
    }

    @Nested
    @DisplayName("Invoice Creation")
    class InvoiceCreationTests {

        @Test
        @DisplayName("should create invoice with valid data")
        void shouldCreateInvoiceWithValidData() {
            // Given
            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-001",
                InvoiceType.PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                LocalDate.now().minusMonths(1),
                LocalDate.now().minusDays(1),
                List.of(),
                "Test invoice notes"
            );

            // When
            InvoiceResponse response = invoiceService.createInvoice(
                testTenant.getId(), testUser.getId(), request
            );

            // Then
            assertThat(response).isNotNull();
            assertThat(response.id()).isNotNull();
            assertThat(response.invoiceNumber()).isEqualTo("INV-001");
            assertThat(response.invoiceType()).isEqualTo(InvoiceType.PROGRESS);
            assertThat(response.status()).isEqualTo(InvoiceStatus.DRAFT);
            assertThat(response.contractId()).isEqualTo(testContract.getId());
            assertThat(response.contractNumber()).isEqualTo(testContract.getContractNumber());
        }

        @Test
        @DisplayName("should create invoice with line items")
        void shouldCreateInvoiceWithLineItems() {
            // Given - Typical T&M line items
            List<LineItemRequest> lineItems = List.of(
                InvoiceTestBuilder.createLaborLineItem(
                    "Senior Developer - 80 hours",
                    new BigDecimal("80.00"),
                    new BigDecimal("150.00")
                ),
                InvoiceTestBuilder.createLaborLineItem(
                    "Junior Developer - 120 hours",
                    new BigDecimal("120.00"),
                    new BigDecimal("85.00")
                ),
                InvoiceTestBuilder.createTravelLineItem(
                    "Customer site visit",
                    new BigDecimal("1500.00")
                )
            );

            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-002",
                InvoiceType.PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                LocalDate.now().minusMonths(1),
                LocalDate.now().minusDays(1),
                lineItems,
                "Monthly T&M billing"
            );

            // When
            InvoiceResponse response = invoiceService.createInvoice(
                testTenant.getId(), testUser.getId(), request
            );

            // Then
            assertThat(response.lineItems()).hasSize(3);

            // Verify total calculation: (80 * 150) + (120 * 85) + 1500 = 12000 + 10200 + 1500 = 23700
            BigDecimal expectedTotal = new BigDecimal("23700.00");
            assertThat(response.totalAmount()).isEqualByComparingTo(expectedTotal);
            assertThat(response.subtotal()).isEqualByComparingTo(expectedTotal);
        }

        @Test
        @DisplayName("should calculate line item amounts correctly with decimal precision")
        void shouldCalculateLineItemAmountsWithDecimalPrecision() {
            // Given - Test decimal precision: 37.5 hours @ $127.33/hr
            BigDecimal hours = new BigDecimal("37.50");
            BigDecimal rate = new BigDecimal("127.33");
            BigDecimal expectedAmount = new BigDecimal("4774.88"); // 37.5 * 127.33 = 4774.875 -> rounded

            List<LineItemRequest> lineItems = List.of(
                new LineItemRequest(
                    "Consultant - Fractional hours",
                    null,
                    LineType.DIRECT_LABOR,
                    hours,
                    "Hour",
                    rate,
                    expectedAmount
                )
            );

            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-DECIMAL",
                InvoiceType.PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                null,
                null,
                lineItems,
                null
            );

            // When
            InvoiceResponse response = invoiceService.createInvoice(
                testTenant.getId(), testUser.getId(), request
            );

            // Then
            assertThat(response.totalAmount()).isEqualByComparingTo(expectedAmount);
        }

        @Test
        @DisplayName("should throw exception when contract not found")
        void shouldThrowExceptionWhenContractNotFound() {
            // Given
            UUID nonExistentContractId = UUID.randomUUID();
            CreateInvoiceRequest request = new CreateInvoiceRequest(
                nonExistentContractId,
                "INV-INVALID",
                InvoiceType.PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                null,
                null,
                List.of(),
                null
            );

            // When/Then
            assertThatThrownBy(() ->
                invoiceService.createInvoice(testTenant.getId(), testUser.getId(), request)
            )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Contract not found");
        }

        @Test
        @DisplayName("should create different invoice types")
        void shouldCreateDifferentInvoiceTypes() {
            // Test each invoice type
            for (InvoiceType type : InvoiceType.values()) {
                CreateInvoiceRequest request = new CreateInvoiceRequest(
                    testContract.getId(),
                    "INV-TYPE-" + type.name(),
                    type,
                    LocalDate.now(),
                    LocalDate.now().plusDays(30),
                    null,
                    null,
                    List.of(),
                    "Testing " + type.name() + " invoice"
                );

                InvoiceResponse response = invoiceService.createInvoice(
                    testTenant.getId(), testUser.getId(), request
                );

                assertThat(response.invoiceType()).isEqualTo(type);
            }
        }
    }

    @Nested
    @DisplayName("Invoice Retrieval")
    class InvoiceRetrievalTests {

        @Test
        @DisplayName("should get invoice by ID")
        void shouldGetInvoiceById() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-GET-001");

            // When
            Optional<InvoiceResponse> response = invoiceService.getInvoice(invoice.getId());

            // Then
            assertThat(response).isPresent();
            assertThat(response.get().invoiceNumber()).isEqualTo("INV-GET-001");
        }

        @Test
        @DisplayName("should return empty when invoice not found")
        void shouldReturnEmptyWhenInvoiceNotFound() {
            // When
            Optional<InvoiceResponse> response = invoiceService.getInvoice(UUID.randomUUID());

            // Then
            assertThat(response).isEmpty();
        }

        @Test
        @DisplayName("should list invoices by tenant with pagination")
        void shouldListInvoicesByTenantWithPagination() {
            // Given - Create 15 invoices
            for (int i = 1; i <= 15; i++) {
                createAndSaveInvoice("INV-LIST-" + String.format("%03d", i));
            }

            // When - Get first page
            Page<InvoiceResponse> firstPage = invoiceService.getInvoices(
                testTenant.getId(), PageRequest.of(0, 10)
            );

            // Then
            assertThat(firstPage.getContent()).hasSize(10);
            assertThat(firstPage.getTotalElements()).isEqualTo(15);
            assertThat(firstPage.getTotalPages()).isEqualTo(2);

            // When - Get second page
            Page<InvoiceResponse> secondPage = invoiceService.getInvoices(
                testTenant.getId(), PageRequest.of(1, 10)
            );

            // Then
            assertThat(secondPage.getContent()).hasSize(5);
        }

        @Test
        @DisplayName("should list invoices by contract")
        void shouldListInvoicesByContract() {
            // Given
            Contract contract2 = ContractTestBuilder.anActiveContract()
                .withTenant(testTenant)
                .withContractNumber("CONTRACT-2")
                .build();
            contract2 = contractRepository.save(contract2);

            // Create invoices for different contracts
            createAndSaveInvoice("INV-C1-001");
            createAndSaveInvoice("INV-C1-002");

            Invoice c2Invoice = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(contract2)
                .withInvoiceNumber("INV-C2-001")
                .build();
            invoiceRepository.save(c2Invoice);

            // When
            Page<InvoiceResponse> contract1Invoices = invoiceService.getInvoicesByContract(
                testContract.getId(), PageRequest.of(0, 10)
            );

            // Then
            assertThat(contract1Invoices.getContent()).hasSize(2);
            assertThat(contract1Invoices.getContent())
                .allMatch(inv -> inv.contractId().equals(testContract.getId()));
        }

        @Test
        @DisplayName("should list invoices by status")
        void shouldListInvoicesByStatus() {
            // Given
            createAndSaveInvoice("INV-DRAFT-1", InvoiceStatus.DRAFT);
            createAndSaveInvoice("INV-DRAFT-2", InvoiceStatus.DRAFT);
            createAndSaveInvoice("INV-SUBMITTED-1", InvoiceStatus.SUBMITTED);

            // When
            Page<InvoiceResponse> draftInvoices = invoiceService.getInvoicesByStatus(
                testTenant.getId(), InvoiceStatus.DRAFT, PageRequest.of(0, 10)
            );

            // Then
            assertThat(draftInvoices.getContent()).hasSize(2);
            assertThat(draftInvoices.getContent())
                .allMatch(inv -> inv.status() == InvoiceStatus.DRAFT);
        }
    }

    @Nested
    @DisplayName("Invoice Status Transitions")
    class InvoiceStatusTransitionTests {

        @Test
        @DisplayName("should submit draft invoice")
        void shouldSubmitDraftInvoice() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-SUBMIT-001", InvoiceStatus.DRAFT);

            // When
            invoiceService.submitInvoice(testTenant.getId(), invoice.getId(), testUser.getId());

            // Then
            Invoice updated = invoiceRepository.findById(invoice.getId()).orElseThrow();
            assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.SUBMITTED);
            assertThat(updated.getSubmittedDate()).isEqualTo(LocalDate.now());
        }

        @Test
        @DisplayName("should approve submitted invoice")
        void shouldApproveSubmittedInvoice() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-APPROVE-001", InvoiceStatus.SUBMITTED);

            // When
            invoiceService.approveInvoice(testTenant.getId(), invoice.getId(), testUser.getId());

            // Then
            Invoice updated = invoiceRepository.findById(invoice.getId()).orElseThrow();
            assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.APPROVED);
        }

        @Test
        @DisplayName("should mark invoice as paid with payment details")
        void shouldMarkInvoiceAsPaidWithPaymentDetails() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-PAY-001", InvoiceStatus.APPROVED);
            LocalDate paidDate = LocalDate.now();
            BigDecimal paidAmount = new BigDecimal("10000.00");

            // When
            invoiceService.markPaid(
                testTenant.getId(), invoice.getId(), testUser.getId(), paidDate, paidAmount
            );

            // Then
            Invoice updated = invoiceRepository.findById(invoice.getId()).orElseThrow();
            assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.PAID);
            assertThat(updated.getPaidDate()).isEqualTo(paidDate);
            assertThat(updated.getAmountPaid()).isEqualByComparingTo(paidAmount);
        }

        @Test
        @DisplayName("should reject invoice with reason")
        void shouldRejectInvoiceWithReason() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-REJECT-001", InvoiceStatus.SUBMITTED);
            String reason = "Missing supporting documentation for travel expenses";

            // When
            invoiceService.rejectInvoice(
                testTenant.getId(), invoice.getId(), testUser.getId(), reason
            );

            // Then
            Invoice updated = invoiceRepository.findById(invoice.getId()).orElseThrow();
            assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.REJECTED);
            assertThat(updated.getRejectionReason()).isEqualTo(reason);
        }

        @Test
        @DisplayName("should track full workflow: DRAFT -> SUBMITTED -> APPROVED -> PAID")
        void shouldTrackFullWorkflow() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-WORKFLOW-001", InvoiceStatus.DRAFT);

            // Step 1: Submit
            invoiceService.submitInvoice(testTenant.getId(), invoice.getId(), testUser.getId());
            Invoice afterSubmit = invoiceRepository.findById(invoice.getId()).orElseThrow();
            assertThat(afterSubmit.getStatus()).isEqualTo(InvoiceStatus.SUBMITTED);

            // Step 2: Approve
            invoiceService.approveInvoice(testTenant.getId(), invoice.getId(), testUser.getId());
            Invoice afterApprove = invoiceRepository.findById(invoice.getId()).orElseThrow();
            assertThat(afterApprove.getStatus()).isEqualTo(InvoiceStatus.APPROVED);

            // Step 3: Pay
            invoiceService.markPaid(
                testTenant.getId(), invoice.getId(), testUser.getId(),
                LocalDate.now(), new BigDecimal("10000.00")
            );
            Invoice afterPay = invoiceRepository.findById(invoice.getId()).orElseThrow();
            assertThat(afterPay.getStatus()).isEqualTo(InvoiceStatus.PAID);
        }
    }

    @Nested
    @DisplayName("Invoice Deletion")
    class InvoiceDeletionTests {

        @Test
        @DisplayName("should delete draft invoice")
        void shouldDeleteDraftInvoice() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-DELETE-001", InvoiceStatus.DRAFT);
            UUID invoiceId = invoice.getId();

            // When
            invoiceService.deleteInvoice(testTenant.getId(), invoiceId, testUser.getId());

            // Then
            assertThat(invoiceRepository.findById(invoiceId)).isEmpty();
        }

        @Test
        @DisplayName("should not delete non-draft invoice")
        void shouldNotDeleteNonDraftInvoice() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-DELETE-002", InvoiceStatus.SUBMITTED);

            // When/Then
            assertThatThrownBy(() ->
                invoiceService.deleteInvoice(testTenant.getId(), invoice.getId(), testUser.getId())
            )
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only draft invoices can be deleted");
        }

        @Test
        @DisplayName("should not delete paid invoice")
        void shouldNotDeletePaidInvoice() {
            // Given
            Invoice invoice = createAndSaveInvoice("INV-DELETE-003", InvoiceStatus.PAID);

            // When/Then
            assertThatThrownBy(() ->
                invoiceService.deleteInvoice(testTenant.getId(), invoice.getId(), testUser.getId())
            )
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only draft invoices can be deleted");
        }
    }

    @Nested
    @DisplayName("Overdue Invoices")
    class OverdueInvoicesTests {

        @Test
        @DisplayName("should find overdue invoices")
        void shouldFindOverdueInvoices() {
            // Given - Create overdue invoice
            Invoice overdueInvoice = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("INV-OVERDUE-001")
                .withStatus(InvoiceStatus.SUBMITTED)
                .withDueDate(LocalDate.now().minusDays(15))
                .build();
            invoiceRepository.save(overdueInvoice);

            // Create non-overdue invoice
            Invoice currentInvoice = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("INV-CURRENT-001")
                .withStatus(InvoiceStatus.SUBMITTED)
                .withDueDate(LocalDate.now().plusDays(15))
                .build();
            invoiceRepository.save(currentInvoice);

            // When
            List<InvoiceResponse> overdueInvoices = invoiceService.getOverdueInvoices(testTenant.getId());

            // Then
            assertThat(overdueInvoices).hasSize(1);
            assertThat(overdueInvoices.get(0).invoiceNumber()).isEqualTo("INV-OVERDUE-001");
        }
    }

    @Nested
    @DisplayName("Invoice Summary")
    class InvoiceSummaryTests {

        @Test
        @DisplayName("should calculate invoice summary totals")
        void shouldCalculateInvoiceSummaryTotals() {
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

            Invoice paid2 = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("INV-PAID-2")
                .withStatus(InvoiceStatus.PAID)
                .withTotalAmount(new BigDecimal("15000.00"))
                .withSubtotal(new BigDecimal("15000.00"))
                .withAmountPaid(new BigDecimal("15000.00"))
                .build();
            invoiceRepository.save(paid2);

            Invoice submitted = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("INV-SUBMITTED-1")
                .withStatus(InvoiceStatus.SUBMITTED)
                .withTotalAmount(new BigDecimal("20000.00"))
                .withSubtotal(new BigDecimal("20000.00"))
                .build();
            invoiceRepository.save(submitted);

            // When
            InvoiceSummary summary = invoiceService.getSummary(testTenant.getId());

            // Then
            assertThat(summary.totalBilled()).isEqualByComparingTo(new BigDecimal("45000.00"));
            assertThat(summary.totalPaid()).isEqualByComparingTo(new BigDecimal("25000.00"));
            assertThat(summary.pendingCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("should return zeros for tenant with no invoices")
        void shouldReturnZerosForTenantWithNoInvoices() {
            // Given - No invoices created

            // When
            InvoiceSummary summary = invoiceService.getSummary(testTenant.getId());

            // Then
            assertThat(summary.totalBilled()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(summary.totalPaid()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(summary.pendingCount()).isZero();
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    class TenantIsolationTests {

        @Test
        @DisplayName("should isolate invoices between tenants")
        void shouldIsolateInvoicesBetweenTenants() {
            // Given - Create second tenant with contract and invoice
            Tenant tenant2 = Tenant.builder()
                .name("Tenant 2")
                .slug("tenant-2-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            Contract contract2 = ContractTestBuilder.anActiveContract()
                .withTenant(tenant2)
                .withContractNumber("T2-CONTRACT-001")
                .build();
            contract2 = contractRepository.save(contract2);

            Invoice tenant1Invoice = InvoiceTestBuilder.anInvoice()
                .withTenant(testTenant)
                .withContract(testContract)
                .withInvoiceNumber("T1-INV-001")
                .build();
            invoiceRepository.save(tenant1Invoice);

            Invoice tenant2Invoice = InvoiceTestBuilder.anInvoice()
                .withTenant(tenant2)
                .withContract(contract2)
                .withInvoiceNumber("T2-INV-001")
                .build();
            invoiceRepository.save(tenant2Invoice);

            // When - Query tenant 1's invoices
            Page<InvoiceResponse> tenant1Invoices = invoiceService.getInvoices(
                testTenant.getId(), PageRequest.of(0, 10)
            );

            // Then - Should only see tenant 1's invoices
            assertThat(tenant1Invoices.getContent()).hasSize(1);
            assertThat(tenant1Invoices.getContent().get(0).invoiceNumber()).isEqualTo("T1-INV-001");

            // When - Query tenant 2's invoices
            Page<InvoiceResponse> tenant2Invoices = invoiceService.getInvoices(
                tenant2.getId(), PageRequest.of(0, 10)
            );

            // Then - Should only see tenant 2's invoices
            assertThat(tenant2Invoices.getContent()).hasSize(1);
            assertThat(tenant2Invoices.getContent().get(0).invoiceNumber()).isEqualTo("T2-INV-001");
        }

        @Test
        @DisplayName("should not allow operations on another tenant's invoice")
        void shouldNotAllowOperationsOnAnotherTenantsInvoice() {
            // Given
            Tenant tenant2 = Tenant.builder()
                .name("Tenant 2")
                .slug("tenant-2-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            Contract contract2 = ContractTestBuilder.anActiveContract()
                .withTenant(tenant2)
                .withContractNumber("T2-CONTRACT-002")
                .build();
            contract2 = contractRepository.save(contract2);

            Invoice tenant2Invoice = InvoiceTestBuilder.anInvoice()
                .withTenant(tenant2)
                .withContract(contract2)
                .withInvoiceNumber("T2-INV-002")
                .withStatus(InvoiceStatus.DRAFT)
                .build();
            tenant2Invoice = invoiceRepository.save(tenant2Invoice);

            UUID tenant2InvoiceId = tenant2Invoice.getId();

            // When/Then - Tenant 1 should not be able to delete tenant 2's invoice
            assertThatThrownBy(() ->
                invoiceService.deleteInvoice(testTenant.getId(), tenant2InvoiceId, testUser.getId())
            )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invoice does not belong to tenant");
        }
    }

    @Nested
    @DisplayName("Financial Calculations")
    class FinancialCalculationsTests {

        @Test
        @DisplayName("should handle large amounts correctly")
        void shouldHandleLargeAmountsCorrectly() {
            // Given - Large government invoice
            BigDecimal largeAmount = new BigDecimal("9999999999.99");

            List<LineItemRequest> lineItems = List.of(
                new LineItemRequest(
                    "Enterprise system implementation",
                    null,
                    LineType.FIXED_PRICE,
                    BigDecimal.ONE,
                    "EA",
                    largeAmount,
                    largeAmount
                )
            );

            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-LARGE",
                InvoiceType.FIXED_PRICE,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                null,
                null,
                lineItems,
                "Large enterprise contract billing"
            );

            // When
            InvoiceResponse response = invoiceService.createInvoice(
                testTenant.getId(), testUser.getId(), request
            );

            // Then
            assertThat(response.totalAmount()).isEqualByComparingTo(largeAmount);
        }

        @Test
        @DisplayName("should handle zero amount invoice")
        void shouldHandleZeroAmountInvoice() {
            // Given - Adjustment invoice with zero balance
            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-ZERO",
                InvoiceType.ADJUSTMENT,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                null,
                null,
                List.of(),
                "Zero balance adjustment"
            );

            // When
            InvoiceResponse response = invoiceService.createInvoice(
                testTenant.getId(), testUser.getId(), request
            );

            // Then
            assertThat(response.totalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("should sum multiple line items accurately")
        void shouldSumMultipleLineItemsAccurately() {
            // Given - Multiple line items with varying amounts
            List<LineItemRequest> lineItems = List.of(
                new LineItemRequest("Item 1", null, LineType.DIRECT_LABOR,
                    new BigDecimal("100"), "Hour", new BigDecimal("125.50"), new BigDecimal("12550.00")),
                new LineItemRequest("Item 2", null, LineType.DIRECT_LABOR,
                    new BigDecimal("50"), "Hour", new BigDecimal("95.75"), new BigDecimal("4787.50")),
                new LineItemRequest("Item 3", null, LineType.MATERIALS,
                    new BigDecimal("25"), "EA", new BigDecimal("150.00"), new BigDecimal("3750.00")),
                new LineItemRequest("Item 4", null, LineType.TRAVEL,
                    new BigDecimal("1"), "Trip", new BigDecimal("2500.00"), new BigDecimal("2500.00")),
                new LineItemRequest("Item 5", null, LineType.ODC,
                    new BigDecimal("1"), "LS", new BigDecimal("412.50"), new BigDecimal("412.50"))
            );

            // Expected total: 12550 + 4787.50 + 3750 + 2500 + 412.50 = 24000.00
            BigDecimal expectedTotal = new BigDecimal("24000.00");

            CreateInvoiceRequest request = new CreateInvoiceRequest(
                testContract.getId(),
                "INV-MULTILINE",
                InvoiceType.PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                LocalDate.now().minusMonths(1),
                LocalDate.now().minusDays(1),
                lineItems,
                "Multi-line item invoice"
            );

            // When
            InvoiceResponse response = invoiceService.createInvoice(
                testTenant.getId(), testUser.getId(), request
            );

            // Then
            assertThat(response.totalAmount()).isEqualByComparingTo(expectedTotal);
            assertThat(response.lineItems()).hasSize(5);
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
