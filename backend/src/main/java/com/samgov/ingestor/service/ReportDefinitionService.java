package com.samgov.ingestor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.ReportDefinition;
import com.samgov.ingestor.model.ReportDefinition.EntityType;
import com.samgov.ingestor.model.ReportDefinition.SortDirection;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ReportDefinitionRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.PipelineRepository;
import com.samgov.ingestor.repository.InvoiceRepository;
import com.samgov.ingestor.repository.ContactRepository;
import com.samgov.ingestor.repository.OrganizationRepository;
import com.samgov.ingestor.repository.CertificationRepository;
import com.samgov.ingestor.repository.ComplianceItemRepository;
import com.samgov.ingestor.repository.ContractDeliverableRepository;
import com.samgov.ingestor.repository.BudgetItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing custom report definitions with drag-and-drop column configuration.
 */
@Service
@Transactional
public class ReportDefinitionService {

    private final ReportDefinitionRepository reportDefinitionRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    // Entity repositories for report execution
    private final OpportunityRepository opportunityRepository;
    private final ContractRepository contractRepository;
    private final PipelineRepository pipelineRepository;
    private final InvoiceRepository invoiceRepository;
    private final ContactRepository contactRepository;
    private final OrganizationRepository organizationRepository;
    private final CertificationRepository certificationRepository;
    private final ComplianceItemRepository complianceItemRepository;
    private final ContractDeliverableRepository deliverableRepository;
    private final BudgetItemRepository budgetItemRepository;

    public ReportDefinitionService(
            ReportDefinitionRepository reportDefinitionRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository,
            AuditService auditService,
            ObjectMapper objectMapper,
            OpportunityRepository opportunityRepository,
            ContractRepository contractRepository,
            PipelineRepository pipelineRepository,
            InvoiceRepository invoiceRepository,
            ContactRepository contactRepository,
            OrganizationRepository organizationRepository,
            CertificationRepository certificationRepository,
            ComplianceItemRepository complianceItemRepository,
            ContractDeliverableRepository deliverableRepository,
            BudgetItemRepository budgetItemRepository) {
        this.reportDefinitionRepository = reportDefinitionRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
        this.opportunityRepository = opportunityRepository;
        this.contractRepository = contractRepository;
        this.pipelineRepository = pipelineRepository;
        this.invoiceRepository = invoiceRepository;
        this.contactRepository = contactRepository;
        this.organizationRepository = organizationRepository;
        this.certificationRepository = certificationRepository;
        this.complianceItemRepository = complianceItemRepository;
        this.deliverableRepository = deliverableRepository;
        this.budgetItemRepository = budgetItemRepository;
    }

    // Request/Response DTOs
    public record ColumnDefinition(
        String field,
        String label,
        Integer width,
        Boolean visible
    ) {}

    public record FilterCondition(
        String field,
        String operator,
        String value
    ) {}

    public record CreateReportRequest(
        String name,
        String description,
        EntityType entityType,
        List<ColumnDefinition> columns,
        List<FilterCondition> filters,
        String sortBy,
        SortDirection sortDirection,
        Boolean isPublic
    ) {}

    public record UpdateReportRequest(
        String name,
        String description,
        List<ColumnDefinition> columns,
        List<FilterCondition> filters,
        String sortBy,
        SortDirection sortDirection,
        Boolean isPublic
    ) {}

