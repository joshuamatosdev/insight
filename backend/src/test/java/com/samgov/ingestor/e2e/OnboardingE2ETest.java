package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.dto.RegisterRequest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for Onboarding flows.
 * Tests complete user onboarding journey from registration to setup completion.
 */
@DisplayName("Onboarding E2E Tests")
class OnboardingE2ETest extends BaseControllerTest {

    private static final String AUTH_URL = "/auth";
    private static final String ONBOARDING_URL = "/onboarding";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;
    private String accessToken;

    @Override
    @BeforeEach
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E Onboarding Tenant " + UUID.randomUUID())
            .slug("e2e-onboard-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-onboard-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("Onboarding")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    private String getAccessToken() throws Exception {
        if (accessToken != null) {
            return accessToken;
        }

        var loginRequest = java.util.Map.of(
            "email", testUser.getEmail(),
            "password", "TestPass123!"
        );

        MvcResult result = performPost(AUTH_URL + "/login", loginRequest)
            .andExpect(status().isOk())
            .andReturn();

        accessToken = objectMapper.readTree(result.getResponse().getContentAsString())
            .get("accessToken").asText();
        return accessToken;
    }

    @Nested
    @DisplayName("Complete Onboarding Flow")
    class CompleteOnboardingFlow {

        @Test
        @DisplayName("should complete full onboarding journey")
        void should_CompleteFullOnboardingJourney() throws Exception {
            // Step 1: Register new user with organization
            String email = "new-onboard-" + UUID.randomUUID() + "@example.com";
            RegisterRequest registerRequest = RegisterRequest.builder()
                .email(email)
                .password("SecurePass123!")
                .firstName("New")
                .lastName("User")
                .organizationName("New Test Organization")
                .build();

            MvcResult regResult = performPost(AUTH_URL + "/register", registerRequest)
                .andExpect(status().isCreated())
                .andReturn();

            String newToken = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .get("accessToken").asText();

            // Step 2: Get onboarding progress
            mockMvc.perform(get(ONBOARDING_URL + "/progress")
                    .header("Authorization", "Bearer " + newToken)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Step 3: Complete company profile step
            java.util.Map<String, Object> companyProfile = java.util.Map.of(
                "step", "COMPANY_PROFILE",
                "data", java.util.Map.of(
                    "companyName", "New Test Organization",
                    "industry", "Information Technology",
                    "size", "50-100",
                    "website", "https://example.com"
                )
            );

            mockMvc.perform(post(ONBOARDING_URL + "/steps/complete")
                    .header("Authorization", "Bearer " + newToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(companyProfile)))
                .andExpect(status().isOk());

            // Step 4: Complete preferences step
            java.util.Map<String, Object> preferences = java.util.Map.of(
                "step", "PREFERENCES",
                "data", java.util.Map.of(
                    "notifications", true,
                    "emailFrequency", "DAILY",
                    "theme", "light"
                )
            );

            mockMvc.perform(post(ONBOARDING_URL + "/steps/complete")
                    .header("Authorization", "Bearer " + newToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(preferences)))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Onboarding Progress Flow")
    class OnboardingProgressFlow {

        @Test
        @DisplayName("should retrieve onboarding progress")
        void should_RetrieveOnboardingProgress() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(ONBOARDING_URL + "/progress")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should list onboarding steps")
        void should_ListOnboardingSteps() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(ONBOARDING_URL + "/steps")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should get current step")
        void should_GetCurrentStep() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(ONBOARDING_URL + "/current-step")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Step Completion Flow")
    class StepCompletionFlow {

        @Test
        @DisplayName("should complete welcome step")
        void should_CompleteWelcomeStep() throws Exception {
            String token = getAccessToken();

            java.util.Map<String, Object> stepData = java.util.Map.of(
                "step", "WELCOME",
                "data", java.util.Map.of()
            );

            mockMvc.perform(post(ONBOARDING_URL + "/steps/complete")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(stepData)))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should complete company profile step")
        void should_CompleteCompanyProfileStep() throws Exception {
            String token = getAccessToken();

            java.util.Map<String, Object> stepData = java.util.Map.of(
                "step", "COMPANY_PROFILE",
                "data", java.util.Map.of(
                    "companyName", "Test Company",
                    "uei", "ABC123456789",
                    "cageCode", "12345",
                    "industry", "Technology"
                )
            );

            mockMvc.perform(post(ONBOARDING_URL + "/steps/complete")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(stepData)))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should complete capabilities step")
        void should_CompleteCapabilitiesStep() throws Exception {
            String token = getAccessToken();

            java.util.Map<String, Object> stepData = java.util.Map.of(
                "step", "CAPABILITIES",
                "data", java.util.Map.of(
                    "naicsCodes", java.util.List.of("541511", "541512", "541519"),
                    "pscCodes", java.util.List.of("D301", "D302"),
                    "keywords", java.util.List.of("IT", "cybersecurity", "cloud")
                )
            );

            mockMvc.perform(post(ONBOARDING_URL + "/steps/complete")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(stepData)))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should complete team setup step")
        void should_CompleteTeamSetupStep() throws Exception {
            String token = getAccessToken();

            java.util.Map<String, Object> stepData = java.util.Map.of(
                "step", "TEAM_SETUP",
                "data", java.util.Map.of(
                    "inviteTeamMembers", java.util.List.of(
                        java.util.Map.of("email", "team1@example.com", "role", "MEMBER"),
                        java.util.Map.of("email", "team2@example.com", "role", "VIEWER")
                    )
                )
            );

            mockMvc.perform(post(ONBOARDING_URL + "/steps/complete")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(stepData)))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Skip and Resume Flow")
    class SkipAndResumeFlow {

        @Test
        @DisplayName("should skip optional step")
        void should_SkipOptionalStep() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(post(ONBOARDING_URL + "/steps/TEAM_SETUP/skip")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should resume onboarding from last step")
        void should_ResumeOnboardingFromLastStep() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(ONBOARDING_URL + "/resume")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should reset onboarding progress")
        void should_ResetOnboardingProgress() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(post(ONBOARDING_URL + "/reset")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Onboarding Completion Flow")
    class OnboardingCompletionFlow {

        @Test
        @DisplayName("should mark onboarding as complete")
        void should_MarkOnboardingAsComplete() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(post(ONBOARDING_URL + "/complete")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should check if onboarding is complete")
        void should_CheckIfOnboardingIsComplete() throws Exception {
            String token = getAccessToken();

            mockMvc.perform(get(ONBOARDING_URL + "/is-complete")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Email Verification During Onboarding")
    class EmailVerificationDuringOnboarding {

        @Test
        @DisplayName("should resend verification email")
        void should_ResendVerificationEmail() throws Exception {
            mockMvc.perform(post("/email-verification/resend")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + testUser.getEmail() + "\"}"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should handle invalid verification token")
        void should_HandleInvalidVerificationToken() throws Exception {
            mockMvc.perform(get("/email-verification/verify")
                    .param("token", "invalid-token")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Onboarding Data Validation")
    class OnboardingDataValidation {

        @Test
        @DisplayName("should validate company profile data")
        void should_ValidateCompanyProfileData() throws Exception {
            String token = getAccessToken();

            // Missing required fields
            java.util.Map<String, Object> invalidData = java.util.Map.of(
                "step", "COMPANY_PROFILE",
                "data", java.util.Map.of()  // Empty data
            );

            mockMvc.perform(post(ONBOARDING_URL + "/steps/complete")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(invalidData)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should validate NAICS codes format")
        void should_ValidateNAICSCodesFormat() throws Exception {
            String token = getAccessToken();

            java.util.Map<String, Object> invalidData = java.util.Map.of(
                "step", "CAPABILITIES",
                "data", java.util.Map.of(
                    "naicsCodes", java.util.List.of("invalid")  // Invalid NAICS format
                )
            );

            mockMvc.perform(post(ONBOARDING_URL + "/steps/complete")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(invalidData)))
                .andExpect(status().isBadRequest());
        }
    }
}
