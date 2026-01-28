package com.samgov.ingestor.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for onboarding progress and step data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Onboarding progress information")
public class OnboardingStepDTO {

    @Schema(description = "Progress ID")
    private UUID id;

    @Schema(description = "Tenant ID")
    private UUID tenantId;

    @Schema(description = "Current step number (1-5)")
    private int currentStep;

    @Schema(description = "Step 1: Company profile complete")
    private boolean companyProfileComplete;

    @Schema(description = "Step 2: Certifications complete")
    private boolean certificationsComplete;

    @Schema(description = "Step 3: NAICS codes complete")
    private boolean naicsComplete;

    @Schema(description = "Step 4: Team invitations complete")
    private boolean teamInviteComplete;

    @Schema(description = "Step 5: Integrations complete")
    private boolean integrationComplete;

    @Schema(description = "User dismissed onboarding")
    private boolean dismissed;

    @Schema(description = "Completion percentage (0-100)")
    private int completionPercentage;

    @Schema(description = "All required steps complete")
    private boolean complete;

    @Schema(description = "When onboarding started")
    private Instant startedAt;

    @Schema(description = "When onboarding completed")
    private Instant completedAt;

    /**
     * Request to complete a step with optional data.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompleteStepRequest {
        @Schema(description = "Whether to skip this step")
        private boolean skipped;

        @Schema(description = "Step-specific data (JSON)")
        private String data;
    }

    /**
     * Step metadata for the wizard UI.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StepInfo {
        private int stepNumber;
        private String title;
        private String description;
        private boolean required;
        private boolean complete;
        private boolean current;
    }
}
