package com.samgov.ingestor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Wrapper record for the SAM.gov search API response.
 * The API returns: { "opportunitiesData": [...], "totalRecords": N, ... }
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SamSearchResponse(
        @JsonProperty("opportunitiesData")
        List<SamOpportunityDto> opportunitiesData,

        @JsonProperty("totalRecords")
        Integer totalRecords
) {
    /**
     * Returns an empty list if opportunitiesData is null.
     */
    public List<SamOpportunityDto> getOpportunities() {
        return opportunitiesData != null ? opportunitiesData : List.of();
    }
}
