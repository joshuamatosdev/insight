package com.samgov.ingestor.builder;

import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.Tenant;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Test data builder for Contract entities.
 * Uses realistic government contracting data for meaningful tests.
 */
public class ContractTestBuilder {

    private Tenant tenant;
    private String contractNumber = "GS-35F-" + System.currentTimeMillis();
    private String title = "IT Professional Services";
    private String description = "Providing IT professional services including software development and system administration.";
    private ContractType contractType = ContractType.FIRM_FIXED_PRICE;
    private ContractStatus status = ContractStatus.ACTIVE;
    private String agency = "General Services Administration";
    private String agencyCode = "GSA";
    private String subAgency = "Federal Acquisition Service";
    private String office = "IT Schedule 70 Contracting Office";
    private LocalDate popStartDate = LocalDate.now().minusMonths(6);
    private LocalDate popEndDate = LocalDate.now().plusYears(1);
    private LocalDate basePeriodEndDate = LocalDate.now().plusYears(1);
    private LocalDate awardDate = LocalDate.now().minusMonths(6);
    private BigDecimal baseValue = new BigDecimal("500000.00");
    private BigDecimal totalValue = new BigDecimal("2500000.00");
    private BigDecimal ceilingValue = new BigDecimal("5000000.00");
    private BigDecimal fundedValue = new BigDecimal("250000.00");
    private String naicsCode = "541512";
    private String pscCode = "D302";
    private String placeOfPerformanceCity = "Washington";
    private String placeOfPerformanceState = "DC";
    private String placeOfPerformanceCountry = "USA";
    private String contractingOfficerName = "Jane Doe";
    private String contractingOfficerEmail = "jane.doe@gsa.gov";
    private String contractingOfficerPhone = "202-555-0100";
    private String corName = "John Smith";
    private String corEmail = "john.smith@gsa.gov";
    private Boolean isSubcontract = false;
    private String contractVehicle = "GSA Schedule 70";
    private String setAsideType = "Small Business";
    private Boolean requiresClearance = false;

    public static ContractTestBuilder aContract() {
        return new ContractTestBuilder();
    }

    public static ContractTestBuilder anActiveContract() {
        return new ContractTestBuilder()
            .withStatus(ContractStatus.ACTIVE)
            .withPopEndDate(LocalDate.now().plusYears(1));
    }

    public static ContractTestBuilder aTimeAndMaterialsContract() {
        return new ContractTestBuilder()
            .withContractType(ContractType.TIME_AND_MATERIALS)
            .withTitle("T&M Software Development Services")
            .withCeilingValue(new BigDecimal("1000000.00"));
    }

    public static ContractTestBuilder aCostPlusContract() {
        return new ContractTestBuilder()
            .withContractType(ContractType.COST_PLUS_FIXED_FEE)
            .withTitle("CPFF Research and Development Services");
    }

    public static ContractTestBuilder anIdiqContract() {
        return new ContractTestBuilder()
            .withContractType(ContractType.INDEFINITE_DELIVERY)
            .withTitle("IDIQ - IT Services Multiple Award Contract")
            .withCeilingValue(new BigDecimal("50000000.00"));
    }

    public static ContractTestBuilder aTaskOrderContract() {
        return new ContractTestBuilder()
            .withContractType(ContractType.TASK_ORDER)
            .withTitle("Task Order - Cloud Migration Services");
    }

    public static ContractTestBuilder aCompletedContract() {
        return new ContractTestBuilder()
            .withStatus(ContractStatus.COMPLETED)
            .withPopEndDate(LocalDate.now().minusMonths(1));
    }

    public static ContractTestBuilder anExpiringContract() {
        return new ContractTestBuilder()
            .withPopEndDate(LocalDate.now().plusDays(30));
    }

    public static ContractTestBuilder aDodContract() {
        return new ContractTestBuilder()
            .withAgency("Department of Defense")
            .withAgencyCode("DOD")
            .withSubAgency("Defense Information Systems Agency")
            .withRequiresClearance(true);
    }

    public ContractTestBuilder withTenant(Tenant tenant) {
        this.tenant = tenant;
        return this;
    }

