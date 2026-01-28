package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.ContractClin;
import com.samgov.ingestor.model.ContractClin.ClinType;
import com.samgov.ingestor.model.ContractClin.PricingType;
import com.samgov.ingestor.model.ContractModification;
import com.samgov.ingestor.model.ContractModification.ModificationStatus;
import com.samgov.ingestor.model.ContractModification.ModificationType;
import com.samgov.ingestor.model.ContractOption;
import com.samgov.ingestor.model.ContractOption.OptionStatus;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractClinRepository;
import com.samgov.ingestor.repository.ContractModificationRepository;
import com.samgov.ingestor.repository.ContractOptionRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.ContractService.CreateClinRequest;
import com.samgov.ingestor.service.ContractService.CreateModificationRequest;
import com.samgov.ingestor.service.ContractService.CreateOptionRequest;
import com.samgov.ingestor.service.ContractService.UpdateClinRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for Contract CLIN, Modification, and Option endpoints.
 *
 * Tests focus on:
 * - CLIN management (add, update, delete)
 * - Modification creation and execution
 * - Option management and exercise
 * - Value calculations and tracking
 */
@DisplayName("Contract CLINs, Modifications, and Options")
class ContractClinControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/contracts";

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractClinRepository clinRepository;

    @Autowired
    private ContractModificationRepository modificationRepository;

    @Autowired
    private ContractOptionRepository optionRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    private Tenant testTenant;
    private User testUser;
    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role with CONTRACT permissions
        Role testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .permissions("CONTRACT_CREATE,CONTRACT_READ,CONTRACT_UPDATE,CONTRACT_DELETE")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        // Create test user
        testUser = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        // Create tenant membership
        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(membership);

        // Set tenant context
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();

        // Create base test contract
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("TEST-2024-0001")
            .title("Test Contract")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("Department of Defense")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .baseValue(new BigDecimal("500000.00"))
            .totalValue(new BigDecimal("500000.00"))
            .fundedValue(new BigDecimal("250000.00"))
            .build();
        testContract = contractRepository.save(testContract);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("CLIN Endpoints")
    class ClinEndpoints {

        @Test
        @DisplayName("POST /{contractId}/clins - should add CLIN to contract")
        void shouldAddClinToContract() throws Exception {
            // Given
            CreateClinRequest clinRequest = new CreateClinRequest(
                "0001",
                "Base Year Software Development",
                ClinType.BASE,
                PricingType.TIME_AND_MATERIALS,
                "Hour",
                new BigDecimal("2000"),
                new BigDecimal("150.00"),
                new BigDecimal("300000.00"),
                new BigDecimal("150000.00"),
                "541512",
                "D302",
                false,
                null,
                "Base year development services"
            );

            // When/Then
            performPost(BASE_URL + "/" + testContract.getId() + "/clins", clinRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.clinNumber", is("0001")))
                .andExpect(jsonPath("$.description", is("Base Year Software Development")))
                .andExpect(jsonPath("$.clinType", is("BASE")))
                .andExpect(jsonPath("$.pricingType", is("TIME_AND_MATERIALS")))
                .andExpect(jsonPath("$.unitOfIssue", is("Hour")))
                .andExpect(jsonPath("$.quantity", is(2000)))
                .andExpect(jsonPath("$.unitPrice", is(150.00)))
                .andExpect(jsonPath("$.totalValue", is(300000.00)))
                .andExpect(jsonPath("$.fundedAmount", is(150000.00)));
        }

        @Test
        @DisplayName("POST /{contractId}/clins - should add Option CLIN")
        void shouldAddOptionClin() throws Exception {
            // Given
            CreateClinRequest clinRequest = new CreateClinRequest(
                "1001",
                "Option Year 1 Services",
                ClinType.OPTION,
                PricingType.FIRM_FIXED_PRICE,
                "Lot",
                new BigDecimal("1"),
                new BigDecimal("350000.00"),
                new BigDecimal("350000.00"),
                new BigDecimal("0.00"), // not funded yet
                null,
                null,
                true, // is option
                1,    // option period 1
                "Option year 1 services"
            );

            // When/Then
            performPost(BASE_URL + "/" + testContract.getId() + "/clins", clinRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clinNumber", is("1001")))
                .andExpect(jsonPath("$.clinType", is("OPTION")))
                .andExpect(jsonPath("$.isOption", is(true)))
                .andExpect(jsonPath("$.optionPeriod", is(1)));
        }

        @Test
        @DisplayName("GET /{contractId}/clins - should return all CLINs")
        void shouldReturnAllClins() throws Exception {
            // Given - Add multiple CLINs
            addTestClin("0001", ClinType.BASE, new BigDecimal("100000.00"), 1);
            addTestClin("0002", ClinType.SERVICES, new BigDecimal("50000.00"), 2);
            addTestClin("1001", ClinType.OPTION, new BigDecimal("110000.00"), 3);

            // When/Then
            performGet(BASE_URL + "/" + testContract.getId() + "/clins")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].clinNumber", is("0001")))
                .andExpect(jsonPath("$[1].clinNumber", is("0002")))
                .andExpect(jsonPath("$[2].clinNumber", is("1001")));
        }

        @Test
        @DisplayName("PUT /{contractId}/clins/{clinId} - should update CLIN")
        void shouldUpdateClin() throws Exception {
            // Given
            ContractClin clin = addTestClin("0001", ClinType.BASE, new BigDecimal("100000.00"), 1);
            clin.setFundedAmount(new BigDecimal("50000.00"));
            clin = clinRepository.save(clin);

            UpdateClinRequest updateRequest = new UpdateClinRequest(
                "Updated Description",
                new BigDecimal("120000.00"),
                new BigDecimal("75000.00"),
                new BigDecimal("30000.00"),
                "Updated CLIN notes"
            );

            // When/Then
            performPut(BASE_URL + "/" + testContract.getId() + "/clins/" + clin.getId(), updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Updated Description")))
                .andExpect(jsonPath("$.totalValue", is(120000.00)))
                .andExpect(jsonPath("$.fundedAmount", is(75000.00)))
                .andExpect(jsonPath("$.invoicedAmount", is(30000.00)))
                .andExpect(jsonPath("$.remainingFunds", is(45000.00))); // 75000 - 30000
        }

        @Test
        @DisplayName("should calculate remaining funds correctly")
        void shouldCalculateRemainingFundsCorrectly() throws Exception {
            // Given
            ContractClin clin = addTestClin("0001", ClinType.SERVICES, new BigDecimal("200000.00"), 1);
            clin.setFundedAmount(new BigDecimal("100000.00"));
            clin.setInvoicedAmount(new BigDecimal("45000.00"));
            clin = clinRepository.save(clin);

            // When/Then
            performGet(BASE_URL + "/" + testContract.getId() + "/clins")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fundedAmount", is(100000.00)))
                .andExpect(jsonPath("$[0].invoicedAmount", is(45000.00)))
                .andExpect(jsonPath("$[0].remainingFunds", is(55000.00)));
        }

        @Test
        @DisplayName("should reject duplicate CLIN numbers")
        void shouldRejectDuplicateClinNumbers() throws Exception {
            // Given - Add first CLIN
            addTestClin("0001", ClinType.BASE, new BigDecimal("100000.00"), 1);

            CreateClinRequest duplicateRequest = new CreateClinRequest(
                "0001", // duplicate number
                "Duplicate CLIN",
                ClinType.BASE,
                PricingType.FIRM_FIXED_PRICE,
                "Lot", new BigDecimal("1"), new BigDecimal("50000.00"),
                new BigDecimal("50000.00"), new BigDecimal("25000.00"),
                null, null, false, null, null
            );

            // When/Then
            performPost(BASE_URL + "/" + testContract.getId() + "/clins", duplicateRequest)
                .andExpect(status().isBadRequest());
        }

        private ContractClin addTestClin(String clinNumber, ClinType type, BigDecimal totalValue, int sortOrder) {
            ContractClin clin = ContractClin.builder()
                .contract(testContract)
                .clinNumber(clinNumber)
                .description("Test CLIN " + clinNumber)
                .clinType(type)
                .pricingType(PricingType.FIRM_FIXED_PRICE)
                .totalValue(totalValue)
                .sortOrder(sortOrder)
                .isOption(type == ClinType.OPTION)
                .build();
            return clinRepository.save(clin);
        }
    }

    @Nested
    @DisplayName("Modification Endpoints")
    class ModificationEndpoints {

        @Test
        @DisplayName("POST /{contractId}/modifications - should create modification")
        void shouldCreateModification() throws Exception {
            // Given
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00001",
                "Incremental Funding",
                "Incremental funding modification",
                ModificationType.INCREMENTAL_FUNDING,
                LocalDate.now(),
                null, // no value change
                new BigDecimal("125000.00"),
                null,
                null, null, null,
                "Finance Office",
                "John Smith",
                "FY25 Q2 funding",
                null
            );

            // When/Then
            performPost(BASE_URL + "/" + testContract.getId() + "/modifications", modRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.modificationNumber", is("P00001")))
                .andExpect(jsonPath("$.modificationType", is("INCREMENTAL_FUNDING")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.fundingChange", is(125000.00)));
        }

        @Test
        @DisplayName("GET /{contractId}/modifications - should return modifications")
        void shouldReturnModifications() throws Exception {
            // Given
            addTestModification("A00001", ModificationType.ADMINISTRATIVE, null, null);
            addTestModification("P00001", ModificationType.INCREMENTAL_FUNDING, null, new BigDecimal("50000.00"));
            addTestModification("P00002", ModificationType.BILATERAL, new BigDecimal("100000.00"), null);

            // When/Then
            performGet(BASE_URL + "/" + testContract.getId() + "/modifications")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
        }

        @Test
        @DisplayName("POST /{contractId}/modifications/{modId}/execute - should execute modification")
        void shouldExecuteModification() throws Exception {
            // Given
            ContractModification mod = addTestModification(
                "P00001", ModificationType.BILATERAL,
                new BigDecimal("50000.00"), new BigDecimal("25000.00")
            );
            mod.setNewTotalValue(new BigDecimal("550000.00"));
            mod = modificationRepository.save(mod);

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + testContract.getId() + "/modifications/" + mod.getId() + "/execute")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("EXECUTED")))
                .andExpect(jsonPath("$.executedDate", notNullValue()));

            // Verify contract updated
            performGet(BASE_URL + "/" + testContract.getId())
                .andExpect(jsonPath("$.totalValue", is(550000.00)));
        }

        @Test
        @DisplayName("should update contract PoP when executing extension mod")
        void shouldUpdateContractPoPWhenExecutingExtension() throws Exception {
            // Given
            LocalDate newEndDate = LocalDate.now().plusYears(2);
            ContractModification mod = addTestModification(
                "P00001", ModificationType.NO_COST_EXTENSION, null, null
            );
            mod.setNewPopEndDate(newEndDate);
            mod = modificationRepository.save(mod);

            // When
            mockMvc.perform(post(BASE_URL + "/" + testContract.getId() + "/modifications/" + mod.getId() + "/execute")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Then
            performGet(BASE_URL + "/" + testContract.getId())
                .andExpect(jsonPath("$.popEndDate", is(newEndDate.toString())));
        }

        private ContractModification addTestModification(
            String modNumber,
            ModificationType type,
            BigDecimal valueChange,
            BigDecimal fundingChange
        ) {
            ContractModification mod = ContractModification.builder()
                .contract(testContract)
                .modificationNumber(modNumber)
                .title("Test Modification " + modNumber)
                .modificationType(type)
                .status(ModificationStatus.PENDING)
                .effectiveDate(LocalDate.now())
                .valueChange(valueChange)
                .fundingChange(fundingChange)
                .build();
            return modificationRepository.save(mod);
        }
    }

    @Nested
    @DisplayName("Option Endpoints")
    class OptionEndpoints {

        @Test
        @DisplayName("POST /{contractId}/options - should add option")
        void shouldAddOption() throws Exception {
            // Given
            CreateOptionRequest optionRequest = new CreateOptionRequest(
                1,
                2,
                "Option Year 1",
                LocalDate.now().plusYears(1),
                LocalDate.now().plusYears(2),
                LocalDate.now().plusMonths(10),
                new BigDecimal("200000.00"),
                12,
                "First option year"
            );

            // When/Then
            performPost(BASE_URL + "/" + testContract.getId() + "/options", optionRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.optionNumber", is(1)))
                .andExpect(jsonPath("$.optionYear", is(2)))
                .andExpect(jsonPath("$.description", is("Option Year 1")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.optionValue", is(200000.00)))
                .andExpect(jsonPath("$.exercisedDate", nullValue()));
        }

        @Test
        @DisplayName("GET /{contractId}/options - should return options")
        void shouldReturnOptions() throws Exception {
            // Given
            addTestOption(1, 2, new BigDecimal("150000.00"));
            addTestOption(2, 3, new BigDecimal("160000.00"));
            addTestOption(3, 4, new BigDecimal("170000.00"));

            // When/Then
            performGet(BASE_URL + "/" + testContract.getId() + "/options")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].optionNumber", is(1)))
                .andExpect(jsonPath("$[1].optionNumber", is(2)))
                .andExpect(jsonPath("$[2].optionNumber", is(3)));
        }

        @Test
        @DisplayName("POST /{contractId}/options/{optionId}/exercise - should exercise option")
        void shouldExerciseOption() throws Exception {
            // Given
            ContractOption option = addTestOption(1, 2, new BigDecimal("150000.00"));
            option.setEndDate(LocalDate.now().plusYears(2));
            option = optionRepository.save(option);

            // When/Then
            mockMvc.perform(post(BASE_URL + "/" + testContract.getId() + "/options/" + option.getId() + "/exercise")
                    .param("modificationNumber", "P00001")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("EXERCISED")))
                .andExpect(jsonPath("$.exercisedDate", is(LocalDate.now().toString())))
                .andExpect(jsonPath("$.exerciseModificationNumber", is("P00001")));

            // Verify contract updated
            performGet(BASE_URL + "/" + testContract.getId())
                .andExpect(jsonPath("$.totalValue", is(650000.00))); // 500k + 150k
        }

        @Test
        @DisplayName("GET /options/approaching-deadlines - should return approaching deadlines")
        void shouldReturnApproachingDeadlines() throws Exception {
            // Given - Option with approaching deadline
            ContractOption approachingOption = addTestOption(1, 2, new BigDecimal("100000.00"));
            approachingOption.setExerciseDeadline(LocalDate.now().plusDays(30));
            approachingOption = optionRepository.save(approachingOption);

            // Option with far deadline
            ContractOption farOption = addTestOption(2, 3, new BigDecimal("100000.00"));
            farOption.setExerciseDeadline(LocalDate.now().plusYears(1));
            optionRepository.save(farOption);

            // When/Then
            mockMvc.perform(get(BASE_URL + "/options/approaching-deadlines")
                    .param("daysAhead", "60")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))));
        }

        private ContractOption addTestOption(int optionNumber, int optionYear, BigDecimal value) {
            ContractOption option = ContractOption.builder()
                .contract(testContract)
                .optionNumber(optionNumber)
                .optionYear(optionYear)
                .description("Option Year " + optionNumber)
                .status(OptionStatus.PENDING)
                .startDate(LocalDate.now().plusYears(optionNumber))
                .endDate(LocalDate.now().plusYears(optionNumber + 1))
                .exerciseDeadline(LocalDate.now().plusMonths(10 * optionNumber))
                .optionValue(value)
                .durationMonths(12)
                .build();
            return optionRepository.save(option);
        }
    }

    @Nested
    @DisplayName("Contract Value Calculations")
    class ContractValueCalculations {

        @Test
        @DisplayName("should calculate CLIN totals in contract summary")
        void shouldCalculateClinTotalsInSummary() throws Exception {
            // Given - Add CLINs with various values
            ContractClin clin1 = ContractClin.builder()
                .contract(testContract)
                .clinNumber("0001")
                .description("CLIN 1")
                .clinType(ClinType.BASE)
                .pricingType(PricingType.FIRM_FIXED_PRICE)
                .totalValue(new BigDecimal("150000.00"))
                .fundedAmount(new BigDecimal("100000.00"))
                .invoicedAmount(new BigDecimal("40000.00"))
                .sortOrder(1)
                .build();
            clinRepository.save(clin1);

            ContractClin clin2 = ContractClin.builder()
                .contract(testContract)
                .clinNumber("0002")
                .description("CLIN 2")
                .clinType(ClinType.SERVICES)
                .pricingType(PricingType.TIME_AND_MATERIALS)
                .totalValue(new BigDecimal("100000.00"))
                .fundedAmount(new BigDecimal("50000.00"))
                .invoicedAmount(new BigDecimal("25000.00"))
                .sortOrder(2)
                .build();
            clinRepository.save(clin2);

            // When/Then
            performGet(BASE_URL + "/" + testContract.getId() + "/summary")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clinTotalValue", is(250000.00))) // 150k + 100k
                .andExpect(jsonPath("$.clinFundedAmount", is(150000.00))) // 100k + 50k
                .andExpect(jsonPath("$.clinInvoicedAmount", is(65000.00))) // 40k + 25k
                .andExpect(jsonPath("$.remainingFunds", is(85000.00))); // 150k - 65k
        }

        @Test
        @DisplayName("should track pending modifications count")
        void shouldTrackPendingModificationsCount() throws Exception {
            // Given
            addModificationWithStatus("P00001", ModificationStatus.PENDING);
            addModificationWithStatus("P00002", ModificationStatus.PENDING);
            addModificationWithStatus("P00003", ModificationStatus.EXECUTED);

            // When/Then
            performGet(BASE_URL + "/" + testContract.getId() + "/summary")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modificationCount", is(3)))
                .andExpect(jsonPath("$.pendingModifications", is(2)));
        }

        @Test
        @DisplayName("should track pending options count and value")
        void shouldTrackPendingOptionsCountAndValue() throws Exception {
            // Given
            addOptionWithStatus(1, new BigDecimal("100000.00"), OptionStatus.PENDING);
            addOptionWithStatus(2, new BigDecimal("110000.00"), OptionStatus.PENDING);
            addOptionWithStatus(3, new BigDecimal("120000.00"), OptionStatus.EXERCISED);

            // When/Then
            performGet(BASE_URL + "/" + testContract.getId() + "/summary")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingOptions", is(2)))
                .andExpect(jsonPath("$.pendingOptionValue", is(210000.00))); // 100k + 110k
        }

        private void addModificationWithStatus(String modNumber, ModificationStatus status) {
            ContractModification mod = ContractModification.builder()
                .contract(testContract)
                .modificationNumber(modNumber)
                .title("Test Mod " + modNumber)
                .modificationType(ModificationType.ADMINISTRATIVE)
                .status(status)
                .effectiveDate(LocalDate.now())
                .build();
            modificationRepository.save(mod);
        }

        private void addOptionWithStatus(int optionNumber, BigDecimal value, OptionStatus status) {
            ContractOption option = ContractOption.builder()
                .contract(testContract)
                .optionNumber(optionNumber)
                .optionYear(optionNumber + 1)
                .description("Option " + optionNumber)
                .status(status)
                .optionValue(value)
                .startDate(LocalDate.now().plusYears(optionNumber))
                .endDate(LocalDate.now().plusYears(optionNumber + 1))
                .build();
            optionRepository.save(option);
        }
    }
}
