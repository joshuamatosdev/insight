package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.ComplianceItem.ComplianceStatus;
import com.samgov.ingestor.service.ComplianceService;
import com.samgov.ingestor.service.ComplianceService.CertificationDto;
import com.samgov.ingestor.service.ComplianceService.ClearanceDto;
import com.samgov.ingestor.service.ComplianceService.ComplianceItemDto;
import com.samgov.ingestor.service.ComplianceService.ComplianceSummaryDto;
import com.samgov.ingestor.service.ComplianceService.CreateCertificationRequest;
import com.samgov.ingestor.service.ComplianceService.CreateClearanceRequest;
import com.samgov.ingestor.service.ComplianceService.CreateComplianceItemRequest;
import com.samgov.ingestor.service.ComplianceService.UpdateCertificationRequest;
import com.samgov.ingestor.service.ComplianceService.UpdateClearanceRequest;
import com.samgov.ingestor.service.ComplianceService.UpdateComplianceItemRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/compliance")
@RequiredArgsConstructor
public class ComplianceController {

    private final ComplianceService complianceService;

    // Summary/Dashboard

    @GetMapping("/summary")
    public ResponseEntity<ComplianceSummaryDto> getComplianceSummary() {
        ComplianceSummaryDto summary = complianceService.getComplianceSummary();
        return ResponseEntity.ok(summary);
    }

    // Certification endpoints

