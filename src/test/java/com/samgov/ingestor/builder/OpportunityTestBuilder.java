package com.samgov.ingestor.builder;

import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.ContractLevel;
import com.samgov.ingestor.model.Opportunity.DataSource;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Test data builder for Opportunity entities.
 * Uses realistic government contracting data for meaningful tests.
 */
public class OpportunityTestBuilder {

    private String id = UUID.randomUUID().toString();
    private String title = "IT Services Support for Federal Agency";
    private String solicitationNumber = "SOL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    private String description = "Seeking qualified contractors for IT infrastructure and support services.";
    private LocalDate postedDate = LocalDate.now().minusDays(7);
    private LocalDate responseDeadLine = LocalDate.now().plusDays(30);
    private LocalDate archiveDate = null;
    private String naicsCode = "541511";
    private String naicsDescription = "Custom Computer Programming Services";
    private String pscCode = "D302";
    private String type = "o";
    private String typeDescription = "Solicitation";
    private String url = "https://sam.gov/opp/" + id;
    private String agency = "Department of Defense";
    private String agencyCode = "DOD";
    private String subAgency = "Defense Information Systems Agency";
    private String office = "DISA Contracting Office";
    private String setAsideType = "SBA";
    private String setAsideDescription = "Small Business Set-Aside";
    private String placeOfPerformanceCity = "Washington";
    private String placeOfPerformanceState = "DC";
    private String placeOfPerformanceCountry = "USA";
    private String placeOfPerformanceZip = "20301";
    private BigDecimal awardAmount = null;
    private BigDecimal estimatedValueLow = new BigDecimal("500000");
    private BigDecimal estimatedValueHigh = new BigDecimal("5000000");
    private String contractType = "FFP";
    private String contractNumber = null;
    private String incumbentContractor = null;
    private Boolean isRecoveryAct = false;
    private String sbirPhase = null;
    private Boolean isSbir = false;
    private Boolean isSttr = false;
    private String primaryContactName = "John Smith";
    private String primaryContactEmail = "john.smith@agency.gov";
    private String primaryContactPhone = "202-555-0100";
    private String secondaryContactName = null;
    private String secondaryContactEmail = null;
    private String source = "SAM.gov";
    private DataSource dataSource = DataSource.SAM_GOV;
    private ContractLevel contractLevel = ContractLevel.FEDERAL;
    private OpportunityStatus status = OpportunityStatus.ACTIVE;
    private String stateAgency = null;
    private String localEntity = null;
    private String procurementPortalUrl = null;
    private String bidNumber = null;
    private Boolean isDod = false;
    private String clearanceRequired = null;
    private Boolean itarControlled = false;
    private Boolean cuiRequired = false;

    public static OpportunityTestBuilder anOpportunity() {
        return new OpportunityTestBuilder();
    }

    public static OpportunityTestBuilder anActiveOpportunity() {
        return new OpportunityTestBuilder()
            .withStatus(OpportunityStatus.ACTIVE)
            .withResponseDeadLine(LocalDate.now().plusDays(30));
    }

    public static OpportunityTestBuilder aClosedOpportunity() {
        return new OpportunityTestBuilder()
            .withStatus(OpportunityStatus.CLOSED)
            .withResponseDeadLine(LocalDate.now().minusDays(7));
    }

    public static OpportunityTestBuilder anSbirOpportunity() {
        return new OpportunityTestBuilder()
            .withIsSbir(true)
            .withSbirPhase("Phase I")
            .withTitle("SBIR Topic: Advanced Cybersecurity Solutions")
            .withDataSource(DataSource.SBIR_GOV)
            .withSetAsideType(null)
            .withSetAsideDescription(null);
    }

    public static OpportunityTestBuilder anSttrOpportunity() {
        return new OpportunityTestBuilder()
            .withIsSttr(true)
            .withSbirPhase("Phase I")
            .withTitle("STTR Topic: Machine Learning for Defense Applications")
            .withDataSource(DataSource.SBIR_GOV)
            .withSetAsideType(null)
            .withSetAsideDescription(null);
    }

    public static OpportunityTestBuilder aDodOpportunity() {
        return new OpportunityTestBuilder()
            .withAgency("Department of Defense")
            .withAgencyCode("DOD")
            .withContractLevel(ContractLevel.DOD)
            .withIsDod(true)
            .withClearanceRequired("Secret")
            .withItarControlled(true)
            .withCuiRequired(true);
    }

    public static OpportunityTestBuilder aStateOpportunity() {
        return new OpportunityTestBuilder()
            .withContractLevel(ContractLevel.STATE)
            .withDataSource(DataSource.STATE_PORTAL)
            .withAgency(null)
            .withAgencyCode(null)
            .withStateAgency("California Department of Technology")
            .withTitle("State IT Infrastructure Modernization Project");
    }

