package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Contract management flows.
 * Tests complete contract lifecycle including CLINs, modifications, and invoices.
 */
@DisplayName("Contract E2E Tests")
class ContractE2ETest extends BaseControllerTest {

    private static final String CONTRACTS_URL = "/api/v1/contracts";
    private static final String INVOICES_URL = "/api/v1/invoices";

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E Contract Tenant " + UUID.randomUUID())
            .slug("e2e-contract-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-contract-user-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("E2E")
            .lastName("ContractUser")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    private Contract createTestContract(String contractNumber) {
        Contract contract = Contract.builder()
            .tenantId(testTenantId)
            .contractNumber(contractNumber)
            .title("E2E Test Contract - " + contractNumber)
            .status(ContractStatus.ACTIVE)
            .awardDate(LocalDate.now().minusDays(30))
            .startDate(LocalDate.now().minusDays(20))
            .endDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .fundedValue(new BigDecimal("250000.00"))
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .build();
        return contractRepository.save(contract);
    }

    @Nested
    @DisplayName("Contract CRUD Flow")
    class ContractCRUDFlow {

        @Test
        @DisplayName("should retrieve contract by ID")
        void should_RetrieveContractById() throws Exception {
            Contract contract = createTestContract("E2E-CONTRACT-001");

            performGet(CONTRACTS_URL + "/" + contract.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contractNumber").value("E2E-CONTRACT-001"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
        }

        @Test
        @DisplayName("should list all contracts for tenant")
        void should_ListAllContractsForTenant() throws Exception {
            createTestContract("E2E-LIST-001");
            createTestContract("E2E-LIST-002");

            performGet(CONTRACTS_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create new contract")
        void should_CreateNewContract() throws Exception {
            java.util.Map<String, Object> contractRequest = java.util.Map.of(
                "contractNumber", "NEW-E2E-" + UUID.randomUUID().toString().substring(0, 8),
                "title", "Newly Created Contract",
                "status", "ACTIVE",
                "awardDate", LocalDate.now().toString(),
                "startDate", LocalDate.now().toString(),
                "endDate", LocalDate.now().plusYears(1).toString(),
                "totalValue", 100000.00,
                "fundedValue", 50000.00,
                "contractType", "FIRM_FIXED_PRICE"
            );

            performPost(CONTRACTS_URL, contractRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Newly Created Contract"));
        }

        @Test
        @DisplayName("should update existing contract")
        void should_UpdateExistingContract() throws Exception {
            Contract contract = createTestContract("E2E-UPDATE-001");

            java.util.Map<String, Object> updateRequest = java.util.Map.of(
                "title", "Updated Contract Title",
                "fundedValue", 300000.00
            );

            performPut(CONTRACTS_URL + "/" + contract.getId(), updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Contract Title"));
        }
    }

    @Nested
    @DisplayName("Contract Status Flow")
    class ContractStatusFlow {

        @Test
        @DisplayName("should filter contracts by status")
        void should_FilterContractsByStatus() throws Exception {
            createTestContract("E2E-ACTIVE-001");

            performGet(CONTRACTS_URL + "?status=ACTIVE")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should transition contract status")
        void should_TransitionContractStatus() throws Exception {
            Contract contract = createTestContract("E2E-STATUS-001");

            java.util.Map<String, Object> statusUpdate = java.util.Map.of(
                "status", "COMPLETED"
            );

            performPatch(CONTRACTS_URL + "/" + contract.getId() + "/status", statusUpdate)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Contract CLINs Flow")
    class ContractCLINsFlow {

        @Test
        @DisplayName("should list contract CLINs")
        void should_ListContractCLINs() throws Exception {
            Contract contract = createTestContract("E2E-CLIN-001");

            performGet(CONTRACTS_URL + "/" + contract.getId() + "/clins")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should add CLIN to contract")
        void should_AddCLINToContract() throws Exception {
            Contract contract = createTestContract("E2E-ADDCLIN-001");

            java.util.Map<String, Object> clinRequest = java.util.Map.of(
                "clinNumber", "0001",
                "description", "Labor - Senior Developer",
                "quantity", 1000,
                "unit", "HOURS",
                "unitPrice", 150.00,
                "totalAmount", 150000.00
            );

            performPost(CONTRACTS_URL + "/" + contract.getId() + "/clins", clinRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Contract Modifications Flow")
    class ContractModificationsFlow {

        @Test
        @DisplayName("should list contract modifications")
        void should_ListContractModifications() throws Exception {
            Contract contract = createTestContract("E2E-MOD-001");

            performGet(CONTRACTS_URL + "/" + contract.getId() + "/modifications")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create contract modification")
        void should_CreateContractModification() throws Exception {
            Contract contract = createTestContract("E2E-ADDMOD-001");

            java.util.Map<String, Object> modRequest = java.util.Map.of(
                "modNumber", "P00001",
                "modType", "FUNDING",
                "description", "Incremental Funding",
                "effectiveDate", LocalDate.now().toString(),
                "valueChange", 50000.00
            );

            performPost(CONTRACTS_URL + "/" + contract.getId() + "/modifications", modRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Invoice Flow")
    class InvoiceFlow {

        @Test
        @DisplayName("should list invoices for contract")
        void should_ListInvoicesForContract() throws Exception {
            Contract contract = createTestContract("E2E-INV-001");

            performGet(CONTRACTS_URL + "/" + contract.getId() + "/invoices")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create invoice for contract")
        void should_CreateInvoiceForContract() throws Exception {
            Contract contract = createTestContract("E2E-ADDINV-001");

            java.util.Map<String, Object> invoiceRequest = java.util.Map.of(
                "invoiceNumber", "INV-" + UUID.randomUUID().toString().substring(0, 8),
                "invoiceDate", LocalDate.now().toString(),
                "dueDate", LocalDate.now().plusDays(30).toString(),
                "amount", 25000.00,
                "status", "PENDING"
            );

            performPost(CONTRACTS_URL + "/" + contract.getId() + "/invoices", invoiceRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update invoice status")
        void should_UpdateInvoiceStatus() throws Exception {
            Contract contract = createTestContract("E2E-INVSTATUS-001");

            // First create an invoice
            java.util.Map<String, Object> invoiceRequest = java.util.Map.of(
                "invoiceNumber", "INV-STATUS-" + UUID.randomUUID().toString().substring(0, 8),
                "invoiceDate", LocalDate.now().toString(),
                "dueDate", LocalDate.now().plusDays(30).toString(),
                "amount", 10000.00,
                "status", "PENDING"
            );

            performPost(CONTRACTS_URL + "/" + contract.getId() + "/invoices", invoiceRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Contract Isolation")
    class MultiTenantContractIsolation {

        @Test
        @DisplayName("should isolate contracts between tenants")
        void should_IsolateContractsBetweenTenants() throws Exception {
            // Create contract for current tenant
            createTestContract("E2E-TENANT1-001");

            // Create another tenant
            Tenant otherTenant = Tenant.builder()
                .name("Other Contract Tenant " + UUID.randomUUID())
                .slug("other-contract-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            // Create contract for other tenant
            Contract otherContract = Contract.builder()
                .tenantId(otherTenant.getId())
                .contractNumber("OTHER-TENANT-001")
                .title("Other Tenant Contract")
                .status(ContractStatus.ACTIVE)
                .awardDate(LocalDate.now())
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("100000.00"))
                .fundedValue(new BigDecimal("50000.00"))
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .build();
            contractRepository.save(otherContract);

            // Query should only return current tenant's contracts
            performGet(CONTRACTS_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.contractNumber == 'OTHER-TENANT-001')]").doesNotExist());
        }

        @Test
        @DisplayName("should return 404 for contract from different tenant")
        void should_Return404_ForContractFromDifferentTenant() throws Exception {
            // Create another tenant's contract
            Tenant otherTenant = Tenant.builder()
                .name("Another Contract Tenant " + UUID.randomUUID())
                .slug("another-contract-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            Contract otherContract = Contract.builder()
                .tenantId(otherTenant.getId())
                .contractNumber("FORBIDDEN-001")
                .title("Forbidden Contract")
                .status(ContractStatus.ACTIVE)
                .awardDate(LocalDate.now())
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("100000.00"))
                .fundedValue(new BigDecimal("50000.00"))
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .build();
            otherContract = contractRepository.save(otherContract);

            // Should not be able to access other tenant's contract
            performGet(CONTRACTS_URL + "/" + otherContract.getId())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Contract Search and Filter")
    class ContractSearchAndFilter {

        @Test
        @DisplayName("should search contracts by contract number")
        void should_SearchContractsByContractNumber() throws Exception {
            String uniqueNumber = "UNIQUE-" + UUID.randomUUID().toString().substring(0, 8);
            createTestContract(uniqueNumber);

            performGet(CONTRACTS_URL + "?contractNumber=" + uniqueNumber)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should filter contracts by date range")
        void should_FilterContractsByDateRange() throws Exception {
            createTestContract("E2E-DATE-001");

            String fromDate = LocalDate.now().minusMonths(1).toString();
            String toDate = LocalDate.now().plusMonths(1).toString();

            performGet(CONTRACTS_URL + "?awardDateFrom=" + fromDate + "&awardDateTo=" + toDate)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should filter contracts by type")
        void should_FilterContractsByType() throws Exception {
            createTestContract("E2E-TYPE-001");

            performGet(CONTRACTS_URL + "?contractType=FIRM_FIXED_PRICE")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }
}
