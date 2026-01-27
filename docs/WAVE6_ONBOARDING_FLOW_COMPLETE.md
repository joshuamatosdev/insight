# Wave 6: Onboarding Flow Complete

## Overview

Multi-step onboarding wizard for new tenant setup.

## Files Created

### Backend
- [x] `src/main/java/com/samgov/ingestor/model/OnboardingProgress.java`
- [x] `src/main/java/com/samgov/ingestor/repository/OnboardingProgressRepository.java`
- [x] `src/main/java/com/samgov/ingestor/dto/OnboardingStepDTO.java`
- [x] `src/main/java/com/samgov/ingestor/service/OnboardingService.java`
- [x] `src/main/java/com/samgov/ingestor/controller/OnboardingController.java`

### Frontend
- [x] `sam-dashboard/src/services/onboardingService.ts`
- [x] `sam-dashboard/src/hooks/useOnboarding.ts`
- [x] `sam-dashboard/src/components/domain/onboarding/StepProgress.tsx`
- [x] `sam-dashboard/src/components/domain/onboarding/OnboardingCard.tsx`
- [x] `sam-dashboard/src/pages/onboarding/OnboardingWizard.tsx`
- [x] `sam-dashboard/src/pages/onboarding/steps/CompanyProfileStep.tsx`
- [x] `sam-dashboard/src/pages/onboarding/steps/CertificationsStep.tsx`
- [x] `sam-dashboard/src/pages/onboarding/steps/NAICSStep.tsx`
- [x] `sam-dashboard/src/pages/onboarding/steps/TeamInviteStep.tsx`
- [x] `sam-dashboard/src/pages/onboarding/steps/IntegrationStep.tsx`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/onboarding/progress` | Get current progress |
| GET | `/api/v1/onboarding/steps` | Get step metadata |
| PUT | `/api/v1/onboarding/step/{step}` | Complete a step |
| POST | `/api/v1/onboarding/dismiss` | Dismiss wizard |
| POST | `/api/v1/onboarding/reset` | Reset progress |

## Onboarding Steps

| Step | Title | Required | Description |
|------|-------|----------|-------------|
| 1 | Company Profile | Yes | Company name, UEI, CAGE, address |
| 2 | Certifications | No | 8(a), HUBZone, WOSB, SDVOSB, etc. |
| 3 | NAICS Codes | Yes | Primary and secondary NAICS |
| 4 | Invite Team | No | Email invitations with roles |
| 5 | Integrations | No | SAM.gov, calendar, email, Slack |

## Database Changes

```sql
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  current_step INT DEFAULT 1,
  company_profile_complete BOOLEAN DEFAULT FALSE,
  certifications_complete BOOLEAN DEFAULT FALSE,
  naics_complete BOOLEAN DEFAULT FALSE,
  team_invite_complete BOOLEAN DEFAULT FALSE,
  integration_complete BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Routes to Add

```tsx
<Route path="/onboarding" element={<OnboardingWizard />} />
```

## Features

- Progress indicator with step completion
- Save & resume capability
- Skip optional steps
- Completion celebration
- Redirect to dashboard on complete
