package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.ExportRequest;
import com.samgov.ingestor.model.ExportTemplate;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.ScheduledExport;
import com.samgov.ingestor.repository.ExportTemplateRepository;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.ScheduledExportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for enhanced export functionality.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExportEnhancementService {

    private final OpportunityRepository opportunityRepository;
    private final ExportTemplateRepository templateRepository;
    private final ScheduledExportRepository scheduledExportRepository;

    /**
     * Export opportunities in the specified format.
     */
    @Transactional(readOnly = true)
    public byte[] exportOpportunities(ExportRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        
        List<Opportunity> opportunities = opportunityRepository.findAllById(request.getIds())
            .stream()
            .filter(o -> o.getTenantId().equals(tenantId))
            .toList();

        return switch (request.getFormat()) {
            case CSV -> generateCsv(opportunities);
            case EXCEL -> generateExcel(opportunities);
            case PDF -> generatePdf(opportunities, request.getTemplateId());
            case JSON -> generateJson(opportunities);
        };
    }

    private byte[] generateCsv(List<Opportunity> opportunities) {
        StringBuilder csv = new StringBuilder();
        csv.append("Notice ID,Title,Agency,Type,Response Deadline,Posted Date\n");
        
        for (Opportunity opp : opportunities) {
            csv.append(escapeCsv(opp.getNoticeId())).append(",");
            csv.append(escapeCsv(opp.getTitle())).append(",");
            csv.append(escapeCsv(opp.getAgency())).append(",");
            csv.append(escapeCsv(opp.getType())).append(",");
            csv.append(opp.getResponseDeadline() != null ? opp.getResponseDeadline() : "").append(",");
            csv.append(opp.getPostedDate() != null ? opp.getPostedDate() : "").append("\n");
        }
        
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private byte[] generateExcel(List<Opportunity> opportunities) {
        // Simplified - in production would use Apache POI
        return generateCsv(opportunities);
    }

    private byte[] generatePdf(List<Opportunity> opportunities, String templateId) {
        // Simplified - in production would use iText or similar
        StringBuilder content = new StringBuilder();
        content.append("OPPORTUNITY EXPORT\n");
        content.append("==================\n\n");
        
        for (Opportunity opp : opportunities) {
            content.append("Title: ").append(opp.getTitle()).append("\n");
            content.append("Notice ID: ").append(opp.getNoticeId()).append("\n");
            content.append("Agency: ").append(opp.getAgency()).append("\n");
            content.append("Type: ").append(opp.getType()).append("\n");
            content.append("Deadline: ").append(opp.getResponseDeadline()).append("\n");
            content.append("\n---\n\n");
        }
        
        return content.toString().getBytes(StandardCharsets.UTF_8);
    }

    private byte[] generateJson(List<Opportunity> opportunities) {
        // Simplified - in production would use Jackson
        StringBuilder json = new StringBuilder();
        json.append("[");
        
        for (int i = 0; i < opportunities.size(); i++) {
            Opportunity opp = opportunities.get(i);
            json.append("{");
            json.append("\"noticeId\":\"").append(opp.getNoticeId()).append("\",");
            json.append("\"title\":\"").append(escapeJson(opp.getTitle())).append("\",");
            json.append("\"agency\":\"").append(escapeJson(opp.getAgency())).append("\",");
            json.append("\"type\":\"").append(opp.getType()).append("\"");
            json.append("}");
            if (i < opportunities.size() - 1) {
                json.append(",");
            }
        }
        
        json.append("]");
        return json.toString().getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Get export templates for current tenant.
     */
    @Transactional(readOnly = true)
    public List<ExportTemplate> getTemplates(String entityType) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (entityType != null) {
            return templateRepository.findByTenantIdAndEntityType(tenantId, entityType);
        }
        return templateRepository.findByTenantId(tenantId);
    }

    /**
     * Get scheduled exports for current user.
     */
    @Transactional(readOnly = true)
    public List<ScheduledExport> getScheduledExports(UUID userId) {
        return scheduledExportRepository.findByUserId(userId);
    }

    /**
     * Create a scheduled export.
     */
    @Transactional
    public ScheduledExport createScheduledExport(ScheduledExport export) {
        export.setTenantId(TenantContext.getCurrentTenantId());
        export.setNextRunAt(calculateNextRun(export));
        return scheduledExportRepository.save(export);
    }

    private Instant calculateNextRun(ScheduledExport export) {
        // Simplified - would calculate based on frequency and schedule
        return Instant.now().plusSeconds(86400); // Next day
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
