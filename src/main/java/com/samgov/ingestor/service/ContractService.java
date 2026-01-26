package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.ContractClin;
import com.samgov.ingestor.model.ContractDeliverable;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableStatus;
import com.samgov.ingestor.model.ContractModification;
import com.samgov.ingestor.model.ContractModification.ModificationStatus;
import com.samgov.ingestor.model.ContractModification.ModificationType;
import com.samgov.ingestor.model.ContractOption;
import com.samgov.ingestor.model.ContractOption.OptionStatus;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractClinRepository;
import com.samgov.ingestor.repository.ContractDeliverableRepository;
import com.samgov.ingestor.repository.ContractModificationRepository;
import com.samgov.ingestor.repository.ContractOptionRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
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
public class ContractService {

    private final ContractRepository contractRepository;
    private final ContractClinRepository clinRepository;
    private final ContractModificationRepository modificationRepository;
    private final ContractOptionRepository optionRepository;
    private final ContractDeliverableRepository deliverableRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final OpportunityRepository opportunityRepository;
    private final AuditService auditService;

    // Contract CRUD

    @Transactional
    public ContractDto createContract(CreateContractRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        if (contractRepository.existsByTenantIdAndContractNumber(tenantId, request.contractNumber())) {
            throw new IllegalArgumentException("Contract number already exists");
        }

        Contract contract = Contract.builder()
            .tenant(tenant)
            .contractNumber(request.contractNumber())
            .title(request.title())
            .description(request.description())
            .contractType(request.contractType())
            .status(ContractStatus.ACTIVE)
            .agency(request.agency())
            .agencyCode(request.agencyCode())
            .subAgency(request.subAgency())
            .office(request.office())
            .popStartDate(request.popStartDate())
            .popEndDate(request.popEndDate())
            .basePeriodEndDate(request.basePeriodEndDate())
            .finalOptionEndDate(request.finalOptionEndDate())
            .baseValue(request.baseValue())
            .totalValue(request.totalValue())
            .ceilingValue(request.ceilingValue())
            .fundedValue(request.fundedValue())
            .naicsCode(request.naicsCode())
            .pscCode(request.pscCode())
            .placeOfPerformanceCity(request.placeOfPerformanceCity())
            .placeOfPerformanceState(request.placeOfPerformanceState())
            .placeOfPerformanceCountry(request.placeOfPerformanceCountry())
            .contractingOfficerName(request.contractingOfficerName())
            .contractingOfficerEmail(request.contractingOfficerEmail())
            .contractingOfficerPhone(request.contractingOfficerPhone())
            .corName(request.corName())
            .corEmail(request.corEmail())
            .corPhone(request.corPhone())
            .primeContractor(request.primeContractor())
            .isSubcontract(request.isSubcontract() != null ? request.isSubcontract() : false)
            .contractVehicle(request.contractVehicle())
            .setAsideType(request.setAsideType())
            .smallBusinessGoalPercentage(request.smallBusinessGoalPercentage())
            .requiresClearance(request.requiresClearance() != null ? request.requiresClearance() : false)
            .clearanceLevel(request.clearanceLevel())
            .awardDate(request.awardDate())
            .internalNotes(request.internalNotes())
            .build();

        // Set relationships
        if (request.parentContractId() != null) {
            Contract parent = contractRepository.findByTenantIdAndId(tenantId, request.parentContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent contract not found"));
            contract.setParentContract(parent);
        }

        if (request.opportunityId() != null) {
            Opportunity opp = opportunityRepository.findById(request.opportunityId())
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));
            contract.setOpportunity(opp);
        }

        if (request.programManagerId() != null) {
            User pm = userRepository.findById(request.programManagerId()).orElse(null);
            contract.setProgramManager(pm);
        }

        if (request.contractManagerId() != null) {
            User cm = userRepository.findById(request.contractManagerId()).orElse(null);
            contract.setContractManager(cm);
        }

        Contract saved = contractRepository.save(contract);

        auditService.logAction(AuditAction.PIPELINE_CREATED, "Contract", saved.getId().toString(),
            "Created contract: " + saved.getContractNumber());