    public ContractTestBuilder withContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
        return this;
    }

    public ContractTestBuilder withTitle(String title) {
        this.title = title;
        return this;
    }

    public ContractTestBuilder withDescription(String description) {
        this.description = description;
        return this;
    }

    public ContractTestBuilder withContractType(ContractType contractType) {
        this.contractType = contractType;
        return this;
    }

    public ContractTestBuilder withStatus(ContractStatus status) {
        this.status = status;
        return this;
    }

    public ContractTestBuilder withAgency(String agency) {
        this.agency = agency;
        return this;
    }

    public ContractTestBuilder withAgencyCode(String agencyCode) {
        this.agencyCode = agencyCode;
        return this;
    }

    public ContractTestBuilder withSubAgency(String subAgency) {
        this.subAgency = subAgency;
        return this;
    }

    public ContractTestBuilder withOffice(String office) {
        this.office = office;
        return this;
    }

    public ContractTestBuilder withPopStartDate(LocalDate popStartDate) {
        this.popStartDate = popStartDate;
        return this;
    }

    public ContractTestBuilder withPopEndDate(LocalDate popEndDate) {
        this.popEndDate = popEndDate;
        return this;
    }

    public ContractTestBuilder withBasePeriodEndDate(LocalDate basePeriodEndDate) {
        this.basePeriodEndDate = basePeriodEndDate;
        return this;
    }

    public ContractTestBuilder withAwardDate(LocalDate awardDate) {
        this.awardDate = awardDate;
        return this;
    }

    public ContractTestBuilder withBaseValue(BigDecimal baseValue) {
        this.baseValue = baseValue;
        return this;
    }

    public ContractTestBuilder withTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
        return this;
    }

    public ContractTestBuilder withCeilingValue(BigDecimal ceilingValue) {
        this.ceilingValue = ceilingValue;
        return this;
    }

    public ContractTestBuilder withFundedValue(BigDecimal fundedValue) {
        this.fundedValue = fundedValue;
        return this;
    }

    public ContractTestBuilder withNaicsCode(String naicsCode) {
        this.naicsCode = naicsCode;
        return this;
    }

    public ContractTestBuilder withPscCode(String pscCode) {
        this.pscCode = pscCode;
        return this;
    }

    public ContractTestBuilder withPlaceOfPerformanceCity(String city) {
        this.placeOfPerformanceCity = city;
        return this;
    }

    public ContractTestBuilder withPlaceOfPerformanceState(String state) {
        this.placeOfPerformanceState = state;
        return this;
    }

    public ContractTestBuilder withPlaceOfPerformanceCountry(String country) {
        this.placeOfPerformanceCountry = country;
        return this;
    }

    public ContractTestBuilder withContractingOfficerName(String name) {
        this.contractingOfficerName = name;
        return this;
    }

    public ContractTestBuilder withContractingOfficerEmail(String email) {
        this.contractingOfficerEmail = email;
        return this;
    }

    public ContractTestBuilder withContractingOfficerPhone(String phone) {
        this.contractingOfficerPhone = phone;
        return this;
    }

    public ContractTestBuilder withCorName(String name) {
        this.corName = name;
        return this;
    }

    public ContractTestBuilder withCorEmail(String email) {
        this.corEmail = email;
        return this;
    }

    public ContractTestBuilder withIsSubcontract(Boolean isSubcontract) {
        this.isSubcontract = isSubcontract;
        return this;
    }

    public ContractTestBuilder withContractVehicle(String contractVehicle) {
        this.contractVehicle = contractVehicle;
        return this;
    }

    public ContractTestBuilder withSetAsideType(String setAsideType) {
        this.setAsideType = setAsideType;
        return this;
    }

    public ContractTestBuilder withRequiresClearance(Boolean requiresClearance) {
        this.requiresClearance = requiresClearance;
        return this;
    }

    public Contract build() {
        if (tenant == null) {
            throw new IllegalStateException("Tenant must be set before building Contract");
        }

        return Contract.builder()
            .tenant(tenant)
            .contractNumber(contractNumber)
            .title(title)
            .description(description)
            .contractType(contractType)
            .status(status)
            .agency(agency)
            .agencyCode(agencyCode)
            .subAgency(subAgency)
            .office(office)
            .popStartDate(popStartDate)
            .popEndDate(popEndDate)
            .basePeriodEndDate(basePeriodEndDate)
            .awardDate(awardDate)
            .baseValue(baseValue)
            .totalValue(totalValue)
            .ceilingValue(ceilingValue)
            .fundedValue(fundedValue)
            .naicsCode(naicsCode)
            .pscCode(pscCode)
            .placeOfPerformanceCity(placeOfPerformanceCity)
            .placeOfPerformanceState(placeOfPerformanceState)
            .placeOfPerformanceCountry(placeOfPerformanceCountry)
            .contractingOfficerName(contractingOfficerName)
            .contractingOfficerEmail(contractingOfficerEmail)
            .contractingOfficerPhone(contractingOfficerPhone)
            .corName(corName)
            .corEmail(corEmail)
            .isSubcontract(isSubcontract)
            .contractVehicle(contractVehicle)
            .setAsideType(setAsideType)
            .requiresClearance(requiresClearance)
            .build();
    }
}
