package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.ContractClin;
import com.samgov.ingestor.model.ContractDeliverable;
import com.samgov.ingestor.model.ScopeChange;
import com.samgov.ingestor.model.ScopeChange.ChangePriority;
import com.samgov.ingestor.model.ScopeChange.ChangeStatus;
import com.samgov.ingestor.model.ScopeChange.ChangeType;
import com.samgov.ingestor.model.ScopeItem;
import com.samgov.ingestor.model.ScopeItem.ScopeItemType;
import com.samgov.ingestor.model.ScopeItem.ScopeStatus;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractClinRepository;
import com.samgov.ingestor.repository.ContractDeliverableRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.ScopeChangeRepository;
import com.samgov.ingestor.repository.ScopeItemRepository;
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
public class ScopeService {

    private final ScopeItemRepository scopeItemRepository;
    private final ScopeChangeRepository scopeChangeRepository;
    private final ContractRepository contractRepository;
    private final ContractClinRepository clinRepository;
    private final ContractDeliverableRepository deliverableRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    // ==================== Scope Items ====================

    public List<ScopeItemDto> getScopeItems(UUID contractId) {
        verifyContractAccess(contractId);
        return scopeItemRepository.findByContractIdOrderBySortOrderAsc(contractId)
            .stream()
            .map(this::toScopeItemDto)
            .toList();
    }

    public Page<ScopeItemDto> getScopeItems(UUID contractId, Pageable pageable) {
        verifyContractAccess(contractId);
        return scopeItemRepository.findByContractId(contractId, pageable)
            .map(this::toScopeItemDto);
    }

    public ScopeItemDto getScopeItem(UUID id) {
        ScopeItem item = scopeItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Scope item", id));
        verifyContractAccess(item.getContract().getId());
        return toScopeItemDtoWithChildren(item);
    }

    public List<ScopeItemDto> getRootItems(UUID contractId) {
        verifyContractAccess(contractId);
        return scopeItemRepository.findRootItemsByContractId(contractId)
            .stream()
            .map(this::toScopeItemDto)
            .toList();
    }

    public List<ScopeItemDto> getChildren(UUID parentId) {
        ScopeItem parent = scopeItemRepository.findById(parentId)
            .orElseThrow(() -> new ResourceNotFoundException("Scope item", parentId));
        verifyContractAccess(parent.getContract().getId());
        return scopeItemRepository.findByParentIdOrderBySortOrderAsc(parentId)
            .stream()
            .map(this::toScopeItemDto)
            .toList();
    }

    @Transactional
    public ScopeItemDto createScopeItem(CreateScopeItemRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Contract contract = contractRepository.findByTenantIdAndId(tenantId, request.contractId())
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (scopeItemRepository.existsByContractIdAndWbsCode(request.contractId(), request.wbsCode())) {
            throw new IllegalArgumentException("WBS code already exists: " + request.wbsCode());
        }

        Integer maxSort;
        if (request.parentId() != null) {
            maxSort = scopeItemRepository.findMaxSortOrderByParentId(request.parentId()).orElse(0);
        } else {
            maxSort = scopeItemRepository.findMaxSortOrderByContractIdAndParentNull(request.contractId()).orElse(0);
        }

        ScopeItem item = ScopeItem.builder()
            .tenant(tenant)
            .contract(contract)
            .wbsCode(request.wbsCode())
            .name(request.title())
            .description(request.description())
            .itemType(request.itemType())
            .status(ScopeStatus.NOT_STARTED)
            .sortOrder(maxSort + 1)
            .priority(request.priority())
            .estimatedHours(request.estimatedHours())
            .estimatedCost(request.estimatedCost())
            .plannedStartDate(request.plannedStartDate())
            .plannedEndDate(request.plannedEndDate())
            .acceptanceCriteria(request.acceptanceCriteria())
            .laborCategory(request.laborCategory())
            .notes(request.notes())
            .isBillable(request.isBillable() != null ? request.isBillable() : true)
            .isMilestone(request.isMilestone() != null ? request.isMilestone() : false)
            .build();

        // Set parent
        if (request.parentId() != null) {
            ScopeItem parent = scopeItemRepository.findByContractIdAndId(request.contractId(), request.parentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent scope item not found"));
            item.setParent(parent);
        }

        // Set assignee
        if (request.assignedToId() != null) {
            User assignee = userRepository.findById(request.assignedToId()).orElse(null);
            item.setAssignedTo(assignee);
        }

        // Set owner
        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId()).orElse(null);
            item.setOwner(owner);
        }

