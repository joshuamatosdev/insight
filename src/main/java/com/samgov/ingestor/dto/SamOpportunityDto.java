package com.samgov.ingestor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO mapping SAM.gov API response fields to match the Opportunity entity.
 * Uses Jackson annotations to handle JSON property naming differences.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SamOpportunityDto(
        @JsonProperty("noticeId")
        String noticeId,

        @JsonProperty("title")
        String title,

        @JsonProperty("solicitationNumber")
        String solicitationNumber,

        @JsonProperty("postedDate")
        String postedDate,

        @JsonProperty("responseDeadLine")
        String responseDeadLine,

        @JsonProperty("naicsCode")
        String naicsCode,

        @JsonProperty("type")
        String type,

        @JsonProperty("uiLink")
        String uiLink
) {
    /**
     * Maps this DTO to the URL field expected by the Opportunity entity.
     * SAM.gov returns 'uiLink' which we expose as 'url'.
     */
    public String url() {
        return uiLink;
    }
}
