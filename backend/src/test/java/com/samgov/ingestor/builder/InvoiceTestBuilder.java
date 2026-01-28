package com.samgov.ingestor.builder;

import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.Invoice.InvoiceType;
import com.samgov.ingestor.model.InvoiceLineItem;
import com.samgov.ingestor.model.InvoiceLineItem.LineType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.service.InvoiceService.CreateInvoiceRequest;
import com.samgov.ingestor.service.InvoiceService.LineItemRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Test data builder for Invoice entities and DTOs.
 * Uses realistic government invoicing data for meaningful tests.
 */
public class InvoiceTestBuilder {

    private Tenant tenant;
    private Contract contract;
    private String invoiceNumber = "INV-" + System.currentTimeMillis();
    private InvoiceType invoiceType = InvoiceType.PROGRESS;
    private InvoiceStatus status = InvoiceStatus.DRAFT;
    private LocalDate invoiceDate = LocalDate.now();
    private LocalDate periodStart = LocalDate.now().minusMonths(1);
    private LocalDate periodEnd = LocalDate.now().minusDays(1);
    private LocalDate dueDate = LocalDate.now().plusDays(30);
    private LocalDate submittedDate = null;
    private LocalDate paidDate = null;
    private BigDecimal subtotal = new BigDecimal("10000.00");
    private BigDecimal adjustments = BigDecimal.ZERO;
    private BigDecimal totalAmount = new BigDecimal("10000.00");
    private BigDecimal amountPaid = BigDecimal.ZERO;
    private BigDecimal retainage = BigDecimal.ZERO;
    private String paymentMethod = null;
    private String paymentReference = null;
    private String voucherNumber = null;
    private String obligatingDocumentNumber = null;
    private String submittedBy = null;
    private String submittedToEmail = null;
    private String notes = "Monthly progress billing for IT services";
    private String rejectionReason = null;
    private List<InvoiceLineItem> lineItems = new ArrayList<>();

    public static InvoiceTestBuilder anInvoice() {
        return new InvoiceTestBuilder();
    }

    public static InvoiceTestBuilder aDraftInvoice() {
        return new InvoiceTestBuilder()
            .withStatus(InvoiceStatus.DRAFT)
            .withNotes("Draft invoice for review");
    }

    public static InvoiceTestBuilder aSubmittedInvoice() {
        return new InvoiceTestBuilder()
            .withStatus(InvoiceStatus.SUBMITTED)
            .withSubmittedDate(LocalDate.now())
            .withSubmittedBy("John Smith")
            .withSubmittedToEmail("accounts.payable@agency.gov");
    }

    public static InvoiceTestBuilder anApprovedInvoice() {
        return new InvoiceTestBuilder()
            .withStatus(InvoiceStatus.APPROVED)
            .withSubmittedDate(LocalDate.now().minusDays(5));
    }

    public static InvoiceTestBuilder aPaidInvoice() {
        return new InvoiceTestBuilder()
            .withStatus(InvoiceStatus.PAID)
            .withSubmittedDate(LocalDate.now().minusDays(30))
            .withPaidDate(LocalDate.now().minusDays(5))
            .withAmountPaid(new BigDecimal("10000.00"))
            .withPaymentMethod("ACH")
            .withPaymentReference("ACH-2024-001234");
    }

    public static InvoiceTestBuilder aRejectedInvoice() {
        return new InvoiceTestBuilder()
            .withStatus(InvoiceStatus.REJECTED)
            .withRejectionReason("Missing supporting documentation for travel expenses");
    }

    public static InvoiceTestBuilder anOverdueInvoice() {
        return new InvoiceTestBuilder()
            .withStatus(InvoiceStatus.SUBMITTED)
            .withInvoiceDate(LocalDate.now().minusDays(60))
            .withDueDate(LocalDate.now().minusDays(30))
            .withSubmittedDate(LocalDate.now().minusDays(60));
    }

    public static InvoiceTestBuilder aProgressInvoice() {
        return new InvoiceTestBuilder()
            .withInvoiceType(InvoiceType.PROGRESS)
            .withNotes("Monthly progress billing - T&M Contract");
    }

    public static InvoiceTestBuilder aMilestoneInvoice() {
        return new InvoiceTestBuilder()
            .withInvoiceType(InvoiceType.MILESTONE)
            .withNotes("Milestone 1 - System Design Complete");
    }

    public static InvoiceTestBuilder aFinalInvoice() {
        return new InvoiceTestBuilder()
            .withInvoiceType(InvoiceType.FINAL)
            .withNotes("Final invoice - Contract closeout");
    }

