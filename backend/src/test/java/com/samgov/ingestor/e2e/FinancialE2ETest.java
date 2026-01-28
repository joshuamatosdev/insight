package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Financial functionality.
 * Tests Invoice, Budget, Labor Rate, and Financial management.
 */
class FinancialE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    private Tenant testTenant;
    private User testUser;
    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Financial E2E Tenant")
            .slug("fin-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("fin-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("Financial")
            .lastName("User")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();

        testContract = contractRepository.save(Contract.builder()
            .contractNumber("FIN-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Financial Test Contract")
            .tenantId(testTenantId)
            .status(Contract.ContractStatus.ACTIVE)
            .startDate(LocalDate.now())
            .endDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("100000"))
            .build());
    }

    @Nested
    @DisplayName("Invoice Management")
    class InvoiceManagement {

        @Test
        @DisplayName("should create invoice")
        void shouldCreateInvoice() throws Exception {
            Map<String, Object> request = Map.of(
                "contractId", testContract.getId().toString(),
                "invoiceNumber", "INV-" + UUID.randomUUID().toString().substring(0, 8),
                "invoiceDate", LocalDate.now().toString(),
                "dueDate", LocalDate.now().plusDays(30).toString(),
                "amount", 5000,
                "status", "DRAFT"
            );

            performPost("/invoices", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invoiceNumber").value(startsWith("INV-")));
        }

        @Test
        @DisplayName("should list invoices")
        void shouldListInvoices() throws Exception {
            performGet("/invoices")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should list invoices by contract")
        void shouldListInvoicesByContract() throws Exception {
            performGet("/contracts/" + testContract.getId() + "/invoices")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should update invoice status")
        void shouldUpdateInvoiceStatus() throws Exception {
            Invoice invoice = invoiceRepository.save(Invoice.builder()
                .contract(testContract)
                .tenantId(testTenantId)
                .invoiceNumber("UPD-" + UUID.randomUUID().toString().substring(0, 8))
                .invoiceDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .amount(new BigDecimal("5000"))
                .status(Invoice.InvoiceStatus.DRAFT)
                .build());

            Map<String, Object> update = Map.of(
                "status", "SUBMITTED"
            );

            performPatch("/invoices/" + invoice.getId() + "/status", update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
        }

        @Test
        @DisplayName("should add line items to invoice")
        void shouldAddLineItemsToInvoice() throws Exception {
            Invoice invoice = invoiceRepository.save(Invoice.builder()
                .contract(testContract)
                .tenantId(testTenantId)
                .invoiceNumber("LI-" + UUID.randomUUID().toString().substring(0, 8))
                .invoiceDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .amount(new BigDecimal("5000"))
                .status(Invoice.InvoiceStatus.DRAFT)
                .build());

            Map<String, Object> lineItem = Map.of(
                "description", "Software Development Services",
                "quantity", 40,
                "unitPrice", 150,
                "amount", 6000
            );

            performPost("/invoices/" + invoice.getId() + "/line-items", lineItem)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Budget Management")
    class BudgetManagement {

        @Test
        @DisplayName("should get contract budget")
        void shouldGetContractBudget() throws Exception {
            performGet("/contracts/" + testContract.getId() + "/budget")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should add budget item")
        void shouldAddBudgetItem() throws Exception {
            Map<String, Object> budgetItem = Map.of(
                "category", "LABOR",
                "description", "Software Developer",
                "plannedAmount", 50000,
                "fiscalYear", 2024
            );

            performPost("/contracts/" + testContract.getId() + "/budget/items", budgetItem)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should get budget summary")
        void shouldGetBudgetSummary() throws Exception {
            performGet("/budgets/summary")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Labor Rate Management")
    class LaborRateManagement {

        @Test
        @DisplayName("should list labor rates")
        void shouldListLaborRates() throws Exception {
            performGet("/labor-rates")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create labor rate")
        void shouldCreateLaborRate() throws Exception {
            Map<String, Object> rate = Map.of(
                "laborCategory", "Senior Software Developer",
                "hourlyRate", 150,
                "effectiveDate", LocalDate.now().toString()
            );

            performPost("/labor-rates", rate)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.laborCategory").value("Senior Software Developer"));
        }

        @Test
        @DisplayName("should update labor rate")
        void shouldUpdateLaborRate() throws Exception {
            // Create rate first
            Map<String, Object> createRequest = Map.of(
                "laborCategory", "Update Rate Test",
                "hourlyRate", 100,
                "effectiveDate", LocalDate.now().toString()
            );

            String response = performPost("/labor-rates", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String rateId = objectMapper.readTree(response).get("id").asText();

            Map<String, Object> update = Map.of(
                "hourlyRate", 125
            );

            performPut("/labor-rates/" + rateId, update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hourlyRate").value(125));
        }
    }

    @Nested
    @DisplayName("Financial Overview")
    class FinancialOverview {

        @Test
        @DisplayName("should get financial summary")
        void shouldGetFinancialSummary() throws Exception {
            performGet("/financial/summary")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get revenue by contract")
        void shouldGetRevenueByContract() throws Exception {
            performGet("/financial/revenue-by-contract")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get cash flow forecast")
        void shouldGetCashFlowForecast() throws Exception {
            performGet("/financial/cash-flow-forecast")
                .andExpect(status().isOk());
        }
    }
}
