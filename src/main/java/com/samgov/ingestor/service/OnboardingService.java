package com.samgov.ingestor.service;

import com.samgov.ingestor.dto.OnboardingStepDTO;
import com.samgov.ingestor.model.OnboardingProgress;
import com.samgov.ingestor.repository.OnboardingProgressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing tenant onboarding process.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final OnboardingProgressRepository progressRepository;

    /**
     * Get or create onboarding progress for a tenant.
     */
    @Transactional
    public OnboardingStepDTO getProgress(UUID tenantId) {
        OnboardingProgress progress = progressRepository.findByTenantId(tenantId)
            .orElseGet(() -> createNewProgress(tenantId));
        
        return mapToDTO(progress);
    }

    /**
     * Complete a specific onboarding step.
     */
    @Transactional
    public OnboardingStepDTO completeStep(UUID tenantId, int stepNumber, boolean skipped) {
        OnboardingProgress progress = progressRepository.findByTenantId(tenantId)
            .orElseGet(() -> createNewProgress(tenantId));

        switch (stepNumber) {
            case 1 -> {
                progress.setCompanyProfileComplete(true);
                progress.setCurrentStep(Math.max(progress.getCurrentStep(), 2));
            }
            case 2 -> {
                progress.setCertificationsComplete(true);
                progress.setCurrentStep(Math.max(progress.getCurrentStep(), 3));
            }
            case 3 -> {
                progress.setNaicsComplete(true);
                progress.setCurrentStep(Math.max(progress.getCurrentStep(), 4));
            }
            case 4 -> {
                progress.setTeamInviteComplete(true);
                progress.setCurrentStep(Math.max(progress.getCurrentStep(), 5));
            }
            case 5 -> {
                progress.setIntegrationComplete(true);
                if (progress.isFullyComplete()) {
                    progress.setCompletedAt(Instant.now());
                }
            }
            default -> throw new IllegalArgumentException("Invalid step number: " + stepNumber);
        }

        // Check if required steps complete
        if (progress.isComplete() && progress.getCompletedAt() == null) {
            progress.setCompletedAt(Instant.now());
        }

        progressRepository.save(progress);
        log.info("Completed onboarding step {} for tenant {}", stepNumber, tenantId);
        
        return mapToDTO(progress);
    }

    /**
     * Dismiss onboarding wizard for a tenant.
     */
    @Transactional
    public OnboardingStepDTO dismiss(UUID tenantId) {
        OnboardingProgress progress = progressRepository.findByTenantId(tenantId)
            .orElseGet(() -> createNewProgress(tenantId));

        progress.setDismissed(true);
        progressRepository.save(progress);
        
        log.info("Onboarding dismissed for tenant {}", tenantId);
        return mapToDTO(progress);
    }

    /**
     * Reset onboarding progress for a tenant.
     */
    @Transactional
    public void reset(UUID tenantId) {
        progressRepository.deleteByTenantId(tenantId);
        log.info("Onboarding reset for tenant {}", tenantId);
    }

    /**
     * Get step metadata for the wizard UI.
     */
    public List<OnboardingStepDTO.StepInfo> getStepInfo(UUID tenantId) {
        OnboardingProgress progress = progressRepository.findByTenantId(tenantId)
            .orElse(null);

        List<OnboardingStepDTO.StepInfo> steps = new ArrayList<>();
        int currentStep = progress != null ? progress.getCurrentStep() : 1;

        steps.add(OnboardingStepDTO.StepInfo.builder()
            .stepNumber(1)
            .title("Company Profile")
            .description("Set up your company information")
            .required(true)
            .complete(progress != null && progress.isCompanyProfileComplete())
            .current(currentStep == 1)
            .build());

        steps.add(OnboardingStepDTO.StepInfo.builder()
            .stepNumber(2)
            .title("Certifications")
            .description("Add your business certifications")
            .required(false)
            .complete(progress != null && progress.isCertificationsComplete())
            .current(currentStep == 2)
            .build());

        steps.add(OnboardingStepDTO.StepInfo.builder()
            .stepNumber(3)
            .title("NAICS Codes")
            .description("Select your industry codes")
            .required(true)
            .complete(progress != null && progress.isNaicsComplete())
            .current(currentStep == 3)
            .build());

        steps.add(OnboardingStepDTO.StepInfo.builder()
            .stepNumber(4)
            .title("Invite Team")
            .description("Add team members to your organization")
            .required(false)
            .complete(progress != null && progress.isTeamInviteComplete())
            .current(currentStep == 4)
            .build());

        steps.add(OnboardingStepDTO.StepInfo.builder()
            .stepNumber(5)
            .title("Integrations")
            .description("Connect external services")
            .required(false)
            .complete(progress != null && progress.isIntegrationComplete())
            .current(currentStep == 5)
            .build());

        return steps;
    }

    private OnboardingProgress createNewProgress(UUID tenantId) {
        OnboardingProgress progress = OnboardingProgress.builder()
            .tenantId(tenantId)
            .currentStep(1)
            .build();
        return progressRepository.save(progress);
    }

    private OnboardingStepDTO mapToDTO(OnboardingProgress progress) {
        return OnboardingStepDTO.builder()
            .id(progress.getId())
            .tenantId(progress.getTenantId())
            .currentStep(progress.getCurrentStep())
            .companyProfileComplete(progress.isCompanyProfileComplete())
            .certificationsComplete(progress.isCertificationsComplete())
            .naicsComplete(progress.isNaicsComplete())
            .teamInviteComplete(progress.isTeamInviteComplete())
            .integrationComplete(progress.isIntegrationComplete())
            .dismissed(progress.isDismissed())
            .completionPercentage(progress.getCompletionPercentage())
            .complete(progress.isComplete())
            .startedAt(progress.getStartedAt())
            .completedAt(progress.getCompletedAt())
            .build();
    }
}
