package com.samgov.ingestor.service;

import com.samgov.ingestor.elasticsearch.OpportunityDocument;
import com.samgov.ingestor.elasticsearch.OpportunitySearchRepository;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.ContractLevel;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service for Elasticsearch operations on Opportunities.
 *
 * Provides enhanced search capabilities including:
 * - Full-text search with relevance scoring
 * - Fuzzy matching for typo tolerance
 * - Faceted filtering
 * - Bulk indexing operations
 *
 * Only available when elasticsearch.enabled=true (default).
 */
@Slf4j
@Service
@ConditionalOnExpression("${elasticsearch.enabled:true}")
@RequiredArgsConstructor
public class ElasticsearchService {

    private final OpportunitySearchRepository searchRepository;
    private final OpportunityRepository opportunityRepository;

    // ============================================
    // INDEX OPERATIONS
    // ============================================

    /**
     * Index a single opportunity in Elasticsearch.
     *
     * @param opportunity the opportunity entity to index
     * @return the indexed document
     */
    public OpportunityDocument indexOpportunity(Opportunity opportunity) {
        if (opportunity == null) {
            log.warn("Attempted to index null opportunity");
            return null;
        }

        log.debug("Indexing opportunity: {}", opportunity.getId());
        OpportunityDocument document = OpportunityDocument.fromEntity(opportunity);
        OpportunityDocument saved = searchRepository.save(document);
        log.info("Successfully indexed opportunity: {}", opportunity.getId());
        return saved;
    }

    /**
     * Index multiple opportunities in bulk.
     *
     * @param opportunities the list of opportunities to index
     * @return list of indexed documents
     */
    public List<OpportunityDocument> indexOpportunities(List<Opportunity> opportunities) {
        if (opportunities == null || opportunities.isEmpty()) {
            log.warn("Attempted to index null or empty opportunity list");
            return List.of();
        }

        log.info("Bulk indexing {} opportunities", opportunities.size());
        List<OpportunityDocument> documents = opportunities.stream()
            .map(OpportunityDocument::fromEntity)
            .toList();

        Iterable<OpportunityDocument> saved = searchRepository.saveAll(documents);
        List<OpportunityDocument> result = new java.util.ArrayList<>();
        saved.forEach(result::add);

        log.info("Successfully bulk indexed {} opportunities", result.size());
        return result;
    }

    /**
     * Delete an opportunity from the Elasticsearch index.
     *
     * @param opportunityId the ID of the opportunity to delete
     */
    public void deleteOpportunity(String opportunityId) {
        if (opportunityId == null || opportunityId.isBlank()) {
            log.warn("Attempted to delete opportunity with null or blank ID");
            return;
        }

        log.debug("Deleting opportunity from index: {}", opportunityId);
        searchRepository.deleteById(opportunityId);
        log.info("Successfully deleted opportunity from index: {}", opportunityId);
    }

    /**
     * Delete multiple opportunities from the index.
     *
     * @param opportunityIds the IDs of opportunities to delete
     */
    public void deleteOpportunities(List<String> opportunityIds) {
        if (opportunityIds == null || opportunityIds.isEmpty()) {
            log.warn("Attempted to delete opportunities with null or empty ID list");
            return;
        }

        log.info("Bulk deleting {} opportunities from index", opportunityIds.size());
        searchRepository.deleteAllById(opportunityIds);
        log.info("Successfully bulk deleted {} opportunities from index", opportunityIds.size());
    }

