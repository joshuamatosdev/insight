package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.TeammingAgreement;
import com.samgov.ingestor.model.TeammingPartner;
import com.samgov.ingestor.service.TeammingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teaming")
@RequiredArgsConstructor
public class TeammingController {

    private final TeammingService teammingService;

    // Partner endpoints
    @GetMapping("/partners")
    public ResponseEntity<Page<TeammingPartner>> getPartners(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            Pageable pageable) {
        return ResponseEntity.ok(teammingService.getPartnersByTenant(tenantId, pageable));
    }

    @GetMapping("/partners/{id}")
    public ResponseEntity<TeammingPartner> getPartner(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return teammingService.getPartner(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/partners")
    public ResponseEntity<TeammingPartner> createPartner(
            @RequestBody TeammingPartner partner,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        TeammingPartner created = teammingService.createPartner(partner);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/partners/{id}")
    public ResponseEntity<TeammingPartner> updatePartner(
            @PathVariable UUID id,
            @RequestBody TeammingPartner partner,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        if (!teammingService.getPartner(id, tenantId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        partner.setId(id);
        return ResponseEntity.ok(teammingService.updatePartner(partner));
    }

    @DeleteMapping("/partners/{id}")
    public ResponseEntity<Void> deletePartner(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        if (!teammingService.getPartner(id, tenantId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        teammingService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/partners/active")
    public ResponseEntity<List<TeammingPartner>> getActivePartners(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(teammingService.getActivePartners(tenantId));
    }

    @GetMapping("/partners/small-business")
    public ResponseEntity<List<TeammingPartner>> getSmallBusinessPartners(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(teammingService.getSmallBusinessPartners(tenantId));
    }

    @GetMapping("/partners/capability/{capability}")
    public ResponseEntity<List<TeammingPartner>> getByCapability(
            @PathVariable String capability,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(teammingService.findByCapability(tenantId, capability));
    }

    @GetMapping("/partners/naics/{naicsCode}")
    public ResponseEntity<List<TeammingPartner>> getByNaicsCode(
            @PathVariable String naicsCode,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(teammingService.findByNaicsCode(tenantId, naicsCode));
    }

    @GetMapping("/partners/search")
    public ResponseEntity<List<TeammingPartner>> searchPartners(
            @RequestParam String q,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(teammingService.searchPartners(tenantId, q));
    }

    // Agreement endpoints
    @GetMapping("/agreements")
    public ResponseEntity<Page<TeammingAgreement>> getAgreements(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            Pageable pageable) {
        return ResponseEntity.ok(teammingService.getAgreementsByTenant(tenantId, pageable));
    }

    @GetMapping("/agreements/{id}")
    public ResponseEntity<TeammingAgreement> getAgreement(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return teammingService.getAgreement(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/agreements")
    public ResponseEntity<TeammingAgreement> createAgreement(
            @RequestBody TeammingAgreement agreement,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        TeammingAgreement created = teammingService.createAgreement(agreement);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/agreements/{id}")
    public ResponseEntity<TeammingAgreement> updateAgreement(
            @PathVariable UUID id,
            @RequestBody TeammingAgreement agreement,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        if (!teammingService.getAgreement(id, tenantId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        agreement.setId(id);
        return ResponseEntity.ok(teammingService.updateAgreement(agreement));
    }

    @DeleteMapping("/agreements/{id}")
    public ResponseEntity<Void> deleteAgreement(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        if (!teammingService.getAgreement(id, tenantId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        teammingService.deleteAgreement(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/agreements/active")
    public ResponseEntity<List<TeammingAgreement>> getActiveAgreements(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(teammingService.getActiveAgreements(tenantId));
    }

    @GetMapping("/agreements/partner/{partnerId}")
    public ResponseEntity<List<TeammingAgreement>> getAgreementsByPartner(
            @PathVariable UUID partnerId) {
        return ResponseEntity.ok(teammingService.getAgreementsByPartner(partnerId));
    }

    @GetMapping("/agreements/opportunity/{opportunityId}")
    public ResponseEntity<List<TeammingAgreement>> getAgreementsByOpportunity(
            @PathVariable String opportunityId) {
        return ResponseEntity.ok(teammingService.getAgreementsByOpportunity(opportunityId));
    }

    @GetMapping("/agreements/expiring-soon")
    public ResponseEntity<List<TeammingAgreement>> getExpiringSoon(
            @RequestParam(defaultValue = "30") int daysAhead,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(teammingService.getExpiringSoon(tenantId, daysAhead));
    }

    @GetMapping("/agreements/pending-nda")
    public ResponseEntity<List<TeammingAgreement>> getPendingNda(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(teammingService.getPendingNda(tenantId));
    }

    @PostMapping("/agreements/{id}/activate")
    public ResponseEntity<TeammingAgreement> activateAgreement(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        try {
            TeammingAgreement activated = teammingService.activateAgreement(id, tenantId);
            return ResponseEntity.ok(activated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/agreements/{id}/sign-nda")
    public ResponseEntity<TeammingAgreement> signNda(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        try {
            TeammingAgreement updated = teammingService.signNda(id, tenantId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
