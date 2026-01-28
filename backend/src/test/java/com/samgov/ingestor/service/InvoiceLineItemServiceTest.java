package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.builder.ContractTestBuilder;
import com.samgov.ingestor.builder.InvoiceTestBuilder;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.InvoiceLineItem;
import com.samgov.ingestor.model.InvoiceLineItem.LineType;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.InvoiceLineItemRepository;
import com.samgov.ingestor.repository.InvoiceRepository;
import com.samgov.ingestor.service.FinancialService.CreateLineItemRequest;
import com.samgov.ingestor.service.FinancialService.UpdateLineItemRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for Invoice Line Item operations via FinancialService.
 * Tests line item CRUD, calculations, and business rules using real PostgreSQL.
 */
@DisplayName("Invoice Line Item Integration Tests")
class InvoiceLineItemServiceTest extends BaseServiceTest {

    @Autowired
    private FinancialService financialService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceLineItemRepository lineItemRepository;

    @Autowired
    private ContractRepository contractRepository;

    private Contract testContract;
    private Invoice testInvoice;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();

        // Create test contract
        testContract = ContractTestBuilder.anActiveContract()
            .withTenant(testTenant)
            .withContractNumber("TEST-CONTRACT-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testContract = contractRepository.save(testContract);

        // Create test invoice
        testInvoice = InvoiceTestBuilder.anInvoice()
            .withTenant(testTenant)
            .withContract(testContract)
            .withInvoiceNumber("TEST-INV-" + UUID.randomUUID().toString().substring(0, 8))
            .withStatus(InvoiceStatus.DRAFT)
            .withSubtotal(BigDecimal.ZERO)
            .withTotalAmount(BigDecimal.ZERO)
            .build();
        testInvoice = invoiceRepository.save(testInvoice);
    }

    @Nested
    @DisplayName("Add Line Item")
    class AddLineItemTests {

        @Test
        @DisplayName("should add labor line item to invoice")
        void shouldAddLaborLineItemToInvoice() {
            // Given
            CreateLineItemRequest request = new CreateLineItemRequest(
                null,                           // clinId
                1,                              // lineNumber
                "Senior Developer - Project Alpha",
                LineType.DIRECT_LABOR,
                "Senior Software Engineer",     // laborCategory
                "Jane Smith",                   // employeeName
                new BigDecimal("160.00"),       // hours
                new BigDecimal("150.00"),       // hourlyRate
                null,                           // quantity
                "Hour",                         // unitOfMeasure
                null,                           // unitPrice
                new BigDecimal("24000.00"),     // amount
                null,                           // directCost
                null,                           // indirectCost
                null,                           // fee
                "Regular hours for January"     // notes
            );

            // When
            Optional<InvoiceLineItem> result = financialService.addLineItem(
                testTenant.getId(), testInvoice.getId(), request
            );

            // Then
            assertThat(result).isPresent();
            InvoiceLineItem item = result.get();
            assertThat(item.getId()).isNotNull();
            assertThat(item.getDescription()).isEqualTo("Senior Developer - Project Alpha");
            assertThat(item.getLineType()).isEqualTo(LineType.DIRECT_LABOR);
            assertThat(item.getHours()).isEqualByComparingTo(new BigDecimal("160.00"));
            assertThat(item.getHourlyRate()).isEqualByComparingTo(new BigDecimal("150.00"));
            assertThat(item.getAmount()).isEqualByComparingTo(new BigDecimal("24000.00"));
            assertThat(item.getEmployeeName()).isEqualTo("Jane Smith");
            assertThat(item.getLaborCategory()).isEqualTo("Senior Software Engineer");
        }

