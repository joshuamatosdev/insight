package com.samgov.ingestor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for SBIR.gov Award API response.
 * Maps fields from https://api.www.sbir.gov/public/api/awards
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SbirAwardDto(
        @JsonProperty("firm")
        String firm,

        @JsonProperty("award_title")
        String awardTitle,

        @JsonProperty("agency")
        String agency,

        @JsonProperty("branch")
        String branch,

        @JsonProperty("phase")
        String phase,

        @JsonProperty("program")
        String program,

        @JsonProperty("agency_tracking_number")
        String agencyTrackingNumber,

        @JsonProperty("contract")
        String contract,

        @JsonProperty("proposal_award_date")
        String proposalAwardDate,

        @JsonProperty("contract_end_date")
        String contractEndDate,

        @JsonProperty("solicitation_number")
        String solicitationNumber,

        @JsonProperty("solicitation_year")
        String solicitationYear,

        @JsonProperty("topic_code")
        String topicCode,

        @JsonProperty("award_year")
        String awardYear,

        @JsonProperty("award_amount")
        String awardAmount,

        @JsonProperty("duns")
        String duns,

        @JsonProperty("uei")
        String uei,

        @JsonProperty("hubzone_owned")
        String hubzoneOwned,

        @JsonProperty("socially_economically_disadvantaged")
        String sociallyEconomicallyDisadvantaged,

        @JsonProperty("women_owned")
        String womenOwned,

        @JsonProperty("number_employees")
        String numberEmployees,

        @JsonProperty("company_url")
        String companyUrl,

        @JsonProperty("address1")
        String address1,

        @JsonProperty("address2")
        String address2,

        @JsonProperty("city")
        String city,

        @JsonProperty("state")
        String state,

        @JsonProperty("zip")
        String zip,

        @JsonProperty("poc_name")
        String pocName,

        @JsonProperty("poc_title")
        String pocTitle,

        @JsonProperty("poc_phone")
        String pocPhone,

        @JsonProperty("poc_email")
        String pocEmail,

        @JsonProperty("pi_name")
        String piName,

        @JsonProperty("pi_phone")
        String piPhone,

        @JsonProperty("pi_email")
        String piEmail,

        @JsonProperty("ri_name")
        String riName,

        @JsonProperty("ri_poc_name")
        String riPocName,

        @JsonProperty("ri_poc_phone")
        String riPocPhone,

        @JsonProperty("research_area_keywords")
        String researchAreaKeywords,

        @JsonProperty("abstract")
        String abstractText,

        @JsonProperty("award_link")
        String awardLink
) {
    /**
     * Parse the phase string to a standardized format (I, II, III).
     */
    public String normalizedPhase() {
        if (phase == null) return null;
        String p = phase.toUpperCase().trim();
        if (p.contains("III") || p.contains("3")) return "III";
        if (p.contains("II") || p.contains("2")) return "II";
        if (p.contains("I") || p.contains("1")) return "I";
        return phase;
    }

    /**
     * Determine if this is SBIR or STTR based on program field.
     */
    public boolean isSbir() {
        return program != null && program.toUpperCase().contains("SBIR");
    }

    public boolean isSttr() {
        return program != null && program.toUpperCase().contains("STTR");
    }
}
