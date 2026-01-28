package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.BudgetItem.BudgetCategory;
import com.samgov.ingestor.service.BudgetService;
import com.samgov.ingestor.service.BudgetService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/budgets")
@PreAuthorize("isAuthenticated()")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetItemResponse> createBudgetItem(
            @Valid @RequestBody CreateBudgetItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(budgetService.createBudgetItem(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<BudgetItemResponse>> getBudgetItems(
            @RequestParam(required = false) BudgetCategory category,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (category != null) {
            return ResponseEntity.ok(budgetService.getBudgetItemsByCategory(tenantId, category, pageable));
        }
        return ResponseEntity.ok(budgetService.getBudgetItems(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetItemResponse> getBudgetItem(@PathVariable UUID id) {
        return budgetService.getBudgetItem(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<Page<BudgetItemResponse>> getBudgetItemsByContract(
            @PathVariable UUID contractId,
            Pageable pageable) {
        return ResponseEntity.ok(budgetService.getBudgetItemsByContract(contractId, pageable));
    }

    @GetMapping("/contract/{contractId}/summary")
    public ResponseEntity<BudgetSummary> getContractBudgetSummary(@PathVariable UUID contractId) {
        return ResponseEntity.ok(budgetService.getContractBudgetSummary(contractId));
    }

    @GetMapping("/over-budget")
    public ResponseEntity<List<BudgetItemResponse>> getOverBudgetItems() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(budgetService.getOverBudgetItems(tenantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetItemResponse> updateBudgetItem(
            @PathVariable UUID id,
            @Valid @RequestBody CreateBudgetItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(budgetService.updateBudgetItem(tenantId, id, userId, request));
    }

    @PostMapping("/{id}/expense")
    public ResponseEntity<Void> recordExpense(
            @PathVariable UUID id,
            @RequestParam BigDecimal amount,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        budgetService.recordExpense(tenantId, id, userId, amount);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudgetItem(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        budgetService.deleteBudgetItem(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<BudgetCategory>> getBudgetCategories() {
        return ResponseEntity.ok(Arrays.asList(BudgetCategory.values()));
    }
}
