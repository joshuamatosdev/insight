package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.dto.ExportRequest;
import com.samgov.ingestor.dto.ExportRequest.ExportFormat;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for ExportController endpoints.
 */
@DisplayName("ExportController")
class ExportControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/export";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        testUser = userRepository.save(User.builder()
            .email("export-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("POST /export/opportunities")
    class ExportOpportunities {

        @Test
        @DisplayName("should export opportunities as CSV")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ExportAsCsv() throws Exception {
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.CSV)
                .opportunityIds(List.of())
                .build();
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should export opportunities as JSON")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ExportAsJson() throws Exception {
            ExportRequest request = ExportRequest.builder()
                .format(ExportFormat.JSON)
                .opportunityIds(List.of())
                .build();
            performPost(BASE_URL + "/opportunities", request)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /export/templates")
    class GetTemplates {

        @Test
        @DisplayName("should return export templates")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnTemplates() throws Exception {
            performGet(BASE_URL + "/templates")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("should filter templates by entity type")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_FilterByEntityType() throws Exception {
            performGet(BASE_URL + "/templates?entityType=OPPORTUNITY")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /export/scheduled")
    class GetScheduledExports {

        @Test
        @DisplayName("should return scheduled exports")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnScheduledExports() throws Exception {
            performGet(BASE_URL + "/scheduled")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("POST /export/scheduled")
    class CreateScheduledExport {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_Invalid() throws Exception {
            performPost(BASE_URL + "/scheduled", "{}")
                .andExpect(status().isBadRequest());
        }
    }
}
