package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.ContractClin;
import com.samgov.ingestor.model.ContractClin.ClinType;
import com.samgov.ingestor.model.ContractClin.PricingType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractClinRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.ContractService.CreateClinRequest;
import com.samgov.ingestor.service.ContractService.CreateContractRequest;
import com.samgov.ingestor.service.ContractService.UpdateContractRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for ContractController REST API.
 *
 * Tests focus on HTTP behavior:
 * - Request/response formats
 * - HTTP status codes
 * - Authorization and tenant isolation
 * - Pagination and filtering
 */
@DisplayName("ContractController")
class ContractControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/contracts";

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractClinRepository clinRepository;

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
    private Role testRole;

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
        testRole = Role.builder()
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

        // Set tenant context for ThreadLocal (service layer)
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers (controller layer via TenantContextFilter)
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private Contract createTestContract(String contractNumber) {
        Contract contract = Contract.builder()
            .tenant(testTenant)
            .contractNumber(contractNumber)
            .title("Test Contract " + contractNumber)
            .description("Test description")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("Department of Defense")
            .agencyCode("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .baseValue(new BigDecimal("500000.00"))
            .totalValue(new BigDecimal("500000.00"))
            .fundedValue(new BigDecimal("250000.00"))
            .awardDate(LocalDate.now().minusDays(30))
            .build();
        return contractRepository.save(contract);
    }

    private CreateContractRequest createContractRequest(String contractNumber) {
        return new CreateContractRequest(
            contractNumber,
            "Test Contract " + contractNumber,
            "Test description",
            ContractType.FIRM_FIXED_PRICE,
            null, null,
            "Department of Defense", "DOD", "Army", "Contracting Office",
            LocalDate.now(), LocalDate.now().plusYears(1),
            LocalDate.now().plusMonths(6), LocalDate.now().plusYears(3),
            new BigDecimal("500000.00"), new BigDecimal("500000.00"),
            new BigDecimal("1000000.00"), new BigDecimal("250000.00"),
            "541512", "R425",
            "Washington", "DC", "USA",
            "John Smith", "john.smith@agency.gov", "202-555-1234",
            "Jane Doe", "jane.doe@agency.gov", "202-555-5678",
            null, false, "GSA Schedule", "8(a)",
            new BigDecimal("23.00"), false, null,
            null, null, LocalDate.now().minusDays(30), null
        );
    }

    @Nested
    @DisplayName("POST /contracts")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class CreateContract {

        @Test
        @DisplayName("should create contract and return 201 CREATED")
        void shouldCreateContractSuccessfully() throws Exception {
            // Given
            CreateContractRequest request = createContractRequest("POST-2024-0001");

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.contractNumber", is("POST-2024-0001")))
                .andExpect(jsonPath("$.title", is("Test Contract POST-2024-0001")))
                .andExpect(jsonPath("$.contractType", is("FIRM_FIXED_PRICE")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.agency", is("Department of Defense")));
        }

        @Test
        @DisplayName("should return 400 BAD REQUEST for duplicate contract number")
        void shouldReturn400ForDuplicateContractNumber() throws Exception {
            // Given
            createTestContract("DUP-2024-0001");
            CreateContractRequest request = createContractRequest("DUP-2024-0001");

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should create IDIQ contract with ceiling value")
        void shouldCreateIdiqContract() throws Exception {
            // Given
            CreateContractRequest request = new CreateContractRequest(
                "IDIQ-2024-0001",
                "IT Services IDIQ",
                "Indefinite Delivery Indefinite Quantity contract",
                ContractType.INDEFINITE_DELIVERY,
                null, null,
                "USAF", "USAF", null, null,
                LocalDate.now(), LocalDate.now().plusYears(5),
                null, null,
                new BigDecimal("0.00"), new BigDecimal("50000000.00"),
                new BigDecimal("50000000.00"), new BigDecimal("0.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, LocalDate.now(), null
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contractType", is("INDEFINITE_DELIVERY")))
                .andExpect(jsonPath("$.ceilingValue", is(50000000.00)));
        }

        @Test
        @DisplayName("should create task order under parent IDIQ")
        void shouldCreateTaskOrderUnderIdiq() throws Exception {
            // Given - Create IDIQ first
            Contract idiq = Contract.builder()
                .tenant(testTenant)
                .contractNumber("IDIQ-PARENT-001")
                .title("Parent IDIQ")
                .contractType(ContractType.INDEFINITE_DELIVERY)
                .status(ContractStatus.ACTIVE)
                .agency("USAF")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(5))
                .ceilingValue(new BigDecimal("50000000.00"))
                .build();
            idiq = contractRepository.save(idiq);

            CreateContractRequest taskOrderRequest = new CreateContractRequest(
                "FA8732-24-F-0001",
                "Task Order 1",
                "First task order under IDIQ",
                ContractType.TASK_ORDER,
                idiq.getId(), null,
                "USAF", "USAF", null, null,
                LocalDate.now(), LocalDate.now().plusMonths(6),
                null, null,
                new BigDecimal("150000.00"), new BigDecimal("150000.00"),
                null, new BigDecimal("75000.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, LocalDate.now(), null
            );

            // When/Then
            performPost(BASE_URL, taskOrderRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contractType", is("TASK_ORDER")))
                .andExpect(jsonPath("$.parentContractId", is(idiq.getId().toString())));
        }
    }

    @Nested
    @DisplayName("GET /contracts")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class GetContracts {

        @Test
        @DisplayName("should return paginated list of contracts")
        void shouldReturnPaginatedContracts() throws Exception {
            // Given
            for (int i = 1; i <= 5; i++) {
                createTestContract("LIST-2024-000" + i);
            }

            // When/Then
            mockMvc.perform(get(BASE_URL)
                    .param("page", "0")
                    .param("size", "3")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.totalPages", greaterThanOrEqualTo(2)));
        }

        @Test
        @DisplayName("should return sorted contracts")
        void shouldReturnSortedContracts() throws Exception {
            // Given
            createTestContract("AAA-2024-0001");
            createTestContract("ZZZ-2024-0001");

            // When/Then - Sort descending
            mockMvc.perform(get(BASE_URL)
                    .param("sortBy", "contractNumber")
                    .param("sortDir", "desc")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].contractNumber", is("ZZZ-2024-0001")));
        }

        @Test
        @DisplayName("should return only active contracts")
        void shouldReturnOnlyActiveContracts() throws Exception {
            // Given
            Contract active = createTestContract("ACTIVE-2024-0001");
            Contract completed = Contract.builder()
                .tenant(testTenant)
                .contractNumber("COMPLETED-2024-0001")
                .title("Completed Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.COMPLETED)
                .agency("DOD")
                .popStartDate(LocalDate.now().minusYears(1))
                .popEndDate(LocalDate.now().minusDays(30))
                .totalValue(new BigDecimal("100000.00"))
                .build();
            contractRepository.save(completed);

            // When/Then
            mockMvc.perform(get(BASE_URL + "/active")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].status").value(org.hamcrest.Matchers.everyItem(is("ACTIVE"))));
        }
    }

    @Nested
    @DisplayName("GET /contracts/{id}")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class GetContractById {

        @Test
        @DisplayName("should return contract by ID")
        void shouldReturnContractById() throws Exception {
            // Given
            Contract contract = createTestContract("GET-2024-0001");

            // When/Then
            performGet(BASE_URL + "/" + contract.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(contract.getId().toString())))
                .andExpect(jsonPath("$.contractNumber", is("GET-2024-0001")));
        }

        @Test
        @DisplayName("should return 404 for non-existent contract")
        void shouldReturn404ForNonExistentContract() throws Exception {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            performGet(BASE_URL + "/" + nonExistentId)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /contracts/search")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class SearchContracts {

        @Test
        @DisplayName("should search contracts by keyword")
        void shouldSearchContractsByKeyword() throws Exception {
            // Given
            Contract cybersecurity = Contract.builder()
                .tenant(testTenant)
                .contractNumber("CYBER-2024-0001")
                .title("Cybersecurity Assessment Services")
                .description("Security testing and vulnerability assessment")
                .contractType(ContractType.TIME_AND_MATERIALS)
                .status(ContractStatus.ACTIVE)
                .agency("DHS")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("200000.00"))
                .build();
            contractRepository.save(cybersecurity);

            createTestContract("OTHER-2024-0001");

            // When/Then
            mockMvc.perform(get(BASE_URL + "/search")
                    .param("keyword", "Cybersecurity")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.content[0].title", containsString("Cybersecurity")));
        }
    }

    @Nested
    @DisplayName("GET /contracts/expiring")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class ExpiringContracts {

        @Test
        @DisplayName("should return expiring contracts within threshold")
        void shouldReturnExpiringContracts() throws Exception {
            // Given - Contract expiring in 30 days
            Contract expiring = Contract.builder()
                .tenant(testTenant)
                .contractNumber("EXP-2024-0001")
                .title("Expiring Soon")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .agency("DOD")
                .popStartDate(LocalDate.now().minusMonths(11))
                .popEndDate(LocalDate.now().plusDays(30))
                .totalValue(new BigDecimal("100000.00"))
                .build();
            contractRepository.save(expiring);

            // When/Then
            mockMvc.perform(get(BASE_URL + "/expiring")
                    .param("daysAhead", "90")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[*].contractNumber", org.hamcrest.Matchers.hasItem("EXP-2024-0001")));
        }
    }

    @Nested
    @DisplayName("PUT /contracts/{id}")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class UpdateContract {

        @Test
        @DisplayName("should update contract successfully")
        void shouldUpdateContractSuccessfully() throws Exception {
            // Given
            Contract contract = createTestContract("UPD-2024-0001");
            UpdateContractRequest updateRequest = new UpdateContractRequest(
                "Updated Title",
                "Updated description",
                null, // don't change status
                "Department of Navy",
                null, null,
                new BigDecimal("750000.00"),
                new BigDecimal("400000.00"),
                null, null, null, null,
                null, null, null
            );

            // When/Then
            performPut(BASE_URL + "/" + contract.getId(), updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.description", is("Updated description")))
                .andExpect(jsonPath("$.agency", is("Department of Navy")))
                .andExpect(jsonPath("$.totalValue", is(750000.00)));
        }

        @Test
        @DisplayName("should return 404 when updating non-existent contract")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            UpdateContractRequest updateRequest = new UpdateContractRequest(
                "Updated Title", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null
            );

            // When/Then
            performPut(BASE_URL + "/" + nonExistentId, updateRequest)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PATCH /contracts/{id}/status")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class UpdateContractStatus {

        @Test
        @DisplayName("should update contract status")
        void shouldUpdateContractStatus() throws Exception {
            // Given
            Contract contract = createTestContract("STS-2024-0001");

            // When/Then
            mockMvc.perform(patch(BASE_URL + "/" + contract.getId() + "/status")
                    .param("status", "ON_HOLD")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Verify
            performGet(BASE_URL + "/" + contract.getId())
                .andExpect(jsonPath("$.status", is("ON_HOLD")));
        }

        @Test
        @DisplayName("should transition through contract lifecycle")
        void shouldTransitionThroughLifecycle() throws Exception {
            // Given
            Contract contract = createTestContract("LIFE-2024-0001");

            // When/Then - ACTIVE -> ON_HOLD
            mockMvc.perform(patch(BASE_URL + "/" + contract.getId() + "/status")
                    .param("status", "ON_HOLD")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // ON_HOLD -> ACTIVE
            mockMvc.perform(patch(BASE_URL + "/" + contract.getId() + "/status")
                    .param("status", "ACTIVE")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // ACTIVE -> COMPLETED
            mockMvc.perform(patch(BASE_URL + "/" + contract.getId() + "/status")
                    .param("status", "COMPLETED")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // COMPLETED -> CLOSED
            mockMvc.perform(patch(BASE_URL + "/" + contract.getId() + "/status")
                    .param("status", "CLOSED")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Verify final state
            performGet(BASE_URL + "/" + contract.getId())
                .andExpect(jsonPath("$.status", is("CLOSED")));
        }
    }

    @Nested
    @DisplayName("Contract CLINs Endpoints")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class ContractClins {

        @Test
        @DisplayName("POST /contracts/{id}/clins - should add CLIN")
        void shouldAddClin() throws Exception {
            // Given
            Contract contract = createTestContract("CLIN-2024-0001");
            CreateClinRequest clinRequest = new CreateClinRequest(
                "0001",
                "Base Year Services",
                ClinType.BASE,
                PricingType.FIRM_FIXED_PRICE,
                "Month",
                new BigDecimal("12"),
                new BigDecimal("10000.00"),
                new BigDecimal("120000.00"),
                new BigDecimal("60000.00"),
                "541512", "R425",
                false, null, null
            );

            // When/Then
            performPost(BASE_URL + "/" + contract.getId() + "/clins", clinRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clinNumber", is("0001")))
                .andExpect(jsonPath("$.description", is("Base Year Services")))
                .andExpect(jsonPath("$.clinType", is("BASE")))
                .andExpect(jsonPath("$.totalValue", is(120000.00)));
        }

        @Test
        @DisplayName("GET /contracts/{id}/clins - should return CLINs")
        void shouldReturnClins() throws Exception {
            // Given
            Contract contract = createTestContract("CLIN-2024-0002");

            ContractClin clin1 = ContractClin.builder()
                .contract(contract)
                .clinNumber("0001")
                .description("Base Services")
                .clinType(ClinType.BASE)
                .pricingType(PricingType.FIRM_FIXED_PRICE)
                .totalValue(new BigDecimal("100000.00"))
                .sortOrder(1)
                .build();
            clinRepository.save(clin1);

            ContractClin clin2 = ContractClin.builder()
                .contract(contract)
                .clinNumber("0002")
                .description("Option Year 1")
                .clinType(ClinType.OPTION)
                .pricingType(PricingType.FIRM_FIXED_PRICE)
                .totalValue(new BigDecimal("110000.00"))
                .isOption(true)
                .optionPeriod(1)
                .sortOrder(2)
                .build();
            clinRepository.save(clin2);

            // When/Then
            performGet(BASE_URL + "/" + contract.getId() + "/clins")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].clinNumber", is("0001")))
                .andExpect(jsonPath("$[1].clinNumber", is("0002")));
        }

        @Test
        @DisplayName("PUT /contracts/{id}/clins/{clinId} - should update CLIN")
        void shouldUpdateClin() throws Exception {
            // Given
            Contract contract = createTestContract("CLIN-2024-0003");
            ContractClin clin = ContractClin.builder()
                .contract(contract)
                .clinNumber("0001")
                .description("Original Description")
                .clinType(ClinType.BASE)
                .pricingType(PricingType.FIRM_FIXED_PRICE)
                .totalValue(new BigDecimal("100000.00"))
                .fundedAmount(new BigDecimal("50000.00"))
                .sortOrder(1)
                .build();
            clin = clinRepository.save(clin);

            var updateRequest = new com.samgov.ingestor.service.ContractService.UpdateClinRequest(
                "Updated Description",
                new BigDecimal("150000.00"),
                new BigDecimal("75000.00"),
                new BigDecimal("25000.00"),
                "Updated notes"
            );

            // When/Then
            performPut(BASE_URL + "/" + contract.getId() + "/clins/" + clin.getId(), updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Updated Description")))
                .andExpect(jsonPath("$.totalValue", is(150000.00)))
                .andExpect(jsonPath("$.fundedAmount", is(75000.00)))
                .andExpect(jsonPath("$.invoicedAmount", is(25000.00)));
        }
    }

    @Nested
    @DisplayName("Contract Summary Endpoint")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class ContractSummary {

        @Test
        @DisplayName("GET /contracts/{id}/summary - should return contract summary")
        void shouldReturnContractSummary() throws Exception {
            // Given
            Contract contract = createTestContract("SUM-2024-0001");

            // Add CLINs
            ContractClin clin1 = ContractClin.builder()
                .contract(contract)
                .clinNumber("0001")
                .description("Base Services")
                .clinType(ClinType.BASE)
                .pricingType(PricingType.FIRM_FIXED_PRICE)
                .totalValue(new BigDecimal("100000.00"))
                .fundedAmount(new BigDecimal("50000.00"))
                .invoicedAmount(new BigDecimal("20000.00"))
                .sortOrder(1)
                .build();
            clinRepository.save(clin1);

            // When/Then
            performGet(BASE_URL + "/" + contract.getId() + "/summary")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contractId", is(contract.getId().toString())))
                .andExpect(jsonPath("$.contractNumber", is("SUM-2024-0001")))
                .andExpect(jsonPath("$.clinTotalValue", is(100000.00)))
                .andExpect(jsonPath("$.clinFundedAmount", is(50000.00)))
                .andExpect(jsonPath("$.clinInvoicedAmount", is(20000.00)))
                .andExpect(jsonPath("$.remainingFunds", is(30000.00)));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    @WithMockUser(roles = "CONTRACT_MANAGER")
    class TenantIsolation {

        @Test
        @DisplayName("should not return contracts from other tenants")
        void shouldNotReturnContractsFromOtherTenants() throws Exception {
            // Given - Create contract in current tenant
            Contract contract1 = createTestContract("TENANT1-2024-0001");

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Create contract in second tenant
            Contract contract2 = Contract.builder()
                .tenant(tenant2)
                .contractNumber("TENANT2-2024-0001")
                .title("Tenant 2 Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .agency("DOD")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("100000.00"))
                .build();
            contractRepository.save(contract2);

            // When/Then - Query should only return tenant1's contract
            mockMvc.perform(get(BASE_URL)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].contractNumber",
                    org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("TENANT2-2024-0001"))));
        }

        @Test
        @DisplayName("should return 404 when accessing other tenant's contract")
        void shouldReturn404ForOtherTenantContract() throws Exception {
            // Given - Create second tenant with contract
            Tenant tenant2 = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            Contract otherTenantContract = Contract.builder()
                .tenant(tenant2)
                .contractNumber("OTHER-2024-0001")
                .title("Other Tenant Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .agency("DOD")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("100000.00"))
                .build();
            otherTenantContract = contractRepository.save(otherTenantContract);

            // When/Then - Should return 404 as current tenant can't access it
            performGet(BASE_URL + "/" + otherTenantContract.getId())
                .andExpect(status().isNotFound());
        }
    }
}
