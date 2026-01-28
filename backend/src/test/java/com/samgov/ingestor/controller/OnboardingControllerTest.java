package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.dto.OnboardingStepDTO;
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
 * E2E tests for OnboardingController endpoints.
 */
@DisplayName("OnboardingController")
class OnboardingControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/onboarding";

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
    @DisplayName("GET /api/v1/onboarding/progress")
    class GetProgress {

        @Test
        @DisplayName("should return onboarding progress")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnProgress() throws Exception {
            performGet(BASE_URL + "/progress")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/onboarding/steps")
    class GetSteps {

        @Test
        @DisplayName("should return onboarding steps")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnSteps() throws Exception {
            performGet(BASE_URL + "/steps")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/onboarding/step/{step}")
    class CompleteStep {

        @Test
        @DisplayName("should complete step")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_CompleteStep() throws Exception {
            performPut(BASE_URL + "/step/1", new OnboardingStepDTO.CompleteStepRequest(false))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should skip step when skipped flag is true")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_SkipStep() throws Exception {
            performPut(BASE_URL + "/step/1", new OnboardingStepDTO.CompleteStepRequest(true))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/onboarding/dismiss")
    class Dismiss {

        @Test
        @DisplayName("should dismiss onboarding")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_DismissOnboarding() throws Exception {
            performPost(BASE_URL + "/dismiss")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/onboarding/reset")
    class Reset {

        @Test
        @DisplayName("should reset onboarding")
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        void should_ResetOnboarding() throws Exception {
            performPost(BASE_URL + "/reset")
                .andExpect(status().isNoContent());
        }
    }
}