    public static OpportunityTestBuilder aLocalOpportunity() {
        return new OpportunityTestBuilder()
            .withContractLevel(ContractLevel.LOCAL)
            .withDataSource(DataSource.LOCAL_PORTAL)
            .withAgency(null)
            .withAgencyCode(null)
            .withLocalEntity("City of Los Angeles")
            .withTitle("Municipal Network Upgrade Services");
    }

    public static OpportunityTestBuilder anOpportunityClosingSoon() {
        return new OpportunityTestBuilder()
            .withResponseDeadLine(LocalDate.now().plusDays(3))
            .withTitle("URGENT: IT Security Assessment - Deadline Approaching");
    }

    // Fluent setters
    public OpportunityTestBuilder withId(String id) {
        this.id = id;
        return this;
    }

    public OpportunityTestBuilder withTitle(String title) {
        this.title = title;
        return this;
    }

    public OpportunityTestBuilder withSolicitationNumber(String solicitationNumber) {
        this.solicitationNumber = solicitationNumber;
        return this;
    }

    public OpportunityTestBuilder withDescription(String description) {
        this.description = description;
        return this;
    }

    public OpportunityTestBuilder withPostedDate(LocalDate postedDate) {
        this.postedDate = postedDate;
        return this;
    }

    public OpportunityTestBuilder withResponseDeadLine(LocalDate responseDeadLine) {
        this.responseDeadLine = responseDeadLine;
        return this;
    }

    public OpportunityTestBuilder withArchiveDate(LocalDate archiveDate) {
        this.archiveDate = archiveDate;
        return this;
    }

    public OpportunityTestBuilder withNaicsCode(String naicsCode) {
        this.naicsCode = naicsCode;
        return this;
    }

    public OpportunityTestBuilder withNaicsDescription(String naicsDescription) {
        this.naicsDescription = naicsDescription;
        return this;
    }

    public OpportunityTestBuilder withPscCode(String pscCode) {
        this.pscCode = pscCode;
        return this;
    }

    public OpportunityTestBuilder withType(String type) {
        this.type = type;
        return this;
    }

    public OpportunityTestBuilder withTypeDescription(String typeDescription) {
        this.typeDescription = typeDescription;
        return this;
    }

    public OpportunityTestBuilder withUrl(String url) {
        this.url = url;
        return this;
    }

    public OpportunityTestBuilder withAgency(String agency) {
        this.agency = agency;
        return this;
    }

    public OpportunityTestBuilder withAgencyCode(String agencyCode) {
        this.agencyCode = agencyCode;
        return this;
    }

    public OpportunityTestBuilder withSubAgency(String subAgency) {
        this.subAgency = subAgency;
        return this;
    }

    public OpportunityTestBuilder withOffice(String office) {
        this.office = office;
        return this;
    }

    public OpportunityTestBuilder withSetAsideType(String setAsideType) {
        this.setAsideType = setAsideType;
        return this;
    }

    public OpportunityTestBuilder withSetAsideDescription(String setAsideDescription) {
        this.setAsideDescription = setAsideDescription;
        return this;
    }

    public OpportunityTestBuilder withPlaceOfPerformanceCity(String city) {
        this.placeOfPerformanceCity = city;
        return this;
    }

    public OpportunityTestBuilder withPlaceOfPerformanceState(String state) {
        this.placeOfPerformanceState = state;
        return this;
    }

    public OpportunityTestBuilder withPlaceOfPerformanceCountry(String country) {
        this.placeOfPerformanceCountry = country;
        return this;
    }

    public OpportunityTestBuilder withPlaceOfPerformanceZip(String zip) {
        this.placeOfPerformanceZip = zip;
        return this;
    }

    public OpportunityTestBuilder withAwardAmount(BigDecimal awardAmount) {
        this.awardAmount = awardAmount;
        return this;
    }

    public OpportunityTestBuilder withEstimatedValueLow(BigDecimal estimatedValueLow) {
        this.estimatedValueLow = estimatedValueLow;
        return this;
    }

    public OpportunityTestBuilder withEstimatedValueHigh(BigDecimal estimatedValueHigh) {
        this.estimatedValueHigh = estimatedValueHigh;
        return this;
    }

    public OpportunityTestBuilder withContractType(String contractType) {
        this.contractType = contractType;
        return this;
    }