        @Test
        @DisplayName("should add materials line item to invoice")
        void shouldAddMaterialsLineItemToInvoice() {
            // Given
            CreateLineItemRequest request = new CreateLineItemRequest(
                null,                           // clinId
                1,                              // lineNumber
                "Dell Laptops for Development Team",
                LineType.MATERIALS,
                null,                           // laborCategory
                null,                           // employeeName
                null,                           // hours
                null,                           // hourlyRate
                new BigDecimal("5.00"),         // quantity
                "EA",                           // unitOfMeasure
                new BigDecimal("1500.00"),      // unitPrice
                new BigDecimal("7500.00"),      // amount
                null,                           // directCost
                null,                           // indirectCost
                null,                           // fee
                "Government-approved hardware"  // notes
            );

            // When
            Optional<InvoiceLineItem> result = financialService.addLineItem(
                testTenant.getId(), testInvoice.getId(), request
            );

            // Then
            assertThat(result).isPresent();
            InvoiceLineItem item = result.get();
            assertThat(item.getLineType()).isEqualTo(LineType.MATERIALS);
            assertThat(item.getQuantity()).isEqualByComparingTo(new BigDecimal("5.00"));
            assertThat(item.getUnitOfMeasure()).isEqualTo("EA");
            assertThat(item.getUnitPrice()).isEqualByComparingTo(new BigDecimal("1500.00"));
            assertThat(item.getAmount()).isEqualByComparingTo(new BigDecimal("7500.00"));
        }

        @Test
        @DisplayName("should add travel line item to invoice")
        void shouldAddTravelLineItemToInvoice() {
            // Given
            CreateLineItemRequest request = new CreateLineItemRequest(
                null,                           // clinId
                1,                              // lineNumber
                "Site visit - Customer headquarters (airfare, hotel, per diem)",
                LineType.TRAVEL,
                null,                           // laborCategory
                null,                           // employeeName
                null,                           // hours
                null,                           // hourlyRate
                new BigDecimal("1"),            // quantity
                "Trip",                         // unitOfMeasure
                new BigDecimal("2500.00"),      // unitPrice
                new BigDecimal("2500.00"),      // amount
                null,                           // directCost
                null,                           // indirectCost
                null,                           // fee
                "Pre-approved travel per TO-12345"  // notes
            );

            // When
            Optional<InvoiceLineItem> result = financialService.addLineItem(
                testTenant.getId(), testInvoice.getId(), request
            );

            // Then
            assertThat(result).isPresent();
            InvoiceLineItem item = result.get();
            assertThat(item.getLineType()).isEqualTo(LineType.TRAVEL);
            assertThat(item.getAmount()).isEqualByComparingTo(new BigDecimal("2500.00"));
        }

        @Test
        @DisplayName("should add ODC line item to invoice")
        void shouldAddOdcLineItemToInvoice() {
            // Given
            CreateLineItemRequest request = new CreateLineItemRequest(
                null,                           // clinId
                1,                              // lineNumber
                "Cloud hosting services - AWS",
                LineType.ODC,
                null,                           // laborCategory
                null,                           // employeeName
                null,                           // hours
                null,                           // hourlyRate
                new BigDecimal("1"),            // quantity
                "Month",                        // unitOfMeasure
                new BigDecimal("5000.00"),      // unitPrice
                new BigDecimal("5000.00"),      // amount
                null,                           // directCost
                null,                           // indirectCost
                null,                           // fee
                "January cloud costs"           // notes
            );

            // When
            Optional<InvoiceLineItem> result = financialService.addLineItem(
                testTenant.getId(), testInvoice.getId(), request
            );

            // Then
            assertThat(result).isPresent();
            InvoiceLineItem item = result.get();
            assertThat(item.getLineType()).isEqualTo(LineType.ODC);
            assertThat(item.getDescription()).contains("AWS");
        }