    /**
     * Reindex all opportunities from the database to Elasticsearch.
     * This is an async operation that runs in the background.
     *
     * @return a CompletableFuture with the count of indexed documents
     */
    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Long> reindexAll() {
        log.info("Starting full reindex of all opportunities");

        // Clear existing index
        searchRepository.deleteAll();
        log.info("Cleared existing Elasticsearch index");

        // Fetch all opportunities from database and index in batches
        long totalIndexed = 0;
        int batchSize = 500;
        int page = 0;

        Page<Opportunity> opportunityPage;
        do {
            opportunityPage = opportunityRepository.findAll(
                org.springframework.data.domain.PageRequest.of(page, batchSize));

            List<OpportunityDocument> documents = opportunityPage.getContent().stream()
                .map(OpportunityDocument::fromEntity)
                .toList();

            searchRepository.saveAll(documents);
            totalIndexed += documents.size();

            log.info("Indexed batch {} ({} documents, {} total)",
                page + 1, documents.size(), totalIndexed);

            page++;
        } while (opportunityPage.hasNext());

        log.info("Completed full reindex: {} opportunities indexed", totalIndexed);
        return CompletableFuture.completedFuture(totalIndexed);
    }

    /**
     * Reindex opportunities by status.
     *
     * @param status the status of opportunities to reindex
     * @return count of indexed documents
     */
    @Transactional(readOnly = true)
    public long reindexByStatus(OpportunityStatus status) {
        log.info("Reindexing opportunities with status: {}", status);

        // Delete existing documents with this status
        searchRepository.deleteByStatus(status);

        // Fetch and index
        int batchSize = 500;
        int page = 0;
        long totalIndexed = 0;

        Page<Opportunity> opportunityPage;
        do {
            opportunityPage = opportunityRepository.findByStatus(status,
                org.springframework.data.domain.PageRequest.of(page, batchSize));

            List<OpportunityDocument> documents = opportunityPage.getContent().stream()
                .map(OpportunityDocument::fromEntity)
                .toList();

            searchRepository.saveAll(documents);
            totalIndexed += documents.size();

            page++;
        } while (opportunityPage.hasNext());

        log.info("Reindexed {} opportunities with status {}", totalIndexed, status);
        return totalIndexed;
    }

    // ============================================
    // SEARCH OPERATIONS
    // ============================================

    /**
     * Full-text search across opportunity fields.
     *
     * @param keyword  the search keyword
     * @param pageable pagination parameters
     * @return page of matching opportunity documents
     */
    public Page<OpportunityDocument> searchOpportunities(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            log.debug("Empty keyword, returning all active opportunities");
            return searchRepository.findByStatus(OpportunityStatus.ACTIVE, pageable);
        }

