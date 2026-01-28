package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.OnboardingStepDTO;
import com.samgov.ingestor.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for onboarding wizard operations.
 */
@RestController
@RequestMapping("/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding", description = "Tenant onboarding wizard")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @GetMapping("/progress")
    @Operation(summary = "Get onboarding progress", description = "Get current onboarding progress for the tenant")
    public ResponseEntity<OnboardingStepDTO> getProgress() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        OnboardingStepDTO progress = onboardingService.getProgress(tenantId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/steps")
    @Operation(summary = "Get step info", description = "Get metadata for all onboarding steps")
    public ResponseEntity<List<OnboardingStepDTO.StepInfo>> getSteps() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        List<OnboardingStepDTO.StepInfo> steps = onboardingService.getStepInfo(tenantId);
        return ResponseEntity.ok(steps);
    }

    @PutMapping("/step/{step}")
    @Operation(summary = "Complete step", description = "Mark an onboarding step as complete")
    public ResponseEntity<OnboardingStepDTO> completeStep(
            @PathVariable int step,
            @RequestBody(required = false) OnboardingStepDTO.CompleteStepRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean skipped = request != null && request.isSkipped();
        OnboardingStepDTO progress = onboardingService.completeStep(tenantId, step, skipped);
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/dismiss")
    @Operation(summary = "Dismiss onboarding", description = "Dismiss the onboarding wizard")
    public ResponseEntity<OnboardingStepDTO> dismiss() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        OnboardingStepDTO progress = onboardingService.dismiss(tenantId);
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset onboarding", description = "Reset onboarding progress (admin only)")
    public ResponseEntity<Void> reset() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        onboardingService.reset(tenantId);
        return ResponseEntity.noContent().build();
    }
}