        @Test
        @DisplayName("should add cost-plus line item with fee breakdown")
        void shouldAddCostPlusLineItemWithFeeBreakdown() {
            // Given - Cost-plus contract line item with detailed cost breakdown
            BigDecimal directCost = new BigDecimal("10000.00");
            BigDecimal indirectCost = new BigDecimal("2500.00");   // 25% overhead
            BigDecimal fee = new BigDecimal("875.00");             // 7% fixed fee
            BigDecimal totalAmount = directCost.add(indirectCost).add(fee);

            CreateLineItemRequest request = new CreateLineItemRequest(
                null,                           // clinId
                1,                              // lineNumber
                "Research and Development Services",
                LineType.OTHER,
                null,                           // laborCategory
                null,                           // employeeName
                null,                           // hours
                null,                           // hourlyRate
                new BigDecimal("1"),            // quantity
                "LS",                           // unitOfMeasure
                totalAmount,                    // unitPrice
                totalAmount,                    // amount
                directCost,
                indirectCost,
                fee,
                "CPFF billing with approved rates"
            );

            // When
            Optional<InvoiceLineItem> result = financialService.addLineItem(
                testTenant.getId(), testInvoice.getId(), request
            );

            // Then
            assertThat(result).isPresent();
            InvoiceLineItem item = result.get();
            assertThat(item.getDirectCost()).isEqualByComparingTo(directCost);
            assertThat(item.getIndirectCost()).isEqualByComparingTo(indirectCost);
            assertThat(item.getFee()).isEqualByComparingTo(fee);
            assertThat(item.getAmount()).isEqualByComparingTo(new BigDecimal("13375.00"));
        }

        @Test
        @DisplayName("should return empty when invoice not found")
        void shouldReturnEmptyWhenInvoiceNotFound() {
            // Given
            UUID nonExistentInvoiceId = UUID.randomUUID();
            CreateLineItemRequest request = new CreateLineItemRequest(
                null, 1, "Test", LineType.OTHER, null, null, null, null,
                BigDecimal.ONE, "EA", new BigDecimal("100"), new BigDecimal("100"),
                null, null, null, null
            );

            // When
            Optional<InvoiceLineItem> result = financialService.addLineItem(
                testTenant.getId(), nonExistentInvoiceId, request
            );

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should recalculate invoice totals after adding line item")
        void shouldRecalculateInvoiceTotalsAfterAddingLineItem() {
            // Given
            CreateLineItemRequest request1 = new CreateLineItemRequest(
                null, 1, "Labor", LineType.DIRECT_LABOR, null, null,
                new BigDecimal("80"), new BigDecimal("100"), null, "Hour", null,
                new BigDecimal("8000.00"), null, null, null, null
            );

            CreateLineItemRequest request2 = new CreateLineItemRequest(
                null, 2, "Travel", LineType.TRAVEL, null, null,
                null, null, BigDecimal.ONE, "Trip", new BigDecimal("1500"),
                new BigDecimal("1500.00"), null, null, null, null
            );

            // When
            financialService.addLineItem(testTenant.getId(), testInvoice.getId(), request1);
            financialService.addLineItem(testTenant.getId(), testInvoice.getId(), request2);

            // Then - Verify totals recalculated
            Invoice updatedInvoice = invoiceRepository.findById(testInvoice.getId()).orElseThrow();
            assertThat(updatedInvoice.getSubtotal()).isEqualByComparingTo(new BigDecimal("9500.00"));
            assertThat(updatedInvoice.getTotalAmount()).isEqualByComparingTo(new BigDecimal("9500.00"));
        }
    }

    @Nested
    @DisplayName("Update Line Item")
    class UpdateLineItemTests {

        private InvoiceLineItem existingLineItem;

        @BeforeEach
        void setUpLineItem() {
            // Add a line item to update
            CreateLineItemRequest request = new CreateLineItemRequest(
                null, 1, "Original Description", LineType.DIRECT_LABOR, null, null,
                new BigDecimal("80"), new BigDecimal("100"), null, "Hour", null,
                new BigDecimal("8000.00"), null, null, null, "Original notes"
            );

            existingLineItem = financialService.addLineItem(
                testTenant.getId(), testInvoice.getId(), request
            ).orElseThrow();
        }

        @Test
        @DisplayName("should update line item description")
        void shouldUpdateLineItemDescription() {
            // Given
            UpdateLineItemRequest request = new UpdateLineItemRequest(
                "Updated Description",
                null, null, null, null, null, null
            );

            // When
            Optional<InvoiceLineItem> result = financialService.updateLineItem(
                testInvoice.getId(), existingLineItem.getId(), request
            );

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().getDescription()).isEqualTo("Updated Description");
        }

