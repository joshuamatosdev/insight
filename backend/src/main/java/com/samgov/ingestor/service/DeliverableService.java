package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableFrequency;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableStatus;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableType;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class DeliverableService {

    private final ContractDeliverableRepository deliverableRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DeliverableService(ContractDeliverableRepository deliverableRepository,
                               ContractRepository contractRepository, UserRepository userRepository,
                               AuditService auditService) {
        this.deliverableRepository = deliverableRepository;
        this.contractRepository = contractRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public record CreateDeliverableRequest(UUID contractId, String cdrlNumber, String title, String description,
                                            DeliverableType deliverableType, DeliverableFrequency frequency,
                                            LocalDate dueDate, LocalDate submittedDate, LocalDate acceptedDate,
                                            UUID ownerId, String notes) {}

    public record DeliverableResponse(UUID id, UUID contractId, String contractNumber, String cdrlNumber,
                                       String title, String description, DeliverableType deliverableType,
                                       DeliverableFrequency frequency, LocalDate dueDate, LocalDate submittedDate,
                                       LocalDate acceptedDate, DeliverableStatus status, Long daysUntilDue,
                                       Double progressPercentage, UUID ownerId, String ownerName, String notes,
                                       Instant createdAt) {}

    public DeliverableResponse createDeliverable(UUID tenantId, UUID userId, CreateDeliverableRequest request) {
        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));

        if (!contract.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Contract does not belong to tenant");
        }

        ContractDeliverable deliverable = new ContractDeliverable();
        deliverable.setContract(contract);
        deliverable.setCdrlNumber(request.cdrlNumber());
        deliverable.setTitle(request.title());
        deliverable.setDescription(request.description());
        deliverable.setDeliverableType(request.deliverableType());
        deliverable.setFrequency(request.frequency());
        deliverable.setDueDate(request.dueDate());
        deliverable.setSubmittedDate(request.submittedDate());
        deliverable.setAcceptedDate(request.acceptedDate());
        deliverable.setNotes(request.notes());
        deliverable.setStatus(DeliverableStatus.PENDING);

        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId())
                    .orElseThrow(() -> new IllegalArgumentException("Owner not found"));
            deliverable.setOwner(owner);
        }

        deliverable = deliverableRepository.save(deliverable);
        auditService.logAction(AuditAction.DELIVERABLE_CREATED, "ContractDeliverable", deliverable.getId().toString(),
                "Created deliverable: " + request.title());

        return toResponse(deliverable);
    }

    @Transactional(readOnly = true)
    public Page<DeliverableResponse> getDeliverables(UUID tenantId, Pageable pageable) {
        return deliverableRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DeliverableResponse> getDeliverablesByContract(UUID contractId, Pageable pageable) {
        return deliverableRepository.findByContractId(contractId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DeliverableResponse> getDeliverablesByStatus(UUID contractId, DeliverableStatus status, Pageable pageable) {
        return deliverableRepository.findByContractIdAndStatus(contractId, status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<DeliverableResponse> getUpcomingDeliverables(UUID contractId, int daysAhead) {
        LocalDate dueBy = LocalDate.now().plusDays(daysAhead);
        return deliverableRepository.findByContractIdAndDueDateBeforeAndStatusNot(contractId, dueBy, DeliverableStatus.ACCEPTED)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DeliverableResponse> getOverdueDeliverables(UUID contractId) {
        return deliverableRepository.findByContractIdAndDueDateBeforeAndStatusNotIn(contractId, LocalDate.now(),
                        List.of(DeliverableStatus.ACCEPTED, DeliverableStatus.SUBMITTED, DeliverableStatus.WAIVED))
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<DeliverableResponse> getDeliverable(UUID deliverableId) {
        return deliverableRepository.findById(deliverableId).map(this::toResponse);
    }

    public DeliverableResponse updateDeliverable(UUID tenantId, UUID deliverableId, UUID userId, CreateDeliverableRequest request) {
        ContractDeliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new IllegalArgumentException("Deliverable not found"));

        if (!deliverable.getContract().getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Deliverable does not belong to tenant");
        }

        deliverable.setCdrlNumber(request.cdrlNumber());
        deliverable.setTitle(request.title());
        deliverable.setDescription(request.description());
        deliverable.setDeliverableType(request.deliverableType());
        deliverable.setFrequency(request.frequency());
        deliverable.setDueDate(request.dueDate());
        deliverable.setSubmittedDate(request.submittedDate());
        deliverable.setAcceptedDate(request.acceptedDate());
        deliverable.setNotes(request.notes());

        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId())
                    .orElseThrow(() -> new IllegalArgumentException("Owner not found"));
            deliverable.setOwner(owner);
        } else {
            deliverable.setOwner(null);
        }

        deliverable = deliverableRepository.save(deliverable);
        auditService.logAction(AuditAction.DELIVERABLE_CREATED, "ContractDeliverable", deliverableId.toString(), "Updated deliverable");

        return toResponse(deliverable);
    }

    public void updateStatus(UUID tenantId, UUID deliverableId, UUID userId, DeliverableStatus status) {
        ContractDeliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new IllegalArgumentException("Deliverable not found"));

        if (!deliverable.getContract().getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Deliverable does not belong to tenant");
        }

        deliverable.setStatus(status);
        if (status == DeliverableStatus.SUBMITTED && deliverable.getSubmittedDate() == null) {
            deliverable.setSubmittedDate(LocalDate.now());
        }
        if (status == DeliverableStatus.ACCEPTED && deliverable.getAcceptedDate() == null) {
            deliverable.setAcceptedDate(LocalDate.now());
        }

        deliverableRepository.save(deliverable);
        auditService.logAction(AuditAction.DELIVERABLE_COMPLETED, "ContractDeliverable", deliverableId.toString(),
                "Updated status to: " + status);
    }

    public void deleteDeliverable(UUID tenantId, UUID deliverableId, UUID userId) {
        ContractDeliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new IllegalArgumentException("Deliverable not found"));

        if (!deliverable.getContract().getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Deliverable does not belong to tenant");
        }

        deliverableRepository.delete(deliverable);
        auditService.logAction(AuditAction.DELIVERABLE_CREATED, "ContractDeliverable", deliverableId.toString(),
                "Deleted deliverable: " + deliverable.getTitle());
    }

    private DeliverableResponse toResponse(ContractDeliverable deliverable) {
        Long daysUntilDue = null;
        if (deliverable.getDueDate() != null) {
            daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), deliverable.getDueDate());
        }

        // Calculate progress percentage based on status
        Double progressPercentage = switch (deliverable.getStatus()) {
            case PENDING -> 0.0;
            case IN_PROGRESS -> 50.0;
            case SUBMITTED -> 75.0;
            case UNDER_REVIEW -> 80.0;
            case REVISION_REQUIRED -> 60.0;
            case ACCEPTED -> 100.0;
            case REJECTED -> 0.0;
            case WAIVED -> 100.0;
        };

        String ownerName = deliverable.getOwner() != null ?
                deliverable.getOwner().getFirstName() + " " + deliverable.getOwner().getLastName() : null;
        UUID ownerId = deliverable.getOwner() != null ? deliverable.getOwner().getId() : null;

        return new DeliverableResponse(deliverable.getId(), deliverable.getContract().getId(),
                deliverable.getContract().getContractNumber(), deliverable.getCdrlNumber(),
                deliverable.getTitle(), deliverable.getDescription(), deliverable.getDeliverableType(),
                deliverable.getFrequency(), deliverable.getDueDate(), deliverable.getSubmittedDate(),
                deliverable.getAcceptedDate(), deliverable.getStatus(), daysUntilDue, progressPercentage,
                ownerId, ownerName, deliverable.getNotes(), deliverable.getCreatedAt());
    }
}