    public OpportunityTestBuilder withContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
        return this;
    }

    public OpportunityTestBuilder withIncumbentContractor(String incumbentContractor) {
        this.incumbentContractor = incumbentContractor;
        return this;
    }

    public OpportunityTestBuilder withIsRecoveryAct(Boolean isRecoveryAct) {
        this.isRecoveryAct = isRecoveryAct;
        return this;
    }

    public OpportunityTestBuilder withSbirPhase(String sbirPhase) {
        this.sbirPhase = sbirPhase;
        return this;
    }

    public OpportunityTestBuilder withIsSbir(Boolean isSbir) {
        this.isSbir = isSbir;
        return this;
    }

    public OpportunityTestBuilder withIsSttr(Boolean isSttr) {
        this.isSttr = isSttr;
        return this;
    }

    public OpportunityTestBuilder withPrimaryContactName(String name) {
        this.primaryContactName = name;
        return this;
    }

    public OpportunityTestBuilder withPrimaryContactEmail(String email) {
        this.primaryContactEmail = email;
        return this;
    }

    public OpportunityTestBuilder withPrimaryContactPhone(String phone) {
        this.primaryContactPhone = phone;
        return this;
    }

    public OpportunityTestBuilder withSecondaryContactName(String name) {
        this.secondaryContactName = name;
        return this;
    }

    public OpportunityTestBuilder withSecondaryContactEmail(String email) {
        this.secondaryContactEmail = email;
        return this;
    }

    public OpportunityTestBuilder withSource(String source) {
        this.source = source;
        return this;
    }

    public OpportunityTestBuilder withDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
        return this;
    }

    public OpportunityTestBuilder withContractLevel(ContractLevel contractLevel) {
        this.contractLevel = contractLevel;
        return this;
    }

    public OpportunityTestBuilder withStatus(OpportunityStatus status) {
        this.status = status;
        return this;
    }

    public OpportunityTestBuilder withStateAgency(String stateAgency) {
        this.stateAgency = stateAgency;
        return this;
    }

    public OpportunityTestBuilder withLocalEntity(String localEntity) {
        this.localEntity = localEntity;
        return this;
    }

    public OpportunityTestBuilder withProcurementPortalUrl(String url) {
        this.procurementPortalUrl = url;
        return this;
    }

    public OpportunityTestBuilder withBidNumber(String bidNumber) {
        this.bidNumber = bidNumber;
        return this;
    }

    public OpportunityTestBuilder withIsDod(Boolean isDod) {
        this.isDod = isDod;
        return this;
    }

    public OpportunityTestBuilder withClearanceRequired(String clearanceRequired) {
        this.clearanceRequired = clearanceRequired;
        return this;
    }

    public OpportunityTestBuilder withItarControlled(Boolean itarControlled) {
        this.itarControlled = itarControlled;
        return this;
    }

    public OpportunityTestBuilder withCuiRequired(Boolean cuiRequired) {
        this.cuiRequired = cuiRequired;
        return this;
    }

    public Opportunity build() {
        return Opportunity.builder()
            .id(id)
            .title(title)
            .solicitationNumber(solicitationNumber)
            .description(description)
            .postedDate(postedDate)
            .responseDeadLine(responseDeadLine)
            .archiveDate(archiveDate)
            .naicsCode(naicsCode)
            .naicsDescription(naicsDescription)
            .pscCode(pscCode)
            .type(type)
            .typeDescription(typeDescription)
            .url(url)
            .agency(agency)
            .agencyCode(agencyCode)
            .subAgency(subAgency)
            .office(office)
            .setAsideType(setAsideType)
            .setAsideDescription(setAsideDescription)
            .placeOfPerformanceCity(placeOfPerformanceCity)
            .placeOfPerformanceState(placeOfPerformanceState)
            .placeOfPerformanceCountry(placeOfPerformanceCountry)
            .placeOfPerformanceZip(placeOfPerformanceZip)
            .awardAmount(awardAmount)
            .estimatedValueLow(estimatedValueLow)
            .estimatedValueHigh(estimatedValueHigh)
            .contractType(contractType)
            .contractNumber(contractNumber)
            .incumbentContractor(incumbentContractor)
            .isRecoveryAct(isRecoveryAct)
            .sbirPhase(sbirPhase)
            .isSbir(isSbir)
            .isSttr(isSttr)
            .primaryContactName(primaryContactName)
            .primaryContactEmail(primaryContactEmail)
            .primaryContactPhone(primaryContactPhone)
            .secondaryContactName(secondaryContactName)
            .secondaryContactEmail(secondaryContactEmail)
            .source(source)
            .dataSource(dataSource)
            .contractLevel(contractLevel)
            .status(status)
            .stateAgency(stateAgency)
            .localEntity(localEntity)
            .procurementPortalUrl(procurementPortalUrl)
            .bidNumber(bidNumber)
            .isDod(isDod)
            .clearanceRequired(clearanceRequired)
            .itarControlled(itarControlled)
            .cuiRequired(cuiRequired)
            .build();
    }
}