        @Test
        @DisplayName("should update line item hours and amount")
        void shouldUpdateLineItemHoursAndAmount() {
            // Given
            UpdateLineItemRequest request = new UpdateLineItemRequest(
                null,
                new BigDecimal("120"),           // updated hours
                new BigDecimal("125"),           // updated rate
                null, null,
                new BigDecimal("15000.00"),      // updated amount
                "Updated notes"
            );

            // When
            Optional<InvoiceLineItem> result = financialService.updateLineItem(
                testInvoice.getId(), existingLineItem.getId(), request
            );

            // Then
            assertThat(result).isPresent();
            InvoiceLineItem item = result.get();
            assertThat(item.getHours()).isEqualByComparingTo(new BigDecimal("120"));
            assertThat(item.getHourlyRate()).isEqualByComparingTo(new BigDecimal("125"));
            assertThat(item.getAmount()).isEqualByComparingTo(new BigDecimal("15000.00"));
            assertThat(item.getNotes()).isEqualTo("Updated notes");
        }

        @Test
        @DisplayName("should update quantity and unit price")
        void shouldUpdateQuantityAndUnitPrice() {
            // Given
            UpdateLineItemRequest request = new UpdateLineItemRequest(
                null, null, null,
                new BigDecimal("10"),            // quantity
                new BigDecimal("250.00"),        // unitPrice
                new BigDecimal("2500.00"),       // amount
                null
            );

            // When
            Optional<InvoiceLineItem> result = financialService.updateLineItem(
                testInvoice.getId(), existingLineItem.getId(), request
            );

            // Then
            assertThat(result).isPresent();
            InvoiceLineItem item = result.get();
            assertThat(item.getQuantity()).isEqualByComparingTo(new BigDecimal("10"));
            assertThat(item.getUnitPrice()).isEqualByComparingTo(new BigDecimal("250.00"));
            assertThat(item.getAmount()).isEqualByComparingTo(new BigDecimal("2500.00"));
        }

