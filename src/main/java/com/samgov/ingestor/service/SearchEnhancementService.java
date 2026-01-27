package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.FacetedSearchRequest;
import com.samgov.ingestor.dto.FacetedSearchResponse;
import com.samgov.ingestor.dto.FacetedSearchResponse.FacetBucket;
import com.samgov.ingestor.dto.OpportunityDto;
import com.samgov.ingestor.dto.SearchSuggestionDTO;
import com.samgov.ingestor.dto.SearchSuggestionDTO.Suggestion;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for enhanced search functionality.
 * Note: In production, this would integrate with Elasticsearch.
 * This implementation uses PostgreSQL full-text search as a foundation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchEnhancementService {

    private final OpportunityRepository opportunityRepository;

    /**
     * Get search suggestions for autocomplete.
     */
    @Transactional(readOnly = true)
    public SearchSuggestionDTO getSuggestions(String query, int limit) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        
        List<Suggestion> suggestions = new ArrayList<>();
        
        // Search in opportunity titles
        Pageable pageable = PageRequest.of(0, limit);
        Page<Opportunity> titleMatches = opportunityRepository
            .searchByKeyword(query, pageable);
        
        for (Opportunity opp : titleMatches) {
            suggestions.add(Suggestion.builder()
                .text(opp.getTitle())
                .type("opportunity")
                .matchCount(1)
                .highlight(highlightMatch(opp.getTitle(), query))
                .build());
        }

        return SearchSuggestionDTO.builder()
            .query(query)
            .suggestions(suggestions)
            .recentSearches(List.of()) // Would fetch from user's search history
            .build();
    }

    /**
     * Perform faceted search with aggregations.
     */
    @Transactional(readOnly = true)
    public FacetedSearchResponse facetedSearch(FacetedSearchRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        long startTime = System.currentTimeMillis();

        // Build sort
        Sort sort = Sort.by(
            "desc".equalsIgnoreCase(request.getSortOrder()) 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC,
            request.getSortBy() != null ? request.getSortBy() : "responseDeadline"
        );

        Pageable pageable = PageRequest.of(
            request.getPage(),
            request.getSize(),
            sort
        );

        // Execute search (simplified - in production would use Elasticsearch)
        Page<Opportunity> results;
        if (request.getQuery() != null && !request.getQuery().isBlank()) {
            results = opportunityRepository.searchByKeyword(request.getQuery(), pageable);
        } else {
            results = opportunityRepository.findAll(pageable);
        }

        // Convert to DTOs
        Page<OpportunityDto> dtoPage = results.map(OpportunityDto::fromEntity);

        // Build facets
        Map<String, List<FacetBucket>> facets = buildFacets(tenantId);

        long queryTimeMs = System.currentTimeMillis() - startTime;

        return FacetedSearchResponse.builder()
            .opportunities(dtoPage)
            .facets(facets)
            .totalCount(results.getTotalElements())
            .queryTimeMs(queryTimeMs)
            .build();
    }

    private Map<String, List<FacetBucket>> buildFacets(UUID tenantId) {
        Map<String, List<FacetBucket>> facets = new HashMap<>();

        // Type facet - simplified implementation
        facets.put("type", List.of(
            new FacetBucket("SOLICITATION", "Solicitation", 0),
            new FacetBucket("PRESOLICITATION", "Pre-Solicitation", 0),
            new FacetBucket("AWARD", "Award", 0),
            new FacetBucket("SOURCE_SOUGHT", "Source Sought", 0)
        ));

        // Status facet - simplified implementation
        facets.put("status", List.of(
            new FacetBucket("ACTIVE", "Active", opportunityRepository.countByStatus(Opportunity.OpportunityStatus.ACTIVE)),
            new FacetBucket("CLOSED", "Closed", opportunityRepository.countByStatus(Opportunity.OpportunityStatus.CLOSED)),
            new FacetBucket("CANCELLED", "Cancelled", opportunityRepository.countByStatus(Opportunity.OpportunityStatus.CANCELLED))
        ));

        return facets;
    }

    private String highlightMatch(String text, String query) {
        if (text == null || query == null) {
            return text;
        }
        String lowerText = text.toLowerCase();
        String lowerQuery = query.toLowerCase();
        int index = lowerText.indexOf(lowerQuery);
        if (index >= 0) {
            return text.substring(0, index) 
                + "<mark>" 
                + text.substring(index, index + query.length()) 
                + "</mark>"
                + text.substring(index + query.length());
        }
        return text;
    }
}
