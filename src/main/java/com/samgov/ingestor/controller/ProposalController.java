package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.Proposal;
import com.samgov.ingestor.model.Proposal.ProposalStatus;
import com.samgov.ingestor.service.ProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;

    @GetMapping
    public ResponseEntity<Page<Proposal>> getProposals(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            Pageable pageable) {
        return ResponseEntity.ok(proposalService.getProposalsByTenant(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proposal> getProposal(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return proposalService.getProposal(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Proposal> createProposal(
            @RequestBody Proposal proposal,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        Proposal created = proposalService.createProposal(proposal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proposal> updateProposal(
            @PathVariable UUID id,
            @RequestBody Proposal proposal,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        if (!proposalService.getProposal(id, tenantId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        proposal.setId(id);
        return ResponseEntity.ok(proposalService.updateProposal(proposal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProposal(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        if (!proposalService.getProposal(id, tenantId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        proposalService.deleteProposal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Proposal> submitProposal(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        try {
            Proposal submitted = proposalService.submitProposal(id, tenantId);
            return ResponseEntity.ok(submitted);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Proposal> updateStatus(
            @PathVariable UUID id,
            @RequestParam ProposalStatus status,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        try {
            Proposal updated = proposalService.updateStatus(id, tenantId, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/version")
    public ResponseEntity<Proposal> incrementVersion(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        try {
            Proposal updated = proposalService.incrementVersion(id, tenantId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Proposal>> getByStatus(
            @PathVariable ProposalStatus status,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(proposalService.getProposalsByStatus(tenantId, status));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Proposal>> getActiveProposals(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(proposalService.getActiveProposals(tenantId));
    }

    @GetMapping("/due-soon")
    public ResponseEntity<List<Proposal>> getDueSoon(
            @RequestParam(defaultValue = "7") int daysAhead,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(proposalService.getProposalsDueSoon(tenantId, daysAhead));
    }

    @GetMapping("/opportunity/{opportunityId}")
    public ResponseEntity<List<Proposal>> getByOpportunity(
            @PathVariable UUID opportunityId) {
        return ResponseEntity.ok(proposalService.getProposalsByOpportunity(opportunityId));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<Proposal>> getByManager(
            @PathVariable UUID managerId,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(proposalService.getProposalsByManager(tenantId, managerId));
    }

    @GetMapping("/count/{status}")
    public ResponseEntity<Long> countByStatus(
            @PathVariable ProposalStatus status,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(proposalService.countByStatus(tenantId, status));
    }
}