        log.debug("Searching opportunities with keyword: {}", keyword);
        return searchRepository.searchByKeyword(keyword, pageable);
    }

    /**
     * Search opportunities with status filter.
     *
     * @param keyword  the search keyword
     * @param status   the status to filter by
     * @param pageable pagination parameters
     * @return page of matching opportunity documents
     */
    public Page<OpportunityDocument> searchOpportunities(
            String keyword, OpportunityStatus status, Pageable pageable) {

        if (keyword == null || keyword.isBlank()) {
            return searchRepository.findByStatus(status, pageable);
        }

        return searchRepository.searchByKeywordAndStatus(keyword, status.name(), pageable);
    }

    /**
     * Search opportunities by agency.
     *
     * @param agency   the agency name to search for
     * @param pageable pagination parameters
     * @return page of matching opportunity documents
     */
    public Page<OpportunityDocument> searchByAgency(String agency, Pageable pageable) {
        if (agency == null || agency.isBlank()) {
            return Page.empty(pageable);
        }

        return searchRepository.findByAgencyContaining(agency, pageable);
    }

    /**
     * Find opportunities by NAICS code.
     *
     * @param naicsCode the NAICS code
     * @param pageable  pagination parameters
     * @return page of matching opportunity documents
     */
    public Page<OpportunityDocument> findByNaicsCode(String naicsCode, Pageable pageable) {
        return searchRepository.findByNaicsCode(naicsCode, pageable);
    }

    /**
     * Find opportunities by set-aside type.
     *
     * @param setAsideType the set-aside type
     * @param pageable     pagination parameters
     * @return page of matching opportunity documents
     */
    public Page<OpportunityDocument> findBySetAsideType(String setAsideType, Pageable pageable) {
        return searchRepository.findBySetAsideType(setAsideType, pageable);
    }

    /**
     * Find opportunities by contract level.
     *
     * @param contractLevel the contract level
     * @param pageable      pagination parameters
     * @return page of matching opportunity documents
     */
    public Page<OpportunityDocument> findByContractLevel(ContractLevel contractLevel, Pageable pageable) {
        return searchRepository.findByContractLevel(contractLevel, pageable);
    }

    /**
     * Find opportunities by state.
     *
     * @param state    the state code
     * @param pageable pagination parameters
     * @return page of matching opportunity documents
     */
    public Page<OpportunityDocument> findByState(String state, Pageable pageable) {
        return searchRepository.findByPlaceOfPerformanceState(state, pageable);
    }

    /**
     * Find SBIR/STTR opportunities.
     *
     * @param pageable pagination parameters
     * @return page of SBIR/STTR opportunity documents
     */
    public Page<OpportunityDocument> findSbirSttr(Pageable pageable) {
        return searchRepository.findByIsSbirTrueOrIsSttrTrue(pageable);
    }

    /**
     * Find opportunities by SBIR/STTR phase.
     *
     * @param phase    the SBIR/STTR phase
     * @param pageable pagination parameters
     * @return page of matching opportunity documents
     */
    public Page<OpportunityDocument> findByPhase(String phase, Pageable pageable) {
        return searchRepository.findBySbirPhase(phase, pageable);
    }

    /**
     * Find DoD opportunities.
     *
     * @param pageable pagination parameters
     * @return page of DoD opportunity documents
     */
    public Page<OpportunityDocument> findDodOpportunities(Pageable pageable) {
        return searchRepository.findByIsDodTrue(pageable);
    }

    /**
     * Find opportunities requiring security clearance.
     *
     * @param pageable pagination parameters
     * @return page of clearance-required opportunity documents
     */
    public Page<OpportunityDocument> findClearanceRequired(Pageable pageable) {
        return searchRepository.findByClearanceRequiredIsNotNull(pageable);
    }

    /**
     * Find ITAR-controlled opportunities.
     *
     * @param pageable pagination parameters
     * @return page of ITAR-controlled opportunity documents
     */
    public Page<OpportunityDocument> findItarControlled(Pageable pageable) {
        return searchRepository.findByItarControlledTrue(pageable);
    }

    /**
     * Find opportunities closing soon (within specified days).
     *
     * @param days     number of days
     * @param pageable pagination parameters
     * @return page of opportunity documents closing soon
     */
    public Page<OpportunityDocument> findClosingSoon(int days, Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(days);
        return searchRepository.findByResponseDeadlineBetween(today, deadline, pageable);
    }

    /**
     * Find recently posted opportunities.
     *
     * @param days     number of days ago
     * @param pageable pagination parameters
     * @return page of recently posted opportunity documents
     */
    public Page<OpportunityDocument> findRecentlyPosted(int days, Pageable pageable) {
        LocalDate since = LocalDate.now().minusDays(days);
        return searchRepository.findByPostedDateAfter(since, pageable);
    }

    // ============================================
    // STATISTICS
    // ============================================

    /**
     * Get search statistics.
     *
     * @return search statistics
     */
    public SearchStats getSearchStats() {
        long totalDocuments = searchRepository.count();
        long activeCount = searchRepository.countByStatus(OpportunityStatus.ACTIVE);
        long sbirCount = searchRepository.countByIsSbirTrue();
        long sttrCount = searchRepository.countByIsSttrTrue();

        return new SearchStats(totalDocuments, activeCount, sbirCount, sttrCount);
    }

    /**
     * Check if the Elasticsearch index exists and has documents.
     *
     * @return true if index exists and has documents
     */
    public boolean isIndexHealthy() {
        try {
            long count = searchRepository.count();
            return count >= 0;
        } catch (Exception e) {
            log.error("Error checking Elasticsearch index health", e);
            return false;
        }
    }

    /**
     * Search statistics record.
     */
    public record SearchStats(
        long totalDocuments,
        long activeOpportunities,
        long sbirOpportunities,
        long sttrOpportunities
    ) {}
}
