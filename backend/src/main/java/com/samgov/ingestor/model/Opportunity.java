package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "opportunities", uniqueConstraints = {
    @UniqueConstraint(columnNames = "solicitation_number", name = "uk_solicitation_number")
}, indexes = {
    @Index(name = "idx_opp_posted_date", columnList = "posted_date"),
    @Index(name = "idx_opp_response_deadline", columnList = "response_deadline"),
    @Index(name = "idx_opp_naics_code", columnList = "naics_code"),
    @Index(name = "idx_opp_agency", columnList = "agency"),
    @Index(name = "idx_opp_type", columnList = "type"),
    @Index(name = "idx_opp_set_aside", columnList = "set_aside_type"),
    @Index(name = "idx_opp_status", columnList = "status"),
    @Index(name = "idx_opp_contract_level", columnList = "contract_level"),
    @Index(name = "idx_opp_data_source", columnList = "data_source"),
    @Index(name = "idx_opp_is_dod", columnList = "is_dod"),
    @Index(name = "idx_opp_state_agency", columnList = "state_agency"),
    @Index(name = "idx_opp_local_entity", columnList = "local_entity"),
    @Index(name = "idx_opp_fips_state", columnList = "fips_state_code"),
    @Index(name = "idx_opp_fips_county", columnList = "fips_county_code"),
    @Index(name = "idx_opp_lat_long", columnList = "latitude, longitude")
})
public class Opportunity {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "title")
    private String title;

    @Column(name = "solicitation_number", unique = true)
    private String solicitationNumber;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "response_deadline")
    private LocalDate responseDeadLine;

    @Column(name = "archive_date")
    private LocalDate archiveDate;

    @Column(name = "naics_code")
    private String naicsCode;

    @Column(name = "naics_description")
    private String naicsDescription;

    @Column(name = "psc_code")
    private String pscCode;

    @Column(name = "type")
    private String type;

    @Column(name = "type_description")
    private String typeDescription;

    @Column(name = "url")
    private String url;

    // Agency information
    @Column(name = "agency")
    private String agency;

    @Column(name = "agency_code")
    private String agencyCode;

    @Column(name = "sub_agency")
    private String subAgency;

    @Column(name = "office")
    private String office;

    // Set-aside information
    @Column(name = "set_aside_type")
    private String setAsideType;

    @Column(name = "set_aside_description")
    private String setAsideDescription;

    // Place of performance
    @Column(name = "pop_city")
    private String placeOfPerformanceCity;

    @Column(name = "pop_state")
    private String placeOfPerformanceState;

    @Column(name = "pop_country")
    private String placeOfPerformanceCountry;

    @Column(name = "pop_zip")
    private String placeOfPerformanceZip;

    // Geographic data (populated by Census Geocoder)
    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "fips_state_code", length = 2)
    private String fipsStateCode;

    @Column(name = "fips_county_code", length = 5)
    private String fipsCountyCode;

    @Column(name = "census_tract", length = 20)
    private String censusTract;

    @Column(name = "geocoded_at")
    private Instant geocodedAt;

    // Award information
    @Column(name = "award_amount", precision = 15, scale = 2)
    private BigDecimal awardAmount;

    @Column(name = "estimated_value_low", precision = 15, scale = 2)
    private BigDecimal estimatedValueLow;

    @Column(name = "estimated_value_high", precision = 15, scale = 2)
    private BigDecimal estimatedValueHigh;

    // Contract information
    @Column(name = "contract_type")
    private String contractType;

    @Column(name = "contract_number")
    private String contractNumber;

    @Column(name = "incumbent_contractor")
    private String incumbentContractor;

    @Column(name = "is_recovery_act")
    @Builder.Default
    private Boolean isRecoveryAct = false;

    // SBIR/STTR fields
    @Column(name = "sbir_phase")
    private String sbirPhase;

    @Column(name = "is_sbir")
    @Builder.Default
    private Boolean isSbir = false;

    @Column(name = "is_sttr")
    @Builder.Default
    private Boolean isSttr = false;

    // Contact information
    @Column(name = "primary_contact_name")
    private String primaryContactName;

    @Column(name = "primary_contact_email")
    private String primaryContactEmail;

    @Column(name = "primary_contact_phone")
    private String primaryContactPhone;

    @Column(name = "secondary_contact_name")
    private String secondaryContactName;

    @Column(name = "secondary_contact_email")
    private String secondaryContactEmail;

    // Source and status
    @Column(name = "source")
    private String source;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_source")
    @Builder.Default
    private DataSource dataSource = DataSource.SAM_GOV;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_level")
    @Builder.Default
    private ContractLevel contractLevel = ContractLevel.FEDERAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private OpportunityStatus status = OpportunityStatus.ACTIVE;

    // State/Local specific fields
    @Column(name = "state_agency")
    private String stateAgency;

    @Column(name = "local_entity")
    private String localEntity;

    @Column(name = "procurement_portal_url")
    private String procurementPortalUrl;

    @Column(name = "bid_number")
    private String bidNumber;

    // DoD specific fields
    @Column(name = "is_dod")
    @Builder.Default
    private Boolean isDod = false;

    @Column(name = "clearance_required")
    private String clearanceRequired;

    @Column(name = "itar_controlled")
    @Builder.Default
    private Boolean itarControlled = false;

    @Column(name = "cui_required")
    @Builder.Default
    private Boolean cuiRequired = false;

    // Metadata
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "last_fetched_at")
    private Instant lastFetchedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        lastFetchedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum OpportunityStatus {
        ACTIVE,
        CLOSED,
        CANCELLED,
        AWARDED,
        ARCHIVED
    }

    /**
     * Contract level categorization for different government tiers.
     */
    public enum ContractLevel {
        FEDERAL,        // Federal civilian agencies
        DOD,            // Department of Defense
        STATE,          // State governments
        LOCAL,          // City/County/Municipal
        COMMERCIAL,     // B2B/Commercial contracts
        PRIME_SUB       // Subcontracting opportunities
    }

    /**
     * Data sources for opportunity ingestion.
     */
    public enum DataSource {
        SAM_GOV,        // SAM.gov - Federal opportunities
        SBIR_GOV,       // SBIR.gov - Small Business Innovation Research
        FPDS,           // Federal Procurement Data System
        USA_SPENDING,   // USASpending.gov
        STATE_PORTAL,   // State procurement portals
        LOCAL_PORTAL,   // City/County procurement sites
        GSA_SCHEDULE,   // GSA Schedule opportunities
        GOVWIN,         // GovWin intelligence
        MANUAL,         // Manually entered
        API             // External API integration
    }

    /**
     * Check if the opportunity is past its response deadline.
     */
    public boolean isPastDeadline() {
        return responseDeadLine != null && LocalDate.now().isAfter(responseDeadLine);
    }

    /**
     * Check if the opportunity is closing soon (within 7 days).
     */
    public boolean isClosingSoon() {
        if (responseDeadLine == null) {
            return false;
        }
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysFromNow = today.plusDays(7);
        return !responseDeadLine.isBefore(today) && !responseDeadLine.isAfter(sevenDaysFromNow);
    }

    /**
     * Get days until deadline.
     */
    public Long getDaysUntilDeadline() {
        if (responseDeadLine == null) {
            return null;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), responseDeadLine);
    }
}
