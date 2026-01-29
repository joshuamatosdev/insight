package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.UpcomingDeadlineDto;
import com.samgov.ingestor.dto.UpcomingDeadlineDto.DeadlineType;
import com.samgov.ingestor.dto.UpcomingDeadlineDto.Priority;
import com.samgov.ingestor.model.ComplianceItem;
import com.samgov.ingestor.model.ContractDeliverable;
import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Milestone;
import com.samgov.ingestor.repository.ComplianceItemRepository;
import com.samgov.ingestor.repository.ContractDeliverableRepository;
import com.samgov.ingestor.repository.InvoiceRepository;
import com.samgov.ingestor.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Service for aggregating upcoming deadlines from multiple sources.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PortalDeadlineService {

    private final ContractDeliverableRepository deliverableRepository;
    private final InvoiceRepository invoiceRepository;
    private final MilestoneRepository milestoneRepository;
    private final ComplianceItemRepository complianceItemRepository;

    /**
     * Get all upcoming deadlines within the specified number of days.
     *
     * @param daysAhead Number of days to look ahead (default 30)
     * @return List of upcoming deadlines sorted by due date ascending
     */
    @Transactional(readOnly = true)
    public List<UpcomingDeadlineDto> getUpcomingDeadlines(int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(daysAhead);

        log.debug("Fetching upcoming deadlines for tenant {} within {} days", tenantId, daysAhead);

        List<UpcomingDeadlineDto> allDeadlines = new ArrayList<>();

        // Aggregate from all sources
        allDeadlines.addAll(getDeliverableDeadlines(tenantId, today, endDate));
        allDeadlines.addAll(getInvoiceDeadlines(tenantId, today, endDate));
        allDeadlines.addAll(getMilestoneDeadlines(tenantId, today, endDate));
        allDeadlines.addAll(getComplianceDeadlines(tenantId, today, endDate));

        // Sort by due date ascending
        allDeadlines.sort(Comparator.comparing(UpcomingDeadlineDto::dueDate));

        log.debug("Found {} upcoming deadlines", allDeadlines.size());
        return allDeadlines;
    }

    private List<UpcomingDeadlineDto> getDeliverableDeadlines(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        return deliverableRepository.findUpcomingByTenantId(tenantId, startDate, endDate)
            .stream()
            .filter(d -> !isDeliverableCompleted(d))
            .map(this::toDeadlineDto)
            .toList();
    }

    private boolean isDeliverableCompleted(ContractDeliverable deliverable) {
        return deliverable.getStatus() == ContractDeliverable.DeliverableStatus.ACCEPTED
            || deliverable.getStatus() == ContractDeliverable.DeliverableStatus.WAIVED;
    }

    private UpcomingDeadlineDto toDeadlineDto(ContractDeliverable deliverable) {
        return new UpcomingDeadlineDto(
            deliverable.getId(),
            deliverable.getTitle(),
            DeadlineType.DELIVERABLE,
            deliverable.getContract().getContractNumber(),
            deliverable.getContract().getId(),
            deliverable.getDueDate(),
            mapDeliverablePriority(deliverable),
            deliverable.getStatus().name()
        );
    }

    private Priority mapDeliverablePriority(ContractDeliverable deliverable) {
        // Map based on days until due and deliverable type
        if (deliverable.getDueDate() == null) {
            return Priority.MEDIUM;
        }
        long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), deliverable.getDueDate());
        if (daysUntil <= 3) {
            return Priority.CRITICAL;
        } else if (daysUntil <= 7) {
            return Priority.HIGH;
        }
        return Priority.MEDIUM;
    }

    private List<UpcomingDeadlineDto> getInvoiceDeadlines(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        return invoiceRepository.findUpcomingByTenantId(tenantId, startDate, endDate)
            .stream()
            .filter(i -> !isInvoiceCompleted(i))
            .map(this::toDeadlineDto)
            .toList();
    }

    private boolean isInvoiceCompleted(Invoice invoice) {
        return invoice.getStatus() == Invoice.InvoiceStatus.PAID
            || invoice.getStatus() == Invoice.InvoiceStatus.CANCELLED;
    }

    private UpcomingDeadlineDto toDeadlineDto(Invoice invoice) {
        return new UpcomingDeadlineDto(
            invoice.getId(),
            "Invoice " + invoice.getInvoiceNumber(),
            DeadlineType.INVOICE,
            invoice.getContract().getContractNumber(),
            invoice.getContract().getId(),
            invoice.getDueDate(),
            mapInvoicePriority(invoice),
            invoice.getStatus().name()
        );
    }

    private Priority mapInvoicePriority(Invoice invoice) {
        if (invoice.getDueDate() == null) {
            return Priority.MEDIUM;
        }
        long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), invoice.getDueDate());
        if (daysUntil <= 3) {
            return Priority.CRITICAL;
        } else if (daysUntil <= 7) {
            return Priority.HIGH;
        }
        return Priority.MEDIUM;
    }

    private List<UpcomingDeadlineDto> getMilestoneDeadlines(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        return milestoneRepository.findUpcomingByTenantId(tenantId, startDate, endDate)
            .stream()
            .filter(m -> !isMilestoneCompleted(m))
            .map(this::toDeadlineDto)
            .toList();
    }

    private boolean isMilestoneCompleted(Milestone milestone) {
        return milestone.getStatus() == Milestone.MilestoneStatus.COMPLETED
            || milestone.getStatus() == Milestone.MilestoneStatus.CANCELLED;
    }

    private UpcomingDeadlineDto toDeadlineDto(Milestone milestone) {
        return new UpcomingDeadlineDto(
            milestone.getId(),
            milestone.getName(),
            DeadlineType.MILESTONE,
            milestone.getContract().getContractNumber(),
            milestone.getContract().getId(),
            milestone.getDueDate(),
            mapMilestonePriority(milestone),
            milestone.getStatus().name()
        );
    }

    private Priority mapMilestonePriority(Milestone milestone) {
        if (milestone.getPriority() == null) {
            return Priority.MEDIUM;
        }
        return switch (milestone.getPriority()) {
            case CRITICAL -> Priority.CRITICAL;
            case HIGH -> Priority.HIGH;
            case LOW -> Priority.LOW;
            default -> Priority.MEDIUM;
        };
    }

    private List<UpcomingDeadlineDto> getComplianceDeadlines(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        return complianceItemRepository.findUpcomingByTenantId(tenantId, startDate, endDate)
            .stream()
            .filter(c -> !isComplianceCompleted(c))
            .map(this::toDeadlineDto)
            .toList();
    }

    private boolean isComplianceCompleted(ComplianceItem item) {
        return item.getStatus() == ComplianceItem.ComplianceStatus.COMPLIANT
            || item.getStatus() == ComplianceItem.ComplianceStatus.NOT_APPLICABLE
            || item.getStatus() == ComplianceItem.ComplianceStatus.WAIVED;
    }

    private UpcomingDeadlineDto toDeadlineDto(ComplianceItem item) {
        String contractNumber = item.getContract() != null
            ? item.getContract().getContractNumber()
            : "N/A";
        UUID contractId = item.getContract() != null
            ? item.getContract().getId()
            : null;

        return new UpcomingDeadlineDto(
            item.getId(),
            item.getTitle(),
            DeadlineType.COMPLIANCE,
            contractNumber,
            contractId,
            item.getDueDate(),
            mapCompliancePriority(item),
            item.getStatus().name()
        );
    }

    private Priority mapCompliancePriority(ComplianceItem item) {
        if (item.getPriority() == null) {
            return Priority.MEDIUM;
        }
        return switch (item.getPriority()) {
            case CRITICAL -> Priority.CRITICAL;
            case HIGH -> Priority.HIGH;
            case LOW -> Priority.LOW;
            default -> Priority.MEDIUM;
        };
    }
}