        // Set CLIN
        if (request.clinId() != null) {
            ContractClin clin = clinRepository.findByContractIdAndId(request.contractId(), request.clinId()).orElse(null);
            item.setClin(clin);
        }

        // Set deliverable
        if (request.deliverableId() != null) {
            ContractDeliverable deliverable = deliverableRepository.findByContractIdAndId(request.contractId(), request.deliverableId()).orElse(null);
            item.setDeliverable(deliverable);
        }

        ScopeItem saved = scopeItemRepository.save(item);

        auditService.logAction(AuditAction.PIPELINE_CREATED, "ScopeItem", saved.getId().toString(),
            "Created scope item: " + saved.getWbsCode() + " - " + saved.getName());

        return toScopeItemDto(saved);
    }

    @Transactional
    public ScopeItemDto updateScopeItem(UUID id, UpdateScopeItemRequest request) {
        ScopeItem item = scopeItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Scope item", id));
        verifyContractAccess(item.getContract().getId());

        if (request.title() != null) item.setName(request.title());
        if (request.description() != null) item.setDescription(request.description());
        if (request.itemType() != null) item.setItemType(request.itemType());
        if (request.priority() != null) item.setPriority(request.priority());
        if (request.estimatedHours() != null) item.setEstimatedHours(request.estimatedHours());
        if (request.actualHours() != null) item.setActualHours(request.actualHours());
        if (request.remainingHours() != null) item.setRemainingHours(request.remainingHours());
        if (request.estimatedCost() != null) item.setEstimatedCost(request.estimatedCost());
        if (request.actualCost() != null) item.setActualCost(request.actualCost());
        if (request.percentComplete() != null) item.setPercentComplete(request.percentComplete());
        if (request.plannedStartDate() != null) item.setPlannedStartDate(request.plannedStartDate());
        if (request.plannedEndDate() != null) item.setPlannedEndDate(request.plannedEndDate());
        if (request.actualStartDate() != null) item.setActualStartDate(request.actualStartDate());
        if (request.actualEndDate() != null) item.setActualEndDate(request.actualEndDate());
        if (request.acceptanceCriteria() != null) item.setAcceptanceCriteria(request.acceptanceCriteria());
        if (request.laborCategory() != null) item.setLaborCategory(request.laborCategory());
        if (request.notes() != null) item.setNotes(request.notes());
        if (request.isBillable() != null) item.setIsBillable(request.isBillable());
        if (request.isMilestone() != null) item.setIsMilestone(request.isMilestone());

        if (request.assignedToId() != null) {
            User assignee = userRepository.findById(request.assignedToId()).orElse(null);
            item.setAssignedTo(assignee);
        }

        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId()).orElse(null);
            item.setOwner(owner);
        }

        if (request.clinId() != null) {
            ContractClin clin = clinRepository.findByContractIdAndId(item.getContract().getId(), request.clinId()).orElse(null);
            item.setClin(clin);
        }

        if (request.deliverableId() != null) {
            ContractDeliverable deliverable = deliverableRepository.findByContractIdAndId(item.getContract().getId(), request.deliverableId()).orElse(null);
            item.setDeliverable(deliverable);
        }

        ScopeItem saved = scopeItemRepository.save(item);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "ScopeItem", saved.getId().toString(),
            "Updated scope item: " + saved.getWbsCode());

        return toScopeItemDto(saved);
    }

    @Transactional
    public void deleteScopeItem(UUID id) {
        ScopeItem item = scopeItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Scope item", id));
        verifyContractAccess(item.getContract().getId());

        String wbsCode = item.getWbsCode();
        scopeItemRepository.delete(item);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "ScopeItem", id.toString(),
            "Deleted scope item: " + wbsCode);
    }

    @Transactional
    public ScopeItemDto updateStatus(UUID id, ScopeStatus status) {
        ScopeItem item = scopeItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Scope item", id));
        verifyContractAccess(item.getContract().getId());

        ScopeStatus oldStatus = item.getStatus();
        item.setStatus(status);

        // Auto-update dates based on status
        if (status == ScopeStatus.IN_PROGRESS && item.getActualStartDate() == null) {
            item.setActualStartDate(LocalDate.now());
        } else if (status == ScopeStatus.COMPLETED && item.getActualEndDate() == null) {
            item.setActualEndDate(LocalDate.now());
            item.setPercentComplete(100);
        }

        ScopeItem saved = scopeItemRepository.save(item);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "ScopeItem", id.toString(),
            "Status changed from " + oldStatus + " to " + status);

        return toScopeItemDto(saved);
    }

    public ScopeSummaryDto getScopeSummary(UUID contractId) {
        verifyContractAccess(contractId);

        BigDecimal totalEstimatedHours = scopeItemRepository.sumEstimatedHoursByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal totalActualHours = scopeItemRepository.sumActualHoursByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal totalRemainingHours = scopeItemRepository.sumRemainingHoursByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal totalEstimatedCost = scopeItemRepository.sumEstimatedCostByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal totalActualCost = scopeItemRepository.sumActualCostByContractId(contractId).orElse(BigDecimal.ZERO);

        long totalItems = scopeItemRepository.countByContractId(contractId);
        long completedItems = scopeItemRepository.countByContractIdAndStatus(contractId, ScopeStatus.COMPLETED);
        long inProgressItems = scopeItemRepository.countByContractIdAndStatus(contractId, ScopeStatus.IN_PROGRESS);
        long notStartedItems = scopeItemRepository.countByContractIdAndStatus(contractId, ScopeStatus.NOT_STARTED);
        long overdueItems = scopeItemRepository.countOverdueByContractId(contractId, LocalDate.now());

        long pendingChanges = scopeChangeRepository.countPendingByContractId(contractId);
        BigDecimal pendingHoursImpact = scopeChangeRepository.sumPendingHoursImpactByContractId(contractId).orElse(BigDecimal.ZERO);
        BigDecimal approvedHoursImpact = scopeChangeRepository.sumApprovedHoursImpactByContractId(contractId).orElse(BigDecimal.ZERO);

        return new ScopeSummaryDto(
            contractId,
            totalItems,
            completedItems,
            inProgressItems,
            notStartedItems,
            overdueItems,
            totalEstimatedHours,
            totalActualHours,
            totalRemainingHours,
            totalEstimatedCost,
            totalActualCost,
            totalActualHours.subtract(totalEstimatedHours),
            totalActualCost.subtract(totalEstimatedCost),
            pendingChanges,
            pendingHoursImpact,
            approvedHoursImpact
        );
    }

    public List<ScopeTreeNodeDto> getWbsTree(UUID contractId) {
        verifyContractAccess(contractId);
        List<ScopeItem> rootItems = scopeItemRepository.findRootItemsByContractId(contractId);
        return rootItems.stream()
            .map(this::buildTreeNode)
            .toList();
    }

    private ScopeTreeNodeDto buildTreeNode(ScopeItem item) {
        List<ScopeTreeNodeDto> childNodes = item.getChildren().stream()
            .sorted((a, b) -> {
                Integer orderA = a.getSortOrder() != null ? a.getSortOrder() : 0;
                Integer orderB = b.getSortOrder() != null ? b.getSortOrder() : 0;
                return orderA.compareTo(orderB);
            })
            .map(this::buildTreeNode)
            .toList();

        return new ScopeTreeNodeDto(
            item.getId(),
            item.getWbsCode(),
            item.getName(),
            item.getDescription(),
            item.getItemType(),
            item.getStatus(),
            item.getEstimatedHours(),
            item.getActualHours(),
            item.getPercentComplete(),
            item.getPlannedStartDate(),
            item.getPlannedEndDate(),
            item.getAssignedTo() != null ? item.getAssignedTo().getFirstName() + " " + item.getAssignedTo().getLastName() : null,
            item.isOverdue(),
            item.isBehindSchedule(),
            item.getIsMilestone(),
            childNodes
        );
    }

    // ==================== Scope Changes ====================

    public List<ScopeChangeDto> getScopeChanges(UUID contractId, ChangeStatus status) {
        verifyContractAccess(contractId);
        List<ScopeChange> changes;
        if (status != null) {
            changes = scopeChangeRepository.findByContractIdAndStatus(contractId, status);
        } else {
            changes = scopeChangeRepository.findByContractIdOrderByCreatedAtDesc(contractId);
        }
        return changes.stream().map(this::toScopeChangeDto).toList();
    }

    public Page<ScopeChangeDto> getScopeChanges(UUID contractId, ChangeStatus status, Pageable pageable) {
        verifyContractAccess(contractId);
        Page<ScopeChange> changes;
        if (status != null) {
            changes = scopeChangeRepository.findByContractIdAndStatus(contractId, status, pageable);
        } else {
            changes = scopeChangeRepository.findByContractId(contractId, pageable);
        }
        return changes.map(this::toScopeChangeDto);
    }

    public ScopeChangeDto getScopeChange(UUID id) {
        ScopeChange change = scopeChangeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Scope change", id));
        verifyContractAccess(change.getContract().getId());
        return toScopeChangeDto(change);
    }

    @Transactional
    public ScopeChangeDto requestChange(CreateScopeChangeRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        Contract contract = contractRepository.findByTenantIdAndId(tenantId, request.contractId())
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        // Generate change number
        String maxChangeNumber = scopeChangeRepository.findMaxChangeNumberByContractId(request.contractId()).orElse("SCR-000");
        int nextNumber = Integer.parseInt(maxChangeNumber.replace("SCR-", "")) + 1;
        String changeNumber = String.format("SCR-%03d", nextNumber);

        ScopeChange change = ScopeChange.builder()
            .contract(contract)
            .changeNumber(changeNumber)
            .title(request.title())
            .description(request.description())
            .changeType(request.changeType())
            .status(ChangeStatus.PENDING_APPROVAL)
            .priority(request.priority())
            .hoursImpact(request.hoursImpact())
            .costImpact(request.costImpact())
            .scheduleImpactDays(request.scheduleImpactDays())
            .impactAnalysis(request.impactAnalysis())
            .justification(request.justification())
            .businessCase(request.businessCase())
            .previousEstimatedHours(request.previousEstimatedHours())
            .newEstimatedHours(request.newEstimatedHours())
            .previousEstimatedCost(request.previousEstimatedCost())
            .newEstimatedCost(request.newEstimatedCost())
            .previousEndDate(request.previousEndDate())
            .newEndDate(request.newEndDate())
            .requestedDate(LocalDate.now())
            .requestorName(request.requestorName())
            .requestorEmail(request.requestorEmail())
            .externalReference(request.externalReference())
            .internalNotes(request.internalNotes())
            .build();

        // Set scope item if provided
        if (request.scopeItemId() != null) {
            ScopeItem scopeItem = scopeItemRepository.findByContractIdAndId(request.contractId(), request.scopeItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found"));
            change.setScopeItem(scopeItem);
        }

        // Set requestor
        if (userId != null) {
            User requestor = userRepository.findById(userId).orElse(null);
            change.setRequestedBy(requestor);
        }

        ScopeChange saved = scopeChangeRepository.save(change);

        auditService.logAction(AuditAction.PIPELINE_CREATED, "ScopeChange", saved.getId().toString(),
            "Created scope change request: " + saved.getChangeNumber() + " - " + saved.getTitle());

        return toScopeChangeDto(saved);
    }

    @Transactional
    public ScopeChangeDto approveChange(UUID id, String comments) {
        UUID userId = TenantContext.getCurrentUserId();

        ScopeChange change = scopeChangeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Scope change", id));
        verifyContractAccess(change.getContract().getId());

        if (!change.isPending()) {
            throw new IllegalStateException("Scope change is not pending approval");
        }

        change.setStatus(ChangeStatus.APPROVED);
        change.setApprovedDate(LocalDate.now());
        change.setApprovalComments(comments);

        if (userId != null) {
            User approver = userRepository.findById(userId).orElse(null);
            change.setApprovedBy(approver);
        }

        ScopeChange saved = scopeChangeRepository.save(change);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "ScopeChange", id.toString(),
            "Approved scope change: " + change.getChangeNumber());

        return toScopeChangeDto(saved);
    }

    @Transactional
    public ScopeChangeDto rejectChange(UUID id, String reason) {
        UUID userId = TenantContext.getCurrentUserId();

        ScopeChange change = scopeChangeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Scope change", id));
        verifyContractAccess(change.getContract().getId());

        if (!change.isPending()) {
            throw new IllegalStateException("Scope change is not pending approval");
        }

        change.setStatus(ChangeStatus.REJECTED);
        change.setRejectionReason(reason);
        change.setReviewedDate(LocalDate.now());

        if (userId != null) {
            User reviewer = userRepository.findById(userId).orElse(null);
            change.setReviewedBy(reviewer);
        }

        ScopeChange saved = scopeChangeRepository.save(change);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "ScopeChange", id.toString(),
            "Rejected scope change: " + change.getChangeNumber());

        return toScopeChangeDto(saved);
    }

    public List<ScopeChangeDto> getPendingChanges() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return scopeChangeRepository.findPendingChangesByTenantId(tenantId)
            .stream()
            .map(this::toScopeChangeDto)
            .toList();
    }

    public Page<ScopeChangeDto> getPendingChanges(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return scopeChangeRepository.findPendingChangesByTenantId(tenantId, pageable)
            .map(this::toScopeChangeDto);
    }

    // ==================== Helper Methods ====================

    private void verifyContractAccess(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
    }

    private ScopeItemDto toScopeItemDto(ScopeItem s) {
        return new ScopeItemDto(
            s.getId(),
            s.getContract().getId(),
            s.getParent() != null ? s.getParent().getId() : null,
            s.getWbsCode(),
            s.getName(),
            s.getDescription(),
            s.getItemType(),
            s.getStatus(),
            s.getSortOrder(),
            s.getPriority(),
            s.getEstimatedHours(),
            s.getActualHours(),
            s.getRemainingHours(),
            s.getEstimatedCost(),
            s.getActualCost(),
            s.getPercentComplete(),
            s.getPlannedStartDate(),
            s.getPlannedEndDate(),
            s.getActualStartDate(),
            s.getActualEndDate(),
            s.getAssignedTo() != null ? s.getAssignedTo().getId() : null,
            s.getAssignedTo() != null ? s.getAssignedTo().getFirstName() + " " + s.getAssignedTo().getLastName() : null,
            s.getOwner() != null ? s.getOwner().getId() : null,
            s.getOwner() != null ? s.getOwner().getFirstName() + " " + s.getOwner().getLastName() : null,
            s.getClin() != null ? s.getClin().getId() : null,
            s.getClin() != null ? s.getClin().getClinNumber() : null,
            s.getDeliverable() != null ? s.getDeliverable().getId() : null,
            s.getDeliverable() != null ? s.getDeliverable().getTitle() : null,
            s.getAcceptanceCriteria(),
            s.getLaborCategory(),
            s.getNotes(),
            s.getIsBillable(),
            s.getIsMilestone(),
            s.isOverdue(),
            s.isBehindSchedule(),
            s.isOverBudget(),
            s.getLevel(),
            s.getChildren() != null ? (long) s.getChildren().size() : 0L,
            s.getCreatedAt(),
            s.getUpdatedAt()
        );
    }

    private ScopeItemDto toScopeItemDtoWithChildren(ScopeItem s) {
        ScopeItemDto dto = toScopeItemDto(s);
        // Children are lazy loaded, so this will fetch them
        return dto;
    }

    private ScopeChangeDto toScopeChangeDto(ScopeChange c) {
        return new ScopeChangeDto(
            c.getId(),
            c.getContract().getId(),
            c.getScopeItem() != null ? c.getScopeItem().getId() : null,
            c.getScopeItem() != null ? c.getScopeItem().getWbsCode() : null,
            c.getScopeItem() != null ? c.getScopeItem().getName() : null,
            c.getChangeNumber(),
            c.getTitle(),
            c.getDescription(),
            c.getChangeType(),
            c.getStatus(),
            c.getPriority(),
            c.getHoursImpact(),
            c.getCostImpact(),
            c.getScheduleImpactDays(),
            c.getImpactAnalysis(),
            c.getJustification(),
            c.getBusinessCase(),
            c.getPreviousEstimatedHours(),
            c.getNewEstimatedHours(),
            c.getPreviousEstimatedCost(),
            c.getNewEstimatedCost(),
            c.getPreviousEndDate(),
            c.getNewEndDate(),
            c.getRequestedBy() != null ? c.getRequestedBy().getId() : null,
            c.getRequestedBy() != null ? c.getRequestedBy().getFirstName() + " " + c.getRequestedBy().getLastName() : null,
            c.getRequestedDate(),
            c.getRequestorName(),
            c.getRequestorEmail(),
            c.getReviewedBy() != null ? c.getReviewedBy().getId() : null,
            c.getReviewedBy() != null ? c.getReviewedBy().getFirstName() + " " + c.getReviewedBy().getLastName() : null,
            c.getReviewedDate(),
            c.getReviewComments(),
            c.getApprovedBy() != null ? c.getApprovedBy().getId() : null,
            c.getApprovedBy() != null ? c.getApprovedBy().getFirstName() + " " + c.getApprovedBy().getLastName() : null,
            c.getApprovedDate(),
            c.getApprovalComments(),
            c.getRejectionReason(),
            c.getImplementationDate(),
            c.getImplementationNotes(),
            c.getExternalReference(),
            c.getInternalNotes(),
            c.isPending(),
            c.isApproved(),
            c.hasImpact(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }

    // ==================== Request/Response DTOs ====================

    public record CreateScopeItemRequest(
        UUID contractId,
        UUID parentId,
        String wbsCode,
        String title,
        String description,
        ScopeItemType itemType,
        Integer priority,
        BigDecimal estimatedHours,
        BigDecimal estimatedCost,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        UUID assignedToId,
        UUID ownerId,
        UUID clinId,
        UUID deliverableId,
        String acceptanceCriteria,
        String laborCategory,
        String notes,
        Boolean isBillable,
        Boolean isMilestone
    ) {}

    public record UpdateScopeItemRequest(
        String title,
        String description,
        ScopeItemType itemType,
        Integer priority,
        BigDecimal estimatedHours,
        BigDecimal actualHours,
        BigDecimal remainingHours,
        BigDecimal estimatedCost,
        BigDecimal actualCost,
        Integer percentComplete,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        LocalDate actualStartDate,
        LocalDate actualEndDate,
        UUID assignedToId,
        UUID ownerId,
        UUID clinId,
        UUID deliverableId,
        String acceptanceCriteria,
        String laborCategory,
        String notes,
        Boolean isBillable,
        Boolean isMilestone
    ) {}

    public record CreateScopeChangeRequest(
        UUID contractId,
        UUID scopeItemId,
        String title,
        String description,
        ChangeType changeType,
        ChangePriority priority,
        BigDecimal hoursImpact,
        BigDecimal costImpact,
        Integer scheduleImpactDays,
        String impactAnalysis,
        String justification,
        String businessCase,
        BigDecimal previousEstimatedHours,
        BigDecimal newEstimatedHours,
        BigDecimal previousEstimatedCost,
        BigDecimal newEstimatedCost,
        LocalDate previousEndDate,
        LocalDate newEndDate,
        String requestorName,
        String requestorEmail,
        String externalReference,
        String internalNotes
    ) {}

    public record ScopeItemDto(
        UUID id,
        UUID contractId,
        UUID parentId,
        String wbsCode,
        String title,
        String description,
        ScopeItemType itemType,
        ScopeStatus status,
        Integer sortOrder,
        Integer priority,
        BigDecimal estimatedHours,
        BigDecimal actualHours,
        BigDecimal remainingHours,
        BigDecimal estimatedCost,
        BigDecimal actualCost,
        Integer percentComplete,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        LocalDate actualStartDate,
        LocalDate actualEndDate,
        UUID assignedToId,
        String assignedToName,
        UUID ownerId,
        String ownerName,
        UUID clinId,
        String clinNumber,
        UUID deliverableId,
        String deliverableTitle,
        String acceptanceCriteria,
        String laborCategory,
        String notes,
        Boolean isBillable,
        Boolean isMilestone,
        Boolean isOverdue,
        Boolean isBehindSchedule,
        Boolean isOverBudget,
        Integer level,
        Long childCount,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ScopeChangeDto(
        UUID id,
        UUID contractId,
        UUID scopeItemId,
        String scopeItemWbsCode,
        String scopeItemTitle,
        String changeNumber,
        String title,
        String description,
        ChangeType changeType,
        ChangeStatus status,
        ChangePriority priority,
        BigDecimal hoursImpact,
        BigDecimal costImpact,
        Integer scheduleImpactDays,
        String impactAnalysis,
        String justification,
        String businessCase,
        BigDecimal previousEstimatedHours,
        BigDecimal newEstimatedHours,
        BigDecimal previousEstimatedCost,
        BigDecimal newEstimatedCost,
        LocalDate previousEndDate,
        LocalDate newEndDate,
        UUID requestedById,
        String requestedByName,
        LocalDate requestedDate,
        String requestorName,
        String requestorEmail,
        UUID reviewedById,
        String reviewedByName,
        LocalDate reviewedDate,
        String reviewComments,
        UUID approvedById,
        String approvedByName,
        LocalDate approvedDate,
        String approvalComments,
        String rejectionReason,
        LocalDate implementationDate,
        String implementationNotes,
        String externalReference,
        String internalNotes,
        Boolean isPending,
        Boolean isApproved,
        Boolean hasImpact,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ScopeSummaryDto(
        UUID contractId,
        long totalItems,
        long completedItems,
        long inProgressItems,
        long notStartedItems,
        long overdueItems,
        BigDecimal totalEstimatedHours,
        BigDecimal totalActualHours,
        BigDecimal totalRemainingHours,
        BigDecimal totalEstimatedCost,
        BigDecimal totalActualCost,
        BigDecimal hoursVariance,
        BigDecimal costVariance,
        long pendingChanges,
        BigDecimal pendingHoursImpact,
        BigDecimal approvedHoursImpact
    ) {}

    public record ScopeTreeNodeDto(
        UUID id,
        String wbsCode,
        String title,
        String description,
        ScopeItemType itemType,
        ScopeStatus status,
        BigDecimal estimatedHours,
        BigDecimal actualHours,
        Integer percentComplete,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        String assignedToName,
        Boolean isOverdue,
        Boolean isBehindSchedule,
        Boolean isMilestone,
        List<ScopeTreeNodeDto> children
    ) {}
}
