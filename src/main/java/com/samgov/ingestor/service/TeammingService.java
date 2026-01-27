package com.samgov.ingestor.service;

import com.samgov.ingestor.model.TeammingAgreement;
import com.samgov.ingestor.model.TeammingAgreement.AgreementStatus;
import com.samgov.ingestor.model.TeammingPartner;
import com.samgov.ingestor.model.TeammingPartner.PartnerStatus;
import com.samgov.ingestor.repository.TeammingAgreementRepository;
import com.samgov.ingestor.repository.TeammingPartnerRepository;
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
public class TeammingService {

    private final TeammingPartnerRepository partnerRepository;
    private final TeammingAgreementRepository agreementRepository;

    // Partner operations
    public Page<TeammingPartner> getPartnersByTenant(UUID tenantId, Pageable pageable) {
        return partnerRepository.findByTenantId(tenantId, pageable);
    }

    public Optional<TeammingPartner> getPartner(UUID id, UUID tenantId) {
        return partnerRepository.findByIdAndTenantId(id, tenantId);
    }

    public TeammingPartner createPartner(TeammingPartner partner) {
        log.info("Creating teaming partner: {} for tenant: {}", partner.getName(), partner.getTenant().getId());
        return partnerRepository.save(partner);
    }

    public TeammingPartner updatePartner(TeammingPartner partner) {
        log.info("Updating teaming partner: {}", partner.getId());
        return partnerRepository.save(partner);
    }

    public void deletePartner(UUID id) {
        log.info("Deleting teaming partner: {}", id);
        partnerRepository.deleteById(id);
    }

    public List<TeammingPartner> getActivePartners(UUID tenantId) {
        return partnerRepository.findActivePartners(tenantId);
    }

    public List<TeammingPartner> getSmallBusinessPartners(UUID tenantId) {
        return partnerRepository.findActiveSmallBusinessPartners(tenantId);
    }

    public List<TeammingPartner> findByCapability(UUID tenantId, String capability) {
        return partnerRepository.findByCapability(tenantId, capability);
    }

    public List<TeammingPartner> findByNaicsCode(UUID tenantId, String naicsCode) {
        return partnerRepository.findByNaicsCode(tenantId, naicsCode);
    }

    public List<TeammingPartner> searchPartners(UUID tenantId, String searchTerm) {
        return partnerRepository.searchByName(tenantId, searchTerm);
    }

    // Agreement operations
    public Page<TeammingAgreement> getAgreementsByTenant(UUID tenantId, Pageable pageable) {
        return agreementRepository.findByTenantId(tenantId, pageable);
    }

    public Optional<TeammingAgreement> getAgreement(UUID id, UUID tenantId) {
        return agreementRepository.findByIdAndTenantId(id, tenantId);
    }

    public TeammingAgreement createAgreement(TeammingAgreement agreement) {
        log.info("Creating teaming agreement for partner: {}", agreement.getPartner().getId());
        return agreementRepository.save(agreement);
    }

    public TeammingAgreement updateAgreement(TeammingAgreement agreement) {
        log.info("Updating teaming agreement: {}", agreement.getId());
        return agreementRepository.save(agreement);
    }

    public void deleteAgreement(UUID id) {
        log.info("Deleting teaming agreement: {}", id);
        agreementRepository.deleteById(id);
    }

    public List<TeammingAgreement> getActiveAgreements(UUID tenantId) {
        return agreementRepository.findActiveAgreements(tenantId);
    }

    public List<TeammingAgreement> getAgreementsByPartner(UUID partnerId) {
        return agreementRepository.findByPartnerId(partnerId);
    }

    public List<TeammingAgreement> getAgreementsByOpportunity(UUID opportunityId) {
        return agreementRepository.findByOpportunityId(opportunityId);
    }

    public List<TeammingAgreement> getExpiringSoon(UUID tenantId, int daysAhead) {
        LocalDate expirationDate = LocalDate.now().plusDays(daysAhead);
        return agreementRepository.findExpiringSoon(tenantId, expirationDate);
    }

    public List<TeammingAgreement> getPendingNda(UUID tenantId) {
        return agreementRepository.findPendingNda(tenantId);
    }

    public TeammingAgreement activateAgreement(UUID id, UUID tenantId) {
        TeammingAgreement agreement = agreementRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Agreement not found"));
        
        agreement.setStatus(AgreementStatus.ACTIVE);
        agreement.setEffectiveDate(LocalDate.now());
        log.info("Activating teaming agreement: {}", id);
        return agreementRepository.save(agreement);
    }

    public TeammingAgreement signNda(UUID id, UUID tenantId) {
        TeammingAgreement agreement = agreementRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Agreement not found"));
        
        agreement.setNdaSigned(true);
        log.info("Marking NDA signed for agreement: {}", id);
        return agreementRepository.save(agreement);
    }

    public long countActiveAgreementsByPartner(UUID partnerId) {
        return agreementRepository.countActiveByPartnerId(partnerId);
    }

    public long countPartnersByStatus(UUID tenantId, PartnerStatus status) {
        return partnerRepository.countByTenantIdAndStatus(tenantId, status);
    }

    public long countAgreementsByStatus(UUID tenantId, AgreementStatus status) {
        return agreementRepository.countByTenantIdAndStatus(tenantId, status);
    }
}
