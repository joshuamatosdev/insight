package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Competitive intelligence service.
 * Tracks competitors and their contract activities.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompetitorService {

    private final CompetitorRepository competitorRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public record CreateCompetitorRequest(
        String name,
        String uei,
        String cageCode,
        String website,
        String headquartersLocation,
        Integer employeeCount,
        BigDecimal estimatedRevenue,
        String primaryNaicsCodes,
        String keyCustomers,
        String contractVehicles,
        String certifications,
        String strengths,
        String weaknesses,
        String winThemes,
        String notes
    ) {}

    public record CompetitorResponse(
        UUID id,
        String name,
        String uei,
        String cageCode,
        String website,
        String headquartersLocation,
        Integer employeeCount,
        BigDecimal estimatedRevenue,
        String primaryNaicsCodes,
        String keyCustomers,
        String contractVehicles,
        String certifications,
        String strengths,
        String weaknesses,
        String winThemes,
        String notes,
        BigDecimal totalContractValue,
        Integer contractCount,
        BigDecimal averageContractValue,
        BigDecimal winRate,
        Boolean isActive,
        Instant lastActivityDate,
        Instant createdAt
    ) {}

    @Transactional
    public CompetitorResponse createCompetitor(UUID tenantId, UUID userId, CreateCompetitorRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        // Check for duplicate
        if (request.uei() != null && competitorRepository.existsByTenantIdAndUei(tenantId, request.uei())) {
            throw new IllegalArgumentException("Competitor with this UEI already exists");
        }

        Competitor competitor = new Competitor();
        competitor.setTenant(tenant);
        competitor.setName(request.name());
        competitor.setUei(request.uei());
        competitor.setCageCode(request.cageCode());
        competitor.setWebsite(request.website());
        competitor.setHeadquartersLocation(request.headquartersLocation());
        competitor.setEmployeeCount(request.employeeCount());
        competitor.setEstimatedRevenue(request.estimatedRevenue());
        competitor.setPrimaryNaicsCodes(request.primaryNaicsCodes());
        competitor.setKeyCustomers(request.keyCustomers());
        competitor.setContractVehicles(request.contractVehicles());
        competitor.setCertifications(request.certifications());
        competitor.setStrengths(request.strengths());
        competitor.setWeaknesses(request.weaknesses());
        competitor.setWinThemes(request.winThemes());
        competitor.setNotes(request.notes());
        competitor.setIsActive(true);

        competitor = competitorRepository.save(competitor);
        auditService.logAction(AuditAction.COMPETITOR_CREATED, "Competitor", competitor.getId().toString(),
            "Created competitor: " + request.name());

        return toResponse(competitor);
    }

    @Transactional(readOnly = true)
    public Page<CompetitorResponse> getCompetitors(UUID tenantId, Pageable pageable) {
        return competitorRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<CompetitorResponse> getActiveCompetitors(UUID tenantId) {
        return competitorRepository.findByTenantIdAndIsActiveTrue(tenantId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<CompetitorResponse> getCompetitor(UUID tenantId, UUID competitorId) {
        return competitorRepository.findByTenantIdAndId(tenantId, competitorId)
            .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<CompetitorResponse> searchByName(UUID tenantId, String name) {
        return competitorRepository.findByTenantIdAndNameContaining(tenantId, name).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CompetitorResponse> searchByNaics(UUID tenantId, String naicsCode) {
        return competitorRepository.findByTenantIdAndNaicsCode(tenantId, naicsCode).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CompetitorResponse> getTopCompetitorsByValue(UUID tenantId, int limit) {
        return competitorRepository.findTopCompetitorsByContractValue(tenantId, PageRequest.of(0, limit)).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CompetitorResponse> getTopCompetitorsByWinRate(UUID tenantId, int limit) {
        return competitorRepository.findTopCompetitorsByWinRate(tenantId, PageRequest.of(0, limit)).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public CompetitorResponse updateCompetitor(UUID tenantId, UUID competitorId, UUID userId, CreateCompetitorRequest request) {
        Competitor competitor = competitorRepository.findByTenantIdAndId(tenantId, competitorId)
            .orElseThrow(() -> new IllegalArgumentException("Competitor not found"));

        competitor.setName(request.name());
        competitor.setUei(request.uei());
        competitor.setCageCode(request.cageCode());
        competitor.setWebsite(request.website());
        competitor.setHeadquartersLocation(request.headquartersLocation());
        competitor.setEmployeeCount(request.employeeCount());
        competitor.setEstimatedRevenue(request.estimatedRevenue());
        competitor.setPrimaryNaicsCodes(request.primaryNaicsCodes());
        competitor.setKeyCustomers(request.keyCustomers());
        competitor.setContractVehicles(request.contractVehicles());
        competitor.setCertifications(request.certifications());
        competitor.setStrengths(request.strengths());
        competitor.setWeaknesses(request.weaknesses());
        competitor.setWinThemes(request.winThemes());
        competitor.setNotes(request.notes());

        competitor = competitorRepository.save(competitor);
        auditService.logAction(AuditAction.COMPETITOR_UPDATED, "Competitor", competitorId.toString(), "Updated competitor");

        return toResponse(competitor);
    }

    @Transactional
    public void updateContractStats(UUID tenantId, UUID competitorId, BigDecimal contractValue, boolean won) {
        Competitor competitor = competitorRepository.findByTenantIdAndId(tenantId, competitorId)
            .orElseThrow(() -> new IllegalArgumentException("Competitor not found"));

        if (won) {
            competitor.setContractCount(competitor.getContractCount() + 1);
            competitor.setTotalContractValue(competitor.getTotalContractValue().add(contractValue));
            competitor.setAverageContractValue(
                competitor.getTotalContractValue().divide(
                    BigDecimal.valueOf(competitor.getContractCount()), 2, java.math.RoundingMode.HALF_UP));
        }

        competitor.setLastActivityDate(Instant.now());
        competitorRepository.save(competitor);
    }

    @Transactional
    public void deactivateCompetitor(UUID tenantId, UUID competitorId, UUID userId) {
        Competitor competitor = competitorRepository.findByTenantIdAndId(tenantId, competitorId)
            .orElseThrow(() -> new IllegalArgumentException("Competitor not found"));

        competitor.setIsActive(false);
        competitorRepository.save(competitor);
        auditService.logAction(AuditAction.COMPETITOR_UPDATED, "Competitor", competitorId.toString(), "Deactivated competitor");
    }

    @Transactional
    public void deleteCompetitor(UUID tenantId, UUID competitorId, UUID userId) {
        Competitor competitor = competitorRepository.findByTenantIdAndId(tenantId, competitorId)
            .orElseThrow(() -> new IllegalArgumentException("Competitor not found"));

        competitorRepository.delete(competitor);
        auditService.logAction(AuditAction.COMPETITOR_DELETED, "Competitor", competitorId.toString(),
            "Deleted competitor: " + competitor.getName());
    }

    @Transactional(readOnly = true)
    public CompetitorStats getCompetitorStats(UUID tenantId) {
        long total = competitorRepository.countByTenantId(tenantId);
        long active = competitorRepository.countByTenantIdAndIsActiveTrue(tenantId);

        return new CompetitorStats(total, active);
    }

    private CompetitorResponse toResponse(Competitor competitor) {
        return new CompetitorResponse(
            competitor.getId(),
            competitor.getName(),
            competitor.getUei(),
            competitor.getCageCode(),
            competitor.getWebsite(),
            competitor.getHeadquartersLocation(),
            competitor.getEmployeeCount(),
            competitor.getEstimatedRevenue(),
            competitor.getPrimaryNaicsCodes(),
            competitor.getKeyCustomers(),
            competitor.getContractVehicles(),
            competitor.getCertifications(),
            competitor.getStrengths(),
            competitor.getWeaknesses(),
            competitor.getWinThemes(),
            competitor.getNotes(),
            competitor.getTotalContractValue(),
            competitor.getContractCount(),
            competitor.getAverageContractValue(),
            competitor.getWinRate(),
            competitor.getIsActive(),
            competitor.getLastActivityDate(),
            competitor.getCreatedAt()
        );
    }

    public record CompetitorStats(long totalCompetitors, long activeCompetitors) {}
}
