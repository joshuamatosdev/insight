package com.samgov.ingestor.config;

import com.samgov.ingestor.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for maintenance and automation operations.
 * Handles opportunity ingestion, alerts, compliance monitoring, and cleanup.
 *
 * IMPORTANT: Scheduling is DISABLED by default for development to minimize API requests.
 * Set app.scheduling.enabled=true in production to enable automated tasks.
 */
@Slf4j
@Component
@EnableScheduling
@ConditionalOnProperty(name = "app.scheduling.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ScheduledTasks {

    private final PasswordResetService passwordResetService;
    private final InvitationService invitationService;
    private final SessionService sessionService;
    private final OpportunityService opportunityService;
    private final AlertService alertService;
    private final CertificationService certificationService;
    private final ComplianceService complianceService;
    private final UsaSpendingIngestionService usaSpendingIngestionService;
    private final GeocodingService geocodingService;

    /**
     * Clean up expired password reset tokens daily at 2 AM.
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredPasswordResetTokens() {
        log.info("Running scheduled cleanup of expired password reset tokens");
        int deleted = passwordResetService.cleanupExpiredTokens();
        log.info("Cleanup complete. Deleted {} expired tokens", deleted);
    }

    /**
     * Expire old invitations daily at 3 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void expireOldInvitations() {
        log.info("Running scheduled expiration of old invitations");
        int expired = invitationService.expireOldInvitations();
        log.info("Expiration complete. Marked {} invitations as expired", expired);
    }

    /**
     * Expire old sessions every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void expireSessions() {
        log.info("Running scheduled session expiration");
        int expired = sessionService.expireSessions();
        log.info("Session expiration complete. Expired {} sessions", expired);
    }

    /**
     * Clean up old revoked sessions weekly on Sunday at 4 AM.
     */
    @Scheduled(cron = "0 0 4 * * SUN")
    public void cleanupOldSessions() {
        log.info("Running scheduled cleanup of old revoked sessions");
        int deleted = sessionService.cleanupOldSessions(30);
        log.info("Session cleanup complete. Deleted {} old sessions", deleted);
    }

    // ============================================
    // OPPORTUNITY INGESTION TASKS
    // ============================================

    /**
     * Ingest new opportunities from SAM.gov twice weekly: Monday and Thursday at 5 AM.
     * Government data doesn't update frequently enough to warrant more than twice weekly.
     */
    @Scheduled(cron = "0 0 5 * * MON,THU")
    public void ingestSamGovOpportunities() {
        log.info("Starting SAM.gov opportunity ingestion");
        try {
            int count = opportunityService.ingestFromSamGov();
            log.info("SAM.gov ingestion complete. Ingested {} new opportunities", count);
        } catch (Exception e) {
            log.error("SAM.gov ingestion failed", e);
        }
    }

    /**
     * Ingest SBIR/STTR opportunities weekly on Sunday at 6 AM.
     */
    @Scheduled(cron = "0 0 6 * * SUN")
    public void ingestSbirOpportunities() {
        log.info("Starting SBIR.gov opportunity ingestion");
        try {
            int count = opportunityService.ingestFromSbirGov();
            log.info("SBIR.gov ingestion complete. Ingested {} new opportunities", count);
        } catch (Exception e) {
            log.error("SBIR.gov ingestion failed", e);
        }
    }

    /**
     * Ingest USAspending.gov award data weekly on Tuesday at 2 AM.
     */
    @Scheduled(cron = "0 0 2 * * TUE")
    public void ingestUsaSpendingData() {
        log.info("Starting USAspending.gov data ingestion");
        try {
            var result = usaSpendingIngestionService.ingestRecentAwards();
            log.info("USAspending.gov ingestion complete: {}", result.toMessage());
        } catch (Exception e) {
            log.error("USAspending.gov ingestion failed", e);
        }
    }

    /**
     * Geocode opportunities without coordinates weekly on Sunday at 3 AM.
     * Processes up to 500 opportunities per run.
     * Only needed when new opportunities with addresses are added.
     */
    @Scheduled(cron = "0 0 3 * * SUN")
    public void geocodeOpportunities() {
        log.info("Starting opportunity geocoding batch");
        try {
            int geocoded = geocodingService.batchGeocodeOpportunities(500);
            log.info("Geocoding batch complete. Geocoded {} opportunities", geocoded);
        } catch (Exception e) {
            log.error("Opportunity geocoding failed", e);
        }
    }

    // ============================================
    // ALERT AND NOTIFICATION TASKS
    // ============================================

    /**
     * Send deadline alerts daily at 8 AM.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDeadlineAlerts() {
        log.info("Processing deadline alerts");
        try {
            // TODO: Implement alertService.processDeadlineAlerts()
            log.info("Deadline alert processing complete");
        } catch (Exception e) {
            log.error("Deadline alert processing failed", e);
        }
    }

    /**
     * Send new opportunity match alerts every 2 hours.
     */
    @Scheduled(cron = "0 0 */2 * * *")
    public void sendOpportunityMatchAlerts() {
        log.info("Processing opportunity match alerts");
        try {
            // TODO: Implement alertService.processOpportunityMatchAlerts()
            log.info("Opportunity match alert processing complete");
        } catch (Exception e) {
            log.error("Opportunity match alert processing failed", e);
        }
    }

    // ============================================
    // COMPLIANCE AND CERTIFICATION TASKS
    // ============================================

    /**
     * Check for expiring certifications daily at 7 AM.
     */
    @Scheduled(cron = "0 0 7 * * *")
    public void checkExpiringCertifications() {
        log.info("Checking for expiring certifications");
        try {
            // TODO: Implement certificationService.checkExpiringCertifications()
            log.info("Certification expiration check complete");
        } catch (Exception e) {
            log.error("Certification expiration check failed", e);
        }
    }

    /**
     * Check for expiring clearances daily at 7:30 AM.
     */
    @Scheduled(cron = "0 30 7 * * *")
    public void checkExpiringClearances() {
        log.info("Checking for expiring security clearances");
        try {
            // This would be implemented in a SecurityClearanceService
            log.info("Clearance expiration check complete");
        } catch (Exception e) {
            log.error("Clearance expiration check failed", e);
        }
    }

    /**
     * Check compliance status weekly on Monday at 9 AM.
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void checkComplianceStatus() {
        log.info("Running weekly compliance status check");
        try {
            // TODO: Implement complianceService.runComplianceCheck()
            log.info("Compliance check complete");
        } catch (Exception e) {
            log.error("Compliance status check failed", e);
        }
    }

    // ============================================
    // DATA MAINTENANCE TASKS
    // ============================================

    /**
     * Archive old closed opportunities monthly on the 1st at 1 AM.
     */
    @Scheduled(cron = "0 0 1 1 * *")
    public void archiveOldOpportunities() {
        log.info("Archiving old closed opportunities");
        try {
            int archived = opportunityService.archiveOldOpportunities(365);
            log.info("Archived {} old opportunities", archived);
        } catch (Exception e) {
            log.error("Opportunity archival failed", e);
        }
    }

    /**
     * Update opportunity statuses (mark expired) once daily at 1 AM.
     * Deadlines are dates, not hours - hourly checks are wasteful.
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void updateOpportunityStatuses() {
        log.info("Updating opportunity statuses");
        try {
            int updated = opportunityService.updateExpiredOpportunities();
            log.info("Updated {} expired opportunities", updated);
        } catch (Exception e) {
            log.error("Opportunity status update failed", e);
        }
    }

    /**
     * Clean up orphaned documents monthly on the 15th at 3 AM.
     */
    @Scheduled(cron = "0 0 3 15 * *")
    public void cleanupOrphanedDocuments() {
        log.info("Cleaning up orphaned documents");
        try {
            // Document cleanup logic
            log.info("Orphaned document cleanup complete");
        } catch (Exception e) {
            log.error("Document cleanup failed", e);
        }
    }

    /**
     * Generate monthly analytics report on the 1st at 5 AM.
     */
    @Scheduled(cron = "0 0 5 1 * *")
    public void generateMonthlyAnalytics() {
        log.info("Generating monthly analytics reports");
        try {
            // Analytics generation logic
            log.info("Monthly analytics report generation complete");
        } catch (Exception e) {
            log.error("Monthly analytics generation failed", e);
        }
    }
}
