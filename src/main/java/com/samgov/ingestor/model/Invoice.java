package com.samgov.ingestor.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "invoices", indexes = {
    @Index(name = "idx_invoice_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_invoice_contract_id", columnList = "contract_id"),
    @Index(name = "idx_invoice_number", columnList = "invoice_number"),
    @Index(name = "idx_invoice_status", columnList = "status"),
    @Index(name = "idx_invoice_date", columnList = "invoice_date")
})
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "invoice_number", nullable = false)
    private String invoiceNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_type", nullable = false)
    private InvoiceType invoiceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    // Dates
    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    // Amounts
    @Column(name = "subtotal", precision = 15, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "adjustments", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal adjustments = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "amount_paid", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "retainage", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal retainage = BigDecimal.ZERO;

    // Payment information
    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_reference")
    private String paymentReference;

    // Government specific
    @Column(name = "voucher_number")
    private String voucherNumber;

    @Column(name = "obligating_document_number")
    private String obligatingDocumentNumber;

    // Contact information
    @Column(name = "submitted_by")
    private String submittedBy;

    @Column(name = "submitted_to_email")
    private String submittedToEmail;

    // Line items
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InvoiceLineItem> lineItems = new ArrayList<>();

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void addLineItem(InvoiceLineItem item) {
        lineItems.add(item);
        item.setInvoice(this);
    }

    public BigDecimal getBalance() {
        return totalAmount.subtract(amountPaid != null ? amountPaid : BigDecimal.ZERO);
    }

    public boolean isOverdue() {
        return dueDate != null
            && status != InvoiceStatus.PAID
            && LocalDate.now().isAfter(dueDate);
    }

    public Long getDaysOutstanding() {
        if (invoiceDate == null) return null;
        LocalDate endDate = paidDate != null ? paidDate : LocalDate.now();
        return java.time.temporal.ChronoUnit.DAYS.between(invoiceDate, endDate);
    }

    public enum InvoiceType {
        PROGRESS,           // Progress payment (T&M, Cost-Plus)
        MILESTONE,          // Milestone-based payment
        FIXED_PRICE,        // Fixed price payment
        FINAL,              // Final invoice
        RETAINAGE_RELEASE,  // Retainage release
        ADJUSTMENT,         // Adjustment/credit
        REIMBURSEMENT       // ODC/Travel reimbursement
    }

    public enum InvoiceStatus {
        DRAFT,
        PENDING_APPROVAL,
        SUBMITTED,
        RECEIVED,
        UNDER_REVIEW,
        APPROVED,
        DISPUTED,
        REJECTED,
        PAID,
        PARTIALLY_PAID,
        CANCELLED
    }
}
