package com.samgov.ingestor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

/**
 * DTO for USAspending.gov award data from the spending_by_award endpoint.
 * Maps the nested JSON structure from the API response.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record UsaSpendingAwardDto(
    @JsonProperty("Award ID") String awardId,
    @JsonProperty("Recipient Name") String recipientName,
    @JsonProperty("recipient_id") String recipientId,
    @JsonProperty("Start Date") String startDate,
    @JsonProperty("End Date") String endDate,
    @JsonProperty("Award Amount") BigDecimal awardAmount,
    @JsonProperty("Total Outlays") BigDecimal totalOutlays,
    @JsonProperty("Description") String description,
    @JsonProperty("def_codes") String defCodes,
    @JsonProperty("COVID-19 Obligations") BigDecimal covidObligations,
    @JsonProperty("COVID-19 Outlays") BigDecimal covidOutlays,
    @JsonProperty("Infrastructure Obligations") BigDecimal infrastructureObligations,
    @JsonProperty("Infrastructure Outlays") BigDecimal infrastructureOutlays,
    @JsonProperty("Awarding Agency") String awardingAgency,
    @JsonProperty("Awarding Sub Agency") String awardingSubAgency,
    @JsonProperty("Contract Award Type") String contractAwardType,
    @JsonProperty("recipient_uei") String recipientUei,
    @JsonProperty("prime_award_recipient_id") String primeAwardRecipientId,

    // Place of performance
    @JsonProperty("Place of Performance City") String popCity,
    @JsonProperty("Place of Performance State") String popState,
    @JsonProperty("Place of Performance Zip") String popZip,
    @JsonProperty("Place of Performance Country") String popCountry,

    // NAICS and PSC
    @JsonProperty("NAICS Code") String naicsCode,
    @JsonProperty("NAICS Description") String naicsDescription,
    @JsonProperty("PSC Code") String pscCode,
    @JsonProperty("PSC Description") String pscDescription,

    // Contract vehicle
    @JsonProperty("Parent Award ID") String parentAwardId,
    @JsonProperty("Award Type") String awardType,

    // Additional metadata
    @JsonProperty("generated_internal_id") String internalId,
    @JsonProperty("Last Modified Date") String lastModifiedDate
) {
    /**
     * Returns a unique identifier for deduplication.
     * Uses awardId as the primary key, falls back to internalId.
     */
    public String uniqueKey() {
        if (awardId != null && !awardId.isBlank()) {
            return awardId;
        }
        return internalId;
    }

    /**
     * Determines if this is a contract (vs grant, loan, etc.)
     */
    public boolean isContract() {
        if (awardType == null) return false;
        String type = awardType.toLowerCase();
        return type.contains("contract") || type.contains("idv") || type.contains("delivery order");
    }

    /**
     * Returns the award amount as a safe value (null-safe).
     */
    public BigDecimal safeAwardAmount() {
        return awardAmount != null ? awardAmount : BigDecimal.ZERO;
    }
}
