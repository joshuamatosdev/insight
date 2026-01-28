package com.samgov.ingestor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

/**
 * DTO for USAspending.gov search response wrapper.
 * The API returns awards in a nested "results" array.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record UsaSpendingSearchResponse(
    @JsonProperty("results") List<UsaSpendingAwardDto> results,
    @JsonProperty("page_metadata") PageMetadata pageMetadata,
    @JsonProperty("messages") List<String> messages
) {
    /**
     * Returns the awards, never null.
     */
    public List<UsaSpendingAwardDto> getAwards() {
        return results != null ? results : List.of();
    }

    /**
     * Returns total count if available from metadata.
     */
    public int getTotalCount() {
        if (pageMetadata != null && pageMetadata.total() != null) {
            return pageMetadata.total();
        }
        return getAwards().size();
    }

    /**
     * Returns true if there are more pages available.
     */
    public boolean hasMore() {
        if (pageMetadata == null) return false;
        Integer page = pageMetadata.page();
        Integer total = pageMetadata.total();
        Integer limit = pageMetadata.limit();
        if (page == null || total == null || limit == null) return false;
        return (page * limit) < total;
    }

    /**
     * Page metadata from the API response.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PageMetadata(
        @JsonProperty("page") Integer page,
        @JsonProperty("total") Integer total,
        @JsonProperty("limit") Integer limit,
        @JsonProperty("next") Integer next,
        @JsonProperty("previous") Integer previous,
        @JsonProperty("hasNext") Boolean hasNext,
        @JsonProperty("hasPrevious") Boolean hasPrevious
    ) {}
}