        @Test
        @DisplayName("should return empty when line item not found")
        void shouldReturnEmptyWhenLineItemNotFound() {
            // Given
            UUID nonExistentLineItemId = UUID.randomUUID();
            UpdateLineItemRequest request = new UpdateLineItemRequest(
                "Updated", null, null, null, null, null, null
            );

            // When
            Optional<InvoiceLineItem> result = financialService.updateLineItem(
                testInvoice.getId(), nonExistentLineItemId, request
            );

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Delete Line Item")
    class DeleteLineItemTests {

        @Test
        @DisplayName("should delete line item")
        void shouldDeleteLineItem() {
            // Given
            CreateLineItemRequest request = new CreateLineItemRequest(
                null, 1, "To be deleted", LineType.OTHER, null, null,
                null, null, BigDecimal.ONE, "EA", new BigDecimal("100"),
                new BigDecimal("100"), null, null, null, null
            );

            InvoiceLineItem lineItem = financialService.addLineItem(
                testTenant.getId(), testInvoice.getId(), request
            ).orElseThrow();

            // When
            boolean deleted = financialService.deleteLineItem(testInvoice.getId(), lineItem.getId());

            // Then
            assertThat(deleted).isTrue();
            assertThat(lineItemRepository.findById(lineItem.getId())).isEmpty();
        }

        @Test
        @DisplayName("should return false when line item not found")
        void shouldReturnFalseWhenLineItemNotFound() {
            // When
            boolean deleted = financialService.deleteLineItem(
                testInvoice.getId(), UUID.randomUUID()
            );

            // Then
            assertThat(deleted).isFalse();
        }
    }

    @Nested
    @DisplayName("Get Line Items")
    class GetLineItemsTests {

        @Test
        @DisplayName("should get line items for invoice")
        void shouldGetLineItemsForInvoice() {
            // Given - Add multiple line items
            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 1, "Item 1", LineType.DIRECT_LABOR,
                    null, null, new BigDecimal("40"), new BigDecimal("100"), null, "Hour",
                    null, new BigDecimal("4000"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 2, "Item 2", LineType.TRAVEL,
                    null, null, null, null, BigDecimal.ONE, "Trip",
                    new BigDecimal("1000"), new BigDecimal("1000"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 3, "Item 3", LineType.ODC,
                    null, null, null, null, BigDecimal.ONE, "Month",
                    new BigDecimal("500"), new BigDecimal("500"), null, null, null, null));

            // When
            List<InvoiceLineItem> lineItems = financialService.getInvoiceLineItems(testInvoice.getId());

            // Then
            assertThat(lineItems).hasSize(3);
        }

        @Test
        @DisplayName("should return empty list when no line items")
        void shouldReturnEmptyListWhenNoLineItems() {
            // When
            List<InvoiceLineItem> lineItems = financialService.getInvoiceLineItems(testInvoice.getId());

            // Then
            assertThat(lineItems).isEmpty();
        }

        @Test
        @DisplayName("should return line items ordered by line number")
        void shouldReturnLineItemsOrderedByLineNumber() {
            // Given - Add line items out of order
            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 3, "Third", LineType.OTHER,
                    null, null, null, null, BigDecimal.ONE, "EA",
                    new BigDecimal("100"), new BigDecimal("100"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 1, "First", LineType.OTHER,
                    null, null, null, null, BigDecimal.ONE, "EA",
                    new BigDecimal("100"), new BigDecimal("100"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 2, "Second", LineType.OTHER,
                    null, null, null, null, BigDecimal.ONE, "EA",
                    new BigDecimal("100"), new BigDecimal("100"), null, null, null, null));

            // When
            List<InvoiceLineItem> lineItems = financialService.getInvoiceLineItems(testInvoice.getId());

            // Then
            assertThat(lineItems).hasSize(3);
            assertThat(lineItems.get(0).getLineNumber()).isEqualTo(1);
            assertThat(lineItems.get(0).getDescription()).isEqualTo("First");
            assertThat(lineItems.get(1).getLineNumber()).isEqualTo(2);
            assertThat(lineItems.get(2).getLineNumber()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Financial Calculations")
    class FinancialCalculationsTests {

        @Test
        @DisplayName("should calculate total correctly with mixed line types")
        void shouldCalculateTotalCorrectlyWithMixedLineTypes() {
            // Given - T&M invoice with labor, travel, and ODC
            // Labor: 160 hours @ $125/hr = $20,000
            // Travel: $2,500
            // ODC: $3,000
            // Total: $25,500

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 1, "Labor", LineType.DIRECT_LABOR,
                    "Developer", "John Doe", new BigDecimal("160"), new BigDecimal("125"),
                    null, "Hour", null, new BigDecimal("20000"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 2, "Travel", LineType.TRAVEL,
                    null, null, null, null, BigDecimal.ONE, "Trip",
                    new BigDecimal("2500"), new BigDecimal("2500"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 3, "ODC", LineType.ODC,
                    null, null, null, null, BigDecimal.ONE, "Month",
                    new BigDecimal("3000"), new BigDecimal("3000"), null, null, null, null));

            // When
            Invoice updatedInvoice = invoiceRepository.findById(testInvoice.getId()).orElseThrow();

            // Then
            assertThat(updatedInvoice.getSubtotal()).isEqualByComparingTo(new BigDecimal("25500.00"));
            assertThat(updatedInvoice.getTotalAmount()).isEqualByComparingTo(new BigDecimal("25500.00"));
        }

        @Test
        @DisplayName("should handle decimal precision correctly")
        void shouldHandleDecimalPrecisionCorrectly() {
            // Given - Fractional hours with precise rate
            BigDecimal hours = new BigDecimal("37.75");
            BigDecimal rate = new BigDecimal("142.67");
            BigDecimal amount = new BigDecimal("5385.79"); // 37.75 * 142.67 = 5385.7825, rounded

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 1, "Fractional hours", LineType.DIRECT_LABOR,
                    null, null, hours, rate, null, "Hour", null, amount,
                    null, null, null, null));

            // When
            Invoice updatedInvoice = invoiceRepository.findById(testInvoice.getId()).orElseThrow();

            // Then
            assertThat(updatedInvoice.getTotalAmount()).isEqualByComparingTo(amount);
        }

        @Test
        @DisplayName("should sum labor hours by line type")
        void shouldSumLaborHoursByLineType() {
            // Given
            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 1, "Senior Dev", LineType.DIRECT_LABOR,
                    null, null, new BigDecimal("80"), new BigDecimal("150"),
                    null, "Hour", null, new BigDecimal("12000"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 2, "Junior Dev", LineType.DIRECT_LABOR,
                    null, null, new BigDecimal("120"), new BigDecimal("85"),
                    null, "Hour", null, new BigDecimal("10200"), null, null, null, null));

            // When
            Optional<BigDecimal> totalHours = lineItemRepository.sumLaborHoursByInvoiceId(
                testInvoice.getId(), LineType.DIRECT_LABOR
            );

            // Then
            assertThat(totalHours).isPresent();
            assertThat(totalHours.get()).isEqualByComparingTo(new BigDecimal("200"));
        }

        @Test
        @DisplayName("should sum amount by invoice")
        void shouldSumAmountByInvoice() {
            // Given
            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 1, "Item 1", LineType.OTHER,
                    null, null, null, null, BigDecimal.ONE, "EA",
                    new BigDecimal("1000"), new BigDecimal("1000"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 2, "Item 2", LineType.OTHER,
                    null, null, null, null, BigDecimal.ONE, "EA",
                    new BigDecimal("2500"), new BigDecimal("2500"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 3, "Item 3", LineType.OTHER,
                    null, null, null, null, BigDecimal.ONE, "EA",
                    new BigDecimal("500"), new BigDecimal("500"), null, null, null, null));

            // When
            Optional<BigDecimal> totalAmount = lineItemRepository.sumAmountByInvoiceId(testInvoice.getId());

            // Then
            assertThat(totalAmount).isPresent();
            assertThat(totalAmount.get()).isEqualByComparingTo(new BigDecimal("4000"));
        }
    }

    @Nested
    @DisplayName("Line Item Types")
    class LineItemTypesTests {

        @Test
        @DisplayName("should support all line item types")
        void shouldSupportAllLineItemTypes() {
            // Test each line type can be created
            int lineNumber = 0;
            for (LineType type : LineType.values()) {
                lineNumber++;
                CreateLineItemRequest request = new CreateLineItemRequest(
                    null, lineNumber, "Test " + type.name(), type,
                    null, null, null, null, BigDecimal.ONE, "EA",
                    new BigDecimal("100"), new BigDecimal("100"), null, null, null, null
                );

                Optional<InvoiceLineItem> result = financialService.addLineItem(
                    testTenant.getId(), testInvoice.getId(), request
                );

                assertThat(result).isPresent();
                assertThat(result.get().getLineType()).isEqualTo(type);
            }

            // Verify all line types were created
            List<InvoiceLineItem> allItems = financialService.getInvoiceLineItems(testInvoice.getId());
            assertThat(allItems).hasSize(LineType.values().length);
        }

        @Test
        @DisplayName("should filter line items by type")
        void shouldFilterLineItemsByType() {
            // Given - Add different types
            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 1, "Labor 1", LineType.DIRECT_LABOR,
                    null, null, new BigDecimal("80"), new BigDecimal("100"),
                    null, "Hour", null, new BigDecimal("8000"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 2, "Labor 2", LineType.DIRECT_LABOR,
                    null, null, new BigDecimal("40"), new BigDecimal("100"),
                    null, "Hour", null, new BigDecimal("4000"), null, null, null, null));

            financialService.addLineItem(testTenant.getId(), testInvoice.getId(),
                new CreateLineItemRequest(null, 3, "Travel", LineType.TRAVEL,
                    null, null, null, null, BigDecimal.ONE, "Trip",
                    new BigDecimal("1000"), new BigDecimal("1000"), null, null, null, null));

            // When
            List<InvoiceLineItem> laborItems = lineItemRepository.findByInvoiceIdAndLineType(
                testInvoice.getId(), LineType.DIRECT_LABOR
            );

            List<InvoiceLineItem> travelItems = lineItemRepository.findByInvoiceIdAndLineType(
                testInvoice.getId(), LineType.TRAVEL
            );

            // Then
            assertThat(laborItems).hasSize(2);
            assertThat(travelItems).hasSize(1);
        }
    }
}
