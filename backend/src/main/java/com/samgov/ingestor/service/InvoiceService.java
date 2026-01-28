package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.Invoice.InvoiceType;
import com.samgov.ingestor.model.InvoiceLineItem.LineType;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository lineItemRepository;
    private final ContractRepository contractRepository;
    private final ContractClinRepository clinRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public InvoiceService(InvoiceRepository invoiceRepository, InvoiceLineItemRepository lineItemRepository,
                          ContractRepository contractRepository, ContractClinRepository clinRepository,
                          TenantRepository tenantRepository, AuditService auditService) {
        this.invoiceRepository = invoiceRepository;
        this.lineItemRepository = lineItemRepository;
        this.contractRepository = contractRepository;
        this.clinRepository = clinRepository;
        this.tenantRepository = tenantRepository;
        this.auditService = auditService;
    }

    public record CreateInvoiceRequest(UUID contractId, String invoiceNumber, InvoiceType invoiceType,
                                        LocalDate invoiceDate, LocalDate dueDate, LocalDate periodStart,
                                        LocalDate periodEnd, List<LineItemRequest> lineItems, String notes) {}

    public record LineItemRequest(String description, UUID clinId, LineType lineType, BigDecimal quantity,
                                   String unitOfMeasure, BigDecimal unitPrice, BigDecimal amount) {}

    public record InvoiceResponse(UUID id, UUID contractId, String contractNumber, String invoiceNumber,
                                   InvoiceType invoiceType, LocalDate invoiceDate, LocalDate dueDate,
                                   LocalDate periodStart, LocalDate periodEnd, BigDecimal subtotal,
                                   BigDecimal totalAmount, InvoiceStatus status, List<LineItemResponse> lineItems,
                                   String notes, Instant createdAt) {}

    public record LineItemResponse(UUID id, String description, UUID clinId, String clinNumber,
                                    LineType lineType, BigDecimal quantity, String unitOfMeasure,
                                    BigDecimal unitPrice, BigDecimal amount) {}

    public InvoiceResponse createInvoice(UUID tenantId, UUID userId, CreateInvoiceRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));

        Invoice invoice = new Invoice();
        invoice.setTenant(tenant);
        invoice.setContract(contract);
        invoice.setInvoiceNumber(request.invoiceNumber());
        invoice.setInvoiceType(request.invoiceType() != null ? request.invoiceType() : InvoiceType.PROGRESS);
        invoice.setInvoiceDate(request.invoiceDate());
        invoice.setDueDate(request.dueDate());
        invoice.setPeriodStart(request.periodStart());
        invoice.setPeriodEnd(request.periodEnd());
        invoice.setNotes(request.notes());
        invoice.setStatus(InvoiceStatus.DRAFT);

        invoice = invoiceRepository.save(invoice);

        BigDecimal total = BigDecimal.ZERO;
        if (request.lineItems() != null) {
            for (LineItemRequest itemReq : request.lineItems()) {
                InvoiceLineItem item = new InvoiceLineItem();
                item.setDescription(itemReq.description());
                item.setLineType(itemReq.lineType() != null ? itemReq.lineType() : LineType.OTHER);

                if (itemReq.clinId() != null) {
                    ContractClin clin = clinRepository.findById(itemReq.clinId())
                            .orElseThrow(() -> new IllegalArgumentException("CLIN not found"));
                    item.setClin(clin);
                }

                item.setQuantity(itemReq.quantity());
                item.setUnitOfMeasure(itemReq.unitOfMeasure());
                item.setUnitPrice(itemReq.unitPrice());
                item.setAmount(itemReq.amount());
                // Add to invoice's collection (which sets the invoice reference via addLineItem)
                invoice.addLineItem(item);
                total = total.add(itemReq.amount());
            }
        }

        invoice.setSubtotal(total);
        invoice.setTotalAmount(total);
        invoice = invoiceRepository.save(invoice);

        auditService.logAction(AuditAction.INVOICE_CREATED, "Invoice", invoice.getId().toString(),
                "Created invoice: " + request.invoiceNumber());

        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoices(UUID tenantId, Pageable pageable) {
        return invoiceRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoicesByContract(UUID contractId, Pageable pageable) {
        return invoiceRepository.findByContractId(contractId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoicesByStatus(UUID tenantId, InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findByTenantIdAndStatus(tenantId, status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<InvoiceResponse> getInvoice(UUID invoiceId) {
        return invoiceRepository.findById(invoiceId).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getOverdueInvoices(UUID tenantId) {
        return invoiceRepository.findByTenantIdAndStatusAndDueDateBefore(tenantId, InvoiceStatus.SUBMITTED, LocalDate.now())
                .stream().map(this::toResponse).toList();
    }

    public void submitInvoice(UUID tenantId, UUID invoiceId, UUID userId) {
        Invoice invoice = getInvoiceEntity(tenantId, invoiceId);
        invoice.setStatus(InvoiceStatus.SUBMITTED);
        invoice.setSubmittedDate(LocalDate.now());
        invoiceRepository.save(invoice);
        auditService.logAction(AuditAction.INVOICE_SUBMITTED, "Invoice", invoiceId.toString(), "Submitted invoice");
    }

    public void approveInvoice(UUID tenantId, UUID invoiceId, UUID userId) {
        Invoice invoice = getInvoiceEntity(tenantId, invoiceId);
        invoice.setStatus(InvoiceStatus.APPROVED);
        invoiceRepository.save(invoice);
        auditService.logAction(AuditAction.INVOICE_SUBMITTED, "Invoice", invoiceId.toString(), "Approved invoice");
    }

    public void markPaid(UUID tenantId, UUID invoiceId, UUID userId, LocalDate paidDate, BigDecimal paidAmount) {
        Invoice invoice = getInvoiceEntity(tenantId, invoiceId);
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidDate(paidDate);
        invoice.setAmountPaid(paidAmount);
        invoiceRepository.save(invoice);
        auditService.logAction(AuditAction.INVOICE_PAID, "Invoice", invoiceId.toString(),
                "Marked as paid: " + paidAmount);
    }

    public void rejectInvoice(UUID tenantId, UUID invoiceId, UUID userId, String reason) {
        Invoice invoice = getInvoiceEntity(tenantId, invoiceId);
        invoice.setStatus(InvoiceStatus.REJECTED);
        invoice.setRejectionReason(reason);
        invoiceRepository.save(invoice);
        auditService.logAction(AuditAction.INVOICE_SUBMITTED, "Invoice", invoiceId.toString(), "Rejected: " + reason);
    }

    public void deleteInvoice(UUID tenantId, UUID invoiceId, UUID userId) {
        Invoice invoice = getInvoiceEntity(tenantId, invoiceId);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Only draft invoices can be deleted");
        }
        invoiceRepository.delete(invoice);
        auditService.logAction(AuditAction.INVOICE_CREATED, "Invoice", invoiceId.toString(), "Deleted invoice");
    }

    @Transactional(readOnly = true)
    public InvoiceSummary getSummary(UUID tenantId) {
        BigDecimal totalBilled = invoiceRepository.sumTotalAmountByTenantId(tenantId);
        BigDecimal totalPaid = invoiceRepository.sumAmountPaidByTenantId(tenantId);
        long pendingCount = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.SUBMITTED);
        return new InvoiceSummary(totalBilled != null ? totalBilled : BigDecimal.ZERO,
                totalPaid != null ? totalPaid : BigDecimal.ZERO, pendingCount);
    }

    public record InvoiceSummary(BigDecimal totalBilled, BigDecimal totalPaid, long pendingCount) {}

    private Invoice getInvoiceEntity(UUID tenantId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        if (!invoice.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Invoice does not belong to tenant");
        }
        return invoice;
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        List<LineItemResponse> lineItems = invoice.getLineItems() != null ?
                invoice.getLineItems().stream().map(this::toLineItemResponse).toList() : Collections.emptyList();

        return new InvoiceResponse(invoice.getId(), invoice.getContract().getId(),
                invoice.getContract().getContractNumber(), invoice.getInvoiceNumber(),
                invoice.getInvoiceType(), invoice.getInvoiceDate(), invoice.getDueDate(),
                invoice.getPeriodStart(), invoice.getPeriodEnd(), invoice.getSubtotal(),
                invoice.getTotalAmount(), invoice.getStatus(), lineItems, invoice.getNotes(),
                invoice.getCreatedAt());
    }

    private LineItemResponse toLineItemResponse(InvoiceLineItem item) {
        UUID clinId = item.getClin() != null ? item.getClin().getId() : null;
        String clinNumber = item.getClin() != null ? item.getClin().getClinNumber() : null;

        return new LineItemResponse(item.getId(), item.getDescription(), clinId, clinNumber,
                item.getLineType(), item.getQuantity(), item.getUnitOfMeasure(),
                item.getUnitPrice(), item.getAmount());
    }
}
