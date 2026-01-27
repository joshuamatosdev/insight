---
name: "wave6-onboarding-flow"
description: "Wave 6: Onboarding Wizard - Multi-step onboarding for new tenants."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create comprehensive onboarding wizard for new tenants to set up their organization.

## Branch

`claude/wave6/onboarding-flow`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/model/OnboardingProgress.java`
- `src/main/java/com/samgov/ingestor/repository/OnboardingProgressRepository.java`
- `src/main/java/com/samgov/ingestor/service/OnboardingService.java`
- `src/main/java/com/samgov/ingestor/controller/OnboardingController.java`
- `src/main/java/com/samgov/ingestor/dto/OnboardingStepDTO.java`

### Frontend
- `sam-dashboard/src/pages/onboarding/OnboardingWizard.tsx`
- `sam-dashboard/src/pages/onboarding/OnboardingWizard.types.ts`
- `sam-dashboard/src/pages/onboarding/steps/CompanyProfileStep.tsx`
- `sam-dashboard/src/pages/onboarding/steps/CertificationsStep.tsx`
- `sam-dashboard/src/pages/onboarding/steps/NAICSStep.tsx`
- `sam-dashboard/src/pages/onboarding/steps/TeamInviteStep.tsx`
- `sam-dashboard/src/pages/onboarding/steps/IntegrationStep.tsx`
- `sam-dashboard/src/components/domain/onboarding/StepProgress.tsx`
- `sam-dashboard/src/components/domain/onboarding/OnboardingCard.tsx`
- `sam-dashboard/src/services/onboardingService.ts`
- `sam-dashboard/src/hooks/useOnboarding.ts`

### Tests
- `src/test/java/com/samgov/ingestor/service/OnboardingServiceTest.java`
- `sam-dashboard/src/pages/onboarding/OnboardingWizard.test.tsx`

## Data Model

### OnboardingProgress
```java
@Entity
public class OnboardingProgress {
    UUID id;
    UUID tenantId;
    int currentStep;
    boolean companyProfileComplete;
    boolean certificationsComplete;
    boolean naicsComplete;
    boolean teamInviteComplete;
    boolean integrationComplete;
    boolean dismissed;
    Instant startedAt;
    Instant completedAt;
}
```

## Onboarding Steps

1. **Company Profile** (Required)
   - Company name
   - DUNS/UEI number
   - CAGE code
   - Address
   - Primary contact

2. **Business Certifications** (Optional)
   - 8(a)
   - HUBZone
   - WOSB/EDWOSB
   - SDVOSB
   - Small Business

3. **NAICS Codes** (Required)
   - Primary NAICS
   - Additional NAICS codes
   - PSC codes

4. **Invite Team** (Optional)
   - Invite by email
   - Assign roles
   - Skip for now

5. **Integrations** (Optional)
   - Connect SAM.gov
   - Connect calendar
   - Connect email

## Features

- Progress indicator
- Save & resume
- Skip step option
- Completion celebration
- Redirect to dashboard

## API Endpoints

- `GET /api/v1/onboarding/progress` - Get progress
- `PUT /api/v1/onboarding/step/{step}` - Complete step
- `POST /api/v1/onboarding/dismiss` - Dismiss onboarding

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE6_ONBOARDING_FLOW_COMPLETE.md`
