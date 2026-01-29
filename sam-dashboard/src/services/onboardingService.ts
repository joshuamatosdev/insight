/**
 * Face Two (Portal) - Client onboarding service.
 * Handles client onboarding wizard API calls for Portal system.
 */

import {get, post, put} from './apiClient';
const ONBOARDING_PATH = '/portal/onboarding';

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
    const result = await get<OnboardingProgress>(`${ONBOARDING_PATH}/progress`);

    if (result.success === false) {
        throw new Error(result.error ?? 'Failed to fetch onboarding progress');
    }

    return result.data;
}

/**
 * Get step metadata for the wizard.
 */
export async function getOnboardingSteps(): Promise<StepInfo[]> {
    const result = await get<StepInfo[]>(`${ONBOARDING_PATH}/steps`);

    if (result.success === false) {
        throw new Error(result.error ?? 'Failed to fetch onboarding steps');
    }

    return result.data;
}

/**
 * Complete a specific step.
 */
export async function completeStep(
    step: number,
    request?: CompleteStepRequest
): Promise<OnboardingProgress> {
    const result = await put<OnboardingProgress>(`${ONBOARDING_PATH}/step/${step}`, request ?? {});

    if (result.success === false) {
        throw new Error(result.error ?? 'Failed to complete step');
    }

    return result.data;
}

/**
 * Dismiss the onboarding wizard.
 */
export async function dismissOnboarding(): Promise<OnboardingProgress> {
    const result = await post<OnboardingProgress>(`${ONBOARDING_PATH}/dismiss`, {});

    if (result.success === false) {
        throw new Error(result.error ?? 'Failed to dismiss onboarding');
    }

    return result.data;
}

/**
 * Reset onboarding progress.
 */
export async function resetOnboarding(): Promise<void> {
    const result = await post<void>(`${ONBOARDING_PATH}/reset`, {});

    if (result.success === false) {
        throw new Error(result.error ?? 'Failed to reset onboarding');
    }
}
