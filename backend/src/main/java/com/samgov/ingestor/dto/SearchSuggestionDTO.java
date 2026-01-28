package com.samgov.ingestor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Search suggestion response for autocomplete
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchSuggestionDTO {

    private String query;
    private List<Suggestion> suggestions;
    private List<String> recentSearches;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Suggestion {
        private String text;
        private String type; // opportunity, agency, naics, keyword
        private int matchCount;
        private String highlight;
    }
}
