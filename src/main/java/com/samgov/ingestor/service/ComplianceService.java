package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Certification;
import com.samgov.ingestor.model.Certification.CertificationStatus;
import com.samgov.ingestor.model.Certification.CertificationType;
import com.samgov.ingestor.model.ComplianceItem;
import com.samgov.ingestor.model.ComplianceItem.ComplianceFrequency;
import com.samgov.ingestor.model.ComplianceItem.CompliancePriority;
import com.samgov.ingestor.model.ComplianceItem.ComplianceStatus;
import com.samgov.ingestor.model.ComplianceItem.ComplianceType;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.SecurityClearance;
import com.samgov.ingestor.model.SecurityClearance.ClearanceLevel;
import com.samgov.ingestor.model.SecurityClearance.ClearanceStatus;
import com.samgov.ingestor.model.SecurityClearance.ClearanceType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.CertificationRepository;
import com.samgov.ingestor.repository.ComplianceItemRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.SecurityClearanceRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplianceService {

    private final CertificationRepository certificationRepository;
    private final SecurityClearanceRepository clearanceRepository;
    private final ComplianceItemRepository complianceItemRepository;
    private final ContractRepository contractRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    // Certification management

    @Transactional
    public CertificationDto createCertification(CreateCertificationRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Certification cert = Certification.builder()
            .tenant(tenant)
            .certificationType(request.certificationType())
            .name(request.name())
            .description(request.description())
            .status(CertificationStatus.ACTIVE)
            .certificateNumber(request.certificateNumber())
            .issuingAgency(request.issuingAgency())
            .issueDate(request.issueDate())
            .expirationDate(request.expirationDate())
            .renewalDate(request.renewalDate())
            .naicsCode(request.naicsCode())
            .sizeStandard(request.sizeStandard())
            .uei(request.uei())
            .cageCode(request.cageCode())
            .samRegistrationDate(request.samRegistrationDate())
            .samExpirationDate(request.samExpirationDate())
            .eightAEntryDate(request.eightAEntryDate())
            .eightAGraduationDate(request.eightAGraduationDate())
            .hubzoneCertificationDate(request.hubzoneCertificationDate())
            .documentUrl(request.documentUrl())
            .notes(request.notes())
            .reminderDaysBefore(request.reminderDaysBefore() != null ? request.reminderDaysBefore() : 90)
            .build();

        Certification saved = certificationRepository.save(cert);
        return toCertificationDto(saved);
    }

    public CertificationDto getCertification(UUID certId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Certification cert = certificationRepository.findByTenantIdAndId(tenantId, certId)
            .orElseThrow(() -> new ResourceNotFoundException("Certification not found"));
        return toCertificationDto(cert);
    }

    public Page<CertificationDto> getCertifications(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return certificationRepository.findByTenantId(tenantId, pageable).map(this::toCertificationDto);
    }

    public List<CertificationDto> getActiveCertifications() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return certificationRepository.findActiveCertifications(tenantId)
            .stream()
            .map(this::toCertificationDto)
            .toList();
    }

    public List<CertificationDto> getExpiringCertifications(int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(daysAhead);
        return certificationRepository.findExpiringCertifications(tenantId, today, deadline)
            .stream()
            .map(this::toCertificationDto)
            .toList();
    }

    public List<CertificationDto> getSmallBusinessCertifications() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return certificationRepository.findActiveSmallBusinessCertifications(tenantId)
            .stream()
            .map(this::toCertificationDto)
            .toList();
    }

    @Transactional
    public CertificationDto updateCertification(UUID certId, UpdateCertificationRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Certification cert = certificationRepository.findByTenantIdAndId(tenantId, certId)
            .orElseThrow(() -> new ResourceNotFoundException("Certification not found"));

        if (request.name() != null) cert.setName(request.name());
        if (request.description() != null) cert.setDescription(request.description());
        if (request.status() != null) cert.setStatus(request.status());
        if (request.expirationDate() != null) cert.setExpirationDate(request.expirationDate());
        if (request.renewalDate() != null) cert.setRenewalDate(request.renewalDate());
        if (request.documentUrl() != null) cert.setDocumentUrl(request.documentUrl());
        if (request.notes() != null) cert.setNotes(request.notes());

        Certification saved = certificationRepository.save(cert);
        return toCertificationDto(saved);
    }

    // Security Clearance management

    @Transactional
    public ClearanceDto createClearance(CreateClearanceRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        SecurityClearance clearance = SecurityClearance.builder()
            .tenant(tenant)
            .entityName(request.entityName())
            .clearanceType(request.clearanceType())
            .clearanceLevel(request.clearanceLevel())
            .status(ClearanceStatus.ACTIVE)
            .investigationDate(request.investigationDate())
            .grantDate(request.grantDate())
            .expirationDate(request.expirationDate())
            .reinvestigationDate(request.reinvestigationDate())
            .polygraphType(request.polygraphType())
            .polygraphDate(request.polygraphDate())
            .sponsoringAgency(request.sponsoringAgency())
            .caseNumber(request.caseNumber())
            .cageCode(request.cageCode())
            .facilityAddress(request.facilityAddress())
            .fsoName(request.fsoName())
            .fsoEmail(request.fsoEmail())
            .fsoPhone(request.fsoPhone())
            .sciAccess(request.sciAccess() != null ? request.sciAccess() : false)
            .sciPrograms(request.sciPrograms())
            .sapAccess(request.sapAccess() != null ? request.sapAccess() : false)
            .notes(request.notes())
            .build();

        if (request.userId() != null) {
            User user = userRepository.findById(request.userId()).orElse(null);
            clearance.setUser(user);
        }

        SecurityClearance saved = clearanceRepository.save(clearance);
        return toClearanceDto(saved);
    }

    public ClearanceDto getClearance(UUID clearanceId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        SecurityClearance clearance = clearanceRepository.findByTenantIdAndId(tenantId, clearanceId)
            .orElseThrow(() -> new ResourceNotFoundException("Clearance not found"));
        return toClearanceDto(clearance);
    }

    public Page<ClearanceDto> getClearances(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return clearanceRepository.findByTenantId(tenantId, pageable).map(this::toClearanceDto);
    }

    public List<ClearanceDto> getActiveClearances() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return clearanceRepository.findActiveClearances(tenantId)
            .stream()
            .map(this::toClearanceDto)
            .toList();
    }

    public List<ClearanceDto> getActivePersonnelClearances() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return clearanceRepository.findActivePersonnelClearances(tenantId)
            .stream()
            .map(this::toClearanceDto)
            .toList();
    }

    public ClearanceDto getFacilityClearance() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        SecurityClearance clearance = clearanceRepository.findActiveFacilityClearance(tenantId)
            .orElse(null);
        return clearance != null ? toClearanceDto(clearance) : null;
    }

    public List<ClearanceDto> getExpiringClearances(int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(daysAhead);
        return clearanceRepository.findExpiringClearances(tenantId, today, deadline)
            .stream()
            .map(this::toClearanceDto)
            .toList();
    }

    @Transactional
    public ClearanceDto updateClearance(UUID clearanceId, UpdateClearanceRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        SecurityClearance clearance = clearanceRepository.findByTenantIdAndId(tenantId, clearanceId)
            .orElseThrow(() -> new ResourceNotFoundException("Clearance not found"));

        if (request.status() != null) clearance.setStatus(request.status());
        if (request.expirationDate() != null) clearance.setExpirationDate(request.expirationDate());
        if (request.reinvestigationDate() != null) clearance.setReinvestigationDate(request.reinvestigationDate());
        if (request.polygraphType() != null) clearance.setPolygraphType(request.polygraphType());
        if (request.polygraphDate() != null) clearance.setPolygraphDate(request.polygraphDate());
        if (request.sciAccess() != null) clearance.setSciAccess(request.sciAccess());
        if (request.sciPrograms() != null) clearance.setSciPrograms(request.sciPrograms());
        if (request.notes() != null) clearance.setNotes(request.notes());

        SecurityClearance saved = clearanceRepository.save(clearance);
        return toClearanceDto(saved);
    }

    // Compliance Item management

    @Transactional
    public ComplianceItemDto createComplianceItem(CreateComplianceItemRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        ComplianceItem item = ComplianceItem.builder()
            .tenant(tenant)
            .complianceType(request.complianceType())
            .title(request.title())
            .description(request.description())
            .status(ComplianceStatus.PENDING)
            .priority(request.priority() != null ? request.priority() : CompliancePriority.MEDIUM)
            .dueDate(request.dueDate())
            .frequency(request.frequency())
            .clauseNumber(request.clauseNumber())
            .clauseTitle(request.clauseTitle())
            .evidenceRequired(request.evidenceRequired() != null ? request.evidenceRequired() : false)
            .verificationMethod(request.verificationMethod())
            .notes(request.notes())
            .build();

        if (request.contractId() != null) {
            Contract contract = contractRepository.findByTenantIdAndId(tenantId, request.contractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
            item.setContract(contract);
        }

        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId()).orElse(null);
            item.setOwner(owner);
        }

        ComplianceItem saved = complianceItemRepository.save(item);
        return toComplianceItemDto(saved);
    }

    public ComplianceItemDto getComplianceItem(UUID itemId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        ComplianceItem item = complianceItemRepository.findByTenantIdAndId(tenantId, itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Compliance item not found"));
        return toComplianceItemDto(item);
    }

    public Page<ComplianceItemDto> getComplianceItems(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return complianceItemRepository.findByTenantId(tenantId, pageable).map(this::toComplianceItemDto);
    }

    public List<ComplianceItemDto> getPendingComplianceItems() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return complianceItemRepository.findPendingItems(tenantId)
            .stream()
            .map(this::toComplianceItemDto)
            .toList();
    }

    public List<ComplianceItemDto> getOverdueComplianceItems() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return complianceItemRepository.findOverdue(tenantId, LocalDate.now())
            .stream()
            .map(this::toComplianceItemDto)
            .toList();
    }

    public List<ComplianceItemDto> getNonCompliantItems() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return complianceItemRepository.findNonCompliantItems(tenantId)
            .stream()
            .map(this::toComplianceItemDto)
            .toList();
    }

    public List<ComplianceItemDto> getComplianceItemsByContract(UUID contractId) {
        return complianceItemRepository.findByContractId(contractId)
            .stream()
            .map(this::toComplianceItemDto)
            .toList();
    }

    @Transactional
    public ComplianceItemDto updateComplianceItemStatus(UUID itemId, ComplianceStatus status, String notes) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        ComplianceItem item = complianceItemRepository.findByTenantIdAndId(tenantId, itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Compliance item not found"));

        item.setStatus(status);
        if (status == ComplianceStatus.COMPLIANT) {
            item.setCompletedDate(LocalDate.now());
        }
        if (notes != null) {
            item.setNotes(notes);
        }

        ComplianceItem saved = complianceItemRepository.save(item);
        return toComplianceItemDto(saved);
    }

    @Transactional
    public ComplianceItemDto updateComplianceItem(UUID itemId, UpdateComplianceItemRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        ComplianceItem item = complianceItemRepository.findByTenantIdAndId(tenantId, itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Compliance item not found"));

        if (request.title() != null) item.setTitle(request.title());
        if (request.description() != null) item.setDescription(request.description());
        if (request.status() != null) item.setStatus(request.status());
        if (request.priority() != null) item.setPriority(request.priority());
        if (request.dueDate() != null) item.setDueDate(request.dueDate());
        if (request.evidenceUrl() != null) item.setEvidenceUrl(request.evidenceUrl());
        if (request.evidenceNotes() != null) item.setEvidenceNotes(request.evidenceNotes());
        if (request.remediationPlan() != null) item.setRemediationPlan(request.remediationPlan());
        if (request.remediationDeadline() != null) item.setRemediationDeadline(request.remediationDeadline());
        if (request.notes() != null) item.setNotes(request.notes());

        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId()).orElse(null);
            item.setOwner(owner);
        }

        ComplianceItem saved = complianceItemRepository.save(item);
        return toComplianceItemDto(saved);
    }

    // Dashboard/Summary

    public ComplianceSummaryDto getComplianceSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        LocalDate today = LocalDate.now();

        // Certifications
        long activeCertifications = certificationRepository.countByTenantIdAndStatus(tenantId, CertificationStatus.ACTIVE);
        List<CertificationDto> expiringCerts = certificationRepository.findExpiringCertifications(tenantId, today, today.plusDays(90))
            .stream()
            .map(this::toCertificationDto)
            .toList();

        // Clearances
        long activePersonnelClearances = clearanceRepository.countActivePersonnelClearances(tenantId);
        List<ClearanceDto> expiringClearances = clearanceRepository.findExpiringClearances(tenantId, today, today.plusDays(90))
            .stream()
            .map(this::toClearanceDto)
            .toList();

        // Compliance items
        long compliantItems = complianceItemRepository.countByTenantIdAndStatus(tenantId, ComplianceStatus.COMPLIANT);
        long nonCompliantItems = complianceItemRepository.countByTenantIdAndStatus(tenantId, ComplianceStatus.NON_COMPLIANT);
        long overdueItems = complianceItemRepository.countOverdueByTenantId(tenantId, today);
        List<ComplianceItemDto> upcomingItems = complianceItemRepository.findDueSoon(tenantId, today, today.plusDays(30))
            .stream()
            .map(this::toComplianceItemDto)
            .toList();

        return new ComplianceSummaryDto(
            activeCertifications,
            expiringCerts,
            activePersonnelClearances,
            expiringClearances,
            compliantItems,
            nonCompliantItems,
            overdueItems,
            upcomingItems
        );
    }

    // DTO converters

    private CertificationDto toCertificationDto(Certification c) {
        return new CertificationDto(
            c.getId(),
            c.getCertificationType(),
            c.getName(),
            c.getDescription(),
            c.getStatus(),
            c.getCertificateNumber(),
            c.getIssuingAgency(),
            c.getIssueDate(),
            c.getExpirationDate(),
            c.getRenewalDate(),
            c.getNaicsCode(),
            c.getSizeStandard(),
            c.getUei(),
            c.getCageCode(),
            c.getSamRegistrationDate(),
            c.getSamExpirationDate(),
            c.getEightAEntryDate(),
            c.getEightAGraduationDate(),
            c.getHubzoneCertificationDate(),
            c.getDocumentUrl(),
            c.getNotes(),
            c.getDaysUntilExpiration(),
            c.isExpiringSoon(90),
            c.isExpired(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }

    private ClearanceDto toClearanceDto(SecurityClearance s) {
        return new ClearanceDto(
            s.getId(),
            s.getUser() != null ? s.getUser().getId() : null,
            s.getUser() != null ? s.getUser().getFirstName() + " " + s.getUser().getLastName() : null,
            s.getEntityName(),
            s.getClearanceType(),
            s.getClearanceLevel(),
            s.getStatus(),
            s.getInvestigationDate(),
            s.getGrantDate(),
            s.getExpirationDate(),
            s.getReinvestigationDate(),
            s.getPolygraphType(),
            s.getPolygraphDate(),
            s.getSponsoringAgency(),
            s.getCaseNumber(),
            s.getCageCode(),
            s.getFacilityAddress(),
            s.getFsoName(),
            s.getFsoEmail(),
            s.getFsoPhone(),
            s.getSciAccess(),
            s.getSciPrograms(),
            s.getSapAccess(),
            s.getNotes(),
            s.isExpiringSoon(90),
            s.needsReinvestigation(90),
            s.getCreatedAt(),
            s.getUpdatedAt()
        );
    }

    private ComplianceItemDto toComplianceItemDto(ComplianceItem c) {
        return new ComplianceItemDto(
            c.getId(),
            c.getContract() != null ? c.getContract().getId() : null,
            c.getContract() != null ? c.getContract().getContractNumber() : null,
            c.getComplianceType(),
            c.getTitle(),
            c.getDescription(),
            c.getStatus(),
            c.getPriority(),
            c.getDueDate(),
            c.getCompletedDate(),
            c.getLastReviewDate(),
            c.getNextReviewDate(),
            c.getFrequency(),
            c.getClauseNumber(),
            c.getClauseTitle(),
            c.getOwner() != null ? c.getOwner().getId() : null,
            c.getOwner() != null ? c.getOwner().getFirstName() + " " + c.getOwner().getLastName() : null,
            c.getEvidenceRequired(),
            c.getEvidenceUrl(),
            c.getEvidenceNotes(),
            c.getVerificationMethod(),
            c.getVerifiedBy(),
            c.getVerificationDate(),
            c.getRemediationPlan(),
            c.getRemediationDeadline(),
            c.getNotes(),
            c.isOverdue(),
            c.isDueSoon(7),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }

    // Request/Response DTOs

    public record CreateCertificationRequest(
        CertificationType certificationType,
        String name,
        String description,
        String certificateNumber,
        String issuingAgency,
        LocalDate issueDate,
        LocalDate expirationDate,
        LocalDate renewalDate,
        String naicsCode,
        String sizeStandard,
        String uei,
        String cageCode,
        LocalDate samRegistrationDate,
        LocalDate samExpirationDate,
        LocalDate eightAEntryDate,
        LocalDate eightAGraduationDate,
        LocalDate hubzoneCertificationDate,
        String documentUrl,
        String notes,
        Integer reminderDaysBefore
    ) {}

    public record UpdateCertificationRequest(
        String name,
        String description,
        CertificationStatus status,
        LocalDate expirationDate,
        LocalDate renewalDate,
        String documentUrl,
        String notes
    ) {}

    public record CreateClearanceRequest(
        UUID userId,
        String entityName,
        ClearanceType clearanceType,
        ClearanceLevel clearanceLevel,
        LocalDate investigationDate,
        LocalDate grantDate,
        LocalDate expirationDate,
        LocalDate reinvestigationDate,
        String polygraphType,
        LocalDate polygraphDate,
        String sponsoringAgency,
        String caseNumber,
        String cageCode,
        String facilityAddress,
        String fsoName,
        String fsoEmail,
        String fsoPhone,
        Boolean sciAccess,
        String sciPrograms,
        Boolean sapAccess,
        String notes
    ) {}

    public record UpdateClearanceRequest(
        ClearanceStatus status,
        LocalDate expirationDate,
        LocalDate reinvestigationDate,
        String polygraphType,
        LocalDate polygraphDate,
        Boolean sciAccess,
        String sciPrograms,
        String notes
    ) {}

    public record CreateComplianceItemRequest(
        UUID contractId,
        ComplianceType complianceType,
        String title,
        String description,
        CompliancePriority priority,
        LocalDate dueDate,
        ComplianceFrequency frequency,
        String clauseNumber,
        String clauseTitle,
        UUID ownerId,
        Boolean evidenceRequired,
        String verificationMethod,
        String notes
    ) {}

    public record UpdateComplianceItemRequest(
        String title,
        String description,
        ComplianceStatus status,
        CompliancePriority priority,
        LocalDate dueDate,
        UUID ownerId,
        String evidenceUrl,
        String evidenceNotes,
        String remediationPlan,
        LocalDate remediationDeadline,
        String notes
    ) {}

    public record CertificationDto(
        UUID id,
        CertificationType certificationType,
        String name,
        String description,
        CertificationStatus status,
        String certificateNumber,
        String issuingAgency,
        LocalDate issueDate,
        LocalDate expirationDate,
        LocalDate renewalDate,
        String naicsCode,
        String sizeStandard,
        String uei,
        String cageCode,
        LocalDate samRegistrationDate,
        LocalDate samExpirationDate,
        LocalDate eightAEntryDate,
        LocalDate eightAGraduationDate,
        LocalDate hubzoneCertificationDate,
        String documentUrl,
        String notes,
        Long daysUntilExpiration,
        Boolean isExpiringSoon,
        Boolean isExpired,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ClearanceDto(
        UUID id,
        UUID userId,
        String userName,
        String entityName,
        ClearanceType clearanceType,
        ClearanceLevel clearanceLevel,
        ClearanceStatus status,
        LocalDate investigationDate,
        LocalDate grantDate,
        LocalDate expirationDate,
        LocalDate reinvestigationDate,
        String polygraphType,
        LocalDate polygraphDate,
        String sponsoringAgency,
        String caseNumber,
        String cageCode,
        String facilityAddress,
        String fsoName,
        String fsoEmail,
        String fsoPhone,
        Boolean sciAccess,
        String sciPrograms,
        Boolean sapAccess,
        String notes,
        Boolean isExpiringSoon,
        Boolean needsReinvestigation,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ComplianceItemDto(
        UUID id,
        UUID contractId,
        String contractNumber,
        ComplianceType complianceType,
        String title,
        String description,
        ComplianceStatus status,
        CompliancePriority priority,
        LocalDate dueDate,
        LocalDate completedDate,
        LocalDate lastReviewDate,
        LocalDate nextReviewDate,
        ComplianceFrequency frequency,
        String clauseNumber,
        String clauseTitle,
        UUID ownerId,
        String ownerName,
        Boolean evidenceRequired,
        String evidenceUrl,
        String evidenceNotes,
        String verificationMethod,
        String verifiedBy,
        LocalDate verificationDate,
        String remediationPlan,
        LocalDate remediationDeadline,
        String notes,
        Boolean isOverdue,
        Boolean isDueSoon,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ComplianceSummaryDto(
        long activeCertifications,
        List<CertificationDto> expiringCertifications,
        long activePersonnelClearances,
        List<ClearanceDto> expiringClearances,
        long compliantItems,
        long nonCompliantItems,
        long overdueItems,
        List<ComplianceItemDto> upcomingItems
    ) {}
}
