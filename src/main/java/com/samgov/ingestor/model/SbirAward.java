package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity representing an SBIR/STTR award from SBIR.gov.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sbir_awards", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"agency_tracking_number", "agency"}, name = "uk_sbir_tracking")
})
public class SbirAward {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "firm")
    private String firm;

    @Column(name = "award_title", length = 1000)
    private String awardTitle;

    @Column(name = "agency")
    private String agency;

    @Column(name = "branch")
    private String branch;

    @Column(name = "phase")
    private String phase;

    @Column(name = "program")
    private String program;

    @Column(name = "agency_tracking_number")
    private String agencyTrackingNumber;

    @Column(name = "contract")
    private String contract;

    @Column(name = "proposal_award_date")
    private LocalDate proposalAwardDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "solicitation_number")
    private String solicitationNumber;

    @Column(name = "solicitation_year")
    private Integer solicitationYear;

    @Column(name = "topic_code")
    private String topicCode;

    @Column(name = "award_year")
    private Integer awardYear;

    @Column(name = "award_amount")
    private BigDecimal awardAmount;

    @Column(name = "uei")
    private String uei;

    @Column(name = "hubzone_owned")
    private Boolean hubzoneOwned;

    @Column(name = "socially_economically_disadvantaged")
    private Boolean sociallyEconomicallyDisadvantaged;

    @Column(name = "women_owned")
    private Boolean womenOwned;

    @Column(name = "number_employees")
    private Integer numberEmployees;

    @Column(name = "company_url")
    private String companyUrl;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "zip")
    private String zip;

    @Column(name = "poc_name")
    private String pocName;

    @Column(name = "poc_email")
    private String pocEmail;

    @Column(name = "poc_phone")
    private String pocPhone;

    @Column(name = "pi_name")
    private String piName;

    @Column(name = "pi_email")
    private String piEmail;

    @Column(name = "research_keywords", length = 2000)
    private String researchKeywords;

    @Column(name = "abstract_text", columnDefinition = "TEXT")
    private String abstractText;

    @Column(name = "award_link")
    private String awardLink;

    @Column(name = "is_sbir")
    private Boolean isSbir;

    @Column(name = "is_sttr")
    private Boolean isSttr;
}