    public record ReportDefinitionResponse(
        UUID id,
        String name,
        String description,
        EntityType entityType,
        List<ColumnDefinition> columns,
        List<FilterCondition> filters,
        String sortBy,
        SortDirection sortDirection,
        Boolean isPublic,
        Integer runCount,
        Instant lastRunAt,
        String createdByName,
        UUID createdById,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ReportExecutionResult(
        UUID reportId,
        String reportName,
        EntityType entityType,
        List<ColumnDefinition> columns,
        List<Map<String, Object>> data,
        Integer totalRecords,
        Instant executedAt
    ) {}

    public record ExportResult(
        byte[] content,
        String contentType,
        String filename
    ) {}

    /**
     * Create a new report definition
     */
    public ReportDefinitionResponse createReport(UUID tenantId, UUID userId, CreateReportRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Report name is required");
        }
        if (request.entityType() == null) {
            throw new IllegalArgumentException("Entity type is required");
        }
        if (request.columns() == null || request.columns().isEmpty()) {
            throw new IllegalArgumentException("At least one column is required");
        }

        ReportDefinition report = new ReportDefinition();
        report.setTenant(tenant);
        report.setUser(user);
        report.setName(request.name());
        report.setDescription(request.description());
        report.setEntityType(request.entityType());
        report.setColumns(serializeColumns(request.columns()));
        report.setFilters(serializeFilters(request.filters()));
        report.setSortBy(request.sortBy());
        report.setSortDirection(request.sortDirection());
        report.setIsPublic(request.isPublic() != null ? request.isPublic() : false);
        report.setRunCount(0);

        report = reportDefinitionRepository.save(report);

        auditService.logAction(AuditAction.REPORT_CREATED, "ReportDefinition",
            report.getId().toString(), "Created report definition: " + request.name());

        return toResponse(report);
    }

