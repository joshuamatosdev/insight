package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.SavedReport.ReportFormat;
import com.samgov.ingestor.model.SavedReport.ReportType;
import com.samgov.ingestor.model.SavedReport.ScheduleFrequency;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class ReportService {

    private final SavedReportRepository reportRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ReportService(SavedReportRepository reportRepository, TenantRepository tenantRepository,
                         UserRepository userRepository, AuditService auditService) {
        this.reportRepository = reportRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public record CreateReportRequest(String name, String description, ReportType reportType,
                                       String queryConfig, ReportFormat format, Boolean isScheduled,
                                       ScheduleFrequency frequency, String recipients) {}

    public record ReportResponse(UUID id, String name, String description, ReportType reportType,
                                  String queryConfig, ReportFormat format, Boolean isScheduled,
                                  ScheduleFrequency frequency, String recipients, Instant lastRunAt,
                                  Integer runCount, String createdByName, Instant createdAt) {}

    public ReportResponse createReport(UUID tenantId, UUID userId, CreateReportRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SavedReport report = new SavedReport();
        report.setTenant(tenant);
        report.setOwner(user);
        report.setName(request.name());
        report.setDescription(request.description());
        report.setReportType(request.reportType());
        report.setConfiguration(request.queryConfig());
        report.setDefaultFormat(request.format() != null ? request.format() : ReportFormat.PDF);
        report.setIsScheduled(request.isScheduled() != null ? request.isScheduled() : false);
        report.setScheduleFrequency(request.frequency());
        report.setScheduleRecipients(request.recipients());
        report.setRunCount(0);

        report = reportRepository.save(report);
        auditService.logAction(AuditAction.REPORT_CREATED, "SavedReport", report.getId().toString(),
                "Created report: " + request.name());

        return toResponse(report);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getReports(UUID tenantId, Pageable pageable) {
        return reportRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getReportsByType(UUID tenantId, ReportType type, Pageable pageable) {
        return reportRepository.findByTenantIdAndReportType(tenantId, type, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getScheduledReports(UUID tenantId) {
        return reportRepository.findByTenantIdAndIsScheduledTrue(tenantId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<ReportResponse> getReport(UUID reportId) {
        return reportRepository.findById(reportId).map(this::toResponse);
    }

    public ReportResponse updateReport(UUID tenantId, UUID reportId, UUID userId, CreateReportRequest request) {
        SavedReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        if (!report.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Report does not belong to tenant");
        }

        report.setName(request.name());
        report.setDescription(request.description());
        report.setReportType(request.reportType());
        report.setConfiguration(request.queryConfig());
        report.setDefaultFormat(request.format());
        report.setIsScheduled(request.isScheduled());
        report.setScheduleFrequency(request.frequency());
        report.setScheduleRecipients(request.recipients());

        report = reportRepository.save(report);
        auditService.logAction(AuditAction.REPORT_UPDATED, "SavedReport", reportId.toString(), "Updated report");

        return toResponse(report);
    }

    public void runReport(UUID tenantId, UUID reportId, UUID userId) {
        SavedReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        if (!report.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Report does not belong to tenant");
        }

        report.setLastRunAt(Instant.now());
        report.setRunCount(report.getRunCount() + 1);
        reportRepository.save(report);

        auditService.logAction(AuditAction.REPORT_RAN, "SavedReport", reportId.toString(), "Ran report");
    }

    public void deleteReport(UUID tenantId, UUID reportId, UUID userId) {
        SavedReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        if (!report.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Report does not belong to tenant");
        }

        reportRepository.delete(report);
        auditService.logAction(AuditAction.REPORT_DELETED, "SavedReport", reportId.toString(),
                "Deleted report: " + report.getName());
    }

    private ReportResponse toResponse(SavedReport report) {
        String createdByName = report.getOwner() != null ?
                report.getOwner().getFirstName() + " " + report.getOwner().getLastName() : "Unknown";

        return new ReportResponse(report.getId(), report.getName(), report.getDescription(),
                report.getReportType(), report.getConfiguration(), report.getDefaultFormat(),
                report.getIsScheduled(), report.getScheduleFrequency(), report.getScheduleRecipients(),
                report.getLastRunAt(), report.getRunCount(), createdByName, report.getCreatedAt());
    }
}