    @PostMapping("/certifications")
    @PreAuthorize("@tenantSecurityService.hasPermission('COMPLIANCE_CREATE')")
    public ResponseEntity<CertificationDto> createCertification(
        @Valid @RequestBody CreateCertificationRequest request
    ) {
        log.info("Creating certification: {}", request.name());
        CertificationDto cert = complianceService.createCertification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cert);
    }

    @GetMapping("/certifications")
    public ResponseEntity<Page<CertificationDto>> getCertifications(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "expirationDate") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CertificationDto> certs = complianceService.getCertifications(pageable);
        return ResponseEntity.ok(certs);
    }

    @GetMapping("/certifications/active")
    public ResponseEntity<List<CertificationDto>> getActiveCertifications() {
        List<CertificationDto> certs = complianceService.getActiveCertifications();
        return ResponseEntity.ok(certs);
    }

    @GetMapping("/certifications/expiring")
    public ResponseEntity<List<CertificationDto>> getExpiringCertifications(
        @RequestParam(defaultValue = "90") int daysAhead
    ) {
        List<CertificationDto> certs = complianceService.getExpiringCertifications(daysAhead);
        return ResponseEntity.ok(certs);
    }

    @GetMapping("/certifications/small-business")
    public ResponseEntity<List<CertificationDto>> getSmallBusinessCertifications() {
        List<CertificationDto> certs = complianceService.getSmallBusinessCertifications();
        return ResponseEntity.ok(certs);
    }

    @GetMapping("/certifications/{certId}")
    public ResponseEntity<CertificationDto> getCertification(@PathVariable UUID certId) {
        CertificationDto cert = complianceService.getCertification(certId);
        return ResponseEntity.ok(cert);
    }

    @PutMapping("/certifications/{certId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('COMPLIANCE_UPDATE')")
    public ResponseEntity<CertificationDto> updateCertification(
        @PathVariable UUID certId,
        @Valid @RequestBody UpdateCertificationRequest request
    ) {
        CertificationDto cert = complianceService.updateCertification(certId, request);
        return ResponseEntity.ok(cert);
    }

    // Security Clearance endpoints

    @PostMapping("/clearances")
    @PreAuthorize("@tenantSecurityService.hasPermission('COMPLIANCE_CREATE')")
    public ResponseEntity<ClearanceDto> createClearance(
        @Valid @RequestBody CreateClearanceRequest request
    ) {
        log.info("Creating clearance: {} - {}", request.clearanceType(), request.clearanceLevel());
        ClearanceDto clearance = complianceService.createClearance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(clearance);
    }

    @GetMapping("/clearances")
    public ResponseEntity<Page<ClearanceDto>> getClearances(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "expirationDate") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ClearanceDto> clearances = complianceService.getClearances(pageable);
        return ResponseEntity.ok(clearances);
    }

    @GetMapping("/clearances/active")
    public ResponseEntity<List<ClearanceDto>> getActiveClearances() {
        List<ClearanceDto> clearances = complianceService.getActiveClearances();
        return ResponseEntity.ok(clearances);
    }

    @GetMapping("/clearances/personnel")
    public ResponseEntity<List<ClearanceDto>> getActivePersonnelClearances() {
        List<ClearanceDto> clearances = complianceService.getActivePersonnelClearances();
        return ResponseEntity.ok(clearances);
    }

    @GetMapping("/clearances/facility")
    public ResponseEntity<ClearanceDto> getFacilityClearance() {
        ClearanceDto clearance = complianceService.getFacilityClearance();
        if (clearance == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(clearance);
    }

    @GetMapping("/clearances/expiring")
    public ResponseEntity<List<ClearanceDto>> getExpiringClearances(
        @RequestParam(defaultValue = "90") int daysAhead
    ) {
        List<ClearanceDto> clearances = complianceService.getExpiringClearances(daysAhead);
        return ResponseEntity.ok(clearances);
    }

    @GetMapping("/clearances/{clearanceId}")
    public ResponseEntity<ClearanceDto> getClearance(@PathVariable UUID clearanceId) {
        ClearanceDto clearance = complianceService.getClearance(clearanceId);
        return ResponseEntity.ok(clearance);
    }

    @PutMapping("/clearances/{clearanceId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('COMPLIANCE_UPDATE')")
    public ResponseEntity<ClearanceDto> updateClearance(
        @PathVariable UUID clearanceId,
        @Valid @RequestBody UpdateClearanceRequest request
    ) {
        ClearanceDto clearance = complianceService.updateClearance(clearanceId, request);
        return ResponseEntity.ok(clearance);
    }

    // Compliance Item endpoints

    @PostMapping("/items")
    @PreAuthorize("@tenantSecurityService.hasPermission('COMPLIANCE_CREATE')")
    public ResponseEntity<ComplianceItemDto> createComplianceItem(
        @Valid @RequestBody CreateComplianceItemRequest request
    ) {
        log.info("Creating compliance item: {}", request.title());
        ComplianceItemDto item = complianceService.createComplianceItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @GetMapping("/items")
    public ResponseEntity<Page<ComplianceItemDto>> getComplianceItems(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "dueDate") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ComplianceItemDto> items = complianceService.getComplianceItems(pageable);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/pending")
    public ResponseEntity<List<ComplianceItemDto>> getPendingComplianceItems() {
        List<ComplianceItemDto> items = complianceService.getPendingComplianceItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/overdue")
    public ResponseEntity<List<ComplianceItemDto>> getOverdueComplianceItems() {
        List<ComplianceItemDto> items = complianceService.getOverdueComplianceItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/non-compliant")
    public ResponseEntity<List<ComplianceItemDto>> getNonCompliantItems() {
        List<ComplianceItemDto> items = complianceService.getNonCompliantItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/contract/{contractId}")
    public ResponseEntity<List<ComplianceItemDto>> getComplianceItemsByContract(
        @PathVariable UUID contractId
    ) {
        List<ComplianceItemDto> items = complianceService.getComplianceItemsByContract(contractId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/{itemId}")
    public ResponseEntity<ComplianceItemDto> getComplianceItem(@PathVariable UUID itemId) {
        ComplianceItemDto item = complianceService.getComplianceItem(itemId);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('COMPLIANCE_UPDATE')")
    public ResponseEntity<ComplianceItemDto> updateComplianceItem(
        @PathVariable UUID itemId,
        @Valid @RequestBody UpdateComplianceItemRequest request
    ) {
        ComplianceItemDto item = complianceService.updateComplianceItem(itemId, request);
        return ResponseEntity.ok(item);
    }

    @PatchMapping("/items/{itemId}/status")
    @PreAuthorize("@tenantSecurityService.hasPermission('COMPLIANCE_UPDATE')")
    public ResponseEntity<ComplianceItemDto> updateComplianceItemStatus(
        @PathVariable UUID itemId,
        @RequestParam ComplianceStatus status,
        @RequestParam(required = false) String notes
    ) {
        ComplianceItemDto item = complianceService.updateComplianceItemStatus(itemId, status, notes);
        return ResponseEntity.ok(item);
    }
}
