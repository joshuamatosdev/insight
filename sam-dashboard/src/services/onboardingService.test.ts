/**
 * Tests for Onboarding Service
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {OnboardingProgress, StepInfo} from './onboardingService';
import {
    completeStep,
    dismissOnboarding,
    getOnboardingProgress,
    getOnboardingSteps,
    resetOnboarding,
} from './onboardingService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Onboarding Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockLocalStorage['token'] = 'test-token';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getOnboardingProgress', () => {
    it('fetches onboarding progress successfully', async () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProgress),
      });

      const result = await getOnboardingProgress();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/progress',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockProgress);
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getOnboardingProgress()).rejects.toThrow(
        'Failed to fetch onboarding progress'
      );
    });
  });

  describe('getOnboardingSteps', () => {
    it('fetches step metadata successfully', async () => {
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
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSteps),
      });

      const result = await getOnboardingSteps();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/steps',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockSteps);
      expect(result.length).toBe(2);
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getOnboardingSteps()).rejects.toThrow(
        'Failed to fetch onboarding steps'
      );
    });
  });

  describe('completeStep', () => {
    it('completes a step successfully', async () => {
      const mockProgress: OnboardingProgress = {
        id: 'p1',
        tenantId: 't1',
        currentStep: 3,
        companyProfileComplete: true,
        certificationsComplete: true,
        naicsComplete: false,
        teamInviteComplete: false,
        integrationComplete: false,
        dismissed: false,
        completionPercentage: 40,
        complete: false,
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProgress),
      });

      const result = await completeStep(2);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/step/2',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({}),
        })
      );
      expect(result.currentStep).toBe(3);
    });

    it('completes a step with skipped flag', async () => {
      const mockProgress: OnboardingProgress = {
        id: 'p1',
        tenantId: 't1',
        currentStep: 3,
        companyProfileComplete: true,
        certificationsComplete: true,
        naicsComplete: false,
        teamInviteComplete: false,
        integrationComplete: false,
        dismissed: false,
        completionPercentage: 40,
        complete: false,
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProgress),
      });

      await completeStep(2, { skipped: true });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/step/2',
        expect.objectContaining({
          body: JSON.stringify({ skipped: true }),
        })
      );
    });

    it('throws error when completion fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(completeStep(2)).rejects.toThrow('Failed to complete step');
    });
  });

  describe('dismissOnboarding', () => {
    it('dismisses onboarding successfully', async () => {
      const mockProgress: OnboardingProgress = {
        id: 'p1',
        tenantId: 't1',
        currentStep: 2,
        companyProfileComplete: true,
        certificationsComplete: false,
        naicsComplete: false,
        teamInviteComplete: false,
        integrationComplete: false,
        dismissed: true,
        completionPercentage: 20,
        complete: false,
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProgress),
      });

      const result = await dismissOnboarding();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/dismiss',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result.dismissed).toBe(true);
    });

    it('throws error when dismiss fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(dismissOnboarding()).rejects.toThrow(
        'Failed to dismiss onboarding'
      );
    });
  });

  describe('resetOnboarding', () => {
    it('resets onboarding successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await resetOnboarding();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/reset',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('throws error when reset fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(resetOnboarding()).rejects.toThrow(
        'Failed to reset onboarding'
      );
    });
  });
});
