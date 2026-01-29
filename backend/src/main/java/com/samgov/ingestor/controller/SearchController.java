package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.FacetedSearchRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.samgov.ingestor.dto.FacetedSearchResponse;
import com.samgov.ingestor.dto.SearchSuggestionDTO;
import com.samgov.ingestor.service.SearchEnhancementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for enhanced search functionality
 */
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Tag(name = "Search (Face One)", description = "Face One (Contract Intelligence): Enhanced Elasticsearch search with facets, suggestions, and autocomplete for opportunity discovery.")
public class SearchController {

    private final SearchEnhancementService searchService;

    /**
     * Get search suggestions for autocomplete
     */
    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SearchSuggestionDTO> getSuggestions(
        @RequestParam String q,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(searchService.getSuggestions(q, limit));
    }

    /**
     * Perform faceted search
     */
    @PostMapping("/faceted")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FacetedSearchResponse> facetedSearch(
        @RequestBody FacetedSearchRequest request
    ) {
        return ResponseEntity.ok(searchService.facetedSearch(request));
    }
}
