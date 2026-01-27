import { useState, useEffect, useCallback } from 'react';
import {
  OnboardingProgress,
  StepInfo,
  getOnboardingProgress,
  getOnboardingSteps,
  completeStep as apiCompleteStep,
  dismissOnboarding as apiDismiss,
} from '../services/onboardingService';

interface UseOnboardingResult {
  progress: OnboardingProgress | null;
  steps: StepInfo[];
  loading: boolean;
  error: string | null;
  currentStepIndex: number;
  completeStep: (step: number, skipped?: boolean) => Promise<void>;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  dismiss: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing onboarding wizard state.
 */
export function useOnboarding(): UseOnboardingResult {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [progressData, stepsData] = await Promise.all([
        getOnboardingProgress(),
        getOnboardingSteps(),
      ]);
      
      setProgress(progressData);
      setSteps(stepsData);
      setCurrentStepIndex(progressData.currentStep - 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load onboarding';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completeStep = useCallback(async (step: number, skipped = false) => {
    try {
      setError(null);
      const updated = await apiCompleteStep(step, { skipped });
      setProgress(updated);
      
      // Move to next step if not on last
      if (step < 5) {
        setCurrentStepIndex(step);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete step';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const nextStep = useCallback(async () => {
    if (currentStepIndex < 4) {
      await completeStep(currentStepIndex + 1);
    }
  }, [currentStepIndex, completeStep]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const dismiss = useCallback(async () => {
    try {
      setError(null);
      const updated = await apiDismiss();
      setProgress(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss onboarding';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    progress,
    steps,
    loading,
    error,
    currentStepIndex,
    completeStep,
    nextStep,
    prevStep,
    dismiss,
    refresh: fetchData,
  };
}

export default useOnboarding;
