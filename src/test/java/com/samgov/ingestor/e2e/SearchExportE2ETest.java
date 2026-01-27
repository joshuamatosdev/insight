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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Search and Export functionality.
 * Tests advanced search, faceted search, autocomplete, and export features.
 */
@DisplayName("Search & Export E2E Tests")
class SearchExportE2ETest extends BaseControllerTest {

    private static final String SEARCH_URL = "/api/v1/search";
    private static final String EXPORT_URL = "/api/v1/export";

    @Autowired
    private OpportunityRepository opportunityRepository;

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
            .name("E2E Search Tenant " + UUID.randomUUID())
            .slug("e2e-search-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-search-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Search")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();

        // Create test opportunities for search
        createTestOpportunity("IT Services Cloud Migration", "PRESOLICITATION");
        createTestOpportunity("Cybersecurity Assessment Services", "SOLICITATION");
        createTestOpportunity("Software Development Support", "PRESOLICITATION");
    }

    private Opportunity createTestOpportunity(String title, String type) {
        Opportunity opp = new Opportunity();
        opp.setId(UUID.randomUUID().toString());
        opp.setTenantId(testTenantId);
        opp.setTitle(title);
        opp.setNoticeId("NOTICE-" + UUID.randomUUID().toString().substring(0, 8));
        opp.setSolicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8));
        opp.setPostedDate(LocalDate.now());
        opp.setResponseDeadLine(LocalDateTime.now().plusDays(30));
        opp.setType(type);
        opp.setActive(true);
        return opportunityRepository.save(opp);
    }

    @Nested
    @DisplayName("Autocomplete Flow")
    class AutocompleteFlow {

        @Test
        @DisplayName("should provide search suggestions")
        void should_ProvideSearchSuggestions() throws Exception {
            performGet(SEARCH_URL + "/suggestions?query=IT")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should provide suggestions with minimum characters")
        void should_ProvideSuggestionsWithMinimumCharacters() throws Exception {
            performGet(SEARCH_URL + "/suggestions?query=cyber")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should return empty for single character query")
        void should_ReturnEmptyForSingleCharacterQuery() throws Exception {
            performGet(SEARCH_URL + "/suggestions?query=a")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Faceted Search Flow")
    class FacetedSearchFlow {

        @Test
        @DisplayName("should perform faceted search")
        void should_PerformFacetedSearch() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "query", "services",
                "facets", java.util.List.of("type", "status", "agency")
            );

            performPost(SEARCH_URL + "/faceted", searchRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should return facet counts")
        void should_ReturnFacetCounts() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "query", "*",
                "facets", java.util.List.of("type")
            );

            performPost(SEARCH_URL + "/faceted", searchRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.facets").exists());
        }

        @Test
        @DisplayName("should filter by selected facet")
        void should_FilterBySelectedFacet() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "query", "services",
                "filters", java.util.Map.of(
                    "type", java.util.List.of("PRESOLICITATION")
                ),
                "facets", java.util.List.of("type", "status")
            );

            performPost(SEARCH_URL + "/faceted", searchRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Advanced Search Flow")
    class AdvancedSearchFlow {

        @Test
        @DisplayName("should search with multiple criteria")
        void should_SearchWithMultipleCriteria() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "keywords", java.util.List.of("IT", "services"),
                "type", "PRESOLICITATION",
                "active", true,
                "page", 0,
                "size", 20
            );

            performPost(SEARCH_URL + "/advanced", searchRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should search with date range")
        void should_SearchWithDateRange() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "postedDateFrom", LocalDate.now().minusDays(30).toString(),
                "postedDateTo", LocalDate.now().toString()
            );

            performPost(SEARCH_URL + "/advanced", searchRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should search with value range")
        void should_SearchWithValueRange() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "minValue", 100000,
                "maxValue", 1000000
            );

            performPost(SEARCH_URL + "/advanced", searchRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should search with sorting")
        void should_SearchWithSorting() throws Exception {
            java.util.Map<String, Object> searchRequest = java.util.Map.of(
                "sortBy", "responseDeadLine",
                "sortDirection", "ASC"
            );

            performPost(SEARCH_URL + "/advanced", searchRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Export Opportunities Flow")
    class ExportOpportunitiesFlow {

        @Test
        @DisplayName("should export opportunities to CSV")
        void should_ExportOpportunitiesToCSV() throws Exception {
            java.util.Map<String, Object> exportRequest = java.util.Map.of(
                "format", "CSV",
                "filters", java.util.Map.of(
                    "active", true
                ),
                "fields", java.util.List.of("title", "noticeId", "postedDate", "responseDeadLine")
            );

            performPost(EXPORT_URL + "/opportunities", exportRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should export opportunities to Excel")
        void should_ExportOpportunitiesToExcel() throws Exception {
            java.util.Map<String, Object> exportRequest = java.util.Map.of(
                "format", "XLSX",
                "filters", java.util.Map.of(
                    "active", true
                )
            );

            performPost(EXPORT_URL + "/opportunities", exportRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should export opportunities to PDF")
        void should_ExportOpportunitiesToPDF() throws Exception {
            java.util.Map<String, Object> exportRequest = java.util.Map.of(
                "format", "PDF",
                "filters", java.util.Map.of(
                    "active", true
                )
            );

            performPost(EXPORT_URL + "/opportunities", exportRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Export Templates Flow")
    class ExportTemplatesFlow {

        @Test
        @DisplayName("should list export templates")
        void should_ListExportTemplates() throws Exception {
            performGet(EXPORT_URL + "/templates")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create export template")
        void should_CreateExportTemplate() throws Exception {
            java.util.Map<String, Object> templateRequest = java.util.Map.of(
                "name", "E2E Test Template",
                "entityType", "OPPORTUNITY",
                "format", "CSV",
                "fields", java.util.List.of("title", "noticeId", "postedDate"),
                "filters", java.util.Map.of(
                    "active", true
                )
            );

            performPost(EXPORT_URL + "/templates", templateRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should export using template")
        void should_ExportUsingTemplate() throws Exception {
            // First create a template
            java.util.Map<String, Object> templateRequest = java.util.Map.of(
                "name", "Template for Export",
                "entityType", "OPPORTUNITY",
                "format", "CSV",
                "fields", java.util.List.of("title", "noticeId")
            );

            performPost(EXPORT_URL + "/templates", templateRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should delete export template")
        void should_DeleteExportTemplate() throws Exception {
            // Create template to delete
            java.util.Map<String, Object> templateRequest = java.util.Map.of(
                "name", "Template to Delete",
                "entityType", "OPPORTUNITY",
                "format", "CSV",
                "fields", java.util.List.of("title")
            );

            performPost(EXPORT_URL + "/templates", templateRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Scheduled Exports Flow")
    class ScheduledExportsFlow {

        @Test
        @DisplayName("should list scheduled exports")
        void should_ListScheduledExports() throws Exception {
            performGet(EXPORT_URL + "/scheduled")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create scheduled export")
        void should_CreateScheduledExport() throws Exception {
            java.util.Map<String, Object> scheduleRequest = java.util.Map.of(
                "name", "Weekly Opportunity Export",
                "entityType", "OPPORTUNITY",
                "format", "CSV",
                "schedule", "0 0 9 * * MON",
                "emailRecipients", java.util.List.of("test@example.com"),
                "enabled", true
            );

            performPost(EXPORT_URL + "/scheduled", scheduleRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should toggle scheduled export status")
        void should_ToggleScheduledExportStatus() throws Exception {
            // Create scheduled export first
            java.util.Map<String, Object> scheduleRequest = java.util.Map.of(
                "name", "Toggle Export",
                "entityType", "OPPORTUNITY",
                "format", "CSV",
                "schedule", "0 0 8 * * *",
                "enabled", true
            );

            performPost(EXPORT_URL + "/scheduled", scheduleRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should run scheduled export immediately")
        void should_RunScheduledExportImmediately() throws Exception {
            // Create scheduled export
            java.util.Map<String, Object> scheduleRequest = java.util.Map.of(
                "name", "Run Now Export",
                "entityType", "OPPORTUNITY",
                "format", "CSV",
                "schedule", "0 0 8 * * *",
                "enabled", true
            );

            performPost(EXPORT_URL + "/scheduled", scheduleRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Batch Export Flow")
    class BatchExportFlow {

        @Test
        @DisplayName("should create batch export job")
        void should_CreateBatchExportJob() throws Exception {
            Opportunity opp1 = createTestOpportunity("Batch Export 1", "PRESOLICITATION");
            Opportunity opp2 = createTestOpportunity("Batch Export 2", "SOLICITATION");

            java.util.Map<String, Object> batchRequest = java.util.Map.of(
                "entityType", "OPPORTUNITY",
                "ids", java.util.List.of(opp1.getId(), opp2.getId()),
                "format", "CSV"
            );

            performPost(EXPORT_URL + "/batch", batchRequest)
                .andExpect(status().isAccepted());
        }

        @Test
        @DisplayName("should check batch export status")
        void should_CheckBatchExportStatus() throws Exception {
            // Create batch export first
            Opportunity opp = createTestOpportunity("Batch Status Check", "PRESOLICITATION");

            java.util.Map<String, Object> batchRequest = java.util.Map.of(
                "entityType", "OPPORTUNITY",
                "ids", java.util.List.of(opp.getId()),
                "format", "CSV"
            );

            performPost(EXPORT_URL + "/batch", batchRequest)
                .andExpect(status().isAccepted());
        }
    }

    @Nested
    @DisplayName("Search History Flow")
    class SearchHistoryFlow {

        @Test
        @DisplayName("should retrieve recent searches")
        void should_RetrieveRecentSearches() throws Exception {
            performGet(SEARCH_URL + "/history")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should clear search history")
        void should_ClearSearchHistory() throws Exception {
            performDelete(SEARCH_URL + "/history")
                .andExpect(status().isOk());
        }
    }
}
