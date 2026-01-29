package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.BudgetItem;
import com.samgov.ingestor.model.BudgetItem.BudgetCategory;
import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.InvoiceLineItem;
import com.samgov.ingestor.model.LaborRate;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.FinancialService;
import com.samgov.ingestor.service.FinancialService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portal/financial")
public class FinancialController {

    private final FinancialService financialService;

    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }

    // ==================== Invoice Endpoints ====================

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<InvoiceDto>> listInvoices(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.listInvoices(tenantId, pageable));
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Invoice> getInvoice(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return financialService.getInvoice(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Invoice> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Invoice invoice = financialService.createInvoice(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
    }

    @PutMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Invoice> updateInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInvoiceRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return financialService.updateInvoice(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = financialService.deleteInvoice(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/invoices/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Invoice> submitInvoice(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return financialService.submitInvoice(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/invoices/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Invoice> updateInvoiceStatus(
            @PathVariable UUID id,
            @RequestParam InvoiceStatus status,
            @RequestParam(required = false) String notes) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return financialService.updateInvoiceStatus(tenantId, id, status, notes)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/invoices/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Invoice> recordPayment(
            @PathVariable UUID id,
            @RequestParam BigDecimal amount,
            @RequestParam LocalDate paymentDate,
            @RequestParam(required = false) String paymentReference) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return financialService.recordPayment(tenantId, id, amount, paymentDate, paymentReference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/invoices/contract/{contractId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<InvoiceDto>> getInvoicesByContract(
            @PathVariable UUID contractId,
            Pageable pageable) {
        return ResponseEntity.ok(financialService.getInvoicesByContract(contractId, pageable));
    }

    @GetMapping("/invoices/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Page<InvoiceDto>> getInvoicesByStatus(
            @PathVariable InvoiceStatus status,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.getInvoicesByStatus(tenantId, status, pageable));
    }

    @GetMapping("/invoices/unpaid")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<List<InvoiceDto>> getUnpaidInvoices() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.getUnpaidInvoices(tenantId));
    }

    @GetMapping("/invoices/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<List<InvoiceDto>> getOverdueInvoices() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.getOverdueInvoices(tenantId));
    }

    @GetMapping("/invoices/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<InvoiceDto>> getInvoicesByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.getInvoicesByDateRange(tenantId, startDate, endDate));
    }

    // ==================== Invoice Line Item Endpoints ====================

    @GetMapping("/invoices/{invoiceId}/line-items")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<InvoiceLineItem>> getInvoiceLineItems(@PathVariable UUID invoiceId) {
        return ResponseEntity.ok(financialService.getInvoiceLineItems(invoiceId));
    }

    @PostMapping("/invoices/{invoiceId}/line-items")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<InvoiceLineItem> addLineItem(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody CreateLineItemRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return financialService.addLineItem(tenantId, invoiceId, request)
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/invoices/{invoiceId}/line-items/{lineItemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<InvoiceLineItem> updateLineItem(
            @PathVariable UUID invoiceId,
            @PathVariable UUID lineItemId,
            @Valid @RequestBody UpdateLineItemRequest request) {
        return financialService.updateLineItem(invoiceId, lineItemId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/invoices/{invoiceId}/line-items/{lineItemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Void> deleteLineItem(
            @PathVariable UUID invoiceId,
            @PathVariable UUID lineItemId) {
        boolean deleted = financialService.deleteLineItem(invoiceId, lineItemId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // ==================== Labor Rate Endpoints ====================

    @GetMapping("/labor-rates")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<LaborRate>> listLaborRates(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.listLaborRates(tenantId, pageable));
    }

    @GetMapping("/labor-rates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<LaborRate> getLaborRate(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return financialService.getLaborRate(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/labor-rates")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<LaborRate> createLaborRate(@Valid @RequestBody CreateLaborRateRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LaborRate rate = financialService.createLaborRate(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(rate);
    }

    @PutMapping("/labor-rates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<LaborRate> updateLaborRate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLaborRateRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return financialService.updateLaborRate(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/labor-rates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Void> deleteLaborRate(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = financialService.deleteLaborRate(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/labor-rates/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<LaborRateDto>> getActiveLaborRates() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.getActiveLaborRates(tenantId));
    }

    @GetMapping("/labor-rates/contract/{contractId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<LaborRateDto>> getContractLaborRates(@PathVariable UUID contractId) {
        return ResponseEntity.ok(financialService.getContractLaborRates(contractId));
    }

    @GetMapping("/labor-rates/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<String>> getLaborCategories() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.getLaborCategories(tenantId));
    }

    @GetMapping("/labor-rates/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<LaborRateDto>> searchLaborRates(@RequestParam String keyword) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.searchLaborRates(tenantId, keyword));
    }

    @GetMapping("/labor-rates/effective")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<LaborRate> getEffectiveRate(
            @RequestParam String category,
            @RequestParam(required = false) UUID contractId,
            @RequestParam(required = false) LocalDate asOfDate) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate effectiveDate = asOfDate != null ? asOfDate : LocalDate.now();
        return financialService.getEffectiveRate(tenantId, category, contractId, effectiveDate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== Budget Item Endpoints ====================

    @GetMapping("/contracts/{contractId}/budget")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<BudgetItem>> getContractBudget(@PathVariable UUID contractId) {
        return ResponseEntity.ok(financialService.getContractBudget(contractId));
    }

    @GetMapping("/contracts/{contractId}/budget/paged")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<BudgetItem>> getContractBudgetPaged(
            @PathVariable UUID contractId,
            Pageable pageable) {
        return ResponseEntity.ok(financialService.getContractBudget(contractId, pageable));
    }

    @GetMapping("/contracts/{contractId}/budget/{budgetItemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<BudgetItem> getBudgetItem(
            @PathVariable UUID contractId,
            @PathVariable UUID budgetItemId) {
        return financialService.getBudgetItem(contractId, budgetItemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/contracts/{contractId}/budget")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<BudgetItem> createBudgetItem(
            @PathVariable UUID contractId,
            @Valid @RequestBody CreateBudgetItemRequest request) {
        return financialService.createBudgetItem(contractId, request)
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/contracts/{contractId}/budget/{budgetItemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<BudgetItem> updateBudgetItem(
            @PathVariable UUID contractId,
            @PathVariable UUID budgetItemId,
            @Valid @RequestBody UpdateBudgetItemRequest request) {
        return financialService.updateBudgetItem(contractId, budgetItemId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/contracts/{contractId}/budget/{budgetItemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<Void> deleteBudgetItem(
            @PathVariable UUID contractId,
            @PathVariable UUID budgetItemId) {
        boolean deleted = financialService.deleteBudgetItem(contractId, budgetItemId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/contracts/{contractId}/budget/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<BudgetItem>> getBudgetByCategory(
            @PathVariable UUID contractId,
            @PathVariable BudgetCategory category) {
        return ResponseEntity.ok(financialService.getBudgetByCategory(contractId, category));
    }

    @GetMapping("/contracts/{contractId}/budget/fiscal-year/{fiscalYear}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<BudgetItem>> getBudgetByFiscalYear(
            @PathVariable UUID contractId,
            @PathVariable Integer fiscalYear) {
        return ResponseEntity.ok(financialService.getBudgetByFiscalYear(contractId, fiscalYear));
    }

    @GetMapping("/contracts/{contractId}/budget/over-budget")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<BudgetItemDto>> getOverBudgetItems(@PathVariable UUID contractId) {
        return ResponseEntity.ok(financialService.getOverBudgetItems(contractId));
    }

    // ==================== Financial Summary Endpoints ====================

    @GetMapping("/contracts/{contractId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<ContractFinancialSummaryDto> getContractFinancialSummary(
            @PathVariable UUID contractId) {
        return ResponseEntity.ok(financialService.getContractFinancialSummary(contractId));
    }

    @GetMapping("/tenant/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<TenantFinancialSummaryDto> getTenantFinancialSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(financialService.getTenantFinancialSummary(tenantId));
    }

    @GetMapping("/contracts/{contractId}/budget/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<BudgetSummaryDto> getBudgetSummary(@PathVariable UUID contractId) {
        return ResponseEntity.ok(financialService.getBudgetSummary(contractId));
    }

    @GetMapping("/contracts/{contractId}/budget/summary/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<BudgetSummaryDto> getBudgetSummaryByCategory(
            @PathVariable UUID contractId,
            @PathVariable BudgetCategory category) {
        return ResponseEntity.ok(financialService.getBudgetSummaryByCategory(contractId, category));
    }
}
