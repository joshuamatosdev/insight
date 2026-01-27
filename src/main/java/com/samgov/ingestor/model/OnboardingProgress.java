package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity tracking tenant onboarding progress through the setup wizard.
 */
@Entity
@Table(name = "onboarding_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "current_step")
    @Builder.Default
    private int currentStep = 1;

    @Column(name = "company_profile_complete")
    @Builder.Default
    private boolean companyProfileComplete = false;

    @Column(name = "certifications_complete")
    @Builder.Default
    private boolean certificationsComplete = false;

    @Column(name = "naics_complete")
    @Builder.Default
    private boolean naicsComplete = false;

    @Column(name = "team_invite_complete")
    @Builder.Default
    private boolean teamInviteComplete = false;

    @Column(name = "integration_complete")
    @Builder.Default
    private boolean integrationComplete = false;

    @Column(name = "dismissed")
    @Builder.Default
    private boolean dismissed = false;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (startedAt == null) {
            startedAt = Instant.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Calculate completion percentage based on completed steps.
     */
    public int getCompletionPercentage() {
        int completed = 0;
        if (companyProfileComplete) completed++;
        if (certificationsComplete) completed++;
        if (naicsComplete) completed++;
        if (teamInviteComplete) completed++;
        if (integrationComplete) completed++;
        return (completed * 100) / 5;
    }

    /**
     * Check if all required steps are complete.
     */
    public boolean isComplete() {
        // Company profile and NAICS are required, others are optional
        return companyProfileComplete && naicsComplete;
    }

    /**
     * Check if all steps are complete.
     */
    public boolean isFullyComplete() {
        return companyProfileComplete && certificationsComplete && 
               naicsComplete && teamInviteComplete && integrationComplete;
    }
}
