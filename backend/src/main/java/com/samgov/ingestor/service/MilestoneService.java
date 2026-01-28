package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.BadRequestException;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.ContractDeliverable;
import com.samgov.ingestor.model.Milestone;
import com.samgov.ingestor.model.Milestone.MilestonePriority;
import com.samgov.ingestor.model.Milestone.MilestoneStatus;
import com.samgov.ingestor.model.Milestone.MilestoneType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractDeliverableRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.MilestoneRepository;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ContractRepository contractRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ContractDeliverableRepository deliverableRepository;
    private final AuditService auditService;

    // CRUD Operations

    public MilestoneDto getMilestone(UUID milestoneId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Milestone milestone = milestoneRepository.findByTenant_IdAndId(tenantId, milestoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));
        return toDto(milestone);
    }

    public List<MilestoneDto> getMilestones(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        verifyContractAccess(tenantId, contractId);

        return milestoneRepository.findByContractIdOrderBySortOrderAsc(contractId)
            .stream()
            .map(this::toDto)
            .toList();
    }

    public Page<MilestoneDto> getMilestonesPaged(UUID contractId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        verifyContractAccess(tenantId, contractId);

        return milestoneRepository.findByContractId(contractId, pageable)
            .map(this::toDto);
    }

    @Transactional
    public MilestoneDto createMilestone(CreateMilestoneRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Contract contract = contractRepository.findByTenantIdAndId(tenantId, request.contractId())
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        Integer maxSort = milestoneRepository.findMaxSortOrderByContractId(request.contractId()).orElse(0);

        Milestone milestone = Milestone.builder()
            .tenant(tenant)
            .contract(contract)
            .name(request.name())
            .description(request.description())
            .status(MilestoneStatus.NOT_STARTED)
            .milestoneType(request.milestoneType())
            .plannedStartDate(request.plannedStartDate())
            .plannedEndDate(request.plannedEndDate())
            .dueDate(request.dueDate())
            .isCriticalPath(request.isCriticalPath() != null ? request.isCriticalPath() : false)
            .paymentAmount(request.paymentAmount())
            .isPaymentMilestone(request.isPaymentMilestone() != null ? request.isPaymentMilestone() : false)
            .priority(request.priority() != null ? request.priority() : MilestonePriority.MEDIUM)
            .sortOrder(request.sortOrder() != null ? request.sortOrder() : maxSort + 1)
            .notes(request.notes())
            .build();

        // Set owner if provided
        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId()).orElse(null);
            milestone.setOwner(owner);
        }

        // Set deliverable if provided
        if (request.deliverableId() != null) {
            ContractDeliverable deliverable = deliverableRepository
                .findByContractIdAndId(request.contractId(), request.deliverableId())
                .orElse(null);
            milestone.setDeliverable(deliverable);
        }

        // Add dependencies if provided
        if (request.dependsOnIds() != null && !request.dependsOnIds().isEmpty()) {
            for (UUID depId : request.dependsOnIds()) {
                Milestone dependency = milestoneRepository.findByContractIdAndId(request.contractId(), depId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dependency milestone not found: " + depId));
                milestone.addDependency(dependency);
            }
        }

        Milestone saved = milestoneRepository.save(milestone);

        auditService.logAction(AuditAction.PIPELINE_CREATED, "Milestone", saved.getId().toString(),
            "Created milestone: " + saved.getName() + " for contract: " + contract.getContractNumber());

        return toDto(saved);
    }

    @Transactional
    public MilestoneDto updateMilestone(UUID milestoneId, UpdateMilestoneRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Milestone milestone = milestoneRepository.findByTenant_IdAndId(tenantId, milestoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));

        if (request.name() != null) milestone.setName(request.name());
        if (request.description() != null) milestone.setDescription(request.description());
        if (request.milestoneType() != null) milestone.setMilestoneType(request.milestoneType());
        if (request.plannedStartDate() != null) milestone.setPlannedStartDate(request.plannedStartDate());
        if (request.plannedEndDate() != null) milestone.setPlannedEndDate(request.plannedEndDate());
        if (request.dueDate() != null) milestone.setDueDate(request.dueDate());
        if (request.actualStartDate() != null) milestone.setActualStartDate(request.actualStartDate());
        if (request.actualEndDate() != null) milestone.setActualEndDate(request.actualEndDate());
        if (request.percentComplete() != null) milestone.setPercentComplete(request.percentComplete());
        if (request.isCriticalPath() != null) milestone.setIsCriticalPath(request.isCriticalPath());
        if (request.paymentAmount() != null) milestone.setPaymentAmount(request.paymentAmount());
        if (request.isPaymentMilestone() != null) milestone.setIsPaymentMilestone(request.isPaymentMilestone());
        if (request.priority() != null) milestone.setPriority(request.priority());
        if (request.sortOrder() != null) milestone.setSortOrder(request.sortOrder());
        if (request.notes() != null) milestone.setNotes(request.notes());

        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId()).orElse(null);
            milestone.setOwner(owner);
        }

        Milestone saved = milestoneRepository.save(milestone);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Milestone", saved.getId().toString(),
            "Updated milestone: " + saved.getName());

        return toDto(saved);
    }

    @Transactional
    public void deleteMilestone(UUID milestoneId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Milestone milestone = milestoneRepository.findByTenant_IdAndId(tenantId, milestoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));

        // Check if any milestones depend on this one
        if (!milestone.getDependents().isEmpty()) {
            throw new BadRequestException("Cannot delete milestone: other milestones depend on it");
        }

        // Remove this milestone from any dependencies it has
        for (Milestone dep : new HashSet<>(milestone.getDependencies())) {
            milestone.removeDependency(dep);
        }

        String milestoneName = milestone.getName();
        milestoneRepository.delete(milestone);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Milestone", milestoneId.toString(),
            "Deleted milestone: " + milestoneName);
    }

    // Status Management

    @Transactional
    public MilestoneDto updateStatus(UUID milestoneId, MilestoneStatus status) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Milestone milestone = milestoneRepository.findByTenant_IdAndId(tenantId, milestoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));

        // Validate status transition
        if (status == MilestoneStatus.IN_PROGRESS && !milestone.canStart()) {
            throw new BadRequestException("Cannot start milestone: dependencies are not completed");
        }

        MilestoneStatus oldStatus = milestone.getStatus();
        milestone.setStatus(status);

        // Set actual dates based on status
        if (status == MilestoneStatus.IN_PROGRESS && milestone.getActualStartDate() == null) {
            milestone.setActualStartDate(LocalDate.now());
        } else if (status == MilestoneStatus.COMPLETED) {
            milestone.setActualEndDate(LocalDate.now());
            milestone.setCompletedDate(LocalDate.now());
            milestone.setPercentComplete(100);
        }

        Milestone saved = milestoneRepository.save(milestone);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Milestone", milestoneId.toString(),
            "Milestone status changed from " + oldStatus + " to " + status + ": " + saved.getName());

        return toDto(saved);
    }

    @Transactional
    public MilestoneDto completeMilestone(UUID milestoneId) {
        return completeMilestone(milestoneId, null);
    }

    @Transactional
    public MilestoneDto completeMilestone(UUID milestoneId, String completionNotes) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Milestone milestone = milestoneRepository.findByTenant_IdAndId(tenantId, milestoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));

        milestone.setStatus(MilestoneStatus.COMPLETED);
        milestone.setCompletedDate(LocalDate.now());
        milestone.setActualEndDate(LocalDate.now());
        milestone.setPercentComplete(100);

        if (completionNotes != null) {
            milestone.setCompletionNotes(completionNotes);
        }

        Milestone saved = milestoneRepository.save(milestone);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Milestone", milestoneId.toString(),
            "Completed milestone: " + saved.getName());

        return toDto(saved);
    }

    // Critical Path and Timeline

    public List<MilestoneDto> getCriticalPath(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        verifyContractAccess(tenantId, contractId);

        return milestoneRepository.findCriticalPathByContractId(contractId)
            .stream()
            .map(this::toDto)
            .toList();
    }

    public List<MilestoneTimelineDto> getMilestoneTimeline(UUID contractId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        verifyContractAccess(tenantId, contractId);

        List<Milestone> milestones = milestoneRepository.findTimelineByContractId(contractId);
        return milestones.stream()
            .map(this::toTimelineDto)
            .toList();
    }

    // Upcoming and Overdue

    public List<MilestoneDto> getUpcomingMilestones(int days) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(days);

        return milestoneRepository.findUpcomingMilestones(tenantId, today, deadline)
            .stream()
            .map(this::toDto)
            .toList();
    }

    public List<MilestoneDto> getOverdueMilestones() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate today = LocalDate.now();

        return milestoneRepository.findOverdueMilestones(tenantId, today)
            .stream()
            .map(this::toDto)
            .toList();
    }

    // Dependency Management

    @Transactional
    public MilestoneDto addDependency(UUID milestoneId, UUID dependsOnId) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        if (milestoneId.equals(dependsOnId)) {
            throw new BadRequestException("A milestone cannot depend on itself");
        }

        Milestone milestone = milestoneRepository.findByTenant_IdAndId(tenantId, milestoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));

        Milestone dependency = milestoneRepository.findByTenant_IdAndId(tenantId, dependsOnId)
            .orElseThrow(() -> new ResourceNotFoundException("Dependency milestone not found"));

        // Verify both milestones belong to the same contract
        if (!milestone.getContract().getId().equals(dependency.getContract().getId())) {
            throw new BadRequestException("Milestones must belong to the same contract");
        }

        // Check for circular dependency
        if (wouldCreateCircularDependency(milestone, dependency)) {
            throw new BadRequestException("Cannot add dependency: would create circular dependency");
        }

        milestone.addDependency(dependency);
        Milestone saved = milestoneRepository.save(milestone);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Milestone", milestoneId.toString(),
            "Added dependency: " + milestone.getName() + " depends on " + dependency.getName());

        return toDto(saved);
    }

    @Transactional
    public MilestoneDto removeDependency(UUID milestoneId, UUID dependsOnId) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        Milestone milestone = milestoneRepository.findByTenant_IdAndId(tenantId, milestoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));

        Milestone dependency = milestoneRepository.findByTenant_IdAndId(tenantId, dependsOnId)
            .orElseThrow(() -> new ResourceNotFoundException("Dependency milestone not found"));

        milestone.removeDependency(dependency);
        Milestone saved = milestoneRepository.save(milestone);

        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Milestone", milestoneId.toString(),
            "Removed dependency: " + milestone.getName() + " no longer depends on " + dependency.getName());

        return toDto(saved);
    }

    // Helper Methods

    private void verifyContractAccess(UUID tenantId, UUID contractId) {
        contractRepository.findByTenantIdAndId(tenantId, contractId)
            .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
    }

    private boolean wouldCreateCircularDependency(Milestone milestone, Milestone newDependency) {
        // Check if the newDependency (directly or indirectly) depends on milestone
        Set<UUID> visited = new HashSet<>();
        return hasPathTo(newDependency, milestone.getId(), visited);
    }

    private boolean hasPathTo(Milestone from, UUID targetId, Set<UUID> visited) {
        if (from.getId().equals(targetId)) {
            return true;
        }
        if (visited.contains(from.getId())) {
            return false;
        }
        visited.add(from.getId());

        for (Milestone dep : from.getDependencies()) {
            if (hasPathTo(dep, targetId, visited)) {
                return true;
            }
        }
        return false;
    }

    // DTO Converters

    private MilestoneDto toDto(Milestone m) {
        return new MilestoneDto(
            m.getId(),
            m.getContract().getId(),
            m.getContract().getContractNumber(),
            m.getName(),
            m.getDescription(),
            m.getStatus(),
            m.getMilestoneType(),
            m.getPlannedStartDate(),
            m.getPlannedEndDate(),
            m.getDueDate(),
            m.getActualStartDate(),
            m.getActualEndDate(),
            m.getCompletedDate(),
            m.getPercentComplete(),
            m.getIsCriticalPath(),
            m.getPaymentAmount(),
            m.getIsPaymentMilestone(),
            m.getOwner() != null ? m.getOwner().getId() : null,
            m.getOwner() != null ? m.getOwner().getFullName() : null,
            m.getPriority(),
            m.getSortOrder(),
            m.getDeliverable() != null ? m.getDeliverable().getId() : null,
            m.getDeliverable() != null ? m.getDeliverable().getTitle() : null,
            m.getDependencies().stream().map(Milestone::getId).collect(Collectors.toSet()),
            m.getDependents().stream().map(Milestone::getId).collect(Collectors.toSet()),
            m.getNotes(),
            m.getCompletionNotes(),
            m.isOverdue(),
            m.isDueSoon(7),
            m.canStart(),
            m.getDaysUntilDue(),
            m.getCreatedAt(),
            m.getUpdatedAt()
        );
    }

    private MilestoneTimelineDto toTimelineDto(Milestone m) {
        List<DependencyDto> dependencyDtos = m.getDependencies().stream()
            .map(d -> new DependencyDto(d.getId(), d.getName(), d.getStatus()))
            .toList();

        return new MilestoneTimelineDto(
            m.getId(),
            m.getName(),
            m.getDescription(),
            m.getStatus(),
            m.getMilestoneType(),
            m.getPlannedStartDate(),
            m.getPlannedEndDate(),
            m.getDueDate(),
            m.getActualStartDate(),
            m.getActualEndDate(),
            m.getCompletedDate(),
            m.getPercentComplete(),
            m.getIsCriticalPath(),
            m.getPriority(),
            dependencyDtos,
            m.isOverdue(),
            m.canStart()
        );
    }

    // Request/Response DTOs

    public record CreateMilestoneRequest(
        UUID contractId,
        String name,
        String description,
        MilestoneType milestoneType,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        LocalDate dueDate,
        Boolean isCriticalPath,
        BigDecimal paymentAmount,
        Boolean isPaymentMilestone,
        UUID ownerId,
        MilestonePriority priority,
        Integer sortOrder,
        UUID deliverableId,
        List<UUID> dependsOnIds,
        String notes
    ) {}

    public record UpdateMilestoneRequest(
        String name,
        String description,
        MilestoneType milestoneType,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        LocalDate dueDate,
        LocalDate actualStartDate,
        LocalDate actualEndDate,
        Integer percentComplete,
        Boolean isCriticalPath,
        BigDecimal paymentAmount,
        Boolean isPaymentMilestone,
        UUID ownerId,
        MilestonePriority priority,
        Integer sortOrder,
        String notes
    ) {}

    public record MilestoneDto(
        UUID id,
        UUID contractId,
        String contractNumber,
        String name,
        String description,
        MilestoneStatus status,
        MilestoneType milestoneType,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        LocalDate dueDate,
        LocalDate actualStartDate,
        LocalDate actualEndDate,
        LocalDate completedDate,
        Integer percentComplete,
        Boolean isCriticalPath,
        BigDecimal paymentAmount,
        Boolean isPaymentMilestone,
        UUID ownerId,
        String ownerName,
        MilestonePriority priority,
        Integer sortOrder,
        UUID deliverableId,
        String deliverableTitle,
        Set<UUID> dependencyIds,
        Set<UUID> dependentIds,
        String notes,
        String completionNotes,
        Boolean isOverdue,
        Boolean isDueSoon,
        Boolean canStart,
        Long daysUntilDue,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record MilestoneTimelineDto(
        UUID id,
        String name,
        String description,
        MilestoneStatus status,
        MilestoneType milestoneType,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        LocalDate dueDate,
        LocalDate actualStartDate,
        LocalDate actualEndDate,
        LocalDate completedDate,
        Integer percentComplete,
        Boolean isCriticalPath,
        MilestonePriority priority,
        List<DependencyDto> dependencies,
        Boolean isOverdue,
        Boolean canStart
    ) {}

    public record DependencyDto(
        UUID id,
        String name,
        MilestoneStatus status
    ) {}

    public record StatusUpdateRequest(
        MilestoneStatus status
    ) {}

    public record CompleteMilestoneRequest(
        String completionNotes
    ) {}
}