    public static InvoiceTestBuilder aReimbursementInvoice() {
        return new InvoiceTestBuilder()
            .withInvoiceType(InvoiceType.REIMBURSEMENT)
            .withNotes("Travel expense reimbursement - Site visit");
    }

    public static InvoiceTestBuilder aLargeInvoice() {
        return new InvoiceTestBuilder()
            .withSubtotal(new BigDecimal("150000.00"))
            .withTotalAmount(new BigDecimal("150000.00"))
            .withNotes("Quarterly billing - Large enterprise contract");
    }

    public static InvoiceTestBuilder anInvoiceWithRetainage() {
        BigDecimal subtotal = new BigDecimal("100000.00");
        BigDecimal retainage = new BigDecimal("10000.00"); // 10% retainage
        BigDecimal total = subtotal.subtract(retainage);

        return new InvoiceTestBuilder()
            .withSubtotal(subtotal)
            .withRetainage(retainage)
            .withTotalAmount(total)
            .withNotes("Progress billing with 10% retainage withheld");
    }

    public InvoiceTestBuilder withTenant(Tenant tenant) {
        this.tenant = tenant;
        return this;
    }

    public InvoiceTestBuilder withContract(Contract contract) {
        this.contract = contract;
        return this;
    }

    public InvoiceTestBuilder withInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
        return this;
    }

    public InvoiceTestBuilder withInvoiceType(InvoiceType invoiceType) {
        this.invoiceType = invoiceType;
        return this;
    }

    public InvoiceTestBuilder withStatus(InvoiceStatus status) {
        this.status = status;
        return this;
    }

    public InvoiceTestBuilder withInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
        return this;
    }

    public InvoiceTestBuilder withPeriodStart(LocalDate periodStart) {
        this.periodStart = periodStart;
        return this;
    }

    public InvoiceTestBuilder withPeriodEnd(LocalDate periodEnd) {
        this.periodEnd = periodEnd;
        return this;
    }

    public InvoiceTestBuilder withDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        return this;
    }

    public InvoiceTestBuilder withSubmittedDate(LocalDate submittedDate) {
        this.submittedDate = submittedDate;
        return this;
    }

    public InvoiceTestBuilder withPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
        return this;
    }

    public InvoiceTestBuilder withSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
        return this;
    }

    public InvoiceTestBuilder withAdjustments(BigDecimal adjustments) {
        this.adjustments = adjustments;
        return this;
    }

    public InvoiceTestBuilder withTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
        return this;
    }

    public InvoiceTestBuilder withAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
        return this;
    }

    public InvoiceTestBuilder withRetainage(BigDecimal retainage) {
        this.retainage = retainage;
        return this;
    }

    public InvoiceTestBuilder withPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
        return this;
    }

    public InvoiceTestBuilder withPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
        return this;
    }

    public InvoiceTestBuilder withVoucherNumber(String voucherNumber) {
        this.voucherNumber = voucherNumber;
        return this;
    }

    public InvoiceTestBuilder withObligatingDocumentNumber(String obligatingDocumentNumber) {
        this.obligatingDocumentNumber = obligatingDocumentNumber;
        return this;
    }

    public InvoiceTestBuilder withSubmittedBy(String submittedBy) {
        this.submittedBy = submittedBy;
        return this;
    }

    public InvoiceTestBuilder withSubmittedToEmail(String submittedToEmail) {
        this.submittedToEmail = submittedToEmail;
        return this;
    }

    public InvoiceTestBuilder withNotes(String notes) {
        this.notes = notes;
        return this;
    }

    public InvoiceTestBuilder withRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
        return this;
    }

    public InvoiceTestBuilder withLineItem(InvoiceLineItem lineItem) {
        this.lineItems.add(lineItem);
        return this;
    }

    public InvoiceTestBuilder withLineItems(List<InvoiceLineItem> lineItems) {
        this.lineItems = new ArrayList<>(lineItems);
        return this;
    }

    public Invoice build() {
        if (tenant == null) {
            throw new IllegalStateException("Tenant must be set before building Invoice");
        }
        if (contract == null) {
            throw new IllegalStateException("Contract must be set before building Invoice");
        }

        Invoice invoice = Invoice.builder()
            .tenant(tenant)
            .contract(contract)
            .invoiceNumber(invoiceNumber)
            .invoiceType(invoiceType)
            .status(status)
            .invoiceDate(invoiceDate)
            .periodStart(periodStart)
            .periodEnd(periodEnd)
            .dueDate(dueDate)
            .submittedDate(submittedDate)
            .paidDate(paidDate)
            .subtotal(subtotal)
            .adjustments(adjustments)
            .totalAmount(totalAmount)
            .amountPaid(amountPaid)
            .retainage(retainage)
            .paymentMethod(paymentMethod)
            .paymentReference(paymentReference)
            .voucherNumber(voucherNumber)
            .obligatingDocumentNumber(obligatingDocumentNumber)
            .submittedBy(submittedBy)
            .submittedToEmail(submittedToEmail)
            .notes(notes)
            .rejectionReason(rejectionReason)
            .build();

        // Add line items
        for (InvoiceLineItem item : lineItems) {
            invoice.addLineItem(item);
        }

        return invoice;
    }

    /**
     * Build a CreateInvoiceRequest DTO for API testing.
     */
    public CreateInvoiceRequest buildRequest() {
        if (contract == null) {
            throw new IllegalStateException("Contract must be set before building CreateInvoiceRequest");
        }

        List<LineItemRequest> lineItemRequests = new ArrayList<>();
        // Note: Line item requests would need to be added separately or from lineItems

        return new CreateInvoiceRequest(
            contract.getId(),
            invoiceNumber,
            invoiceType,
            invoiceDate,
            dueDate,
            periodStart,
            periodEnd,
            lineItemRequests,
            notes
        );
    }

    /**
     * Build a CreateInvoiceRequest DTO with line items.
     */
    public CreateInvoiceRequest buildRequestWithLineItems(List<LineItemRequest> lineItemRequests) {
        if (contract == null) {
            throw new IllegalStateException("Contract must be set before building CreateInvoiceRequest");
        }

        return new CreateInvoiceRequest(
            contract.getId(),
            invoiceNumber,
            invoiceType,
            invoiceDate,
            dueDate,
            periodStart,
            periodEnd,
            lineItemRequests,
            notes
        );
    }

    /**
     * Helper to create a LineItemRequest for testing.
     */
    public static LineItemRequest createLineItemRequest(
            String description,
            LineType lineType,
            BigDecimal quantity,
            String unitOfMeasure,
            BigDecimal unitPrice,
            BigDecimal amount) {
        return new LineItemRequest(description, null, lineType, quantity, unitOfMeasure, unitPrice, amount);
    }

    /**
     * Create a labor line item request.
     */
    public static LineItemRequest createLaborLineItem(
            String description,
            BigDecimal hours,
            BigDecimal hourlyRate) {
        BigDecimal amount = hours.multiply(hourlyRate);
        return new LineItemRequest(
            description, null, LineType.DIRECT_LABOR, hours, "Hour", hourlyRate, amount
        );
    }

    /**
     * Create a materials line item request.
     */
    public static LineItemRequest createMaterialsLineItem(
            String description,
            BigDecimal quantity,
            String unitOfMeasure,
            BigDecimal unitPrice) {
        BigDecimal amount = quantity.multiply(unitPrice);
        return new LineItemRequest(
            description, null, LineType.MATERIALS, quantity, unitOfMeasure, unitPrice, amount
        );
    }

    /**
     * Create a travel/ODC line item request.
     */
    public static LineItemRequest createTravelLineItem(String description, BigDecimal amount) {
        return new LineItemRequest(
            description, null, LineType.TRAVEL, BigDecimal.ONE, "Trip", amount, amount
        );
    }

    /**
     * Create a fixed price line item request.
     */
    public static LineItemRequest createFixedPriceLineItem(String description, BigDecimal amount) {
        return new LineItemRequest(
            description, null, LineType.FIXED_PRICE, BigDecimal.ONE, "EA", amount, amount
        );
    }

    /**
     * Create a typical T&M invoice with labor and ODC line items.
     */
    public static List<LineItemRequest> createTypicalTmLineItems() {
        List<LineItemRequest> items = new ArrayList<>();

        // Senior Software Engineer - 160 hours @ $150/hr
        items.add(createLaborLineItem(
            "Senior Software Engineer - Jane Smith",
            new BigDecimal("160.00"),
            new BigDecimal("150.00")
        ));

        // Junior Developer - 160 hours @ $85/hr
        items.add(createLaborLineItem(
            "Junior Developer - John Doe",
            new BigDecimal("160.00"),
            new BigDecimal("85.00")
        ));

        // Travel expense
        items.add(createTravelLineItem(
            "Site visit - Customer facility (airfare, hotel, per diem)",
            new BigDecimal("1250.00")
        ));

        return items;
    }

    /**
     * Create a fixed price milestone invoice.
     */
    public static List<LineItemRequest> createMilestoneLineItems() {
        List<LineItemRequest> items = new ArrayList<>();

        items.add(createFixedPriceLineItem(
            "Milestone 1 - Requirements Analysis Complete",
            new BigDecimal("25000.00")
        ));

        return items;
    }
}
