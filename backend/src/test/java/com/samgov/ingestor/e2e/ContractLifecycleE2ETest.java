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
 * End-to-End tests for Contract Lifecycle functionality.
 * Tests CLINs, Modifications, Tasks, and full contract management workflows.
 */
class ContractLifecycleE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractClinRepository clinRepository;

    private Tenant testTenant;
    private User testUser;
    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Contract Lifecycle E2E Tenant")
            .slug("cl-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("cl-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("Contract")
            .lastName("Manager")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();

        testContract = contractRepository.save(Contract.builder()
            .contractNumber("CL-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Contract Lifecycle Test")
            .tenantId(testTenantId)
            .status(Contract.ContractStatus.ACTIVE)
            .startDate(LocalDate.now())
            .endDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("250000"))
            .build());
    }

    @Nested
    @DisplayName("Contract CLIN Management")
    class ContractClinManagement {

        @Test
        @DisplayName("should create CLIN")
        void shouldCreateClin() throws Exception {
            Map<String, Object> clin = Map.of(
                "clinNumber", "0001",
                "description", "Software Development Services",
                "unitPrice", 150,
                "quantity", 1000,
                "totalAmount", 150000,
                "type", "LABOR"
            );

            performPost("/api/v1/contracts/" + testContract.getId() + "/clins", clin)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clinNumber").value("0001"));
        }

        @Test
        @DisplayName("should list CLINs for contract")
        void shouldListClinsForContract() throws Exception {
            // Create a CLIN first
            clinRepository.save(ContractClin.builder()
                .contract(testContract)
                .clinNumber("0002")
                .description("Test CLIN")
                .unitPrice(new BigDecimal("100"))
                .quantity(100)
                .totalAmount(new BigDecimal("10000"))
                .build());

            performGet("/api/v1/contracts/" + testContract.getId() + "/clins")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        @DisplayName("should update CLIN")
        void shouldUpdateClin() throws Exception {
            ContractClin clin = clinRepository.save(ContractClin.builder()
                .contract(testContract)
                .clinNumber("0003")
                .description("Original Description")
                .unitPrice(new BigDecimal("100"))
                .quantity(100)
                .totalAmount(new BigDecimal("10000"))
                .build());

            Map<String, Object> update = Map.of(
                "description", "Updated Description",
                "quantity", 150
            );

            performPut("/api/v1/contracts/" + testContract.getId() + "/clins/" + clin.getId(), update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated Description"));
        }

        @Test
        @DisplayName("should delete CLIN")
        void shouldDeleteClin() throws Exception {
            ContractClin clin = clinRepository.save(ContractClin.builder()
                .contract(testContract)
                .clinNumber("0004")
                .description("To Delete")
                .unitPrice(new BigDecimal("100"))
                .quantity(100)
                .totalAmount(new BigDecimal("10000"))
                .build());

            performDelete("/api/v1/contracts/" + testContract.getId() + "/clins/" + clin.getId())
                .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("Contract Modifications")
    class ContractModifications {

        @Test
        @DisplayName("should create modification")
        void shouldCreateModification() throws Exception {
            Map<String, Object> mod = Map.of(
                "modNumber", "P00001",
                "type", "ADMINISTRATIVE",
                "description", "Period of performance extension",
                "effectiveDate", LocalDate.now().toString()
            );

            performPost("/api/v1/contracts/" + testContract.getId() + "/modifications", mod)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.modNumber").value("P00001"));
        }

        @Test
        @DisplayName("should list modifications")
        void shouldListModifications() throws Exception {
            performGet("/api/v1/contracts/" + testContract.getId() + "/modifications")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should get modification details")
        void shouldGetModificationDetails() throws Exception {
            // Create first
            Map<String, Object> createRequest = Map.of(
                "modNumber", "P00002",
                "type", "BILATERAL",
                "description", "Scope change",
                "effectiveDate", LocalDate.now().toString()
            );

            String response = performPost("/api/v1/contracts/" + testContract.getId() + "/modifications", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String modId = objectMapper.readTree(response).get("id").asText();

            performGet("/api/v1/contracts/" + testContract.getId() + "/modifications/" + modId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modNumber").value("P00002"));
        }
    }

    @Nested
    @DisplayName("Contract Tasks")
    class ContractTasks {

        @Test
        @DisplayName("should create task")
        void shouldCreateTask() throws Exception {
            Map<String, Object> task = Map.of(
                "title", "Develop Feature X",
                "description", "Implement the requested feature",
                "dueDate", LocalDate.now().plusDays(14).toString(),
                "priority", "HIGH",
                "status", "NOT_STARTED"
            );

            performPost("/api/v1/contracts/" + testContract.getId() + "/tasks", task)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Develop Feature X"));
        }

        @Test
        @DisplayName("should list tasks")
        void shouldListTasks() throws Exception {
            performGet("/api/v1/contracts/" + testContract.getId() + "/tasks")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should update task status")
        void shouldUpdateTaskStatus() throws Exception {
            Map<String, Object> createRequest = Map.of(
                "title", "Status Update Task",
                "description", "Task for status update test",
                "dueDate", LocalDate.now().plusDays(7).toString(),
                "priority", "MEDIUM",
                "status", "NOT_STARTED"
            );

            String response = performPost("/api/v1/contracts/" + testContract.getId() + "/tasks", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String taskId = objectMapper.readTree(response).get("id").asText();

            Map<String, Object> update = Map.of("status", "IN_PROGRESS");

            performPatch("/api/v1/contracts/" + testContract.getId() + "/tasks/" + taskId, update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        }
    }

    @Nested
    @DisplayName("Contract Workflow")
    class ContractWorkflow {

        @Test
        @DisplayName("should transition contract status")
        void shouldTransitionContractStatus() throws Exception {
            Map<String, Object> transition = Map.of(
                "newStatus", "COMPLETED",
                "reason", "Contract work completed successfully"
            );

            performPatch("/api/v1/contracts/" + testContract.getId() + "/status", transition)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
        }

        @Test
        @DisplayName("should get contract timeline")
        void shouldGetContractTimeline() throws Exception {
            performGet("/api/v1/contracts/" + testContract.getId() + "/timeline")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should get contract summary")
        void shouldGetContractSummary() throws Exception {
            performGet("/api/v1/contracts/" + testContract.getId() + "/summary")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Contract Team Management")
    class ContractTeamManagement {

        @Test
        @DisplayName("should list team members")
        void shouldListTeamMembers() throws Exception {
            performGet("/api/v1/contracts/" + testContract.getId() + "/team")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should add team member")
        void shouldAddTeamMember() throws Exception {
            Map<String, Object> member = Map.of(
                "userId", testUserId.toString(),
                "role", "PROJECT_MANAGER"
            );

            performPost("/api/v1/contracts/" + testContract.getId() + "/team", member)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should remove team member")
        void shouldRemoveTeamMember() throws Exception {
            // Add first
            Map<String, Object> member = Map.of(
                "userId", testUserId.toString(),
                "role", "TEAM_MEMBER"
            );

            performPost("/api/v1/contracts/" + testContract.getId() + "/team", member)
                .andExpect(status().isCreated());

            performDelete("/api/v1/contracts/" + testContract.getId() + "/team/" + testUserId)
                .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("Contract Documents")
    class ContractDocuments {

        @Test
        @DisplayName("should list contract documents")
        void shouldListContractDocuments() throws Exception {
            performGet("/api/v1/contracts/" + testContract.getId() + "/documents")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should add document reference")
        void shouldAddDocumentReference() throws Exception {
            Map<String, Object> doc = Map.of(
                "name", "Contract Award Document",
                "type", "AWARD",
                "url", "https://documents.example.com/award-123.pdf"
            );

            performPost("/api/v1/contracts/" + testContract.getId() + "/documents", doc)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Contract Award Document"));
        }
    }

    @Nested
    @DisplayName("Contract Option Years")
    class ContractOptionYears {

        @Test
        @DisplayName("should list option years")
        void shouldListOptionYears() throws Exception {
            performGet("/api/v1/contracts/" + testContract.getId() + "/option-years")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should add option year")
        void shouldAddOptionYear() throws Exception {
            Map<String, Object> optionYear = Map.of(
                "yearNumber", 1,
                "startDate", LocalDate.now().plusYears(1).toString(),
                "endDate", LocalDate.now().plusYears(2).toString(),
                "value", 100000,
                "status", "NOT_EXERCISED"
            );

            performPost("/api/v1/contracts/" + testContract.getId() + "/option-years", optionYear)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.yearNumber").value(1));
        }

        @Test
        @DisplayName("should exercise option year")
        void shouldExerciseOptionYear() throws Exception {
            // Add first
            Map<String, Object> optionYear = Map.of(
                "yearNumber", 2,
                "startDate", LocalDate.now().plusYears(2).toString(),
                "endDate", LocalDate.now().plusYears(3).toString(),
                "value", 100000,
                "status", "NOT_EXERCISED"
            );

            String response = performPost("/api/v1/contracts/" + testContract.getId() + "/option-years", optionYear)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String optionId = objectMapper.readTree(response).get("id").asText();

            performPatch("/api/v1/contracts/" + testContract.getId() + "/option-years/" + optionId + "/exercise")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EXERCISED"));
        }
    }
}
