package com.samgov.ingestor.elasticsearch;

import com.samgov.ingestor.model.Opportunity.ContractLevel;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Elasticsearch repository for OpportunityDocument.
 *
 * Provides full-text search capabilities and various filtering options
 * optimized for Elasticsearch queries.
 */
@Repository
public interface OpportunitySearchRepository extends ElasticsearchRepository<OpportunityDocument, String> {

    /**
     * Find opportunities by status.
     */
    Page<OpportunityDocument> findByStatus(OpportunityStatus status, Pageable pageable);

    /**
     * Find opportunities by NAICS code.
     */
    Page<OpportunityDocument> findByNaicsCode(String naicsCode, Pageable pageable);

    /**
     * Find opportunities by set-aside type.
     */
    Page<OpportunityDocument> findBySetAsideType(String setAsideType, Pageable pageable);

    /**
     * Find opportunities by contract level.
     */
    Page<OpportunityDocument> findByContractLevel(ContractLevel contractLevel, Pageable pageable);

    /**
     * Find opportunities by place of performance state.
     */
    Page<OpportunityDocument> findByPlaceOfPerformanceState(String state, Pageable pageable);

    /**
     * Find SBIR opportunities.
     */
    Page<OpportunityDocument> findByIsSbirTrue(Pageable pageable);

    /**
     * Find STTR opportunities.
     */
    Page<OpportunityDocument> findByIsSttrTrue(Pageable pageable);

    /**
     * Find SBIR or STTR opportunities.
     */
    Page<OpportunityDocument> findByIsSbirTrueOrIsSttrTrue(Pageable pageable);

    /**
     * Find opportunities by SBIR/STTR phase.
     */
    Page<OpportunityDocument> findBySbirPhase(String phase, Pageable pageable);

    /**
     * Find DoD opportunities.
     */
    Page<OpportunityDocument> findByIsDodTrue(Pageable pageable);

    /**
     * Find opportunities requiring clearance.
     */
    Page<OpportunityDocument> findByClearanceRequiredIsNotNull(Pageable pageable);

    /**
     * Find ITAR-controlled opportunities.
     */
    Page<OpportunityDocument> findByItarControlledTrue(Pageable pageable);

    /**
     * Find opportunities with response deadline between dates.
     */
    Page<OpportunityDocument> findByResponseDeadlineBetween(
        LocalDate start, LocalDate end, Pageable pageable);

    /**
     * Find opportunities posted after a specific date.
     */
    Page<OpportunityDocument> findByPostedDateAfter(LocalDate date, Pageable pageable);

    /**
     * Full-text search across title, description, and agency fields.
     * Uses multi_match query for relevance scoring.
     */
    @Query("""
        {
          "bool": {
            "must": [
              {
                "multi_match": {
                  "query": "?0",
                  "fields": ["title^3", "description^2", "agency", "naicsDescription", "office"],
                  "type": "best_fields",
                  "fuzziness": "AUTO"
                }
              }
            ],
            "filter": [
              { "term": { "status": "ACTIVE" } }
            ]
          }
        }
        """)
    Page<OpportunityDocument> searchByKeyword(String keyword, Pageable pageable);

    /**
     * Full-text search with status filter.
     */
    @Query("""
        {
          "bool": {
            "must": [
              {
                "multi_match": {
                  "query": "?0",
                  "fields": ["title^3", "description^2", "agency", "naicsDescription", "office"],
                  "type": "best_fields",
                  "fuzziness": "AUTO"
                }
              }
            ],
            "filter": [
              { "term": { "status": "?1" } }
            ]
          }
        }
        """)
    Page<OpportunityDocument> searchByKeywordAndStatus(
        String keyword, String status, Pageable pageable);

    /**
     * Advanced search with multiple filters.
     */
    @Query("""
        {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    { "match": { "title": { "query": "?0", "boost": 3 } } },
                    { "match": { "description": { "query": "?0", "boost": 2 } } },
                    { "match": { "agency": "?0" } }
                  ],
                  "minimum_should_match": 1
                }
              }
            ],
            "filter": [
              { "term": { "status": "?1" } }
            ]
          }
        }
        """)
    Page<OpportunityDocument> advancedSearch(
        String query, String status, Pageable pageable);

    /**
     * Find by agency containing text (case-insensitive).
     */
    @Query("""
        {
          "bool": {
            "must": [
              {
                "match": {
                  "agency": {
                    "query": "?0",
                    "fuzziness": "AUTO"
                  }
                }
              }
            ]
          }
        }
        """)
    Page<OpportunityDocument> findByAgencyContaining(String agency, Pageable pageable);

    /**
     * Count opportunities by status.
     */
    long countByStatus(OpportunityStatus status);

    /**
     * Count SBIR opportunities.
     */
    long countByIsSbirTrue();

    /**
     * Count STTR opportunities.
     */
    long countByIsSttrTrue();

    /**
     * Find distinct agencies.
     */
    @Query("""
        {
          "aggs": {
            "unique_agencies": {
              "terms": {
                "field": "agencyCode",
                "size": 1000
              }
            }
          },
          "size": 0
        }
        """)
    List<String> findDistinctAgencies();

    /**
     * Delete all opportunities by status.
     */
    void deleteByStatus(OpportunityStatus status);
}
