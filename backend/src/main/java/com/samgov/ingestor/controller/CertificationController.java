package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Certification.CertificationStatus;
import com.samgov.ingestor.model.Certification.CertificationType;
import com.samgov.ingestor.service.CertificationService;
import com.samgov.ingestor.service.CertificationService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portal/certifications")
@PreAuthorize("isAuthenticated()")
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @PostMapping
    public ResponseEntity<CertificationResponse> createCertification(
            @Valid @RequestBody CreateCertificationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(certificationService.createCertification(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<CertificationResponse>> getCertifications(
            @RequestParam(required = false) CertificationType type,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (type != null) {
            return ResponseEntity.ok(certificationService.getCertificationsByType(tenantId, type, pageable));
        }
        return ResponseEntity.ok(certificationService.getCertifications(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificationResponse> getCertification(@PathVariable UUID id) {
        return certificationService.getCertification(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<CertificationResponse>> getExpiringCertifications(
            @RequestParam(defaultValue = "30") int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(certificationService.getExpiringCertifications(tenantId, daysAhead));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificationResponse> updateCertification(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCertificationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(certificationService.updateCertification(tenantId, id, userId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam CertificationStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        certificationService.updateStatus(tenantId, id, userId, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertification(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        certificationService.deleteCertification(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/types")
    public ResponseEntity<List<CertificationType>> getCertificationTypes() {
        return ResponseEntity.ok(Arrays.asList(CertificationType.values()));
    }
}
