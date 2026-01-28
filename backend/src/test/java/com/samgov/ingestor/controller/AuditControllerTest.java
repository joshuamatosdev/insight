package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for AuditController endpoints.
 */
@DisplayName("AuditController")
class AuditControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/audit";

    @Autowired
    private TenantRepository tenantRepository;

    private Tenant testTenant;

    @Override
    @BeforeEach
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Test Tenant " + UUID.randomUUID())
            .slug("test-tenant-" + UUID.randomUUID())
            .build());
        testTenantId = testTenant.getId();
    }

    @Nested
    @DisplayName("GET /audit")
    class GetAuditLogs {

        @Test
        @DisplayName("should return paginated audit logs")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnPaginatedLogs() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /audit/{id}")
    class GetAuditLogById {

        @Test
        @DisplayName("should return 404 when log not found")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /audit/entity/{entityType}/{entityId}")
    class GetAuditLogsByEntity {

        @Test
        @DisplayName("should return audit logs for entity")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ReturnLogsForEntity() throws Exception {
            performGet(BASE_URL + "/entity/USER/" + UUID.randomUUID())
                .andExpect(status().isOk());
        }
    }
}
