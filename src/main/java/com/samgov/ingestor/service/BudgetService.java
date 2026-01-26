package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.BudgetItem.BudgetCategory;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class BudgetService {

    private final BudgetItemRepository budgetRepository;
    private final ContractRepository contractRepository;
    private final ContractClinRepository clinRepository;
    private final AuditService auditService;

    public BudgetService(BudgetItemRepository budgetRepository, ContractRepository contractRepository,
                         ContractClinRepository clinRepository, AuditService auditService) {
        this.budgetRepository = budgetRepository;
        this.contractRepository = contractRepository;
        this.clinRepository = clinRepository;
        this.auditService = auditService;
    }

    public record CreateBudgetItemRequest(UUID contractId, UUID clinId, BudgetCategory category, String name,
                                           String description, BigDecimal budgetedAmount, BigDecimal actualAmount,
                                           LocalDate periodStart, LocalDate periodEnd, Integer fiscalYear,
                                           String notes) {}

    public record BudgetItemResponse(UUID id, UUID contractId, String contractNumber, UUID clinId, String clinNumber,
                                      BudgetCategory category, String name, String description, BigDecimal budgetedAmount,
                                      BigDecimal actualAmount, BigDecimal variance, BigDecimal variancePercent,
                                      LocalDate periodStart, LocalDate periodEnd, Integer fiscalYear,
                                      String notes, Instant createdAt) {}

    public record BudgetSummary(BigDecimal totalBudget, BigDecimal totalActual, BigDecimal totalVariance,
                                 BigDecimal percentUsed, Map<BudgetCategory, CategorySummary> byCategory) {}

    public record CategorySummary(BigDecimal budgeted, BigDecimal actual, BigDecimal variance) {}

    public BudgetItemResponse createBudgetItem(UUID tenantId, UUID userId, CreateBudgetItemRequest request) {
        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));

        if (!contract.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Contract does not belong to tenant");
        }

        BudgetItem item = new BudgetItem();
        item.setContract(contract);

        if (request.clinId() != null) {
            ContractClin clin = clinRepository.findById(request.clinId())
                    .orElseThrow(() -> new IllegalArgumentException("CLIN not found"));
            item.setClin(clin);
        }

        item.setCategory(request.category());
        item.setName(request.name());
        item.setDescription(request.description());
        item.setBudgetedAmount(request.budgetedAmount());
        item.setActualAmount(request.actualAmount() != null ? request.actualAmount() : BigDecimal.ZERO);
        item.setPeriodStart(request.periodStart());
        item.setPeriodEnd(request.periodEnd());
        item.setFiscalYear(request.fiscalYear());
        item.setNotes(request.notes());

        item = budgetRepository.save(item);
        auditService.logAction(AuditAction.BUDGET_ITEM_CREATED, "BudgetItem", item.getId().toString(),
                "Created budget item: " + request.name());

        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public Page<BudgetItemResponse> getBudgetItemsByContract(UUID contractId, Pageable pageable) {
        return budgetRepository.findByContractId(contractId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<BudgetItemResponse> getBudgetItems(UUID tenantId, Pageable pageable) {
        // Get all contracts for tenant, then get budget items
        List<Contract> contracts = contractRepository.findByTenantId(tenantId);
        List<BudgetItem> allItems = new ArrayList<>();
        for (Contract contract : contracts) {
            allItems.addAll(budgetRepository.findByContractId(contract.getId()));
        }

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allItems.size());
        List<BudgetItem> pageContent = start < allItems.size() ? allItems.subList(start, end) : Collections.emptyList();

        return new PageImpl<>(
                pageContent.stream().map(this::toResponse).toList(),
                pageable,
                allItems.size()
        );
    }

    @Transactional(readOnly = true)
    public Page<BudgetItemResponse> getBudgetItemsByCategory(UUID tenantId, BudgetCategory category, Pageable pageable) {
        // Get all contracts for tenant, then filter budget items by category
        List<Contract> contracts = contractRepository.findByTenantId(tenantId);
        List<BudgetItem> allItems = new ArrayList<>();
        for (Contract contract : contracts) {
            allItems.addAll(budgetRepository.findByContractIdAndCategory(contract.getId(), category));
        }

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allItems.size());
        List<BudgetItem> pageContent = start < allItems.size() ? allItems.subList(start, end) : Collections.emptyList();

        return new PageImpl<>(
                pageContent.stream().map(this::toResponse).toList(),
                pageable,
                allItems.size()
        );
    }

    @Transactional(readOnly = true)
    public Optional<BudgetItemResponse> getBudgetItem(UUID itemId) {
        return budgetRepository.findById(itemId).map(this::toResponse);
    }

    public BudgetItemResponse updateBudgetItem(UUID tenantId, UUID itemId, UUID userId, CreateBudgetItemRequest request) {
        BudgetItem item = budgetRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Budget item not found"));

        if (!item.getContract().getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Budget item does not belong to tenant");
        }

        if (request.clinId() != null) {
            ContractClin clin = clinRepository.findById(request.clinId())
                    .orElseThrow(() -> new IllegalArgumentException("CLIN not found"));
            item.setClin(clin);
        } else {
            item.setClin(null);
        }

        item.setCategory(request.category());
        item.setName(request.name());
        item.setDescription(request.description());
        item.setBudgetedAmount(request.budgetedAmount());
        item.setActualAmount(request.actualAmount());
        item.setPeriodStart(request.periodStart());
        item.setPeriodEnd(request.periodEnd());
        item.setFiscalYear(request.fiscalYear());
        item.setNotes(request.notes());

        item = budgetRepository.save(item);
        auditService.logAction(AuditAction.BUDGET_ITEM_CREATED, "BudgetItem", itemId.toString(), "Updated budget item");

        return toResponse(item);
    }

    public void recordExpense(UUID tenantId, UUID itemId, UUID userId, BigDecimal amount) {
        BudgetItem item = budgetRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Budget item not found"));

        if (!item.getContract().getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Budget item does not belong to tenant");
        }

        item.setActualAmount(item.getActualAmount().add(amount));
        budgetRepository.save(item);
        auditService.logAction(AuditAction.BUDGET_ITEM_CREATED, "BudgetItem", itemId.toString(),
                "Recorded expense: " + amount);
    }

    public void deleteBudgetItem(UUID tenantId, UUID itemId, UUID userId) {
        BudgetItem item = budgetRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Budget item not found"));

        if (!item.getContract().getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Budget item does not belong to tenant");
        }

        budgetRepository.delete(item);
        auditService.logAction(AuditAction.BUDGET_ITEM_CREATED, "BudgetItem", itemId.toString(), "Deleted budget item");
    }

    @Transactional(readOnly = true)
    public BudgetSummary getContractBudgetSummary(UUID contractId) {
        List<BudgetItem> items = budgetRepository.findByContractId(contractId);

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalActual = BigDecimal.ZERO;
        Map<BudgetCategory, BigDecimal> budgetByCategory = new HashMap<>();
        Map<BudgetCategory, BigDecimal> actualByCategory = new HashMap<>();

        for (BudgetItem item : items) {
            totalBudget = totalBudget.add(item.getBudgetedAmount() != null ? item.getBudgetedAmount() : BigDecimal.ZERO);
            totalActual = totalActual.add(item.getActualAmount() != null ? item.getActualAmount() : BigDecimal.ZERO);

            if (item.getCategory() != null) {
                budgetByCategory.merge(item.getCategory(),
                        item.getBudgetedAmount() != null ? item.getBudgetedAmount() : BigDecimal.ZERO, BigDecimal::add);
                actualByCategory.merge(item.getCategory(),
                        item.getActualAmount() != null ? item.getActualAmount() : BigDecimal.ZERO, BigDecimal::add);
            }
        }

        BigDecimal totalVariance = totalBudget.subtract(totalActual);
        BigDecimal percentUsed = totalBudget.compareTo(BigDecimal.ZERO) > 0 ?
                totalActual.divide(totalBudget, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO;

        Map<BudgetCategory, CategorySummary> byCategory = new HashMap<>();
        for (BudgetCategory cat : BudgetCategory.values()) {
            BigDecimal budgeted = budgetByCategory.getOrDefault(cat, BigDecimal.ZERO);
            BigDecimal actual = actualByCategory.getOrDefault(cat, BigDecimal.ZERO);
            byCategory.put(cat, new CategorySummary(budgeted, actual, budgeted.subtract(actual)));
        }

        return new BudgetSummary(totalBudget, totalActual, totalVariance, percentUsed, byCategory);
    }

    @Transactional(readOnly = true)
    public List<BudgetItemResponse> getOverBudgetItems(UUID contractId) {
        return budgetRepository.findByContractId(contractId).stream()
                .filter(BudgetItem::isOverBudget)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BudgetItemResponse> getOverBudgetItemsByTenant(UUID tenantId) {
        // Get all contracts for tenant, then find over-budget items
        List<Contract> contracts = contractRepository.findByTenantId(tenantId);
        List<BudgetItemResponse> overBudget = new ArrayList<>();
        for (Contract contract : contracts) {
            overBudget.addAll(
                    budgetRepository.findByContractId(contract.getId()).stream()
                            .filter(BudgetItem::isOverBudget)
                            .map(this::toResponse)
                            .toList()
            );
        }
        return overBudget;
    }

    private BudgetItemResponse toResponse(BudgetItem item) {
        BigDecimal variance = null;
        BigDecimal variancePercent = null;

        if (item.getBudgetedAmount() != null && item.getActualAmount() != null) {
            variance = item.getBudgetedAmount().subtract(item.getActualAmount());
            if (item.getBudgetedAmount().compareTo(BigDecimal.ZERO) > 0) {
                variancePercent = variance.divide(item.getBudgetedAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        }

        String clinNumber = item.getClin() != null ? item.getClin().getClinNumber() : null;
        UUID clinId = item.getClin() != null ? item.getClin().getId() : null;

        return new BudgetItemResponse(item.getId(), item.getContract().getId(),
                item.getContract().getContractNumber(), clinId, clinNumber, item.getCategory(),
                item.getName(), item.getDescription(), item.getBudgetedAmount(), item.getActualAmount(),
                variance, variancePercent, item.getPeriodStart(), item.getPeriodEnd(),
                item.getFiscalYear(), item.getNotes(), item.getCreatedAt());
    }
}
