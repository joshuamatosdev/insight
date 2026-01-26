package com.samgov.ingestor.service;

import com.samgov.ingestor.dto.OpportunityDto;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;

    /**
     * Get opportunity by ID.
     */
    @Transactional(readOnly = true)
    public Optional<OpportunityDto> getById(String id) {
        return opportunityRepository.findById(id)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get opportunity by solicitation number.
     */
    @Transactional(readOnly = true)
    public Optional<OpportunityDto> getBySolicitationNumber(String solicitationNumber) {
        return opportunityRepository.findBySolicitationNumber(solicitationNumber)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Search opportunities with filters.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> search(OpportunitySearchRequest request, Pageable pageable) {
        Specification<Opportunity> spec = buildSpecification(request);
        return opportunityRepository.findAll(spec, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Search opportunities by keyword.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> searchByKeyword(String keyword, Pageable pageable) {
        return opportunityRepository.searchByKeyword(keyword, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get active opportunities.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getActiveOpportunities(Pageable pageable) {
        return opportunityRepository.findByStatus(OpportunityStatus.ACTIVE, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get opportunities closing soon.
     */
    @Transactional(readOnly = true)
    public List<OpportunityDto> getClosingSoon(int days) {
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(days);
        return opportunityRepository.findClosingSoon(today, deadline)
            .stream()
            .map(OpportunityDto::fromEntity)
            .toList();
    }

    /**
     * Get recently posted opportunities.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getRecentlyPosted(int days, Pageable pageable) {
        LocalDate since = LocalDate.now().minusDays(days);
        return opportunityRepository.findRecentlyPosted(since, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get opportunities by NAICS code.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getByNaicsCode(String naicsCode, Pageable pageable) {
        return opportunityRepository.findByNaicsCode(naicsCode, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get opportunities by agency.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getByAgency(String agency, Pageable pageable) {
        return opportunityRepository.findByAgencyContainingIgnoreCase(agency, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get opportunities by set-aside type.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getBySetAsideType(String setAsideType, Pageable pageable) {
        return opportunityRepository.findBySetAsideType(setAsideType, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get SBIR/STTR opportunities.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getSbirSttr(Pageable pageable) {
        return opportunityRepository.findAllSbirSttr(pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get SBIR/STTR opportunities by phase.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getSbirSttrByPhase(String phase, Pageable pageable) {
        return opportunityRepository.findSbirSttrByPhase(phase, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get opportunities by state (place of performance).
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getByState(String state, Pageable pageable) {
        return opportunityRepository.findByPlaceOfPerformanceState(state, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get dashboard statistics.
     */
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysFromNow = today.plusDays(7);

        long activeCount = opportunityRepository.countActiveOpportunities(today);
        long sbirCount = opportunityRepository.countByIsSbirTrue();
        long sttrCount = opportunityRepository.countByIsSttrTrue();
        long closingSoonCount = opportunityRepository.findClosingSoon(today, sevenDaysFromNow).size();

        return new DashboardStats(activeCount, sbirCount, sttrCount, closingSoonCount);
    }

    /**
     * Get distinct filter options.
     */
    @Transactional(readOnly = true)
    public FilterOptions getFilterOptions() {
        List<String> agencies = opportunityRepository.findDistinctAgencies();
        List<String> setAsideTypes = opportunityRepository.findDistinctSetAsideTypes();
        List<String> naicsCodes = opportunityRepository.findDistinctNaicsCodes();

        return new FilterOptions(agencies, setAsideTypes, naicsCodes);
    }

    private Specification<Opportunity> buildSpecification(OpportunitySearchRequest request) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            // Status filter (default to ACTIVE)
            if (request.status() != null) {
                predicates.add(cb.equal(root.get("status"), request.status()));
            } else {
                predicates.add(cb.equal(root.get("status"), OpportunityStatus.ACTIVE));
            }

            // Keyword search
            if (request.keyword() != null && !request.keyword().isBlank()) {
                String keyword = "%" + request.keyword().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
                ));
            }

            // NAICS code filter
            if (request.naicsCode() != null && !request.naicsCode().isBlank()) {
                predicates.add(cb.equal(root.get("naicsCode"), request.naicsCode()));
            }

            // Agency filter
            if (request.agency() != null && !request.agency().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("agency")),
                    "%" + request.agency().toLowerCase() + "%"));
            }

            // Set-aside type filter
            if (request.setAsideType() != null && !request.setAsideType().isBlank()) {
                predicates.add(cb.equal(root.get("setAsideType"), request.setAsideType()));
            }

            // Type filter
            if (request.type() != null && !request.type().isBlank()) {
                predicates.add(cb.equal(root.get("type"), request.type()));
            }

            // SBIR filter
            if (Boolean.TRUE.equals(request.isSbir())) {
                predicates.add(cb.isTrue(root.get("isSbir")));
            }

            // STTR filter
            if (Boolean.TRUE.equals(request.isSttr())) {
                predicates.add(cb.isTrue(root.get("isSttr")));
            }

            // SBIR/STTR combined filter
            if (Boolean.TRUE.equals(request.sbirOrSttr())) {
                predicates.add(cb.or(
                    cb.isTrue(root.get("isSbir")),
                    cb.isTrue(root.get("isSttr"))
                ));
            }

            // Phase filter
            if (request.phase() != null && !request.phase().isBlank()) {
                predicates.add(cb.equal(root.get("sbirPhase"), request.phase()));
            }

            // State filter
            if (request.state() != null && !request.state().isBlank()) {
                predicates.add(cb.equal(root.get("placeOfPerformanceState"), request.state()));
            }

            // Posted date range
            if (request.postedDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("postedDate"), request.postedDateFrom()));
            }
            if (request.postedDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("postedDate"), request.postedDateTo()));
            }

            // Response deadline range
            if (request.responseDeadlineFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("responseDeadLine"), request.responseDeadlineFrom()));
            }
            if (request.responseDeadlineTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("responseDeadLine"), request.responseDeadlineTo()));
            }

            // Not past deadline
            if (Boolean.TRUE.equals(request.activeOnly())) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("responseDeadLine"), LocalDate.now()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    public record OpportunitySearchRequest(
        String keyword,
        String naicsCode,
        String agency,
        String setAsideType,
        String type,
        Boolean isSbir,
        Boolean isSttr,
        Boolean sbirOrSttr,
        String phase,
        String state,
        LocalDate postedDateFrom,
        LocalDate postedDateTo,
        LocalDate responseDeadlineFrom,
        LocalDate responseDeadlineTo,
        OpportunityStatus status,
        Boolean activeOnly
    ) {}

    public record DashboardStats(
        long activeOpportunities,
        long sbirOpportunities,
        long sttrOpportunities,
        long closingSoonOpportunities
    ) {}

    public record FilterOptions(
        List<String> agencies,
        List<String> setAsideTypes,
        List<String> naicsCodes
    ) {}

    // ============================================
    // INGESTION METHODS
    // ============================================

    /**
     * Ingest opportunities from SAM.gov API.
     * @return number of new opportunities ingested
     */
    @Transactional
    public int ingestFromSamGov() {
        log.info("Starting SAM.gov opportunity ingestion");
        // Implementation would call SAM.gov API
        // For now, return 0 as placeholder
        return 0;
    }

    /**
     * Ingest opportunities from SBIR.gov API.
     * @return number of new opportunities ingested
     */
    @Transactional
    public int ingestFromSbirGov() {
        log.info("Starting SBIR.gov opportunity ingestion");
        // Implementation would call SBIR.gov API
        return 0;
    }

    /**
     * Ingest opportunities from state procurement portal.
     * @param stateCode the two-letter state code
     * @return number of new opportunities ingested
     */
    @Transactional
    public int ingestFromStatePortal(String stateCode) {
        log.info("Starting state portal ingestion for: {}", stateCode);
        // Implementation would call state-specific API
        return 0;
    }

    /**
     * Ingest opportunities from local government portal.
     * @param localEntityId the local entity identifier
     * @return number of new opportunities ingested
     */
    @Transactional
    public int ingestFromLocalPortal(String localEntityId) {
        log.info("Starting local portal ingestion for: {}", localEntityId);
        // Implementation would call local-specific API
        return 0;
    }

    // ============================================
    // MAINTENANCE METHODS
    // ============================================

    /**
     * Archive opportunities older than specified days.
     * @param daysOld opportunities closed more than this many days ago
     * @return number of opportunities archived
     */
    @Transactional
    public int archiveOldOpportunities(int daysOld) {
        LocalDate cutoffDate = LocalDate.now().minusDays(daysOld);
        List<Opportunity> toArchive = opportunityRepository.findByStatusAndResponseDeadLineBefore(
            OpportunityStatus.CLOSED, cutoffDate);

        toArchive.forEach(opp -> opp.setStatus(OpportunityStatus.ARCHIVED));
        opportunityRepository.saveAll(toArchive);

        log.info("Archived {} opportunities older than {} days", toArchive.size(), daysOld);
        return toArchive.size();
    }

    /**
     * Update opportunities that are past their deadline to CLOSED status.
     * @return number of opportunities updated
     */
    @Transactional
    public int updateExpiredOpportunities() {
        LocalDate today = LocalDate.now();
        List<Opportunity> expired = opportunityRepository.findByStatusAndResponseDeadLineBefore(
            OpportunityStatus.ACTIVE, today);

        expired.forEach(opp -> opp.setStatus(OpportunityStatus.CLOSED));
        opportunityRepository.saveAll(expired);

        log.info("Updated {} expired opportunities to CLOSED status", expired.size());
        return expired.size();
    }

    // ============================================
    // CONTRACT LEVEL QUERIES
    // ============================================

    /**
     * Get opportunities by contract level.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getByContractLevel(Opportunity.ContractLevel level, Pageable pageable) {
        return opportunityRepository.findByContractLevel(level, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get Federal opportunities.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getFederalOpportunities(Pageable pageable) {
        return opportunityRepository.findByContractLevel(Opportunity.ContractLevel.FEDERAL, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get DoD opportunities.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getDodOpportunities(Pageable pageable) {
        return opportunityRepository.findByContractLevelOrIsDodTrue(Opportunity.ContractLevel.DOD, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get State opportunities.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getStateOpportunities(Pageable pageable) {
        return opportunityRepository.findByContractLevel(Opportunity.ContractLevel.STATE, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get Local opportunities.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getLocalOpportunities(Pageable pageable) {
        return opportunityRepository.findByContractLevel(Opportunity.ContractLevel.LOCAL, pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get opportunities requiring security clearance.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getClearanceRequiredOpportunities(Pageable pageable) {
        return opportunityRepository.findByClearanceRequiredIsNotNull(pageable)
            .map(OpportunityDto::fromEntity);
    }

    /**
     * Get ITAR-controlled opportunities.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityDto> getItarControlledOpportunities(Pageable pageable) {
        return opportunityRepository.findByItarControlledTrue(pageable)
            .map(OpportunityDto::fromEntity);
    }
}
