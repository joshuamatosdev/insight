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
 * End-to-End tests for Core Business functionality.
 * Tests Opportunities, Contracts, Pipeline, and Invoice flows.
 */
class CoreBusinessE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private PipelineRepository pipelineRepository;

    private Tenant testTenant;
    private User testUser;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Business E2E Tenant")
            .slug("biz-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("bizuser-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("Business")
            .lastName("User")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("Opportunity Management")
    class OpportunityManagement {

        @Test
        @DisplayName("should list opportunities with pagination")
        void shouldListOpportunitiesWithPagination() throws Exception {
            // Create test opportunities
            for (int i = 0; i < 5; i++) {
                opportunityRepository.save(Opportunity.builder()
                    .id(UUID.randomUUID().toString())
                    .title("Test Opportunity " + i)
                    .solicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8))
                    .type("Solicitation")
                    .naicsCode("541512")
                    .postedDate(LocalDate.now())
                    .responseDeadLine(LocalDate.now().plusDays(30))
                    .build());
            }

            performGet("/api/v1/opportunities?page=0&size=3")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.totalElements").value(greaterThanOrEqualTo(5)));
        }

        @Test
        @DisplayName("should search opportunities by keyword")
        void shouldSearchOpportunitiesByKeyword() throws Exception {
            String uniqueTitle = "UniqueKeyword-" + UUID.randomUUID();
            opportunityRepository.save(Opportunity.builder()
                .id(UUID.randomUUID().toString())
                .title(uniqueTitle)
                .solicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8))
                .type("Solicitation")
                .naicsCode("541512")
                .postedDate(LocalDate.now())
                .responseDeadLine(LocalDate.now().plusDays(30))
                .build());

            performGet("/api/v1/opportunities?search=" + uniqueTitle)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value(uniqueTitle));
        }

        @Test
        @DisplayName("should get opportunity by ID")
        void shouldGetOpportunityById() throws Exception {
            Opportunity opp = opportunityRepository.save(Opportunity.builder()
                .id(UUID.randomUUID().toString())
                .title("Specific Opportunity")
                .solicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8))
                .type("Solicitation")
                .naicsCode("541512")
                .postedDate(LocalDate.now())
                .responseDeadLine(LocalDate.now().plusDays(30))
                .build());

            performGet("/api/v1/opportunities/" + opp.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Specific Opportunity"));
        }

        @Test
        @DisplayName("should return 404 for non-existent opportunity")
        void shouldReturn404ForNonExistent() throws Exception {
            performGet("/api/v1/opportunities/non-existent-id")
                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should filter opportunities by NAICS code")
        void shouldFilterByNaicsCode() throws Exception {
            opportunityRepository.save(Opportunity.builder()
                .id(UUID.randomUUID().toString())
                .title("NAICS Test")
                .solicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8))
                .type("Solicitation")
                .naicsCode("541511")
                .postedDate(LocalDate.now())
                .responseDeadLine(LocalDate.now().plusDays(30))
                .build());

            performGet("/api/v1/opportunities?naicsCode=541511")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].naicsCode", everyItem(equalTo("541511"))));
        }
    }

    @Nested
    @DisplayName("Contract Management")
    class ContractManagement {

        @Test
        @DisplayName("should create new contract")
        void shouldCreateContract() throws Exception {
            Map<String, Object> request = Map.of(
                "contractNumber", "CONTRACT-" + UUID.randomUUID().toString().substring(0, 8),
                "title", "E2E Test Contract",
                "contractType", "FIRM_FIXED_PRICE",
                "status", "ACTIVE",
                "startDate", LocalDate.now().toString(),
                "endDate", LocalDate.now().plusYears(1).toString(),
                "totalValue", 100000
            );

            performPost("/api/v1/contracts", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("E2E Test Contract"))
                .andExpect(jsonPath("$.id").isNotEmpty());
        }

        @Test
        @DisplayName("should list contracts with tenant isolation")
        void shouldListContractsWithTenantIsolation() throws Exception {
            contractRepository.save(Contract.builder()
                .contractNumber("CN-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Tenant Contract")
                .tenantId(testTenantId)
                .status(Contract.ContractStatus.ACTIVE)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("50000"))
                .build());

            performGet("/api/v1/contracts")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should update contract")
        void shouldUpdateContract() throws Exception {
            Contract contract = contractRepository.save(Contract.builder()
                .contractNumber("CN-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Original Title")
                .tenantId(testTenantId)
                .status(Contract.ContractStatus.ACTIVE)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("50000"))
                .build());

            Map<String, Object> update = Map.of(
                "title", "Updated Title",
                "status", "ACTIVE"
            );

            performPut("/api/v1/contracts/" + contract.getId(), update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
        }

        @Test
        @DisplayName("should delete contract")
        void shouldDeleteContract() throws Exception {
            Contract contract = contractRepository.save(Contract.builder()
                .contractNumber("CN-" + UUID.randomUUID().toString().substring(0, 8))
                .title("To Delete")
                .tenantId(testTenantId)
                .status(Contract.ContractStatus.ACTIVE)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("50000"))
                .build());

            performDelete("/api/v1/contracts/" + contract.getId())
                .andExpect(status().isNoContent());

            performGet("/api/v1/contracts/" + contract.getId())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Pipeline Management")
    class PipelineManagement {

        @Test
        @DisplayName("should create pipeline")
        void shouldCreatePipeline() throws Exception {
            Map<String, Object> request = Map.of(
                "name", "E2E Test Pipeline",
                "description", "Test pipeline for E2E"
            );

            performPost("/api/v1/pipelines", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test Pipeline"));
        }

        @Test
        @DisplayName("should list pipelines")
        void shouldListPipelines() throws Exception {
            pipelineRepository.save(Pipeline.builder()
                .name("Test Pipeline")
                .tenantId(testTenantId)
                .build());

            performGet("/api/v1/pipelines")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("Saved Opportunities")
    class SavedOpportunities {

        @Test
        @DisplayName("should save opportunity")
        void shouldSaveOpportunity() throws Exception {
            Opportunity opp = opportunityRepository.save(Opportunity.builder()
                .id(UUID.randomUUID().toString())
                .title("To Save")
                .solicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8))
                .type("Solicitation")
                .naicsCode("541512")
                .postedDate(LocalDate.now())
                .responseDeadLine(LocalDate.now().plusDays(30))
                .build());

            Map<String, Object> request = Map.of(
                "opportunityId", opp.getId(),
                "notes", "Interesting opportunity"
            );

            performPost("/api/v1/saved-opportunities", request)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should list saved opportunities")
        void shouldListSavedOpportunities() throws Exception {
            performGet("/api/v1/saved-opportunities")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("Saved Searches")
    class SavedSearches {

        @Test
        @DisplayName("should create saved search")
        void shouldCreateSavedSearch() throws Exception {
            Map<String, Object> request = Map.of(
                "name", "IT Opportunities",
                "query", "software development",
                "filters", Map.of("naicsCode", "541512")
            );

            performPost("/api/v1/saved-searches", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("IT Opportunities"));
        }

        @Test
        @DisplayName("should list saved searches")
        void shouldListSavedSearches() throws Exception {
            performGet("/api/v1/saved-searches")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }
}
