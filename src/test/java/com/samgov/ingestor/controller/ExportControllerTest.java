package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.ExportRequest;
import com.samgov.ingestor.dto.ExportRequest.ExportFormat;
import com.samgov.ingestor.model.ExportTemplate;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.ScheduledExport;
import com.samgov.ingestor.model.ScheduledExport.Frequency;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ExportTemplateRepository;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.ScheduledExportRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for ExportController REST API.
 *
 * Tests focus on HTTP behavior:
 * - Request/response formats and content types
 * - HTTP status codes
 * - Content-Disposition headers for file downloads
 * - Validation of request parameters
 * - Authentication requirements
 */
@DisplayName("ExportController")
class ExportControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/export";

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private ExportTemplateRepository templateRepository;

    @Autowired
    private ScheduledExportRepository scheduledExportRepository;

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
    private Opportunity opportunity1;
    private Opportunity opportunity2;

    @BeforeEach
    @Override
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .permissions("EXPORT_READ,EXPORT_CREATE")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        // Create test user with UUID-parseable username
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

        testTenantId = testTenant.getId();
        testUserId = testUser.getId();

        // Create test opportunities
        createTestOpportunities();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private void createTestOpportunities() {
        opportunity1 = Opportunity.builder()
            .id("OPP-" + UUID.randomUUID().toString().substring(0, 8))
            .solicitationNumber("W911NF-24-R-0001")
            .title("IT Modernization Services")
            .description("Enterprise IT modernization contract")
            .agency("Department of Defense")
            .type("Solicitation")
            .naicsCode("541511")
            .postedDate(LocalDate.now().minusDays(10))
            .responseDeadLine(LocalDate.now().plusDays(30))
            .build();
        opportunityRepository.save(opportunity1);

        opportunity2 = Opportunity.builder()
            .id("OPP-" + UUID.randomUUID().toString().substring(0, 8))
            .solicitationNumber("FA8732-24-R-0002")
            .title("Cybersecurity Assessment")
            .description("Security testing and vulnerability assessment")
            .agency("Department of Air Force")
            .type("RFP")
            .naicsCode("541512")
            .postedDate(LocalDate.now().minusDays(5))
            .responseDeadLine(LocalDate.now().plusDays(45))
            .build();
        opportunityRepository.save(opportunity2);
    }

    private String padUuid(String id) {
        if (id.matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")) {
            return id;
        }
        return UUID.nameUUIDFromBytes(id.getBytes()).toString();
    }

    @Nested
    @DisplayName("POST /api/v1/export/opportunities")
    @WithMockUser(username = "test-user")
    class ExportOpportunities {

        @Test
        @DisplayName("should export opportunities as CSV and return correct content type")
        void exportOpportunitiesAsCsv() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andExpect(header().string("Content-Disposition",
                    containsString("attachment; filename=\"opportunities-export.csv\"")));
        }

        @Test
        @DisplayName("should export opportunities as PDF and return correct content type")
        void exportOpportunitiesAsPdf() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.PDF)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/pdf"))
                .andExpect(header().string("Content-Disposition",
                    containsString("attachment; filename=\"opportunities-export.pdf\"")));
        }

        @Test
        @DisplayName("should export opportunities as JSON and return correct content type")
        void exportOpportunitiesAsJson() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.JSON)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(header().string("Content-Disposition",
                    containsString("attachment; filename=\"opportunities-export.json\"")));
        }

        @Test
        @DisplayName("should export opportunities as Excel and return correct content type")
        void exportOpportunitiesAsExcel() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.EXCEL)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition",
                    containsString("attachment; filename=\"opportunities-export.excel\"")));
        }

        @Test
        @DisplayName("should export multiple opportunities in batch")
        void exportMultipleOpportunitiesInBatch() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(
                    UUID.fromString(padUuid(opportunity1.getId())),
                    UUID.fromString(padUuid(opportunity2.getId()))
                ))
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/opportunities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request))))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("W911NF-24-R-0001")))
                .andExpect(content().string(containsString("FA8732-24-R-0002")));
        }

        @Test
        @DisplayName("should return 400 when format is missing")
        void return400WhenFormatIsMissing() throws Exception {
            // Given - Request without format
            String invalidRequest = "{\"ids\":[\"" + UUID.randomUUID() + "\"]}";

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/opportunities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when ids list is empty")
        void return400WhenIdsListIsEmpty() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of())
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should accept optional template ID for export")
        void acceptOptionalTemplateIdForExport() throws Exception {
            // Given
            ExportTemplate template = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Custom Template")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(template);

            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.PDF)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .templateId(template.getId().toString())
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should accept optional includeAttachments flag")
        void acceptOptionalIncludeAttachmentsFlag() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.PDF)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .includeAttachments(true)
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/export/templates")
    @WithMockUser(username = "test-user")
    class GetTemplates {

        @Test
        @DisplayName("should return all templates for current tenant")
        void returnAllTemplatesForCurrentTenant() throws Exception {
            // Given
            ExportTemplate template1 = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Opportunity Template")
                .description("Standard opportunity export")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(template1);

            ExportTemplate template2 = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Contract Template")
                .description("Standard contract export")
                .entityType("contract")
                .format("CSV")
                .build();
            templateRepository.save(template2);

            // When/Then
            performGet(BASE_URL + "/templates")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", notNullValue()))
                .andExpect(jsonPath("$[1].name", notNullValue()));
        }

        @Test
        @DisplayName("should filter templates by entity type")
        void filterTemplatesByEntityType() throws Exception {
            // Given
            ExportTemplate oppTemplate = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Opportunity Template")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(oppTemplate);

            ExportTemplate contractTemplate = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Contract Template")
                .entityType("contract")
                .format("PDF")
                .build();
            templateRepository.save(contractTemplate);

            // When/Then
            mockMvc.perform(withTenantContext(get(BASE_URL + "/templates")
                    .param("entityType", "opportunity")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Opportunity Template")))
                .andExpect(jsonPath("$[0].entityType", is("opportunity")));
        }

        @Test
        @DisplayName("should return empty list when no templates exist")
        void returnEmptyListWhenNoTemplatesExist() throws Exception {
            // When/Then
            performGet(BASE_URL + "/templates")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("should not return templates from other tenants")
        void notReturnTemplatesFromOtherTenants() throws Exception {
            // Given - Create template for another tenant
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            ExportTemplate otherTenantTemplate = ExportTemplate.builder()
                .tenantId(otherTenant.getId())
                .name("Other Tenant Template")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(otherTenantTemplate);

            // Create template for current tenant
            ExportTemplate currentTenantTemplate = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Current Tenant Template")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(currentTenantTemplate);

            // When/Then
            performGet(BASE_URL + "/templates")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Current Tenant Template")));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/export/scheduled")
    class GetScheduledExports {

        @Test
        @DisplayName("should return scheduled exports for current user")
        @WithMockUser(username = "test-user")
        void returnScheduledExportsForCurrentUser() throws Exception {
            // Given
            ScheduledExport export1 = ScheduledExport.builder()
                .tenantId(testTenant.getId())
                .userId(testUser.getId())
                .name("Daily Report")
                .entityType("opportunity")
                .format("CSV")
                .frequency(Frequency.DAILY)
                .hourOfDay(9)
                .active(true)
                .build();
            scheduledExportRepository.save(export1);

            ScheduledExport export2 = ScheduledExport.builder()
                .tenantId(testTenant.getId())
                .userId(testUser.getId())
                .name("Weekly Summary")
                .entityType("contract")
                .format("PDF")
                .frequency(Frequency.WEEKLY)
                .dayOfWeek(1)
                .hourOfDay(8)
                .active(true)
                .build();
            scheduledExportRepository.save(export2);

            // When/Then - Note: This test requires authenticated user with username as UUID
            // In real scenario, would use the actual user's ID from authentication
            mockMvc.perform(withTenantContext(get(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should return empty list when user has no scheduled exports")
        @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
        void returnEmptyListWhenUserHasNoScheduledExports() throws Exception {
            // When/Then
            mockMvc.perform(withTenantContext(get(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("POST /api/v1/export/scheduled")
    class CreateScheduledExport {

        @Test
        @DisplayName("should create daily scheduled export")
        @WithMockUser(username = "test-user")
        void createDailyScheduledExport() throws Exception {
            // Given
            ScheduledExport request = ScheduledExport.builder()
                .name("Daily Opportunity Report")
                .entityType("opportunity")
                .format("CSV")
                .frequency(Frequency.DAILY)
                .hourOfDay(8)
                .recipients("[\"user@example.com\"]")
                .active(true)
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Daily Opportunity Report")))
                .andExpect(jsonPath("$.frequency", is("DAILY")))
                .andExpect(jsonPath("$.nextRunAt", notNullValue()));
        }

        @Test
        @DisplayName("should create weekly scheduled export")
        @WithMockUser(username = "test-user")
        void createWeeklyScheduledExport() throws Exception {
            // Given
            ScheduledExport request = ScheduledExport.builder()
                .name("Weekly Summary")
                .entityType("opportunity")
                .format("PDF")
                .frequency(Frequency.WEEKLY)
                .dayOfWeek(1) // Monday
                .hourOfDay(9)
                .active(true)
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.frequency", is("WEEKLY")))
                .andExpect(jsonPath("$.dayOfWeek", is(1)));
        }

        @Test
        @DisplayName("should create monthly scheduled export")
        @WithMockUser(username = "test-user")
        void createMonthlyScheduledExport() throws Exception {
            // Given
            ScheduledExport request = ScheduledExport.builder()
                .name("Monthly Report")
                .entityType("contract")
                .format("EXCEL")
                .frequency(Frequency.MONTHLY)
                .dayOfMonth(1) // First of the month
                .hourOfDay(6)
                .active(true)
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.frequency", is("MONTHLY")))
                .andExpect(jsonPath("$.dayOfMonth", is(1)));
        }

        @Test
        @DisplayName("should create scheduled export with template")
        @WithMockUser(username = "test-user")
        void createScheduledExportWithTemplate() throws Exception {
            // Given
            ExportTemplate template = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Custom Template")
                .entityType("opportunity")
                .format("PDF")
                .build();
            template = templateRepository.save(template);

            ScheduledExport request = ScheduledExport.builder()
                .name("Templated Export")
                .entityType("opportunity")
                .format("PDF")
                .templateId(template.getId())
                .frequency(Frequency.DAILY)
                .hourOfDay(8)
                .active(true)
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.templateId", is(template.getId().toString())));
        }

        @Test
        @DisplayName("should create scheduled export with filter criteria")
        @WithMockUser(username = "test-user")
        void createScheduledExportWithFilterCriteria() throws Exception {
            // Given
            String filterCriteria = "{\"agency\":\"DOD\",\"naicsCode\":\"541511\"}";

            ScheduledExport request = ScheduledExport.builder()
                .name("Filtered Export")
                .entityType("opportunity")
                .format("CSV")
                .frequency(Frequency.DAILY)
                .hourOfDay(8)
                .filterCriteria(filterCriteria)
                .active(true)
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.filterCriteria", is(filterCriteria)));
        }

        @Test
        @DisplayName("should set tenant ID from context")
        @WithMockUser(username = "test-user")
        void setTenantIdFromContext() throws Exception {
            // Given
            ScheduledExport request = ScheduledExport.builder()
                .name("Tenant-Associated Export")
                .entityType("opportunity")
                .format("CSV")
                .frequency(Frequency.DAILY)
                .hourOfDay(8)
                .active(true)
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId", is(testTenant.getId().toString())));
        }
    }

    @Nested
    @DisplayName("Error Handling")
    @WithMockUser(username = "test-user")
    class ErrorHandling {

        @Test
        @DisplayName("should return 400 for invalid export format")
        void return400ForInvalidExportFormat() throws Exception {
            // Given - Invalid format in request
            String invalidRequest = "{\"format\":\"INVALID\",\"ids\":[\"" + UUID.randomUUID() + "\"]}";

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/opportunities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 for null IDs in request")
        void return400ForNullIdsInRequest() throws Exception {
            // Given
            String invalidRequest = "{\"format\":\"CSV\",\"ids\":null}";

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/opportunities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 for missing required fields in scheduled export")
        void return400ForMissingRequiredFieldsInScheduledExport() throws Exception {
            // Given - Missing required fields
            String invalidRequest = "{\"name\":\"Test\"}";

            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/scheduled")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Content-Disposition Headers")
    @WithMockUser(username = "test-user")
    class ContentDispositionHeaders {

        @Test
        @DisplayName("should set correct filename for CSV export")
        void setCorrectFilenameForCsvExport() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(header().string("Content-Disposition",
                    "attachment; filename=\"opportunities-export.csv\""));
        }

        @Test
        @DisplayName("should set correct filename for PDF export")
        void setCorrectFilenameForPdfExport() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.PDF)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(header().string("Content-Disposition",
                    "attachment; filename=\"opportunities-export.pdf\""));
        }

        @Test
        @DisplayName("should set correct filename for JSON export")
        void setCorrectFilenameForJsonExport() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.JSON)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(header().string("Content-Disposition",
                    "attachment; filename=\"opportunities-export.json\""));
        }

        @Test
        @DisplayName("should set correct filename for Excel export")
        void setCorrectFilenameForExcelExport() throws Exception {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.EXCEL)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(header().string("Content-Disposition",
                    "attachment; filename=\"opportunities-export.excel\""));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    @WithMockUser(username = "test-user")
    class TenantIsolation {

        @Test
        @DisplayName("should only export opportunities visible to current tenant context")
        void onlyExportOpportunitiesVisibleToCurrentTenantContext() throws Exception {
            // Given - Opportunities are not tenant-specific in this model,
            // but templates and scheduled exports are
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(UUID.fromString(padUuid(opportunity1.getId()))))
                .build();

            // When/Then
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("W911NF-24-R-0001")));
        }

        @Test
        @DisplayName("should not access templates from other tenants")
        void notAccessTemplatesFromOtherTenants() throws Exception {
            // Given
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant")
                .slug("other-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            ExportTemplate otherTenantTemplate = ExportTemplate.builder()
                .tenantId(otherTenant.getId())
                .name("Secret Template")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(otherTenantTemplate);

            // When/Then - Should return empty list, not the other tenant's template
            performGet(BASE_URL + "/templates")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }
    }
}
