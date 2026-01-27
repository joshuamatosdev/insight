/**
 * Tests for useOnboarding hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useOnboarding } from './useOnboarding';

// Mock the onboarding service
vi.mock('../services/onboardingService', () => ({
  getOnboardingProgress: vi.fn(),
  getOnboardingSteps: vi.fn(),
  completeStep: vi.fn(),
  dismissOnboarding: vi.fn(),
}));

import {
  getOnboardingProgress,
  getOnboardingSteps,
  completeStep,
  dismissOnboarding,
} from '../services/onboardingService';
import type { OnboardingProgress, StepInfo } from '../services/onboardingService';

const mockProgress: OnboardingProgress = {
  id: 'p1',
  tenantId: 't1',
  currentStep: 2,
  companyProfileComplete: true,
  certificationsComplete: false,
  naicsComplete: false,
  teamInviteComplete: false,
  integrationComplete: false,
  dismissed: false,
  completionPercentage: 20,
  complete: false,
  startedAt: '2024-01-01T00:00:00Z',
  completedAt: null,
};

const mockSteps: StepInfo[] = [
  {
    stepNumber: 1,
    title: 'Company Profile',
    description: 'Set up your company details',
    required: true,
    complete: true,
    current: false,
  },
  {
    stepNumber: 2,
    title: 'Certifications',
    description: 'Add your certifications',
    required: false,
    complete: false,
    current: true,
  },
  {
    stepNumber: 3,
    title: 'NAICS Codes',
    description: 'Select NAICS codes',
    required: true,
    complete: false,
    current: false,
  },
  {
    stepNumber: 4,
    title: 'Team Invite',
    description: 'Invite team members',
    required: false,
    complete: false,
    current: false,
  },
  {
    stepNumber: 5,
    title: 'Integrations',
    description: 'Connect integrations',
    required: false,
    complete: false,
    current: false,
  },
];

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getOnboardingProgress as ReturnType<typeof vi.fn>).mockResolvedValue(mockProgress);
    (getOnboardingSteps as ReturnType<typeof vi.fn>).mockResolvedValue(mockSteps);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches progress and steps on mount', async () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getOnboardingProgress).toHaveBeenCalledTimes(1);
    expect(getOnboardingSteps).toHaveBeenCalledTimes(1);
    expect(result.current.progress).toEqual(mockProgress);
    expect(result.current.steps).toEqual(mockSteps);
  });

  it('sets current step index from progress', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // currentStep is 2, so index should be 1 (0-based)
    expect(result.current.currentStepIndex).toBe(1);
  });

  it('handles error when fetching fails', async () => {
    (getOnboardingProgress as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.progress).toBeNull();
  });

  it('completes a step and updates progress', async () => {
    const updatedProgress: OnboardingProgress = {
      ...mockProgress,
      currentStep: 3,
      certificationsComplete: true,
      completionPercentage: 40,
    };

    (completeStep as ReturnType<typeof vi.fn>).mockResolvedValue(updatedProgress);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.completeStep(2);
    });

    expect(completeStep).toHaveBeenCalledWith(2, { skipped: false });
    expect(result.current.progress).toEqual(updatedProgress);
    expect(result.current.currentStepIndex).toBe(2);
  });

  it('completes a step with skipped flag', async () => {
    const updatedProgress: OnboardingProgress = {
      ...mockProgress,
      currentStep: 3,
      certificationsComplete: true,
    };

    (completeStep as ReturnType<typeof vi.fn>).mockResolvedValue(updatedProgress);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.completeStep(2, true);
    });

    expect(completeStep).toHaveBeenCalledWith(2, { skipped: true });
  });

  it('handles error when completing step fails', async () => {
    (completeStep as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Failed to complete')
    );

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.completeStep(2);
      })
    ).rejects.toThrow('Failed to complete');

    expect(result.current.error).toBe('Failed to complete');
  });

  it('goes to previous step', async () => {
    const progressAtStep3: OnboardingProgress = {
      ...mockProgress,
      currentStep: 3,
    };
    (getOnboardingProgress as ReturnType<typeof vi.fn>).mockResolvedValue(progressAtStep3);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentStepIndex).toBe(2);

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStepIndex).toBe(1);
  });

  it('does not go before first step', async () => {
    const progressAtStep1: OnboardingProgress = {
      ...mockProgress,
      currentStep: 1,
    };
    (getOnboardingProgress as ReturnType<typeof vi.fn>).mockResolvedValue(progressAtStep1);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentStepIndex).toBe(0);

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStepIndex).toBe(0);
  });

  it('dismisses onboarding', async () => {
    const dismissedProgress: OnboardingProgress = {
      ...mockProgress,
      dismissed: true,
    };

    (dismissOnboarding as ReturnType<typeof vi.fn>).mockResolvedValue(dismissedProgress);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.dismiss();
    });

    expect(dismissOnboarding).toHaveBeenCalledTimes(1);
    expect(result.current.progress?.dismissed).toBe(true);
  });

  it('handles error when dismissing fails', async () => {
    (dismissOnboarding as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Dismiss failed')
    );

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.dismiss();
      })
    ).rejects.toThrow('Dismiss failed');

    expect(result.current.error).toBe('Dismiss failed');
  });

  it('refreshes data', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getOnboardingProgress).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refresh();
    });

    expect(getOnboardingProgress).toHaveBeenCalledTimes(2);
    expect(getOnboardingSteps).toHaveBeenCalledTimes(2);
  });

  it('does not advance past last step', async () => {
    const progressAtStep5: OnboardingProgress = {
      ...mockProgress,
      currentStep: 5,
    };
    (getOnboardingProgress as ReturnType<typeof vi.fn>).mockResolvedValue(progressAtStep5);

    const updatedProgress: OnboardingProgress = {
      ...progressAtStep5,
      complete: true,
    };
    (completeStep as ReturnType<typeof vi.fn>).mockResolvedValue(updatedProgress);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentStepIndex).toBe(4);

    await act(async () => {
      await result.current.completeStep(5);
    });

    // Should stay at step 5 (index 4)
    expect(result.current.currentStepIndex).toBe(4);
  });
});