        return toDto(saved);
    }

    public ContractDto getContract(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        return toDto(contract);
    }

    public Page<ContractDto> getContracts(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return contractRepository.findByTenantId(tenantId, pageable).map(this::toDto);
    }

    public Page<ContractDto> getActiveContracts(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return contractRepository.findActiveContracts(tenantId, pageable).map(this::toDto);
    }

    public Page<ContractDto> searchContracts(String keyword, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return contractRepository.searchByKeyword(tenantId, keyword, pageable).map(this::toDto);
    }

    @Transactional
    public ContractDto updateContract(UUID contractId, UpdateContractRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (request.title() != null) contract.setTitle(request.title());
        if (request.description() != null) contract.setDescription(request.description());
        if (request.status() != null) contract.setStatus(request.status());
        if (request.agency() != null) contract.setAgency(request.agency());
        if (request.popStartDate() != null) contract.setPopStartDate(request.popStartDate());
        if (request.popEndDate() != null) contract.setPopEndDate(request.popEndDate());
        if (request.totalValue() != null) contract.setTotalValue(request.totalValue());
        if (request.fundedValue() != null) contract.setFundedValue(request.fundedValue());
        if (request.contractingOfficerName() != null) contract.setContractingOfficerName(request.contractingOfficerName());
        if (request.contractingOfficerEmail() != null) contract.setContractingOfficerEmail(request.contractingOfficerEmail());
        if (request.corName() != null) contract.setCorName(request.corName());
        if (request.corEmail() != null) contract.setCorEmail(request.corEmail());
        if (request.internalNotes() != null) contract.setInternalNotes(request.internalNotes());

        if (request.programManagerId() != null) {
            User pm = userRepository.findById(request.programManagerId()).orElse(null);
            contract.setProgramManager(pm);
        }

        if (request.contractManagerId() != null) {
            User cm = userRepository.findById(request.contractManagerId()).orElse(null);
            contract.setContractManager(cm);
        }

        Contract saved = contractRepository.save(contract);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Contract", saved.getId().toString(),
            "Updated contract: " + saved.getContractNumber());

        return toDto(saved);
    }

    @Transactional
    public void updateContractStatus(UUID contractId, ContractStatus status) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        contract.setStatus(status);
        contractRepository.save(contract);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Contract", contractId.toString(),
            "Contract status changed to: " + status);
    }

    // CLIN management

    @Transactional
    public ClinDto addClin(UUID contractId, CreateClinRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (clinRepository.existsByContractIdAndClinNumber(contractId, request.clinNumber())) {
            throw new IllegalArgumentException("CLIN number already exists");
        }

        Integer maxSort = clinRepository.findMaxSortOrderByContractId(contractId).orElse(0);

        ContractClin clin = ContractClin.builder()
            .contract(contract)
            .clinNumber(request.clinNumber())
            .description(request.description())
            .clinType(request.clinType())
            .pricingType(request.pricingType())
            .unitOfIssue(request.unitOfIssue())
            .quantity(request.quantity())
            .unitPrice(request.unitPrice())
            .totalValue(request.totalValue())
            .fundedAmount(request.fundedAmount())
            .naicsCode(request.naicsCode())
            .pscCode(request.pscCode())
            .isOption(request.isOption() != null ? request.isOption() : false)
            .optionPeriod(request.optionPeriod())
            .sortOrder(maxSort + 1)
            .notes(request.notes())
            .build();

        ContractClin saved = clinRepository.save(clin);
        return toClinDto(saved);
    }

    public List<ClinDto> getClins(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        return clinRepository.findByContractIdOrderBySortOrderAsc(contractId)
            .stream()
            .map(this::toClinDto)
            .toList();
    }

    @Transactional
    public ClinDto updateClin(UUID contractId, UUID clinId, UpdateClinRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        ContractClin clin = clinRepository.findByContractIdAndId(contractId, clinId)
            .orElseThrow(() -> new ResourceNotFoundException("CLIN not found"));

        if (request.description() != null) clin.setDescription(request.description());
        if (request.totalValue() != null) clin.setTotalValue(request.totalValue());
        if (request.fundedAmount() != null) clin.setFundedAmount(request.fundedAmount());
        if (request.invoicedAmount() != null) clin.setInvoicedAmount(request.invoicedAmount());
        if (request.notes() != null) clin.setNotes(request.notes());

        ContractClin saved = clinRepository.save(clin);
        return toClinDto(saved);
    }

    // Modification management

    @Transactional
    public ModificationDto createModification(UUID contractId, CreateModificationRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (modificationRepository.existsByContractIdAndModificationNumber(contractId, request.modificationNumber())) {
            throw new IllegalArgumentException("Modification number already exists");
        }

        ContractModification mod = ContractModification.builder()
            .contract(contract)
            .modificationNumber(request.modificationNumber())
            .title(request.title())
            .description(request.description())
            .modificationType(request.modificationType())
            .status(ModificationStatus.PENDING)
            .effectiveDate(request.effectiveDate())
            .valueChange(request.valueChange())
            .fundingChange(request.fundingChange())
            .newTotalValue(request.newTotalValue())
            .popExtensionDays(request.popExtensionDays())
            .newPopEndDate(request.newPopEndDate())
            .scopeChangeSummary(request.scopeChangeSummary())
            .requestingOffice(request.requestingOffice())
            .contractingOfficerName(request.contractingOfficerName())
            .reason(request.reason())
            .internalNotes(request.internalNotes())
            .build();

        ContractModification saved = modificationRepository.save(mod);
        return toModificationDto(saved);
    }

    public List<ModificationDto> getModifications(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        return modificationRepository.findByContractIdOrderByModificationNumberDesc(contractId)
            .stream()
            .map(this::toModificationDto)
            .toList();
    }

    @Transactional
    public ModificationDto executeModification(UUID contractId, UUID modificationId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        ContractModification mod = modificationRepository.findByContractIdAndId(contractId, modificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Modification not found"));

        mod.setStatus(ModificationStatus.EXECUTED);
        mod.setExecutedDate(LocalDate.now());

        // Apply changes to contract
        if (mod.getNewTotalValue() != null) {
            contract.setTotalValue(mod.getNewTotalValue());
        }
        if (mod.getFundingChange() != null && contract.getFundedValue() != null) {
            contract.setFundedValue(contract.getFundedValue().add(mod.getFundingChange()));
        }
        if (mod.getNewPopEndDate() != null) {
            contract.setPopEndDate(mod.getNewPopEndDate());
        }

        contractRepository.save(contract);
        ContractModification saved = modificationRepository.save(mod);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "ContractModification", modificationId.toString(),
            "Executed modification: " + mod.getModificationNumber());

        return toModificationDto(saved);
    }

    // Option management

    @Transactional
    public OptionDto addOption(UUID contractId, CreateOptionRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        Integer maxOptionNumber = optionRepository.findMaxOptionNumberByContractId(contractId).orElse(0);
        int newOptionNumber = request.optionNumber() != null ? request.optionNumber() : maxOptionNumber + 1;

        ContractOption option = ContractOption.builder()
            .contract(contract)
            .optionNumber(newOptionNumber)
            .optionYear(request.optionYear())
            .description(request.description())
            .status(OptionStatus.PENDING)
            .startDate(request.startDate())
            .endDate(request.endDate())
            .exerciseDeadline(request.exerciseDeadline())
            .optionValue(request.optionValue())
            .durationMonths(request.durationMonths())
            .notes(request.notes())
            .build();

        ContractOption saved = optionRepository.save(option);
        return toOptionDto(saved);
    }

    public List<OptionDto> getOptions(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        return optionRepository.findByContractIdOrderByOptionNumberAsc(contractId)
            .stream()
            .map(this::toOptionDto)
            .toList();
    }

    @Transactional
    public OptionDto exerciseOption(UUID contractId, UUID optionId, String modificationNumber) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        ContractOption option = optionRepository.findByContractIdAndId(contractId, optionId)
            .orElseThrow(() -> new ResourceNotFoundException("Option not found"));

        option.setStatus(OptionStatus.EXERCISED);
        option.setExercisedDate(LocalDate.now());
        option.setExerciseModificationNumber(modificationNumber);

        // Update contract PoP if option has end date
        if (option.getEndDate() != null) {
            contract.setPopEndDate(option.getEndDate());
        }

        // Add option value to contract
        if (option.getOptionValue() != null && contract.getTotalValue() != null) {
            contract.setTotalValue(contract.getTotalValue().add(option.getOptionValue()));
        }

        contractRepository.save(contract);
        ContractOption saved = optionRepository.save(option);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "ContractOption", optionId.toString(),
            "Exercised option: " + option.getOptionNumber());

        return toOptionDto(saved);
    }

    // Deliverable management

    @Transactional
    public DeliverableDto addDeliverable(UUID contractId, CreateDeliverableRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        ContractDeliverable deliverable = ContractDeliverable.builder()
            .contract(contract)
            .cdrlNumber(request.cdrlNumber())
            .title(request.title())
            .description(request.description())
            .deliverableType(request.deliverableType())
            .status(DeliverableStatus.PENDING)
            .dueDate(request.dueDate())
            .frequency(request.frequency())
            .formatRequirements(request.formatRequirements())
            .distributionList(request.distributionList())
            .copiesRequired(request.copiesRequired())
            .notes(request.notes())
            .build();

        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId()).orElse(null);
            deliverable.setOwner(owner);
        }

        if (request.clinId() != null) {
            ContractClin clin = clinRepository.findByContractIdAndId(contractId, request.clinId()).orElse(null);
            deliverable.setClin(clin);
        }

        ContractDeliverable saved = deliverableRepository.save(deliverable);
        return toDeliverableDto(saved);
    }

    public List<DeliverableDto> getDeliverables(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        return deliverableRepository.findByContractIdOrderByDueDateAsc(contractId)
            .stream()
            .map(this::toDeliverableDto)
            .toList();
    }

    @Transactional
    public DeliverableDto updateDeliverableStatus(UUID contractId, UUID deliverableId, DeliverableStatus status) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        ContractDeliverable deliverable = deliverableRepository.findByContractIdAndId(contractId, deliverableId)
            .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found"));

        deliverable.setStatus(status);

        if (status == DeliverableStatus.SUBMITTED) {
            deliverable.setSubmittedDate(LocalDate.now());
        } else if (status == DeliverableStatus.ACCEPTED) {
            deliverable.setAcceptedDate(LocalDate.now());
        }

        ContractDeliverable saved = deliverableRepository.save(deliverable);
        return toDeliverableDto(saved);
    }

    // Analytics

    public ContractSummaryDto getContractSummary(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Contract contract = contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        BigDecimal clinTotalValue = clinRepository.sumTotalValueByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal clinFundedAmount = clinRepository.sumFundedAmountByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal clinInvoicedAmount = clinRepository.sumInvoicedAmountByContractId(contractId).orElse(BigDecimal.ZERO);

        long modificationCount = modificationRepository.countByContractId(contractId);
        long pendingModifications = modificationRepository.countByContractIdAndStatus(contractId, ModificationStatus.PENDING);

        long pendingOptions = optionRepository.countByContractIdAndStatus(contractId, OptionStatus.PENDING);
        BigDecimal pendingOptionValue = optionRepository.sumPendingOptionValueByContractId(contractId).orElse(BigDecimal.ZERO);

        long pendingDeliverables = deliverableRepository.countByContractIdAndStatus(contractId, DeliverableStatus.PENDING);
        long overdueDeliverables = deliverableRepository.countOverdueByContractId(contractId, LocalDate.now());

        return new ContractSummaryDto(
            contractId,
            contract.getContractNumber(),
            contract.getTitle(),
            contract.getStatus(),
            contract.getTotalValue(),
            contract.getFundedValue(),
            clinTotalValue,
            clinFundedAmount,
            clinInvoicedAmount,
            clinFundedAmount.subtract(clinInvoicedAmount),
            modificationCount,
            pendingModifications,
            pendingOptions,
            pendingOptionValue,
            pendingDeliverables,
            overdueDeliverables,
            contract.getPopStartDate(),
            contract.getPopEndDate()
        );
    }

    public List<ContractDto> getExpiringContracts(int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate deadline = LocalDate.now().plusDays(daysAhead);
        return contractRepository.findExpiringContracts(tenantId, deadline)
            .stream()
            .map(this::toDto)
            .toList();
    }

    public List<DeliverableDto> getOverdueDeliverables(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        return deliverableRepository.findOverdue(contractId, LocalDate.now())
            .stream()
            .map(this::toDeliverableDto)
            .toList();
    }

    public List<OptionDto> getApproachingOptionDeadlines(int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate deadline = LocalDate.now().plusDays(daysAhead);
        return optionRepository.findPendingOptionsByTenantWithApproachingDeadlines(tenantId, deadline)
            .stream()
            .map(this::toOptionDto)
            .toList();
    }

    // DTO converters

    private ContractDto toDto(Contract c) {
        return new ContractDto(
            c.getId(),
            c.getContractNumber(),
            c.getTitle(),
            c.getDescription(),
            c.getContractType(),
            c.getStatus(),
            c.getParentContract() != null ? c.getParentContract().getId() : null,
            c.getOpportunity() != null ? c.getOpportunity().getId() : null,
            c.getAgency(),
            c.getAgencyCode(),
            c.getSubAgency(),
            c.getOffice(),
            c.getPopStartDate(),
            c.getPopEndDate(),
            c.getBasePeriodEndDate(),
            c.getFinalOptionEndDate(),
            c.getBaseValue(),
            c.getTotalValue(),
            c.getCeilingValue(),
            c.getFundedValue(),
            c.getNaicsCode(),
            c.getPscCode(),
            c.getPlaceOfPerformanceCity(),
            c.getPlaceOfPerformanceState(),
            c.getPlaceOfPerformanceCountry(),
            c.getContractingOfficerName(),
            c.getContractingOfficerEmail(),
            c.getCorName(),
            c.getCorEmail(),
            c.getPrimeContractor(),
            c.getIsSubcontract(),
            c.getContractVehicle(),
            c.getSetAsideType(),
            c.getRequiresClearance(),
            c.getClearanceLevel(),
            c.getProgramManager() != null ? c.getProgramManager().getId() : null,
            c.getProgramManager() != null ? c.getProgramManager().getFirstName() + " " + c.getProgramManager().getLastName() : null,
            c.getContractManager() != null ? c.getContractManager().getId() : null,
            c.getContractManager() != null ? c.getContractManager().getFirstName() + " " + c.getContractManager().getLastName() : null,
            c.getAwardDate(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }

    private ClinDto toClinDto(ContractClin c) {
        return new ClinDto(
            c.getId(),
            c.getClinNumber(),
            c.getDescription(),
            c.getClinType(),
            c.getPricingType(),
            c.getUnitOfIssue(),
            c.getQuantity(),
            c.getUnitPrice(),
            c.getTotalValue(),
            c.getFundedAmount(),
            c.getObligatedAmount(),
            c.getInvoicedAmount(),
            c.getRemainingFunds(),
            c.getNaicsCode(),
            c.getPscCode(),
            c.getIsOption(),
            c.getOptionPeriod(),
            c.getNotes()
        );
    }

    private ModificationDto toModificationDto(ContractModification m) {
        return new ModificationDto(
            m.getId(),
            m.getModificationNumber(),
            m.getTitle(),
            m.getDescription(),
            m.getModificationType(),
            m.getStatus(),
            m.getEffectiveDate(),
            m.getExecutedDate(),
            m.getValueChange(),
            m.getFundingChange(),
            m.getNewTotalValue(),
            m.getPopExtensionDays(),
            m.getNewPopEndDate(),
            m.getScopeChangeSummary(),
            m.getRequestingOffice(),
            m.getContractingOfficerName(),
            m.getReason(),
            m.getCreatedAt()
        );
    }

    private OptionDto toOptionDto(ContractOption o) {
        return new OptionDto(
            o.getId(),
            o.getOptionNumber(),
            o.getOptionYear(),
            o.getDescription(),
            o.getStatus(),
            o.getStartDate(),
            o.getEndDate(),
            o.getExerciseDeadline(),
            o.getExercisedDate(),
            o.getOptionValue(),
            o.getDurationMonths(),
            o.getExerciseModificationNumber(),
            o.getNotes(),
            o.isExerciseDeadlineApproaching(30)
        );
    }

    private DeliverableDto toDeliverableDto(ContractDeliverable d) {
        return new DeliverableDto(
            d.getId(),
            d.getCdrlNumber(),
            d.getTitle(),
            d.getDescription(),
            d.getDeliverableType(),
            d.getStatus(),
            d.getDueDate(),
            d.getSubmittedDate(),
            d.getAcceptedDate(),
            d.getFrequency(),
            d.getNextDueDate(),
            d.getClin() != null ? d.getClin().getId() : null,
            d.getClin() != null ? d.getClin().getClinNumber() : null,
            d.getOwner() != null ? d.getOwner().getId() : null,
            d.getOwner() != null ? d.getOwner().getFirstName() + " " + d.getOwner().getLastName() : null,
            d.getReviewerName(),
            d.getReviewComments(),
            d.getFormatRequirements(),
            d.getNotes(),
            d.isOverdue(),
            d.isDueSoon(7)
        );
    }

    // Request/Response DTOs

    public record CreateContractRequest(
        String contractNumber,
        String title,
        String description,
        ContractType contractType,
        UUID parentContractId,
        String opportunityId,
        String agency,
        String agencyCode,
        String subAgency,
        String office,
        LocalDate popStartDate,
        LocalDate popEndDate,
        LocalDate basePeriodEndDate,
        LocalDate finalOptionEndDate,
        BigDecimal baseValue,
        BigDecimal totalValue,
        BigDecimal ceilingValue,
        BigDecimal fundedValue,
        String naicsCode,
        String pscCode,
        String placeOfPerformanceCity,
        String placeOfPerformanceState,
        String placeOfPerformanceCountry,
        String contractingOfficerName,
        String contractingOfficerEmail,
        String contractingOfficerPhone,
        String corName,
        String corEmail,
        String corPhone,
        String primeContractor,
        Boolean isSubcontract,
        String contractVehicle,
        String setAsideType,
        BigDecimal smallBusinessGoalPercentage,
        Boolean requiresClearance,
        String clearanceLevel,
        UUID programManagerId,
        UUID contractManagerId,
        LocalDate awardDate,
        String internalNotes
    ) {}

    public record UpdateContractRequest(
        String title,
        String description,
        ContractStatus status,
        String agency,
        LocalDate popStartDate,
        LocalDate popEndDate,
        BigDecimal totalValue,
        BigDecimal fundedValue,
        String contractingOfficerName,
        String contractingOfficerEmail,
        String corName,
        String corEmail,
        UUID programManagerId,
        UUID contractManagerId,
        String internalNotes
    ) {}

    public record CreateClinRequest(
        String clinNumber,
        String description,
        ContractClin.ClinType clinType,
        ContractClin.PricingType pricingType,
        String unitOfIssue,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal totalValue,
        BigDecimal fundedAmount,
        String naicsCode,
        String pscCode,
        Boolean isOption,
        Integer optionPeriod,
        String notes
    ) {}

    public record UpdateClinRequest(
        String description,
        BigDecimal totalValue,
        BigDecimal fundedAmount,
        BigDecimal invoicedAmount,
        String notes
    ) {}

    public record CreateModificationRequest(
        String modificationNumber,
        String title,
        String description,
        ModificationType modificationType,
        LocalDate effectiveDate,
        BigDecimal valueChange,
        BigDecimal fundingChange,
        BigDecimal newTotalValue,
        Integer popExtensionDays,
        LocalDate newPopEndDate,
        String scopeChangeSummary,
        String requestingOffice,
        String contractingOfficerName,
        String reason,
        String internalNotes
    ) {}

    public record CreateOptionRequest(
        Integer optionNumber,
        Integer optionYear,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate exerciseDeadline,
        BigDecimal optionValue,
        Integer durationMonths,
        String notes
    ) {}

    public record CreateDeliverableRequest(
        String cdrlNumber,
        String title,
        String description,
        ContractDeliverable.DeliverableType deliverableType,
        LocalDate dueDate,
        ContractDeliverable.DeliverableFrequency frequency,
        UUID clinId,
        UUID ownerId,
        String formatRequirements,
        String distributionList,
        Integer copiesRequired,
        String notes
    ) {}

    public record ContractDto(
        UUID id,
        String contractNumber,
        String title,
        String description,
        ContractType contractType,
        ContractStatus status,
        UUID parentContractId,
        String opportunityId,
        String agency,
        String agencyCode,
        String subAgency,
        String office,
        LocalDate popStartDate,
        LocalDate popEndDate,
        LocalDate basePeriodEndDate,
        LocalDate finalOptionEndDate,
        BigDecimal baseValue,
        BigDecimal totalValue,
        BigDecimal ceilingValue,
        BigDecimal fundedValue,
        String naicsCode,
        String pscCode,
        String placeOfPerformanceCity,
        String placeOfPerformanceState,
        String placeOfPerformanceCountry,
        String contractingOfficerName,
        String contractingOfficerEmail,
        String corName,
        String corEmail,
        String primeContractor,
        Boolean isSubcontract,
        String contractVehicle,
        String setAsideType,
        Boolean requiresClearance,
        String clearanceLevel,
        UUID programManagerId,
        String programManagerName,
        UUID contractManagerId,
        String contractManagerName,
        LocalDate awardDate,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ClinDto(
        UUID id,
        String clinNumber,
        String description,
        ContractClin.ClinType clinType,
        ContractClin.PricingType pricingType,
        String unitOfIssue,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal totalValue,
        BigDecimal fundedAmount,
        BigDecimal obligatedAmount,
        BigDecimal invoicedAmount,
        BigDecimal remainingFunds,
        String naicsCode,
        String pscCode,
        Boolean isOption,
        Integer optionPeriod,
        String notes
    ) {}

    public record ModificationDto(
        UUID id,
        String modificationNumber,
        String title,
        String description,
        ModificationType modificationType,
        ModificationStatus status,
        LocalDate effectiveDate,
        LocalDate executedDate,
        BigDecimal valueChange,
        BigDecimal fundingChange,
        BigDecimal newTotalValue,
        Integer popExtensionDays,
        LocalDate newPopEndDate,
        String scopeChangeSummary,
        String requestingOffice,
        String contractingOfficerName,
        String reason,
        Instant createdAt
    ) {}

    public record OptionDto(
        UUID id,
        Integer optionNumber,
        Integer optionYear,
        String description,
        OptionStatus status,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate exerciseDeadline,
        LocalDate exercisedDate,
        BigDecimal optionValue,
        Integer durationMonths,
        String exerciseModificationNumber,
        String notes,
        Boolean isDeadlineApproaching
    ) {}

    public record DeliverableDto(
        UUID id,
        String cdrlNumber,
        String title,
        String description,
        ContractDeliverable.DeliverableType deliverableType,
        DeliverableStatus status,
        LocalDate dueDate,
        LocalDate submittedDate,
        LocalDate acceptedDate,
        ContractDeliverable.DeliverableFrequency frequency,
        LocalDate nextDueDate,
        UUID clinId,
        String clinNumber,
        UUID ownerId,
        String ownerName,
        String reviewerName,
        String reviewComments,
        String formatRequirements,
        String notes,
        Boolean isOverdue,
        Boolean isDueSoon
    ) {}

    public record ContractSummaryDto(
        UUID contractId,
        String contractNumber,
        String title,
        ContractStatus status,
        BigDecimal totalValue,
        BigDecimal fundedValue,
        BigDecimal clinTotalValue,
        BigDecimal clinFundedAmount,
        BigDecimal clinInvoicedAmount,
        BigDecimal remainingFunds,
        long modificationCount,
        long pendingModifications,
        long pendingOptions,
        BigDecimal pendingOptionValue,
        long pendingDeliverables,
        long overdueDeliverables,
        LocalDate popStartDate,
        LocalDate popEndDate
    ) {}
}
