package com.samgov.ingestor.service;

import com.samgov.ingestor.model.Proposal;
import com.samgov.ingestor.model.Proposal.ProposalStatus;
import com.samgov.ingestor.repository.ProposalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProposalService {

    private final ProposalRepository proposalRepository;

    public Page<Proposal> getProposalsByTenant(UUID tenantId, Pageable pageable) {
        return proposalRepository.findByTenantId(tenantId, pageable);
    }

    public Optional<Proposal> getProposal(UUID id, UUID tenantId) {
        return proposalRepository.findByIdAndTenantId(id, tenantId);
    }

    public Proposal createProposal(Proposal proposal) {
        log.info("Creating proposal: {} for tenant: {}", proposal.getTitle(), proposal.getTenant().getId());
        return proposalRepository.save(proposal);
    }

    public Proposal updateProposal(Proposal proposal) {
        log.info("Updating proposal: {}", proposal.getId());
        return proposalRepository.save(proposal);
    }

    public void deleteProposal(UUID id) {
        log.info("Deleting proposal: {}", id);
        proposalRepository.deleteById(id);
    }

    public List<Proposal> getProposalsByStatus(UUID tenantId, ProposalStatus status) {
        return proposalRepository.findByTenantIdAndStatus(tenantId, status);
    }

    public List<Proposal> getProposalsByOpportunity(UUID opportunityId) {
        return proposalRepository.findByOpportunityId(opportunityId);
    }

    public List<Proposal> getProposalsDueSoon(UUID tenantId, int daysAhead) {
        LocalDate dueDate = LocalDate.now().plusDays(daysAhead);
        return proposalRepository.findDueBefore(tenantId, dueDate);
    }

    public List<Proposal> getUpcomingProposals(UUID tenantId, Pageable pageable) {
        return proposalRepository.findUpcoming(tenantId, pageable);
    }

    public Proposal submitProposal(UUID id, UUID tenantId) {
        Proposal proposal = proposalRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));
        
        proposal.submit();
        log.info("Submitting proposal: {}", id);
        return proposalRepository.save(proposal);
    }

    public Proposal updateStatus(UUID id, UUID tenantId, ProposalStatus status) {
        Proposal proposal = proposalRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));
        
        proposal.setStatus(status);
        log.info("Updating proposal {} status to: {}", id, status);
        return proposalRepository.save(proposal);
    }

    public Proposal incrementVersion(UUID id, UUID tenantId) {
        Proposal proposal = proposalRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));
        
        proposal.setVersion(proposal.getVersion() + 1);
        log.info("Incrementing proposal {} version to: {}", id, proposal.getVersion());
        return proposalRepository.save(proposal);
    }

    public long countByStatus(UUID tenantId, ProposalStatus status) {
        return proposalRepository.countByTenantIdAndStatus(tenantId, status);
    }

    public List<Proposal> getProposalsByManager(UUID tenantId, UUID managerId) {
        return proposalRepository.findByProposalManager(tenantId, managerId);
    }

    public List<Proposal> getActiveProposals(UUID tenantId) {
        return proposalRepository.findByTenantIdAndStatusIn(tenantId, 
            List.of(ProposalStatus.DRAFT, ProposalStatus.IN_REVIEW, 
                ProposalStatus.PINK_TEAM, ProposalStatus.RED_TEAM, 
                ProposalStatus.GOLD_TEAM, ProposalStatus.FINAL_REVIEW));
    }
}
