package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Compliance functionality.
 * Tests Compliance, Security Clearance, SBOM, and Document management.
 */
class ComplianceE2ETest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    private Tenant testTenant;
    private User testUser;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Compliance E2E Tenant")
            .slug("comp-e2e-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("comp-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("Compliance")
            .lastName("User")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("Compliance Items")
    class ComplianceItems {

        @Test
        @DisplayName("should list compliance items")
        void shouldListComplianceItems() throws Exception {
            performGet("/api/v1/compliance")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create compliance item")
        void shouldCreateComplianceItem() throws Exception {
            Map<String, Object> item = Map.of(
                "name", "FAR 52.204-21 Compliance",
                "type", "FAR_CLAUSE",
                "status", "COMPLIANT",
                "description", "Basic Safeguarding of Covered Contractor Information",
                "dueDate", LocalDate.now().plusMonths(6).toString()
            );

            performPost("/api/v1/compliance", item)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("FAR 52.204-21 Compliance"));
        }

        @Test
        @DisplayName("should update compliance status")
        void shouldUpdateComplianceStatus() throws Exception {
            // Create first
            Map<String, Object> createRequest = Map.of(
                "name", "Update Status Test",
                "type", "FAR_CLAUSE",
                "status", "IN_PROGRESS"
            );

            String response = performPost("/api/v1/compliance", createRequest)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

            String itemId = objectMapper.readTree(response).get("id").asText();

            Map<String, Object> update = Map.of("status", "COMPLIANT");

            performPatch("/api/v1/compliance/" + itemId, update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLIANT"));
        }

        @Test
        @DisplayName("should get compliance summary")
        void shouldGetComplianceSummary() throws Exception {
            performGet("/api/v1/compliance/summary")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Security Clearances")
    class SecurityClearances {

        @Test
        @DisplayName("should list security clearances")
        void shouldListSecurityClearances() throws Exception {
            performGet("/api/v1/security-clearances")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should add security clearance")
        void shouldAddSecurityClearance() throws Exception {
            Map<String, Object> clearance = Map.of(
                "userId", testUserId.toString(),
                "level", "SECRET",
                "grantedDate", LocalDate.now().minusMonths(6).toString(),
                "expirationDate", LocalDate.now().plusYears(4).toString(),
                "investigationType", "TIER_3"
            );

            performPost("/api/v1/security-clearances", clearance)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.level").value("SECRET"));
        }

        @Test
        @DisplayName("should get clearance statistics")
        void shouldGetClearanceStatistics() throws Exception {
            performGet("/api/v1/security-clearances/statistics")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("SBOM (Software Bill of Materials)")
    class Sbom {

        @Test
        @DisplayName("should get SBOM")
        void shouldGetSbom() throws Exception {
            performGet("/api/v1/sbom")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get SBOM components")
        void shouldGetSbomComponents() throws Exception {
            performGet("/api/v1/sbom/components")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get SBOM vulnerabilities")
        void shouldGetSbomVulnerabilities() throws Exception {
            performGet("/api/v1/sbom/vulnerabilities")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Document Management")
    class DocumentManagement {

        @Test
        @DisplayName("should list documents")
        void shouldListDocuments() throws Exception {
            performGet("/api/v1/documents")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should list document folders")
        void shouldListDocumentFolders() throws Exception {
            performGet("/api/v1/documents/folders")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should create document folder")
        void shouldCreateDocumentFolder() throws Exception {
            Map<String, Object> folder = Map.of(
                "name", "E2E Test Folder",
                "description", "Folder for E2E tests"
            );

            performPost("/api/v1/documents/folders", folder)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Test Folder"));
        }
    }

    @Nested
    @DisplayName("Content Library")
    class ContentLibrary {

        @Test
        @DisplayName("should list content library items")
        void shouldListContentLibraryItems() throws Exception {
            performGet("/api/v1/content-library")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create content library item")
        void shouldCreateContentLibraryItem() throws Exception {
            Map<String, Object> item = Map.of(
                "name", "Standard Capability Statement",
                "type", "CAPABILITY_STATEMENT",
                "content", "Our company provides excellent services..."
            );

            performPost("/api/v1/content-library", item)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Standard Capability Statement"));
        }

        @Test
        @DisplayName("should search content library")
        void shouldSearchContentLibrary() throws Exception {
            performGet("/api/v1/content-library?search=capability")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("Competitors")
    class Competitors {

        @Test
        @DisplayName("should list competitors")
        void shouldListCompetitors() throws Exception {
            performGet("/api/v1/competitors")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should add competitor")
        void shouldAddCompetitor() throws Exception {
            Map<String, Object> competitor = Map.of(
                "name", "E2E Competitor Inc",
                "website", "https://competitor.example.com",
                "naicsCodes", java.util.List.of("541512", "541511"),
                "notes", "Major competitor in IT services"
            );

            performPost("/api/v1/competitors", competitor)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("E2E Competitor Inc"));
        }
    }

    @Nested
    @DisplayName("Deliverables")
    class Deliverables {

        @Test
        @DisplayName("should list deliverables")
        void shouldListDeliverables() throws Exception {
            performGet("/api/v1/deliverables")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should create deliverable")
        void shouldCreateDeliverable() throws Exception {
            Map<String, Object> deliverable = Map.of(
                "name", "Monthly Status Report",
                "description", "Monthly progress report",
                "dueDate", LocalDate.now().plusMonths(1).toString(),
                "status", "NOT_STARTED"
            );

            performPost("/api/v1/deliverables", deliverable)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Monthly Status Report"));
        }
    }
}
