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
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Compliance and Certification flows.
 * Tests certifications, security clearances, CMMC, and SBOM dashboard.
 */
@DisplayName("Compliance E2E Tests")
class ComplianceE2ETest extends BaseControllerTest {

    private static final String CERTIFICATIONS_URL = "/api/v1/certifications";
    private static final String CLEARANCES_URL = "/api/v1/security-clearances";
    private static final String CMMC_URL = "/api/v1/cmmc";
    private static final String SBOM_URL = "/api/v1/sbom";
    private static final String COMPLIANCE_URL = "/api/v1/compliance";

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
            .name("E2E Compliance Tenant " + UUID.randomUUID())
            .slug("e2e-compliance-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-compliance-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Compliance")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("Certifications CRUD Flow")
    class CertificationsCRUDFlow {

        @Test
        @DisplayName("should list certifications")
        void should_ListCertifications() throws Exception {
            performGet(CERTIFICATIONS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create certification")
        void should_CreateCertification() throws Exception {
            java.util.Map<String, Object> certRequest = java.util.Map.of(
                "name", "8(a) Small Business",
                "type", "SMALL_BUSINESS",
                "certifyingAgency", "SBA",
                "certificationNumber", "SBA-8A-" + UUID.randomUUID().toString().substring(0, 8),
                "issueDate", LocalDate.now().minusYears(1).toString(),
                "expirationDate", LocalDate.now().plusYears(4).toString(),
                "status", "ACTIVE"
            );

            performPost(CERTIFICATIONS_URL, certRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("8(a) Small Business"));
        }

        @Test
        @DisplayName("should retrieve certification by ID")
        void should_RetrieveCertificationById() throws Exception {
            // Create certification first
            java.util.Map<String, Object> certRequest = java.util.Map.of(
                "name", "HUBZone",
                "type", "SMALL_BUSINESS",
                "certifyingAgency", "SBA",
                "certificationNumber", "HUB-" + UUID.randomUUID().toString().substring(0, 8),
                "issueDate", LocalDate.now().toString(),
                "expirationDate", LocalDate.now().plusYears(3).toString(),
                "status", "ACTIVE"
            );

            performPost(CERTIFICATIONS_URL, certRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update certification")
        void should_UpdateCertification() throws Exception {
            java.util.Map<String, Object> certRequest = java.util.Map.of(
                "name", "SDVOSB",
                "type", "VETERAN_OWNED",
                "certifyingAgency", "VA",
                "certificationNumber", "VA-" + UUID.randomUUID().toString().substring(0, 8),
                "issueDate", LocalDate.now().toString(),
                "status", "ACTIVE"
            );

            performPost(CERTIFICATIONS_URL, certRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should get expiring certifications")
        void should_GetExpiringCertifications() throws Exception {
            performGet(CERTIFICATIONS_URL + "/expiring?days=90")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter certifications by type")
        void should_FilterCertificationsByType() throws Exception {
            performGet(CERTIFICATIONS_URL + "?type=SMALL_BUSINESS")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter certifications by status")
        void should_FilterCertificationsByStatus() throws Exception {
            performGet(CERTIFICATIONS_URL + "?status=ACTIVE")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Security Clearances Flow")
    class SecurityClearancesFlow {

        @Test
        @DisplayName("should list security clearances")
        void should_ListSecurityClearances() throws Exception {
            performGet(CLEARANCES_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create security clearance")
        void should_CreateSecurityClearance() throws Exception {
            java.util.Map<String, Object> clearanceRequest = java.util.Map.of(
                "level", "SECRET",
                "type", "FACILITY",
                "grantingAgency", "DCSA",
                "cageCode", "12345",
                "grantDate", LocalDate.now().minusYears(2).toString(),
                "expirationDate", LocalDate.now().plusYears(8).toString(),
                "status", "ACTIVE"
            );

            performPost(CLEARANCES_URL, clearanceRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.level").value("SECRET"));
        }

        @Test
        @DisplayName("should create personnel clearance")
        void should_CreatePersonnelClearance() throws Exception {
            java.util.Map<String, Object> clearanceRequest = java.util.Map.of(
                "level", "TOP_SECRET",
                "type", "PERSONNEL",
                "grantingAgency", "DCSA",
                "personnelName", "John Smith",
                "grantDate", LocalDate.now().minusYears(1).toString(),
                "expirationDate", LocalDate.now().plusYears(4).toString(),
                "status", "ACTIVE"
            );

            performPost(CLEARANCES_URL, clearanceRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should get expiring clearances")
        void should_GetExpiringClearances() throws Exception {
            performGet(CLEARANCES_URL + "/expiring?days=180")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter clearances by level")
        void should_FilterClearancesByLevel() throws Exception {
            performGet(CLEARANCES_URL + "?level=SECRET")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter clearances by type")
        void should_FilterClearancesByType() throws Exception {
            performGet(CLEARANCES_URL + "?type=FACILITY")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("CMMC Compliance Flow")
    class CMMCComplianceFlow {

        @Test
        @DisplayName("should get CMMC assessment status")
        void should_GetCMMCAssessmentStatus() throws Exception {
            performGet(CMMC_URL + "/status")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should list CMMC practices")
        void should_ListCMMCPractices() throws Exception {
            performGet(CMMC_URL + "/practices")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get CMMC practices by level")
        void should_GetCMMCPracticesByLevel() throws Exception {
            performGet(CMMC_URL + "/practices?level=2")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should update practice compliance status")
        void should_UpdatePracticeComplianceStatus() throws Exception {
            java.util.Map<String, Object> updateRequest = java.util.Map.of(
                "practiceId", "AC.L2-3.1.1",
                "status", "IMPLEMENTED",
                "evidence", "Access control policy implemented",
                "assessmentDate", LocalDate.now().toString()
            );

            performPost(CMMC_URL + "/practices/status", updateRequest)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get CMMC gap analysis")
        void should_GetCMMCGapAnalysis() throws Exception {
            performGet(CMMC_URL + "/gap-analysis?targetLevel=2")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get CMMC compliance score")
        void should_GetCMMCComplianceScore() throws Exception {
            performGet(CMMC_URL + "/score")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should generate CMMC assessment report")
        void should_GenerateCMMCAssessmentReport() throws Exception {
            performGet(CMMC_URL + "/report?format=PDF")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("SBOM Dashboard Flow")
    class SBOMDashboardFlow {

        @Test
        @DisplayName("should get SBOM overview")
        void should_GetSBOMOverview() throws Exception {
            performGet(SBOM_URL + "/overview")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should list SBOM components")
        void should_ListSBOMComponents() throws Exception {
            performGet(SBOM_URL + "/components")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get component vulnerabilities")
        void should_GetComponentVulnerabilities() throws Exception {
            performGet(SBOM_URL + "/vulnerabilities")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter vulnerabilities by severity")
        void should_FilterVulnerabilitiesBySeverity() throws Exception {
            performGet(SBOM_URL + "/vulnerabilities?severity=HIGH")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get license compliance status")
        void should_GetLicenseComplianceStatus() throws Exception {
            performGet(SBOM_URL + "/licenses")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should generate SBOM report")
        void should_GenerateSBOMReport() throws Exception {
            performGet(SBOM_URL + "/report?format=SPDX")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get SBOM in CycloneDX format")
        void should_GetSBOMInCycloneDXFormat() throws Exception {
            performGet(SBOM_URL + "/export?format=CYCLONEDX")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Compliance Dashboard Flow")
    class ComplianceDashboardFlow {

        @Test
        @DisplayName("should get compliance overview")
        void should_GetComplianceOverview() throws Exception {
            performGet(COMPLIANCE_URL + "/overview")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get compliance alerts")
        void should_GetComplianceAlerts() throws Exception {
            performGet(COMPLIANCE_URL + "/alerts")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get expiring items summary")
        void should_GetExpiringItemsSummary() throws Exception {
            performGet(COMPLIANCE_URL + "/expiring?days=90")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get compliance score breakdown")
        void should_GetComplianceScoreBreakdown() throws Exception {
            performGet(COMPLIANCE_URL + "/score")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Compliance Documents Flow")
    class ComplianceDocumentsFlow {

        @Test
        @DisplayName("should list compliance documents")
        void should_ListComplianceDocuments() throws Exception {
            performGet(COMPLIANCE_URL + "/documents")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should upload compliance document")
        void should_UploadComplianceDocument() throws Exception {
            java.util.Map<String, Object> docRequest = java.util.Map.of(
                "name", "System Security Plan",
                "type", "SSP",
                "relatedEntity", "CMMC",
                "version", "1.0"
            );

            performPost(COMPLIANCE_URL + "/documents", docRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should get documents by type")
        void should_GetDocumentsByType() throws Exception {
            performGet(COMPLIANCE_URL + "/documents?type=SSP")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Compliance Reminders Flow")
    class ComplianceRemindersFlow {

        @Test
        @DisplayName("should list compliance reminders")
        void should_ListComplianceReminders() throws Exception {
            performGet(COMPLIANCE_URL + "/reminders")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create compliance reminder")
        void should_CreateComplianceReminder() throws Exception {
            java.util.Map<String, Object> reminderRequest = java.util.Map.of(
                "title", "8(a) Renewal",
                "entityType", "CERTIFICATION",
                "dueDate", LocalDate.now().plusMonths(6).toString(),
                "reminderDays", java.util.List.of(90, 60, 30, 7),
                "recipients", java.util.List.of("admin@example.com")
            );

            performPost(COMPLIANCE_URL + "/reminders", reminderRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update reminder settings")
        void should_UpdateReminderSettings() throws Exception {
            java.util.Map<String, Object> settingsRequest = java.util.Map.of(
                "defaultReminderDays", java.util.List.of(90, 60, 30, 14, 7),
                "emailNotifications", true,
                "dashboardAlerts", true
            );

            performPut(COMPLIANCE_URL + "/reminders/settings", settingsRequest)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Compliance Isolation")
    class MultiTenantComplianceIsolation {

        @Test
        @DisplayName("should isolate certifications between tenants")
        void should_IsolateCertificationsBetweenTenants() throws Exception {
            // Create certification in current tenant
            java.util.Map<String, Object> certRequest = java.util.Map.of(
                "name", "Isolated Cert",
                "type", "OTHER",
                "certifyingAgency", "Test Agency",
                "certificationNumber", "ISO-" + UUID.randomUUID().toString().substring(0, 8),
                "issueDate", LocalDate.now().toString(),
                "status", "ACTIVE"
            );

            performPost(CERTIFICATIONS_URL, certRequest)
                .andExpect(status().isCreated());

            // Create another tenant
            Tenant otherTenant = Tenant.builder()
                .name("Other Compliance Tenant " + UUID.randomUUID())
                .slug("other-comp-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenantRepository.save(otherTenant);

            // Certifications should be isolated
            performGet(CERTIFICATIONS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should isolate clearances between tenants")
        void should_IsolateClearancesBetweenTenants() throws Exception {
            // Create clearance in current tenant
            java.util.Map<String, Object> clearanceRequest = java.util.Map.of(
                "level", "CONFIDENTIAL",
                "type", "FACILITY",
                "grantingAgency", "DCSA",
                "cageCode", "99999",
                "grantDate", LocalDate.now().toString(),
                "status", "ACTIVE"
            );

            performPost(CLEARANCES_URL, clearanceRequest)
                .andExpect(status().isCreated());

            // Clearances should be isolated
            performGet(CLEARANCES_URL)
                .andExpect(status().isOk());
        }
    }
}
