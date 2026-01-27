package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.BudgetItem;
import com.samgov.ingestor.model.BudgetItem.BudgetCategory;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.ContractClin;
import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.Invoice.InvoiceType;
import com.samgov.ingestor.model.InvoiceLineItem;
import com.samgov.ingestor.model.InvoiceLineItem.LineType;
import com.samgov.ingestor.model.LaborRate;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.BudgetItemRepository;
import com.samgov.ingestor.repository.ContractClinRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.InvoiceLineItemRepository;
import com.samgov.ingestor.repository.InvoiceRepository;
import com.samgov.ingestor.repository.LaborRateRepository;
import com.samgov.ingestor.repository.TenantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinancialService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository lineItemRepository;
    private final LaborRateRepository laborRateRepository;
    private final BudgetItemRepository budgetItemRepository;
    private final ContractRepository contractRepository;
    private final ContractClinRepository clinRepository;
    private final TenantRepository tenantRepository;

    // Invoice management

    @Transactional
    public InvoiceDto createInvoice(CreateInvoiceRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Contract contract = contractRepository.findByTenantIdAndId(tenantId, request.contractId())
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (invoiceRepository.existsByTenantIdAndInvoiceNumber(tenantId, request.invoiceNumber())) {
            throw new IllegalArgumentException("Invoice number already exists");
        }

        Invoice invoice = Invoice.builder()
            .tenant(tenant)
            .contract(contract)
            .invoiceNumber(request.invoiceNumber())
            .invoiceType(request.invoiceType())
            .status(InvoiceStatus.DRAFT)
            .invoiceDate(request.invoiceDate())
            .periodStart(request.periodStart())
            .periodEnd(request.periodEnd())
            .dueDate(request.dueDate())
            .subtotal(BigDecimal.ZERO)
            .totalAmount(BigDecimal.ZERO)
            .notes(request.notes())
            .build();

        Invoice saved = invoiceRepository.save(invoice);
        return toInvoiceDto(saved);
    }

    public InvoiceDto getInvoice(UUID invoiceId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Invoice invoice = invoiceRepository.findByTenantIdAndId(tenantId, invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return toInvoiceDto(invoice);
    }

    public Page<InvoiceDto> getInvoices(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return invoiceRepository.findByTenantId(tenantId, pageable).map(this::toInvoiceDto);
    }

    public Page<InvoiceDto> getInvoicesByContract(UUID contractId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        return invoiceRepository.findByContractId(contractId, pageable).map(this::toInvoiceDto);
    }

    public List<InvoiceDto> getUnpaidInvoices() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return invoiceRepository.findUnpaidInvoices(tenantId)
            .stream()
            .map(this::toInvoiceDto)
            .toList();
    }

    public List<InvoiceDto> getOverdueInvoices() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return invoiceRepository.findOverdueInvoices(tenantId, LocalDate.now())
            .stream()
            .map(this::toInvoiceDto)
            .toList();
    }

    @Transactional
    public InvoiceDto addLineItem(UUID invoiceId, CreateLineItemRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Invoice invoice = invoiceRepository.findByTenantIdAndId(tenantId, invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        InvoiceLineItem item = InvoiceLineItem.builder()
            .invoice(invoice)
            .lineNumber(request.lineNumber())
            .description(request.description())
            .lineType(request.lineType())
            .laborCategory(request.laborCategory())
            .employeeName(request.employeeName())
            .hours(request.hours())
            .hourlyRate(request.hourlyRate())
            .quantity(request.quantity())
            .unitOfMeasure(request.unitOfMeasure())
            .unitPrice(request.unitPrice())
            .amount(request.amount())
            .directCost(request.directCost())
            .indirectCost(request.indirectCost())
            .fee(request.fee())
            .notes(request.notes())
            .build();

        if (request.clinId() != null) {
            ContractClin clin = clinRepository.findById(request.clinId()).orElse(null);
            item.setClin(clin);
        }

        invoice.addLineItem(item);
        recalculateInvoiceTotals(invoice);

        Invoice saved = invoiceRepository.save(invoice);
        return toInvoiceDto(saved);
    }

    @Transactional
    public InvoiceDto updateInvoiceStatus(UUID invoiceId, InvoiceStatus status) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Invoice invoice = invoiceRepository.findByTenantIdAndId(tenantId, invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        invoice.setStatus(status);

        if (status == InvoiceStatus.SUBMITTED) {
            invoice.setSubmittedDate(LocalDate.now());
        } else if (status == InvoiceStatus.PAID) {
            invoice.setPaidDate(LocalDate.now());
            invoice.setAmountPaid(invoice.getTotalAmount());
        }

        Invoice saved = invoiceRepository.save(invoice);
        return toInvoiceDto(saved);
    }

    @Transactional
    public InvoiceDto recordPayment(UUID invoiceId, BigDecimal amount, String paymentReference) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Invoice invoice = invoiceRepository.findByTenantIdAndId(tenantId, invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        BigDecimal currentPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal newTotal = currentPaid.add(amount);
        invoice.setAmountPaid(newTotal);
        invoice.setPaymentReference(paymentReference);

        if (newTotal.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoice.setPaidDate(LocalDate.now());
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        Invoice saved = invoiceRepository.save(invoice);
        return toInvoiceDto(saved);
    }

    private void recalculateInvoiceTotals(Invoice invoice) {
        BigDecimal subtotal = invoice.getLineItems().stream()
            .map(InvoiceLineItem::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        invoice.setSubtotal(subtotal);
        BigDecimal adjustments = invoice.getAdjustments() != null ? invoice.getAdjustments() : BigDecimal.ZERO;
        invoice.setTotalAmount(subtotal.add(adjustments));
    }

    // Labor Rate management

    @Transactional
    public LaborRateDto createLaborRate(CreateLaborRateRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        LaborRate rate = LaborRate.builder()
            .tenant(tenant)
            .laborCategory(request.laborCategory())
            .laborCategoryDescription(request.laborCategoryDescription())
            .minYearsExperience(request.minYearsExperience())
            .maxYearsExperience(request.maxYearsExperience())
            .educationRequirement(request.educationRequirement())
            .baseRate(request.baseRate())
            .fringeRate(request.fringeRate())
            .overheadRate(request.overheadRate())
            .gaRate(request.gaRate())
            .feeRate(request.feeRate())
            .billingRate(request.billingRate())
            .rateType(request.rateType())
            .effectiveDate(request.effectiveDate())
            .endDate(request.endDate())
            .fiscalYear(request.fiscalYear())
            .scaCode(request.scaCode())
            .scaWageDetermination(request.scaWageDetermination())
            .notes(request.notes())
            .isActive(true)
            .build();

        if (request.contractId() != null) {
            Contract contract = contractRepository.findByTenantIdAndId(tenantId, request.contractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
            rate.setContract(contract);
        }

        LaborRate saved = laborRateRepository.save(rate);
        return toLaborRateDto(saved);
    }

    public Page<LaborRateDto> getLaborRates(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return laborRateRepository.findByTenantId(tenantId, pageable).map(this::toLaborRateDto);
    }

    public List<LaborRateDto> getActiveLaborRates() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return laborRateRepository.findByTenantIdAndIsActiveTrue(tenantId)
            .stream()
            .map(this::toLaborRateDto)
            .toList();
    }

    public List<LaborRateDto> getContractLaborRates(UUID contractId) {
        return laborRateRepository.findByContractIdAndIsActiveTrue(contractId)
            .stream()
            .map(this::toLaborRateDto)
            .toList();
    }

    public List<String> getLaborCategories() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return laborRateRepository.findDistinctLaborCategoriesByTenantId(tenantId);
    }

    // Budget management

    @Transactional
    public BudgetItemDto createBudgetItem(CreateBudgetItemRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, request.contractId())
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        BudgetItem item = BudgetItem.builder()
            .contract(contract)
            .name(request.name())
            .description(request.description())
            .category(request.category())
            .budgetedAmount(request.budgetedAmount())
            .actualAmount(BigDecimal.ZERO)
            .committedAmount(BigDecimal.ZERO)
            .forecastAmount(request.forecastAmount())
            .periodStart(request.periodStart())
            .periodEnd(request.periodEnd())
            .fiscalYear(request.fiscalYear())
            .fiscalPeriod(request.fiscalPeriod())
            .notes(request.notes())
            .build();

        if (request.clinId() != null) {
            ContractClin clin = clinRepository.findById(request.clinId()).orElse(null);
            item.setClin(clin);
        }

        BudgetItem saved = budgetItemRepository.save(item);
        return toBudgetItemDto(saved);
    }

    public List<BudgetItemDto> getBudgetItems(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        return budgetItemRepository.findByContractId(contractId)
            .stream()
            .map(this::toBudgetItemDto)
            .toList();
    }

    @Transactional
    public BudgetItemDto updateBudgetItem(UUID budgetItemId, UpdateBudgetItemRequest request) {
        BudgetItem item = budgetItemRepository.findById(budgetItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Budget item not found"));

        if (request.budgetedAmount() != null) item.setBudgetedAmount(request.budgetedAmount());
        if (request.actualAmount() != null) item.setActualAmount(request.actualAmount());
        if (request.committedAmount() != null) item.setCommittedAmount(request.committedAmount());
        if (request.forecastAmount() != null) item.setForecastAmount(request.forecastAmount());
        if (request.notes() != null) item.setNotes(request.notes());

        item.setLastUpdatedDate(LocalDate.now());

        BudgetItem saved = budgetItemRepository.save(item);
        return toBudgetItemDto(saved);
    }

    public List<BudgetItemDto> getOverBudgetItems(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        return budgetItemRepository.findOverBudgetItems(contractId)
            .stream()
            .map(this::toBudgetItemDto)
            .toList();
    }

    // Financial summaries

    public ContractFinancialSummaryDto getContractFinancialSummary(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        BigDecimal totalBudget = budgetItemRepository.sumBudgetedAmountByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal actualSpent = budgetItemRepository.sumActualAmountByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal committed = budgetItemRepository.sumCommittedAmountByContractId(contractId).orElse(BigDecimal.ZERO);

        BigDecimal totalInvoiced = invoiceRepository.sumInvoicedAmountByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal totalPaid = invoiceRepository.sumPaidAmountByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal outstandingBalance = invoiceRepository.sumOutstandingBalanceByContractId(contractId).orElse(BigDecimal.ZERO);

        long unpaidInvoiceCount = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.SUBMITTED)
            + invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.APPROVED);

        return new ContractFinancialSummaryDto(
            contractId,
            contract.getContractNumber(),
            contract.getTotalValue(),
            contract.getFundedValue(),
            totalBudget,
            actualSpent,
            committed,
            totalBudget.subtract(actualSpent).subtract(committed),
            totalInvoiced,
            totalPaid,
            outstandingBalance,
            unpaidInvoiceCount
        );
    }

    public TenantFinancialSummaryDto getTenantFinancialSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();

        BigDecimal totalInvoiced = invoiceRepository.sumTotalInvoicedByTenantId(tenantId).orElse(BigDecimal.ZERO);
        BigDecimal totalOutstanding = invoiceRepository.sumOutstandingByTenantId(tenantId).orElse(BigDecimal.ZERO);

        long draftInvoices = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.DRAFT);
        long submittedInvoices = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.SUBMITTED);
        long overdueInvoices = invoiceRepository.findOverdueInvoices(tenantId, LocalDate.now()).size();

        return new TenantFinancialSummaryDto(
            totalInvoiced,
            totalOutstanding,
            draftInvoices,
            submittedInvoices,
            overdueInvoices
        );
    }

    // DTO converters

    private InvoiceDto toInvoiceDto(Invoice i) {
        return new InvoiceDto(
            i.getId(),
            i.getContract().getId(),
            i.getContract().getContractNumber(),
            i.getInvoiceNumber(),
            i.getInvoiceType(),
            i.getStatus(),
            i.getInvoiceDate(),
            i.getPeriodStart(),
            i.getPeriodEnd(),
            i.getDueDate(),
            i.getSubmittedDate(),
            i.getPaidDate(),
            i.getSubtotal(),
            i.getAdjustments(),
            i.getTotalAmount(),
            i.getAmountPaid(),
            i.getRetainage(),
            i.getBalance(),
            i.getPaymentMethod(),
            i.getPaymentReference(),
            i.getVoucherNumber(),
            i.getNotes(),
            i.isOverdue(),
            i.getDaysOutstanding(),
            i.getCreatedAt(),
            i.getUpdatedAt()
        );
    }

    private LaborRateDto toLaborRateDto(LaborRate r) {
        return new LaborRateDto(
            r.getId(),
            r.getContract() != null ? r.getContract().getId() : null,
            r.getLaborCategory(),
            r.getLaborCategoryDescription(),
            r.getMinYearsExperience(),
            r.getMaxYearsExperience(),
            r.getEducationRequirement(),
            r.getBaseRate(),
            r.getFringeRate(),
            r.getOverheadRate(),
            r.getGaRate(),
            r.getFeeRate(),
            r.getFullyBurdenedRate(),
            r.getBillingRate(),
            r.getRateType(),
            r.getEffectiveDate(),
            r.getEndDate(),
            r.getFiscalYear(),
            r.getScaCode(),
            r.getScaWageDetermination(),
            r.getNotes(),
            r.getIsActive()
        );
    }

    private BudgetItemDto toBudgetItemDto(BudgetItem b) {
        return new BudgetItemDto(
            b.getId(),
            b.getContract().getId(),
            b.getClin() != null ? b.getClin().getId() : null,
            b.getClin() != null ? b.getClin().getClinNumber() : null,
            b.getName(),
            b.getDescription(),
            b.getCategory(),
            b.getBudgetedAmount(),
            b.getActualAmount(),
            b.getCommittedAmount(),
            b.getForecastAmount(),
            b.getVariance(),
            b.getVariancePercentage(),
            b.getRemainingBudget(),
            b.isOverBudget(),
            b.getPeriodStart(),
            b.getPeriodEnd(),
            b.getFiscalYear(),
            b.getFiscalPeriod(),
            b.getLastUpdatedDate(),
            b.getNotes()
        );
    }

    // Request/Response DTOs

    public record CreateInvoiceRequest(
        UUID contractId,
        String invoiceNumber,
        InvoiceType invoiceType,
        LocalDate invoiceDate,
        LocalDate periodStart,
        LocalDate periodEnd,
        LocalDate dueDate,
        String notes
    ) {}

    public record CreateLineItemRequest(
        UUID clinId,
        Integer lineNumber,
        String description,
        LineType lineType,
        String laborCategory,
        String employeeName,
        BigDecimal hours,
        BigDecimal hourlyRate,
        BigDecimal quantity,
        String unitOfMeasure,
        BigDecimal unitPrice,
        BigDecimal amount,
        BigDecimal directCost,
        BigDecimal indirectCost,
        BigDecimal fee,
        String notes
    ) {}

    public record CreateLaborRateRequest(
        UUID contractId,
        String laborCategory,
        String laborCategoryDescription,
        Integer minYearsExperience,
        Integer maxYearsExperience,
        String educationRequirement,
        BigDecimal baseRate,
        BigDecimal fringeRate,
        BigDecimal overheadRate,
        BigDecimal gaRate,
        BigDecimal feeRate,
        BigDecimal billingRate,
        String rateType,
        LocalDate effectiveDate,
        LocalDate endDate,
        Integer fiscalYear,
        String scaCode,
        String scaWageDetermination,
        String notes
    ) {}

    public record CreateBudgetItemRequest(
        UUID contractId,
        UUID clinId,
        String name,
        String description,
        BudgetCategory category,
        BigDecimal budgetedAmount,
        BigDecimal forecastAmount,
        LocalDate periodStart,
        LocalDate periodEnd,
        Integer fiscalYear,
        Integer fiscalPeriod,
        String notes
    ) {}

    public record UpdateBudgetItemRequest(
        BigDecimal budgetedAmount,
        BigDecimal actualAmount,
        BigDecimal committedAmount,
        BigDecimal forecastAmount,
        String notes
    ) {}

    public record InvoiceDto(
        UUID id,
        UUID contractId,
        String contractNumber,
        String invoiceNumber,
        InvoiceType invoiceType,
        InvoiceStatus status,
        LocalDate invoiceDate,
        LocalDate periodStart,
        LocalDate periodEnd,
        LocalDate dueDate,
        LocalDate submittedDate,
        LocalDate paidDate,
        BigDecimal subtotal,
        BigDecimal adjustments,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        BigDecimal retainage,
        BigDecimal balance,
        String paymentMethod,
        String paymentReference,
        String voucherNumber,
        String notes,
        Boolean isOverdue,
        Long daysOutstanding,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record LaborRateDto(
        UUID id,
        UUID contractId,
        String laborCategory,
        String laborCategoryDescription,
        Integer minYearsExperience,
        Integer maxYearsExperience,
        String educationRequirement,
        BigDecimal baseRate,
        BigDecimal fringeRate,
        BigDecimal overheadRate,
        BigDecimal gaRate,
        BigDecimal feeRate,
        BigDecimal fullyBurdenedRate,
        BigDecimal billingRate,
        String rateType,
        LocalDate effectiveDate,
        LocalDate endDate,
        Integer fiscalYear,
        String scaCode,
        String scaWageDetermination,
        String notes,
        Boolean isActive
    ) {}

    public record BudgetItemDto(
        UUID id,
        UUID contractId,
        UUID clinId,
        String clinNumber,
        String name,
        String description,
        BudgetCategory category,
        BigDecimal budgetedAmount,
        BigDecimal actualAmount,
        BigDecimal committedAmount,
        BigDecimal forecastAmount,
        BigDecimal variance,
        BigDecimal variancePercentage,
        BigDecimal remainingBudget,
        Boolean isOverBudget,
        LocalDate periodStart,
        LocalDate periodEnd,
        Integer fiscalYear,
        Integer fiscalPeriod,
        LocalDate lastUpdatedDate,
        String notes
    ) {}

    public record ContractFinancialSummaryDto(
        UUID contractId,
        String contractNumber,
        BigDecimal totalContractValue,
        BigDecimal fundedValue,
        BigDecimal totalBudget,
        BigDecimal actualSpent,
        BigDecimal committed,
        BigDecimal remainingBudget,
        BigDecimal totalInvoiced,
        BigDecimal totalPaid,
        BigDecimal outstandingBalance,
        long unpaidInvoiceCount
    ) {}

    public record TenantFinancialSummaryDto(
        BigDecimal totalInvoiced,
        BigDecimal totalOutstanding,
        long draftInvoices,
        long submittedInvoices,
        long overdueInvoices
    ) {}

    public record UpdateInvoiceRequest(
        LocalDate invoiceDate,
        LocalDate periodStart,
        LocalDate periodEnd,
        LocalDate dueDate,
        BigDecimal adjustments,
        String notes
    ) {}

    public record UpdateLineItemRequest(
        String description,
        BigDecimal hours,
        BigDecimal hourlyRate,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal amount,
        String notes
    ) {}

    public record UpdateLaborRateRequest(
        BigDecimal baseRate,
        BigDecimal fringeRate,
        BigDecimal overheadRate,
        BigDecimal gaRate,
        BigDecimal feeRate,
        BigDecimal billingRate,
        LocalDate effectiveDate,
        LocalDate endDate,
        Boolean isActive,
        String notes
    ) {}

    public record BudgetSummaryDto(
        UUID contractId,
        BigDecimal totalBudget,
        BigDecimal actualSpent,
        BigDecimal committed,
        BigDecimal remaining,
        BigDecimal variancePercent,
        int itemCount,
        int overBudgetCount
    ) {}

    // Additional methods for controller compatibility

    public Page<InvoiceDto> listInvoices(UUID tenantId, Pageable pageable) {
        return invoiceRepository.findByTenantId(tenantId, pageable).map(this::toInvoiceDto);
    }

    public java.util.Optional<Invoice> getInvoice(UUID tenantId, UUID invoiceId) {
        return invoiceRepository.findByTenantIdAndId(tenantId, invoiceId);
    }

    public Invoice createInvoice(UUID tenantId, CreateInvoiceRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Contract contract = contractRepository.findByTenantIdAndId(tenantId, request.contractId())
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (invoiceRepository.existsByTenantIdAndInvoiceNumber(tenantId, request.invoiceNumber())) {
            throw new IllegalArgumentException("Invoice number already exists");
        }

        Invoice invoice = Invoice.builder()
            .tenant(tenant)
            .contract(contract)
            .invoiceNumber(request.invoiceNumber())
            .invoiceType(request.invoiceType())
            .status(InvoiceStatus.DRAFT)
            .invoiceDate(request.invoiceDate())
            .periodStart(request.periodStart())
            .periodEnd(request.periodEnd())
            .dueDate(request.dueDate())
            .subtotal(BigDecimal.ZERO)
            .totalAmount(BigDecimal.ZERO)
            .notes(request.notes())
            .build();

        return invoiceRepository.save(invoice);
    }

    public java.util.Optional<Invoice> updateInvoice(UUID tenantId, UUID invoiceId, UpdateInvoiceRequest request) {
        return invoiceRepository.findByTenantIdAndId(tenantId, invoiceId).map(invoice -> {
            if (request.invoiceDate() != null) invoice.setInvoiceDate(request.invoiceDate());
            if (request.periodStart() != null) invoice.setPeriodStart(request.periodStart());
            if (request.periodEnd() != null) invoice.setPeriodEnd(request.periodEnd());
            if (request.dueDate() != null) invoice.setDueDate(request.dueDate());
            if (request.adjustments() != null) invoice.setAdjustments(request.adjustments());
            if (request.notes() != null) invoice.setNotes(request.notes());
            recalculateInvoiceTotals(invoice);
            return invoiceRepository.save(invoice);
        });
    }

    public boolean deleteInvoice(UUID tenantId, UUID invoiceId) {
        return invoiceRepository.findByTenantIdAndId(tenantId, invoiceId).map(invoice -> {
            invoiceRepository.delete(invoice);
            return true;
        }).orElse(false);
    }

    public java.util.Optional<Invoice> submitInvoice(UUID tenantId, UUID invoiceId) {
        return invoiceRepository.findByTenantIdAndId(tenantId, invoiceId).map(invoice -> {
            invoice.setStatus(InvoiceStatus.SUBMITTED);
            invoice.setSubmittedDate(LocalDate.now());
            return invoiceRepository.save(invoice);
        });
    }

    public java.util.Optional<Invoice> updateInvoiceStatus(UUID tenantId, UUID invoiceId, InvoiceStatus status, String notes) {
        return invoiceRepository.findByTenantIdAndId(tenantId, invoiceId).map(invoice -> {
            invoice.setStatus(status);
            if (notes != null) invoice.setNotes(notes);
            return invoiceRepository.save(invoice);
        });
    }

    public java.util.Optional<Invoice> recordPayment(UUID tenantId, UUID invoiceId, BigDecimal amount, LocalDate paymentDate, String paymentReference) {
        return invoiceRepository.findByTenantIdAndId(tenantId, invoiceId).map(invoice -> {
            BigDecimal currentPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
            invoice.setAmountPaid(currentPaid.add(amount));
            invoice.setPaidDate(paymentDate);
            invoice.setPaymentReference(paymentReference);
            if (invoice.getAmountPaid().compareTo(invoice.getTotalAmount()) >= 0) {
                invoice.setStatus(InvoiceStatus.PAID);
            }
            return invoiceRepository.save(invoice);
        });
    }

    public Page<InvoiceDto> getInvoicesByStatus(UUID tenantId, InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findByTenantIdAndStatus(tenantId, status, pageable).map(this::toInvoiceDto);
    }

    public List<InvoiceDto> getUnpaidInvoices(UUID tenantId) {
        return invoiceRepository.findUnpaidInvoices(tenantId).stream().map(this::toInvoiceDto).toList();
    }

    public List<InvoiceDto> getOverdueInvoices(UUID tenantId) {
        return invoiceRepository.findOverdueInvoices(tenantId, LocalDate.now()).stream().map(this::toInvoiceDto).toList();
    }

    public List<InvoiceDto> getInvoicesByDateRange(UUID tenantId, LocalDate start, LocalDate end) {
        return invoiceRepository.findByDateRange(tenantId, start, end).stream().map(this::toInvoiceDto).toList();
    }

    public List<InvoiceLineItem> getInvoiceLineItems(UUID invoiceId) {
        return lineItemRepository.findByInvoiceIdOrderByLineNumber(invoiceId);
    }

    @Transactional
    public java.util.Optional<InvoiceLineItem> addLineItem(UUID tenantId, UUID invoiceId, CreateLineItemRequest request) {
        return invoiceRepository.findByTenantIdAndId(tenantId, invoiceId).map(invoice -> {
            InvoiceLineItem item = InvoiceLineItem.builder()
                .invoice(invoice)
                .lineNumber(request.lineNumber())
                .description(request.description())
                .lineType(request.lineType())
                .laborCategory(request.laborCategory())
                .employeeName(request.employeeName())
                .hours(request.hours())
                .hourlyRate(request.hourlyRate())
                .quantity(request.quantity())
                .unitOfMeasure(request.unitOfMeasure())
                .unitPrice(request.unitPrice())
                .amount(request.amount())
                .directCost(request.directCost())
                .indirectCost(request.indirectCost())
                .fee(request.fee())
                .notes(request.notes())
                .build();
            // Save the line item directly to ensure it gets an ID
            InvoiceLineItem savedItem = lineItemRepository.save(item);
            invoice.addLineItem(savedItem);
            recalculateInvoiceTotals(invoice);
            invoiceRepository.save(invoice);
            return savedItem;
        });
    }

    public java.util.Optional<InvoiceLineItem> updateLineItem(UUID invoiceId, UUID lineItemId, UpdateLineItemRequest request) {
        return lineItemRepository.findById(lineItemId).map(item -> {
            if (request.description() != null) item.setDescription(request.description());
            if (request.hours() != null) item.setHours(request.hours());
            if (request.hourlyRate() != null) item.setHourlyRate(request.hourlyRate());
            if (request.quantity() != null) item.setQuantity(request.quantity());
            if (request.unitPrice() != null) item.setUnitPrice(request.unitPrice());
            if (request.amount() != null) item.setAmount(request.amount());
            if (request.notes() != null) item.setNotes(request.notes());
            return lineItemRepository.save(item);
        });
    }

    public boolean deleteLineItem(UUID invoiceId, UUID lineItemId) {
        return lineItemRepository.findById(lineItemId).map(item -> {
            lineItemRepository.delete(item);
            return true;
        }).orElse(false);
    }

    public Page<LaborRate> listLaborRates(UUID tenantId, Pageable pageable) {
        return laborRateRepository.findByTenantId(tenantId, pageable);
    }

    public java.util.Optional<LaborRate> getLaborRate(UUID tenantId, UUID rateId) {
        return laborRateRepository.findById(rateId).filter(r -> r.getTenant().getId().equals(tenantId));
    }

    public LaborRate createLaborRate(UUID tenantId, CreateLaborRateRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        LaborRate rate = LaborRate.builder()
            .tenant(tenant)
            .laborCategory(request.laborCategory())
            .laborCategoryDescription(request.laborCategoryDescription())
            .minYearsExperience(request.minYearsExperience())
            .maxYearsExperience(request.maxYearsExperience())
            .educationRequirement(request.educationRequirement())
            .baseRate(request.baseRate())
            .fringeRate(request.fringeRate())
            .overheadRate(request.overheadRate())
            .gaRate(request.gaRate())
            .feeRate(request.feeRate())
            .billingRate(request.billingRate())
            .rateType(request.rateType())
            .effectiveDate(request.effectiveDate())
            .endDate(request.endDate())
            .fiscalYear(request.fiscalYear())
            .scaCode(request.scaCode())
            .scaWageDetermination(request.scaWageDetermination())
            .notes(request.notes())
            .isActive(true)
            .build();

        return laborRateRepository.save(rate);
    }

    public java.util.Optional<LaborRate> updateLaborRate(UUID tenantId, UUID rateId, UpdateLaborRateRequest request) {
        return laborRateRepository.findById(rateId)
            .filter(r -> r.getTenant().getId().equals(tenantId))
            .map(rate -> {
                if (request.baseRate() != null) rate.setBaseRate(request.baseRate());
                if (request.fringeRate() != null) rate.setFringeRate(request.fringeRate());
                if (request.overheadRate() != null) rate.setOverheadRate(request.overheadRate());
                if (request.gaRate() != null) rate.setGaRate(request.gaRate());
                if (request.feeRate() != null) rate.setFeeRate(request.feeRate());
                if (request.billingRate() != null) rate.setBillingRate(request.billingRate());
                if (request.effectiveDate() != null) rate.setEffectiveDate(request.effectiveDate());
                if (request.endDate() != null) rate.setEndDate(request.endDate());
                if (request.isActive() != null) rate.setIsActive(request.isActive());
                if (request.notes() != null) rate.setNotes(request.notes());
                return laborRateRepository.save(rate);
            });
    }

    public boolean deleteLaborRate(UUID tenantId, UUID rateId) {
        return laborRateRepository.findById(rateId)
            .filter(r -> r.getTenant().getId().equals(tenantId))
            .map(rate -> {
                laborRateRepository.delete(rate);
                return true;
            }).orElse(false);
    }

    public List<LaborRateDto> getActiveLaborRates(UUID tenantId) {
        return laborRateRepository.findByTenantIdAndIsActiveTrue(tenantId).stream().map(this::toLaborRateDto).toList();
    }

    public List<String> getLaborCategories(UUID tenantId) {
        return laborRateRepository.findDistinctLaborCategoriesByTenantId(tenantId);
    }

    public List<LaborRateDto> searchLaborRates(UUID tenantId, String keyword) {
        return laborRateRepository.findByTenantIdAndLaborCategoryContainingIgnoreCase(tenantId, keyword).stream().map(this::toLaborRateDto).toList();
    }

    public java.util.Optional<LaborRate> getEffectiveRate(UUID tenantId, String category, UUID contractId, LocalDate asOfDate) {
        return laborRateRepository.findEffectiveRate(tenantId, category, contractId, asOfDate);
    }

    public List<BudgetItem> getContractBudget(UUID contractId) {
        return budgetItemRepository.findByContractId(contractId);
    }

    public Page<BudgetItem> getContractBudget(UUID contractId, Pageable pageable) {
        return budgetItemRepository.findByContractId(contractId, pageable);
    }

    public java.util.Optional<BudgetItem> getBudgetItem(UUID contractId, UUID itemId) {
        return budgetItemRepository.findById(itemId).filter(b -> b.getContract().getId().equals(contractId));
    }

    public java.util.Optional<BudgetItem> createBudgetItem(UUID contractId, CreateBudgetItemRequest request) {
        return contractRepository.findById(contractId).map(contract -> {
            BudgetItem item = BudgetItem.builder()
                .contract(contract)
                .name(request.name())
                .description(request.description())
                .category(request.category())
                .budgetedAmount(request.budgetedAmount())
                .actualAmount(BigDecimal.ZERO)
                .committedAmount(BigDecimal.ZERO)
                .forecastAmount(request.forecastAmount())
                .periodStart(request.periodStart())
                .periodEnd(request.periodEnd())
                .fiscalYear(request.fiscalYear())
                .fiscalPeriod(request.fiscalPeriod())
                .notes(request.notes())
                .build();
            return budgetItemRepository.save(item);
        });
    }

    public java.util.Optional<BudgetItem> updateBudgetItem(UUID contractId, UUID itemId, UpdateBudgetItemRequest request) {
        return budgetItemRepository.findById(itemId)
            .filter(b -> b.getContract().getId().equals(contractId))
            .map(item -> {
                if (request.budgetedAmount() != null) item.setBudgetedAmount(request.budgetedAmount());
                if (request.actualAmount() != null) item.setActualAmount(request.actualAmount());
                if (request.committedAmount() != null) item.setCommittedAmount(request.committedAmount());
                if (request.forecastAmount() != null) item.setForecastAmount(request.forecastAmount());
                if (request.notes() != null) item.setNotes(request.notes());
                item.setLastUpdatedDate(LocalDate.now());
                return budgetItemRepository.save(item);
            });
    }

    public boolean deleteBudgetItem(UUID contractId, UUID itemId) {
        return budgetItemRepository.findById(itemId)
            .filter(b -> b.getContract().getId().equals(contractId))
            .map(item -> {
                budgetItemRepository.delete(item);
                return true;
            }).orElse(false);
    }

    public List<BudgetItem> getBudgetByCategory(UUID contractId, BudgetCategory category) {
        return budgetItemRepository.findByContractIdAndCategory(contractId, category);
    }

    public List<BudgetItem> getBudgetByFiscalYear(UUID contractId, Integer fiscalYear) {
        return budgetItemRepository.findByContractIdAndFiscalYear(contractId, fiscalYear);
    }

    public TenantFinancialSummaryDto getTenantFinancialSummary(UUID tenantId) {
        BigDecimal totalInvoiced = invoiceRepository.sumTotalInvoicedByTenantId(tenantId).orElse(BigDecimal.ZERO);
        BigDecimal totalOutstanding = invoiceRepository.sumOutstandingByTenantId(tenantId).orElse(BigDecimal.ZERO);

        long draftInvoices = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.DRAFT);
        long submittedInvoices = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.SUBMITTED);
        long overdueInvoices = invoiceRepository.findOverdueInvoices(tenantId, LocalDate.now()).size();

        return new TenantFinancialSummaryDto(
            totalInvoiced,
            totalOutstanding,
            draftInvoices,
            submittedInvoices,
            overdueInvoices
        );
    }

    public BudgetSummaryDto getBudgetSummary(UUID contractId) {
        BigDecimal totalBudget = budgetItemRepository.sumBudgetedAmountByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal actualSpent = budgetItemRepository.sumActualAmountByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal committed = budgetItemRepository.sumCommittedAmountByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal remaining = totalBudget.subtract(actualSpent).subtract(committed);

        BigDecimal variance = totalBudget.compareTo(BigDecimal.ZERO) > 0
            ? remaining.divide(totalBudget, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
            : BigDecimal.ZERO;

        List<BudgetItem> items = budgetItemRepository.findByContractId(contractId);
        int overBudgetCount = (int) items.stream().filter(BudgetItem::isOverBudget).count();

        return new BudgetSummaryDto(contractId, totalBudget, actualSpent, committed, remaining, variance, items.size(), overBudgetCount);
    }

    public BudgetSummaryDto getBudgetSummaryByCategory(UUID contractId, BudgetCategory category) {
        List<BudgetItem> items = budgetItemRepository.findByContractIdAndCategory(contractId, category);
        BigDecimal totalBudget = items.stream().map(BudgetItem::getBudgetedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actualSpent = items.stream().map(BudgetItem::getActualAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal committed = items.stream().map(BudgetItem::getCommittedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remaining = totalBudget.subtract(actualSpent).subtract(committed);

        BigDecimal variance = totalBudget.compareTo(BigDecimal.ZERO) > 0
            ? remaining.divide(totalBudget, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
            : BigDecimal.ZERO;

        int overBudgetCount = (int) items.stream().filter(BudgetItem::isOverBudget).count();

        return new BudgetSummaryDto(contractId, totalBudget, actualSpent, committed, remaining, variance, items.size(), overBudgetCount);
    }
}
