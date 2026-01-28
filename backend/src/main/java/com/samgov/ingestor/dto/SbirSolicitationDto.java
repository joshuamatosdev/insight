package com.samgov.ingestor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for SBIR.gov Solicitation API response.
 * Maps fields from https://api.www.sbir.gov/public/api/solicitations
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SbirSolicitationDto(
        @JsonProperty("solicitation_id")
        String solicitationId,

        @JsonProperty("solicitation_number")
        String solicitationNumber,

        @JsonProperty("solicitation_title")
        String solicitationTitle,

        @JsonProperty("agency")
        String agency,

        @JsonProperty("branch")
        String branch,

        @JsonProperty("program")
        String program,

        @JsonProperty("phase")
        String phase,

        @JsonProperty("solicitation_year")
        String solicitationYear,

        @JsonProperty("release_date")
        String releaseDate,

        @JsonProperty("open_date")
        String openDate,

        @JsonProperty("close_date")
        String closeDate,

        @JsonProperty("application_due_date")
        String applicationDueDate,

        @JsonProperty("sbir_solicitation_link")
        String sbirSolicitationLink,

        @JsonProperty("solicitation_agency_url")
        String solicitationAgencyUrl,

        @JsonProperty("current_status")
        String currentStatus,

        @JsonProperty("topic_code")
        String topicCode,

        @JsonProperty("topic_title")
        String topicTitle,

        @JsonProperty("topic_description")
        String topicDescription
) {
    /**
     * Check if solicitation is currently open.
     */
    public boolean isOpen() {
        return "Open".equalsIgnoreCase(currentStatus);
    }

    /**
     * Determine if this is SBIR or STTR.
     */
    public boolean isSbir() {
        return program != null && program.toUpperCase().contains("SBIR");
    }

    public boolean isSttr() {
        return program != null && program.toUpperCase().contains("STTR");
    }

    /**
     * Get the best available URL for this solicitation.
     */
    public String getUrl() {
        if (sbirSolicitationLink != null && !sbirSolicitationLink.isBlank()) {
            return sbirSolicitationLink;
        }
        return solicitationAgencyUrl;
    }
}
