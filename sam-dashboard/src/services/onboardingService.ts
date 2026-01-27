/**
 * Onboarding service for wizard API calls.
 */

const API_BASE = '/api/v1/onboarding';

export interface OnboardingProgress {
  id: string;
  tenantId: string;
  currentStep: number;
  companyProfileComplete: boolean;
  certificationsComplete: boolean;
  naicsComplete: boolean;
  teamInviteComplete: boolean;
  integrationComplete: boolean;
  dismissed: boolean;
  completionPercentage: number;
  complete: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export interface StepInfo {
  stepNumber: number;
  title: string;
  description: string;
  required: boolean;
  complete: boolean;
  current: boolean;
}

export interface CompleteStepRequest {
  skipped?: boolean;
  data?: string;
}

/**
 * Get current onboarding progress.
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  const response = await fetch(API_BASE + '/progress', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
  });

  if (response.ok === false) {
    throw new Error('Failed to fetch onboarding progress');
  }

  return response.json();
}

/**
 * Get step metadata for the wizard.
 */
export async function getOnboardingSteps(): Promise<StepInfo[]> {
  const response = await fetch(API_BASE + '/steps', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
  });

  if (response.ok === false) {
    throw new Error('Failed to fetch onboarding steps');
  }

  return response.json();
}

/**
 * Complete a specific step.
 */
export async function completeStep(
  step: number,
  request?: CompleteStepRequest
): Promise<OnboardingProgress> {
  const response = await fetch(`${API_BASE}/step/${step}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
    body: JSON.stringify(request ?? {}),
  });

  if (response.ok === false) {
    throw new Error('Failed to complete step');
  }

  return response.json();
}

/**
 * Dismiss the onboarding wizard.
 */
export async function dismissOnboarding(): Promise<OnboardingProgress> {
  const response = await fetch(API_BASE + '/dismiss', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
  });

  if (response.ok === false) {
    throw new Error('Failed to dismiss onboarding');
  }

  return response.json();
}

/**
 * Reset onboarding progress.
 */
export async function resetOnboarding(): Promise<void> {
  const response = await fetch(API_BASE + '/reset', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
  });

  if (response.ok === false) {
    throw new Error('Failed to reset onboarding');
  }
}
