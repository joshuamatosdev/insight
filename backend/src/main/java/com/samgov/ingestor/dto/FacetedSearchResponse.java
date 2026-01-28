package com.samgov.ingestor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * Response for faceted search with aggregations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacetedSearchResponse {

    private Page<OpportunityDto> opportunities;
    private Map<String, List<FacetBucket>> facets;
    private long totalCount;
    private long queryTimeMs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FacetBucket {
        private String key;
        private String label;
        private long count;
    }
}
