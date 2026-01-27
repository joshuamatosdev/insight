import clsx from 'clsx';
import { Badge } from '../../catalyst';

interface Step {
  stepNumber: number;
  title: string;
  complete: boolean;
  current: boolean;
  required: boolean;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

/**
 * Step progress indicator for the onboarding wizard.
 */
export function StepProgress({ steps, currentStep }: StepProgressProps): React.ReactElement {
  return (
    <div className="mb-6 w-full space-y-2">
      <div className="flex w-full items-center gap-2">
        {steps.map((step, index) => {
          const isComplete = step.complete;
          const isCurrent = step.stepNumber === currentStep;
          const isPast = step.stepNumber < currentStep;

          return (
            <div key={step.stepNumber} className="flex flex-1 items-center">
              {/* Step Circle */}
              <div
                className={clsx(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  isComplete && 'bg-green-500 text-white dark:bg-green-600',
                  isCurrent && !isComplete && 'bg-blue-600 text-white dark:bg-blue-500',
                  !isCurrent && !isComplete && 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                )}
              >
                {isComplete ? '✓' : step.stepNumber}
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'mx-2 h-0.5 flex-1',
                    (isPast || isComplete) ? 'bg-green-500 dark:bg-green-600' : 'bg-zinc-200 dark:bg-zinc-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Labels */}
      <div className="flex w-full gap-2">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className="flex-1 text-center"
          >
            <p
              className={clsx(
                'text-xs',
                step.stepNumber === currentStep
                  ? 'font-semibold text-blue-600 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400'
              )}
            >
              {step.title}
              {step.required && <span className="text-danger"> *</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StepProgress;