    /**
     * Update an existing report definition
     */
    public ReportDefinitionResponse updateReport(UUID tenantId, UUID userId, UUID reportId, UpdateReportRequest request) {
        ReportDefinition report = reportDefinitionRepository.findByIdAndTenantId(reportId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        // Only owner can update
        if (!report.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the report owner can update it");
        }

        if (request.name() != null && !request.name().isBlank()) {
            report.setName(request.name());
        }
        report.setDescription(request.description());
        if (request.columns() != null && !request.columns().isEmpty()) {
            report.setColumns(serializeColumns(request.columns()));
        }
        report.setFilters(serializeFilters(request.filters()));
        report.setSortBy(request.sortBy());
        report.setSortDirection(request.sortDirection());
        if (request.isPublic() != null) {
            report.setIsPublic(request.isPublic());
        }

        report = reportDefinitionRepository.save(report);

        auditService.logAction(AuditAction.REPORT_UPDATED, "ReportDefinition",
            reportId.toString(), "Updated report definition");

        return toResponse(report);
    }

    /**
     * Delete a report definition
     */
    public void deleteReport(UUID tenantId, UUID userId, UUID reportId) {
        ReportDefinition report = reportDefinitionRepository.findByIdAndTenantId(reportId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        // Only owner can delete
        if (!report.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the report owner can delete it");
        }

        String reportName = report.getName();
        reportDefinitionRepository.delete(report);

        auditService.logAction(AuditAction.REPORT_DELETED, "ReportDefinition",
            reportId.toString(), "Deleted report definition: " + reportName);
    }

    /**
     * Get a single report definition
     */
    @Transactional(readOnly = true)
    public Optional<ReportDefinitionResponse> getReport(UUID tenantId, UUID userId, UUID reportId) {
        return reportDefinitionRepository.findByIdAndTenantId(reportId, tenantId)
                .filter(r -> r.getUser().getId().equals(userId) || r.getIsPublic())
                .map(this::toResponse);
    }

    /**
     * Get all accessible reports for a user
     */
    @Transactional(readOnly = true)
    public Page<ReportDefinitionResponse> getAccessibleReports(UUID tenantId, UUID userId, Pageable pageable) {
        return reportDefinitionRepository.findAccessibleReports(tenantId, userId, pageable)
                .map(this::toResponse);
    }

    /**
     * Get reports by entity type
     */
    @Transactional(readOnly = true)
    public Page<ReportDefinitionResponse> getReportsByEntityType(
            UUID tenantId, UUID userId, EntityType entityType, Pageable pageable) {
        return reportDefinitionRepository.findByTenantIdAndEntityType(tenantId, entityType, pageable)
                .map(this::toResponse);
    }

    /**
     * Search reports by name
     */
    @Transactional(readOnly = true)
    public Page<ReportDefinitionResponse> searchReports(UUID tenantId, UUID userId, String keyword, Pageable pageable) {
        return reportDefinitionRepository.searchByName(tenantId, userId, keyword, pageable)
                .map(this::toResponse);
    }

    /**
     * Execute a report and return the data
     */
    @Transactional
    public ReportExecutionResult executeReport(UUID tenantId, UUID userId, UUID reportId, Map<String, String> parameters) {
        ReportDefinition report = reportDefinitionRepository.findByIdAndTenantId(reportId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        // Check access
        if (!report.getUser().getId().equals(userId) && !report.getIsPublic()) {
            throw new IllegalArgumentException("Access denied to this report");
        }

        List<ColumnDefinition> columns = deserializeColumns(report.getColumns());
        List<FilterCondition> filters = deserializeFilters(report.getFilters());

        // Merge parameters with filters
        if (parameters != null && !parameters.isEmpty()) {
            // Parameters can override filter values dynamically
            for (FilterCondition filter : filters) {
                String paramValue = parameters.get(filter.field());
                if (paramValue != null) {
                    // Create new filter with parameter value
                    filters = filters.stream()
                        .map(f -> f.field().equals(filter.field())
                            ? new FilterCondition(f.field(), f.operator(), paramValue)
                            : f)
                        .collect(Collectors.toList());
                }
            }
        }

        // Execute query based on entity type
        List<Map<String, Object>> data = executeEntityQuery(
            tenantId,
            report.getEntityType(),
            columns,
            filters,
            report.getSortBy(),
            report.getSortDirection()
        );

        // Record execution
        report.recordExecution();
        reportDefinitionRepository.save(report);

        auditService.logAction(AuditAction.REPORT_RAN, "ReportDefinition",
            reportId.toString(), "Executed report: " + report.getName());

        return new ReportExecutionResult(
            reportId,
            report.getName(),
            report.getEntityType(),
            columns,
            data,
            data.size(),
            Instant.now()
        );
    }

    /**
     * Export report to CSV, Excel, or PDF
     */
    @Transactional
    public ExportResult exportReport(UUID tenantId, UUID userId, UUID reportId, String format) {
        // Execute the report first
        ReportExecutionResult result = executeReport(tenantId, userId, reportId, null);

        return switch (format.toUpperCase()) {
            case "CSV" -> exportToCsv(result);
            case "EXCEL" -> exportToExcel(result);
            case "PDF" -> exportToPdf(result);
            default -> throw new IllegalArgumentException("Unsupported export format: " + format);
        };
    }

    /**
     * Get available columns for an entity type
     */
    @Transactional(readOnly = true)
    public List<ColumnDefinition> getAvailableColumns(EntityType entityType) {
        return switch (entityType) {
            case OPPORTUNITY -> getOpportunityColumns();
            case CONTRACT -> getContractColumns();
            case PIPELINE -> getPipelineColumns();
            case INVOICE -> getInvoiceColumns();
            case CONTACT -> getContactColumns();
            case ORGANIZATION -> getOrganizationColumns();
            case CERTIFICATION -> getCertificationColumns();
            case COMPLIANCE -> getComplianceColumns();
            case DELIVERABLE -> getDeliverableColumns();
            case BUDGET -> getBudgetColumns();
        };
    }

    // Private helper methods

    private String serializeColumns(List<ColumnDefinition> columns) {
        try {
            return objectMapper.writeValueAsString(columns);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize columns", e);
        }
    }

    private String serializeFilters(List<FilterCondition> filters) {
        if (filters == null || filters.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(filters);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize filters", e);
        }
    }

    private List<ColumnDefinition> deserializeColumns(String columnsJson) {
        try {
            return objectMapper.readValue(columnsJson, new TypeReference<List<ColumnDefinition>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize columns", e);
        }
    }

    private List<FilterCondition> deserializeFilters(String filtersJson) {
        if (filtersJson == null || filtersJson.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(filtersJson, new TypeReference<List<FilterCondition>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize filters", e);
        }
    }

    private ReportDefinitionResponse toResponse(ReportDefinition report) {
        String createdByName = report.getUser() != null
                ? report.getUser().getFirstName() + " " + report.getUser().getLastName()
                : "Unknown";

        return new ReportDefinitionResponse(
            report.getId(),
            report.getName(),
            report.getDescription(),
            report.getEntityType(),
            deserializeColumns(report.getColumns()),
            deserializeFilters(report.getFilters()),
            report.getSortBy(),
            report.getSortDirection(),
            report.getIsPublic(),
            report.getRunCount(),
            report.getLastRunAt(),
            createdByName,
            report.getUser() != null ? report.getUser().getId() : null,
            report.getCreatedAt(),
            report.getUpdatedAt()
        );
    }

    private List<Map<String, Object>> executeEntityQuery(
            UUID tenantId,
            EntityType entityType,
            List<ColumnDefinition> columns,
            List<FilterCondition> filters,
            String sortBy,
            SortDirection sortDirection) {

        // This is a simplified implementation
        // In production, you would use JPA Criteria API or QueryDSL for dynamic queries

        Pageable pageable = PageRequest.of(0, 1000,
            sortDirection == SortDirection.DESC ? Sort.Direction.DESC : Sort.Direction.ASC,
            sortBy != null ? sortBy : "id");

        return switch (entityType) {
            case OPPORTUNITY -> executeOpportunityQuery(tenantId, columns, filters, pageable);
            case CONTRACT -> executeContractQuery(tenantId, columns, filters, pageable);
            case PIPELINE -> executePipelineQuery(tenantId, columns, filters, pageable);
            case INVOICE -> executeInvoiceQuery(tenantId, columns, filters, pageable);
            case CONTACT -> executeContactQuery(tenantId, columns, filters, pageable);
            case ORGANIZATION -> executeOrganizationQuery(tenantId, columns, filters, pageable);
            case CERTIFICATION -> executeCertificationQuery(tenantId, columns, filters, pageable);
            case COMPLIANCE -> executeComplianceQuery(tenantId, columns, filters, pageable);
            case DELIVERABLE -> executeDeliverableQuery(tenantId, columns, filters, pageable);
            case BUDGET -> executeBudgetQuery(tenantId, columns, filters, pageable);
        };
    }

    private List<Map<String, Object>> executeOpportunityQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        // Simplified: fetch all opportunities and map to columns
        return opportunityRepository.findAll(pageable).getContent().stream()
            .map(opp -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(opp, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executeContractQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return contractRepository.findByTenantId(tenantId, pageable).getContent().stream()
            .map(contract -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(contract, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executePipelineQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return pipelineRepository.findByTenantId(tenantId, pageable).getContent().stream()
            .map(pipeline -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(pipeline, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executeInvoiceQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return invoiceRepository.findByTenantId(tenantId, pageable).getContent().stream()
            .map(invoice -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(invoice, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executeContactQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return contactRepository.findByTenantIdAndStatusNot(
                tenantId,
                com.samgov.ingestor.model.Contact.ContactStatus.ARCHIVED,
                pageable
            ).getContent().stream()
            .map(contact -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(contact, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executeOrganizationQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return organizationRepository.findByTenantIdAndStatusNot(
                tenantId,
                com.samgov.ingestor.model.Organization.OrganizationStatus.ARCHIVED,
                pageable
            ).getContent().stream()
            .map(org -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(org, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executeCertificationQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return certificationRepository.findByTenantId(tenantId, pageable).getContent().stream()
            .map(cert -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(cert, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executeComplianceQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return complianceItemRepository.findByTenantId(tenantId, pageable).getContent().stream()
            .map(item -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(item, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executeDeliverableQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return deliverableRepository.findByTenantId(tenantId, pageable).getContent().stream()
            .map(deliverable -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(deliverable, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> executeBudgetQuery(
            UUID tenantId, List<ColumnDefinition> columns, List<FilterCondition> filters, Pageable pageable) {
        return budgetItemRepository.findByTenantId(tenantId, pageable).getContent().stream()
            .map(budget -> {
                Map<String, Object> row = new HashMap<>();
                for (ColumnDefinition col : columns) {
                    if (col.visible()) {
                        row.put(col.field(), getFieldValue(budget, col.field()));
                    }
                }
                return row;
            })
            .collect(Collectors.toList());
    }

    private Object getFieldValue(Object entity, String fieldName) {
        try {
            var field = entity.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(entity);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            // Try getter method
            try {
                String getterName = "get" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
                var method = entity.getClass().getMethod(getterName);
                return method.invoke(entity);
            } catch (Exception ex) {
                return null;
            }
        }
    }

    private ExportResult exportToCsv(ReportExecutionResult result) {
        StringBuilder csv = new StringBuilder();

        // Header
        List<String> visibleColumns = result.columns().stream()
            .filter(ColumnDefinition::visible)
            .map(ColumnDefinition::label)
            .toList();
        csv.append(String.join(",", visibleColumns)).append("\n");

        // Data
        for (Map<String, Object> row : result.data()) {
            List<String> values = result.columns().stream()
                .filter(ColumnDefinition::visible)
                .map(col -> {
                    Object value = row.get(col.field());
                    return value != null ? "\"" + value.toString().replace("\"", "\"\"") + "\"" : "";
                })
                .toList();
            csv.append(String.join(",", values)).append("\n");
        }

        return new ExportResult(
            csv.toString().getBytes(),
            "text/csv",
            result.reportName().replaceAll("[^a-zA-Z0-9]", "_") + ".csv"
        );
    }

    private ExportResult exportToExcel(ReportExecutionResult result) {
        // Simplified: just return CSV with Excel content type
        // In production, use Apache POI for proper Excel files
        ExportResult csvResult = exportToCsv(result);
        return new ExportResult(
            csvResult.content(),
            "application/vnd.ms-excel",
            result.reportName().replaceAll("[^a-zA-Z0-9]", "_") + ".xls"
        );
    }

    private ExportResult exportToPdf(ReportExecutionResult result) {
        // Simplified placeholder - in production use iText or similar
        String pdfContent = "PDF export not fully implemented. Report: " + result.reportName();
        return new ExportResult(
            pdfContent.getBytes(),
            "application/pdf",
            result.reportName().replaceAll("[^a-zA-Z0-9]", "_") + ".pdf"
        );
    }

    // Column definitions for each entity type
    private List<ColumnDefinition> getOpportunityColumns() {
        return Arrays.asList(
            new ColumnDefinition("noticeId", "Notice ID", 120, true),
            new ColumnDefinition("title", "Title", 300, true),
            new ColumnDefinition("type", "Type", 100, true),
            new ColumnDefinition("postedDate", "Posted Date", 120, true),
            new ColumnDefinition("responseDeadLine", "Response Deadline", 140, true),
            new ColumnDefinition("naicsCode", "NAICS Code", 100, true),
            new ColumnDefinition("setAsideDescription", "Set-Aside", 150, true),
            new ColumnDefinition("organizationName", "Agency", 200, true),
            new ColumnDefinition("placeOfPerformance", "Location", 150, false),
            new ColumnDefinition("archiveDate", "Archive Date", 120, false)
        );
    }

    private List<ColumnDefinition> getContractColumns() {
        return Arrays.asList(
            new ColumnDefinition("contractNumber", "Contract Number", 150, true),
            new ColumnDefinition("title", "Title", 300, true),
            new ColumnDefinition("status", "Status", 100, true),
            new ColumnDefinition("totalValue", "Total Value", 120, true),
            new ColumnDefinition("startDate", "Start Date", 120, true),
            new ColumnDefinition("endDate", "End Date", 120, true),
            new ColumnDefinition("contractType", "Contract Type", 120, true),
            new ColumnDefinition("fundedAmount", "Funded Amount", 120, false),
            new ColumnDefinition("obligatedAmount", "Obligated Amount", 120, false)
        );
    }

    private List<ColumnDefinition> getPipelineColumns() {
        return Arrays.asList(
            new ColumnDefinition("name", "Name", 200, true),
            new ColumnDefinition("description", "Description", 300, true),
            new ColumnDefinition("isDefault", "Is Default", 80, true),
            new ColumnDefinition("createdAt", "Created At", 120, true),
            new ColumnDefinition("updatedAt", "Updated At", 120, false)
        );
    }

    private List<ColumnDefinition> getInvoiceColumns() {
        return Arrays.asList(
            new ColumnDefinition("invoiceNumber", "Invoice Number", 150, true),
            new ColumnDefinition("status", "Status", 100, true),
            new ColumnDefinition("totalAmount", "Total Amount", 120, true),
            new ColumnDefinition("invoiceDate", "Invoice Date", 120, true),
            new ColumnDefinition("dueDate", "Due Date", 120, true),
            new ColumnDefinition("paidDate", "Paid Date", 120, false),
            new ColumnDefinition("description", "Description", 250, false)
        );
    }

    private List<ColumnDefinition> getContactColumns() {
        return Arrays.asList(
            new ColumnDefinition("firstName", "First Name", 120, true),
            new ColumnDefinition("lastName", "Last Name", 120, true),
            new ColumnDefinition("email", "Email", 200, true),
            new ColumnDefinition("phone", "Phone", 120, true),
            new ColumnDefinition("title", "Title", 150, true),
            new ColumnDefinition("contactType", "Type", 100, true),
            new ColumnDefinition("notes", "Notes", 200, false)
        );
    }

    private List<ColumnDefinition> getOrganizationColumns() {
        return Arrays.asList(
            new ColumnDefinition("name", "Name", 250, true),
            new ColumnDefinition("organizationType", "Type", 120, true),
            new ColumnDefinition("website", "Website", 200, true),
            new ColumnDefinition("phone", "Phone", 120, true),
            new ColumnDefinition("city", "City", 120, true),
            new ColumnDefinition("state", "State", 80, true),
            new ColumnDefinition("country", "Country", 100, false)
        );
    }

    private List<ColumnDefinition> getCertificationColumns() {
        return Arrays.asList(
            new ColumnDefinition("name", "Name", 200, true),
            new ColumnDefinition("certificationNumber", "Cert Number", 150, true),
            new ColumnDefinition("issuingAgency", "Issuing Agency", 150, true),
            new ColumnDefinition("status", "Status", 100, true),
            new ColumnDefinition("issueDate", "Issue Date", 120, true),
            new ColumnDefinition("expirationDate", "Expiration Date", 130, true),
            new ColumnDefinition("category", "Category", 120, false)
        );
    }

    private List<ColumnDefinition> getComplianceColumns() {
        return Arrays.asList(
            new ColumnDefinition("name", "Name", 200, true),
            new ColumnDefinition("complianceType", "Type", 120, true),
            new ColumnDefinition("status", "Status", 100, true),
            new ColumnDefinition("priority", "Priority", 80, true),
            new ColumnDefinition("dueDate", "Due Date", 120, true),
            new ColumnDefinition("completedDate", "Completed", 120, false),
            new ColumnDefinition("description", "Description", 250, false)
        );
    }

    private List<ColumnDefinition> getDeliverableColumns() {
        return Arrays.asList(
            new ColumnDefinition("name", "Name", 200, true),
            new ColumnDefinition("deliverableNumber", "Number", 100, true),
            new ColumnDefinition("status", "Status", 100, true),
            new ColumnDefinition("dueDate", "Due Date", 120, true),
            new ColumnDefinition("submittedDate", "Submitted", 120, true),
            new ColumnDefinition("acceptedDate", "Accepted", 120, false),
            new ColumnDefinition("description", "Description", 250, false)
        );
    }

    private List<ColumnDefinition> getBudgetColumns() {
        return Arrays.asList(
            new ColumnDefinition("name", "Name", 200, true),
            new ColumnDefinition("category", "Category", 120, true),
            new ColumnDefinition("budgetedAmount", "Budgeted", 120, true),
            new ColumnDefinition("actualAmount", "Actual", 120, true),
            new ColumnDefinition("variance", "Variance", 100, true),
            new ColumnDefinition("fiscalYear", "Fiscal Year", 100, true),
            new ColumnDefinition("fiscalPeriod", "Period", 80, false)
        );
    }
}
