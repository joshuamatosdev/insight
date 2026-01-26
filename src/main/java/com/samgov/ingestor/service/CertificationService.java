package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Certification.CertificationStatus;
import com.samgov.ingestor.model.Certification.CertificationType;
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
public class CertificationService {

    private final CertificationRepository certificationRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public CertificationService(CertificationRepository certificationRepository,
                                 TenantRepository tenantRepository, AuditService auditService) {
        this.certificationRepository = certificationRepository;
        this.tenantRepository = tenantRepository;
        this.auditService = auditService;
    }

    public record CreateCertificationRequest(CertificationType type, String name, String issuingAuthority,
                                              String certificationNumber, LocalDate issueDate, LocalDate expirationDate,
                                              String documentUrl, String notes) {}

    public record CertificationResponse(UUID id, CertificationType type, String name, String issuingAuthority,
                                         String certificationNumber, LocalDate issueDate, LocalDate expirationDate,
                                         CertificationStatus status, Long daysUntilExpiration, String documentUrl,
                                         String notes, Instant createdAt) {}

    public CertificationResponse createCertification(UUID tenantId, UUID userId, CreateCertificationRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Certification cert = new Certification();
        cert.setTenant(tenant);
        cert.setCertificationType(request.type());
        cert.setName(request.name());
        cert.setIssuingAgency(request.issuingAuthority());
        cert.setCertificateNumber(request.certificationNumber());
        cert.setIssueDate(request.issueDate());
        cert.setExpirationDate(request.expirationDate());
        cert.setDocumentUrl(request.documentUrl());
        cert.setNotes(request.notes());
        cert.setStatus(CertificationStatus.ACTIVE);

        cert = certificationRepository.save(cert);
        auditService.logAction(AuditAction.CERTIFICATION_CREATED, "Certification", cert.getId().toString(),
                "Created certification: " + request.name());

        return toResponse(cert);
    }

    @Transactional(readOnly = true)
    public Page<CertificationResponse> getCertifications(UUID tenantId, Pageable pageable) {
        return certificationRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<CertificationResponse> getCertificationsByType(UUID tenantId, CertificationType type, Pageable pageable) {
        return certificationRepository.findByTenantIdAndCertificationType(tenantId, type, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<CertificationResponse> getExpiringCertifications(UUID tenantId, int daysAhead) {
        LocalDate expiresBy = LocalDate.now().plusDays(daysAhead);
        return certificationRepository.findByTenantIdAndExpirationDateBefore(tenantId, expiresBy)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<CertificationResponse> getCertification(UUID certId) {
        return certificationRepository.findById(certId).map(this::toResponse);
    }

    public CertificationResponse updateCertification(UUID tenantId, UUID certId, UUID userId, CreateCertificationRequest request) {
        Certification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        if (!cert.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Certification does not belong to tenant");
        }

        cert.setCertificationType(request.type());
        cert.setName(request.name());
        cert.setIssuingAgency(request.issuingAuthority());
        cert.setCertificateNumber(request.certificationNumber());
        cert.setIssueDate(request.issueDate());
        cert.setExpirationDate(request.expirationDate());
        cert.setDocumentUrl(request.documentUrl());
        cert.setNotes(request.notes());

        cert = certificationRepository.save(cert);
        auditService.logAction(AuditAction.CERTIFICATION_UPDATED, "Certification", certId.toString(), "Updated certification");

        return toResponse(cert);
    }

    public void updateStatus(UUID tenantId, UUID certId, UUID userId, CertificationStatus status) {
        Certification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        if (!cert.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Certification does not belong to tenant");
        }

        cert.setStatus(status);
        certificationRepository.save(cert);
        auditService.logAction(AuditAction.CERTIFICATION_UPDATED, "Certification", certId.toString(),
                "Updated status to: " + status);
    }

    public void deleteCertification(UUID tenantId, UUID certId, UUID userId) {
        Certification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        if (!cert.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Certification does not belong to tenant");
        }

        certificationRepository.delete(cert);
        auditService.logAction(AuditAction.CERTIFICATION_DELETED, "Certification", certId.toString(),
                "Deleted certification: " + cert.getName());
    }

    private CertificationResponse toResponse(Certification cert) {
        Long daysUntilExpiration = null;
        if (cert.getExpirationDate() != null) {
            daysUntilExpiration = ChronoUnit.DAYS.between(LocalDate.now(), cert.getExpirationDate());
        }

        return new CertificationResponse(cert.getId(), cert.getCertificationType(), cert.getName(), cert.getIssuingAgency(),
                cert.getCertificateNumber(), cert.getIssueDate(), cert.getExpirationDate(),
                cert.getStatus(), daysUntilExpiration, cert.getDocumentUrl(), cert.getNotes(), cert.getCreatedAt());
    }
}
