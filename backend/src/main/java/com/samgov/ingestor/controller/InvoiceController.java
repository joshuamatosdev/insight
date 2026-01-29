package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.service.InvoiceService;
import com.samgov.ingestor.service.InvoiceService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portal/invoices")
@PreAuthorize("isAuthenticated()")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();
        return ResponseEntity.ok(invoiceService.createInvoice(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceResponse>> getInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (status != null) {
            return ResponseEntity.ok(invoiceService.getInvoicesByStatus(tenantId, status, pageable));
        }
        return ResponseEntity.ok(invoiceService.getInvoices(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable UUID id) {
        return invoiceService.getInvoice(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<Page<InvoiceResponse>> getInvoicesByContract(
            @PathVariable UUID contractId,
            Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getInvoicesByContract(contractId, pageable));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceResponse>> getOverdueInvoices() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(invoiceService.getOverdueInvoices(tenantId));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Void> submitInvoice(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();
        invoiceService.submitInvoice(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveInvoice(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();
        invoiceService.approveInvoice(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Void> markPaid(
            @PathVariable UUID id,
            @RequestParam LocalDate paidDate,
            @RequestParam BigDecimal paidAmount,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();
        invoiceService.markPaid(tenantId, id, userId, paidDate, paidAmount);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectInvoice(
            @PathVariable UUID id,
            @RequestParam String reason,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();
        invoiceService.rejectInvoice(tenantId, id, userId, reason);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();
        invoiceService.deleteInvoice(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<InvoiceSummary> getSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(invoiceService.getSummary(tenantId));
    }
}
