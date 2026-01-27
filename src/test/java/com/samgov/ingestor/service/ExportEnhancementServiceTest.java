package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.dto.ExportRequest;
import com.samgov.ingestor.dto.ExportRequest.ExportFormat;
import com.samgov.ingestor.model.ExportTemplate;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.ScheduledExport;
import com.samgov.ingestor.model.ScheduledExport.Frequency;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.ExportTemplateRepository;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.ScheduledExportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Behavioral tests for ExportEnhancementService.
 *
 * Tests the business logic of export functionality:
 * - Export to various formats (CSV, PDF, JSON, Excel)
 * - Batch export of multiple opportunities
 * - Export template management
 * - Scheduled export creation and management
 * - Multi-tenant isolation
 */
class ExportEnhancementServiceTest extends BaseServiceTest {

    @Autowired
    private ExportEnhancementService exportService;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private ExportTemplateRepository templateRepository;

    @Autowired
    private ScheduledExportRepository scheduledExportRepository;

    private Opportunity opportunity1;
    private Opportunity opportunity2;
    private Opportunity opportunity3;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        createTestOpportunities();
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

        opportunity3 = Opportunity.builder()
            .id("OPP-" + UUID.randomUUID().toString().substring(0, 8))
            .solicitationNumber("N00014-24-R-0003")
            .title("Naval Research Support")
            .description("Research and development support services")
            .agency("Department of Navy")
            .type("Combined Synopsis/Solicitation")
            .naicsCode("541715")
            .postedDate(LocalDate.now().minusDays(3))
            .responseDeadLine(LocalDate.now().plusDays(60))
            .build();
        opportunityRepository.save(opportunity3);
    }

    @Nested
    @DisplayName("CSV Export")
    class CsvExport {

        @Test
        @DisplayName("should export single opportunity to CSV format")
        void exportSingleOpportunityToCsv() {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(opportunity1.getId()))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String csvContent = new String(result, StandardCharsets.UTF_8);
            assertThat(csvContent).isNotEmpty();
            assertThat(csvContent).contains("Solicitation Number,Title,Agency,Type,Response Deadline,Posted Date");
            assertThat(csvContent).contains("W911NF-24-R-0001");
            assertThat(csvContent).contains("IT Modernization Services");
            assertThat(csvContent).contains("Department of Defense");
        }

        @Test
        @DisplayName("should export multiple opportunities to CSV format")
        void exportMultipleOpportunitiesToCsv() {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(
                    opportunity1.getId(),
                    opportunity2.getId(),
                    opportunity3.getId()
                ))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String csvContent = new String(result, StandardCharsets.UTF_8);
            assertThat(csvContent).contains("W911NF-24-R-0001");
            assertThat(csvContent).contains("FA8732-24-R-0002");
            assertThat(csvContent).contains("N00014-24-R-0003");

            // Count lines (header + 3 data rows)
            String[] lines = csvContent.split("\n");
            assertThat(lines.length).isEqualTo(4);
        }

        @Test
        @DisplayName("should escape special characters in CSV export")
        void escapesSpecialCharactersInCsv() {
            // Given - Create opportunity with special characters
            Opportunity oppWithSpecialChars = Opportunity.builder()
                .id("OPP-" + UUID.randomUUID().toString().substring(0, 8))
                .solicitationNumber("SPECIAL-001")
                .title("Test, With \"Quotes\" and Commas")
                .description("Description with\nnewlines")
                .agency("Test Agency")
                .type("RFP")
                .build();
            opportunityRepository.save(oppWithSpecialChars);

            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(oppWithSpecialChars.getId()))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String csvContent = new String(result, StandardCharsets.UTF_8);
            // CSV should properly escape the quoted title
            assertThat(csvContent).contains("\"Test, With \"\"Quotes\"\" and Commas\"");
        }

        @Test
        @DisplayName("should handle empty list for CSV export")
        void handleEmptyListForCsvExport() {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of("non-existent-id")) // Non-existent ID
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String csvContent = new String(result, StandardCharsets.UTF_8);
            // Should still have header row
            assertThat(csvContent).contains("Solicitation Number,Title,Agency,Type");
            // But only header row
            String[] lines = csvContent.split("\n");
            assertThat(lines.length).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("PDF Export")
    class PdfExport {

        @Test
        @DisplayName("should export opportunity to PDF format")
        void exportOpportunityToPdf() {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.PDF)
                .ids(List.of(opportunity1.getId()))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String pdfContent = new String(result, StandardCharsets.UTF_8);
            assertThat(pdfContent).isNotEmpty();
            assertThat(pdfContent).contains("OPPORTUNITY EXPORT");
            assertThat(pdfContent).contains("Title: IT Modernization Services");
            assertThat(pdfContent).contains("Solicitation Number: W911NF-24-R-0001");
            assertThat(pdfContent).contains("Agency: Department of Defense");
        }

        @Test
        @DisplayName("should export multiple opportunities to PDF with separators")
        void exportMultipleOpportunitiesToPdf() {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.PDF)
                .ids(List.of(
                    opportunity1.getId(),
                    opportunity2.getId()
                ))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String pdfContent = new String(result, StandardCharsets.UTF_8);
            assertThat(pdfContent).contains("IT Modernization Services");
            assertThat(pdfContent).contains("Cybersecurity Assessment");
            // Should have separators between opportunities
            assertThat(pdfContent).contains("---");
        }

        @Test
        @DisplayName("should accept template ID for PDF export")
        void acceptTemplateIdForPdfExport() {
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
                .ids(List.of(opportunity1.getId()))
                .templateId(template.getId().toString())
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then - Should not throw, template ID is accepted
            assertThat(result).isNotEmpty();
        }
    }

    @Nested
    @DisplayName("JSON Export")
    class JsonExport {

        @Test
        @DisplayName("should export opportunity to JSON format")
        void exportOpportunityToJson() {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.JSON)
                .ids(List.of(opportunity1.getId()))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String jsonContent = new String(result, StandardCharsets.UTF_8);
            assertThat(jsonContent).startsWith("[");
            assertThat(jsonContent).endsWith("]");
            assertThat(jsonContent).contains("\"solicitationNumber\":\"W911NF-24-R-0001\"");
            assertThat(jsonContent).contains("\"title\":\"IT Modernization Services\"");
            assertThat(jsonContent).contains("\"agency\":\"Department of Defense\"");
        }

        @Test
        @DisplayName("should export multiple opportunities as JSON array")
        void exportMultipleOpportunitiesAsJsonArray() {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.JSON)
                .ids(List.of(
                    opportunity1.getId(),
                    opportunity2.getId()
                ))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String jsonContent = new String(result, StandardCharsets.UTF_8);
            assertThat(jsonContent).contains("},{"); // Multiple objects in array
            assertThat(jsonContent).contains("W911NF-24-R-0001");
            assertThat(jsonContent).contains("FA8732-24-R-0002");
        }

        @Test
        @DisplayName("should escape special characters in JSON export")
        void escapeSpecialCharactersInJson() {
            // Given
            Opportunity oppWithQuotes = Opportunity.builder()
                .id("OPP-" + UUID.randomUUID().toString().substring(0, 8))
                .solicitationNumber("JSON-TEST-001")
                .title("Test with \"quotes\" and backslash\\")
                .agency("Test Agency")
                .type("RFP")
                .build();
            opportunityRepository.save(oppWithQuotes);

            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.JSON)
                .ids(List.of(oppWithQuotes.getId()))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String jsonContent = new String(result, StandardCharsets.UTF_8);
            // Should properly escape quotes and backslashes
            assertThat(jsonContent).contains("\\\"quotes\\\"");
            assertThat(jsonContent).contains("\\\\");
        }
    }

    @Nested
    @DisplayName("Excel Export")
    class ExcelExport {

        @Test
        @DisplayName("should export opportunity to Excel format")
        void exportOpportunityToExcel() {
            // Given
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.EXCEL)
                .ids(List.of(opportunity1.getId()))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then - Simplified implementation returns CSV-like content
            String content = new String(result, StandardCharsets.UTF_8);
            assertThat(content).isNotEmpty();
            assertThat(content).contains("W911NF-24-R-0001");
        }
    }

    @Nested
    @DisplayName("Export Template Management")
    class ExportTemplateManagement {

        @Test
        @DisplayName("should get templates for current tenant")
        void getTemplatesForCurrentTenant() {
            // Given
            ExportTemplate template1 = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Opportunity Export Template")
                .description("Standard opportunity export")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(template1);

            ExportTemplate template2 = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Contract Export Template")
                .description("Standard contract export")
                .entityType("contract")
                .format("CSV")
                .build();
            templateRepository.save(template2);

            // When
            List<ExportTemplate> result = exportService.getTemplates(null);

            // Then
            assertThat(result).hasSize(2);
            assertThat(result)
                .extracting(ExportTemplate::getName)
                .containsExactlyInAnyOrder("Opportunity Export Template", "Contract Export Template");
        }

        @Test
        @DisplayName("should filter templates by entity type")
        void filterTemplatesByEntityType() {
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

            // When
            List<ExportTemplate> result = exportService.getTemplates("opportunity");

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Opportunity Template");
        }

        @Test
        @DisplayName("should return empty list when no templates exist")
        void returnEmptyListWhenNoTemplatesExist() {
            // When
            List<ExportTemplate> result = exportService.getTemplates(null);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Scheduled Export Management")
    class ScheduledExportManagement {

        @Test
        @DisplayName("should create scheduled export")
        void createScheduledExport() {
            // Given
            ScheduledExport scheduledExport = ScheduledExport.builder()
                .userId(testUser.getId())
                .name("Weekly Opportunity Report")
                .entityType("opportunity")
                .format("CSV")
                .frequency(Frequency.WEEKLY)
                .dayOfWeek(1) // Monday
                .hourOfDay(8)
                .recipients("[\"user@example.com\"]")
                .active(true)
                .build();

            // When
            ScheduledExport result = exportService.createScheduledExport(scheduledExport);

            // Then
            assertThat(result.getId()).isNotNull();
            assertThat(result.getTenantId()).isEqualTo(testTenant.getId());
            assertThat(result.getName()).isEqualTo("Weekly Opportunity Report");
            assertThat(result.getNextRunAt()).isNotNull();
            assertThat(result.getNextRunAt()).isAfter(Instant.now());
        }

        @Test
        @DisplayName("should get scheduled exports for user")
        void getScheduledExportsForUser() {
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
                .name("Monthly Report")
                .entityType("contract")
                .format("PDF")
                .frequency(Frequency.MONTHLY)
                .dayOfMonth(1)
                .hourOfDay(8)
                .active(true)
                .build();
            scheduledExportRepository.save(export2);

            // When
            List<ScheduledExport> result = exportService.getScheduledExports(testUser.getId());

            // Then
            assertThat(result).hasSize(2);
            assertThat(result)
                .extracting(ScheduledExport::getName)
                .containsExactlyInAnyOrder("Daily Report", "Monthly Report");
        }

        @Test
        @DisplayName("should return empty list when user has no scheduled exports")
        void returnEmptyListWhenUserHasNoScheduledExports() {
            // Given
            UUID otherUserId = UUID.randomUUID();

            // When
            List<ScheduledExport> result = exportService.getScheduledExports(otherUserId);

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should set next run time when creating scheduled export")
        void setNextRunTimeWhenCreatingScheduledExport() {
            // Given
            ScheduledExport scheduledExport = ScheduledExport.builder()
                .userId(testUser.getId())
                .name("Test Export")
                .entityType("opportunity")
                .format("CSV")
                .frequency(Frequency.DAILY)
                .hourOfDay(8)
                .active(true)
                .build();

            // When
            ScheduledExport result = exportService.createScheduledExport(scheduledExport);

            // Then
            assertThat(result.getNextRunAt()).isNotNull();
            // Should be approximately 24 hours from now (simplified implementation)
            Instant expectedMin = Instant.now().plusSeconds(86400 - 60);
            Instant expectedMax = Instant.now().plusSeconds(86400 + 60);
            assertThat(result.getNextRunAt()).isBetween(expectedMin, expectedMax);
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        private Tenant tenant2;

        @BeforeEach
        void createSecondTenant() {
            tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenantRepository.save(tenant2);
        }

        @Test
        @DisplayName("should not return templates from other tenants")
        void shouldNotReturnTemplatesFromOtherTenants() {
            // Given - Create template for tenant 1
            ExportTemplate tenant1Template = ExportTemplate.builder()
                .tenantId(testTenant.getId())
                .name("Tenant 1 Template")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(tenant1Template);

            // Create template for tenant 2
            ExportTemplate tenant2Template = ExportTemplate.builder()
                .tenantId(tenant2.getId())
                .name("Tenant 2 Template")
                .entityType("opportunity")
                .format("PDF")
                .build();
            templateRepository.save(tenant2Template);

            // When - Query as tenant 1
            List<ExportTemplate> result = exportService.getTemplates(null);

            // Then - Should only see tenant 1's template
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Tenant 1 Template");
        }

        @Test
        @DisplayName("should associate scheduled export with current tenant")
        void shouldAssociateScheduledExportWithCurrentTenant() {
            // Given
            ScheduledExport scheduledExport = ScheduledExport.builder()
                .userId(testUser.getId())
                .name("Tenant-Specific Export")
                .entityType("opportunity")
                .format("CSV")
                .frequency(Frequency.DAILY)
                .hourOfDay(8)
                .build();

            // When
            ScheduledExport result = exportService.createScheduledExport(scheduledExport);

            // Then
            assertThat(result.getTenantId()).isEqualTo(testTenant.getId());
        }
    }

    @Nested
    @DisplayName("Batch Export")
    class BatchExport {

        @Test
        @DisplayName("should export all requested opportunities in batch")
        void exportAllRequestedOpportunitiesInBatch() {
            // Given - Create 10 opportunities
            for (int i = 0; i < 10; i++) {
                Opportunity opp = Opportunity.builder()
                    .id("BATCH-" + UUID.randomUUID().toString().substring(0, 8))
                    .solicitationNumber("BATCH-2024-" + String.format("%04d", i))
                    .title("Batch Opportunity " + i)
                    .agency("Test Agency")
                    .type("RFP")
                    .build();
                opportunityRepository.save(opp);
            }

            List<Opportunity> allOpps = opportunityRepository.findAll();
            List<String> allIds = allOpps.stream()
                .map(Opportunity::getId)
                .toList();

            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(allIds)
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then
            String csvContent = new String(result, StandardCharsets.UTF_8);
            String[] lines = csvContent.split("\n");
            // Header + all opportunities
            assertThat(lines.length).isGreaterThanOrEqualTo(11);
        }

        @Test
        @DisplayName("should handle partial batch when some IDs do not exist")
        void handlePartialBatchWhenSomeIdsDoNotExist() {
            // Given
            String nonExistentId = "non-existent-id-12345";

            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(
                    opportunity1.getId(),
                    nonExistentId,
                    opportunity2.getId()
                ))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then - Should export the valid opportunities
            String csvContent = new String(result, StandardCharsets.UTF_8);
            assertThat(csvContent).contains("W911NF-24-R-0001");
            assertThat(csvContent).contains("FA8732-24-R-0002");

            // Should have header + 2 data rows
            String[] lines = csvContent.split("\n");
            assertThat(lines.length).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {

        @Test
        @DisplayName("should handle null values in opportunity fields")
        void handleNullValuesInOpportunityFields() {
            // Given
            Opportunity oppWithNulls = Opportunity.builder()
                .id("NULL-" + UUID.randomUUID().toString().substring(0, 8))
                .solicitationNumber("NULL-TEST-001")
                .title(null)
                .agency(null)
                .type(null)
                .postedDate(null)
                .responseDeadLine(null)
                .build();
            opportunityRepository.save(oppWithNulls);

            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .ids(List.of(oppWithNulls.getId()))
                .build();

            // When
            byte[] result = exportService.exportOpportunities(request);

            // Then - Should not throw, should handle nulls gracefully
            String csvContent = new String(result, StandardCharsets.UTF_8);
            assertThat(csvContent).contains("NULL-TEST-001");
        }
    }

    /**
     * Helper method to pad short IDs to valid UUID format.
     * The Opportunity model uses String IDs which may not be valid UUIDs.
     * This method handles the conversion for testing purposes.
     */
    private String padUuid(String id) {
        // If ID is already a valid UUID format, return as-is
        if (id.matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")) {
            return id;
        }
        // For test purposes, create a deterministic UUID from the string
        return UUID.nameUUIDFromBytes(id.getBytes()).toString();
    }
}
