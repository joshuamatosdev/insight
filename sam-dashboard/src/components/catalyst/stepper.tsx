import clsx from 'clsx'
import React from 'react'
import { CheckIcon } from './primitives/Icon/icons/CheckIcon'

type StepperProps = {
  currentStep: number
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'nav'>

type StepProps = {
  label: string
  description?: string
  className?: string
} & React.ComponentPropsWithoutRef<'div'>

type StepState = 'completed' | 'current' | 'pending'

type StepperContextValue = {
  currentStep: number
  totalSteps: number
  orientation: 'horizontal' | 'vertical'
  stepNumber: number
}

const StepperContext = React.createContext<StepperContextValue | undefined>(undefined)

function useStepperContext() {
  const context = React.useContext(StepperContext)
  if (context === undefined) {
    throw new Error('Step must be used within Stepper')
  }
  return context
}

export function Stepper({
  currentStep,
  orientation = 'horizontal',
  className,
  children,
  ...props
}: StepperProps) {
  const steps = React.Children.toArray(children)
  const totalSteps = steps.length

  // Ensure currentStep is at least 1
  const normalizedCurrentStep = Math.max(1, currentStep)

  return (
    <nav
      aria-label="Progress"
      data-stepper
      className={clsx(
        'flex',
        orientation === 'horizontal' && 'flex-row items-center',
        orientation === 'vertical' && 'flex-col',
        className
      )}
      {...props}
    >
      {steps.map((child, index) => {
        const stepNumber = index + 1
        return (
          <StepperContext.Provider
            key={stepNumber}
            value={{
              currentStep: normalizedCurrentStep,
              totalSteps,
              orientation,
              stepNumber,
            }}
          >
            <StepWrapper stepNumber={stepNumber}>{child}</StepWrapper>
          </StepperContext.Provider>
        )
      })}
    </nav>
  )
}

function StepWrapper({
  stepNumber,
  children,
}: {
  stepNumber: number
  children: React.ReactNode
}) {
  const { currentStep, totalSteps, orientation } = useStepperContext()
  const isLastStep = stepNumber === totalSteps

  return (
    <div
      className={clsx(
        'flex',
        orientation === 'horizontal' && 'flex-1 items-center',
        orientation === 'vertical' && 'flex-col'
      )}
    >
      {children}
      {isLastStep === false && (
        <Connector stepNumber={stepNumber} orientation={orientation} />
      )}
    </div>
  )
}

function Connector({
  stepNumber,
  orientation,
}: {
  stepNumber: number
  orientation: 'horizontal' | 'vertical'
}) {
  const { currentStep } = useStepperContext()
  const isCompleted = stepNumber < currentStep

  return (
    <div
      data-connector
      className={clsx(
        'border-zinc-300 dark:border-zinc-700',
        orientation === 'horizontal' && 'mx-4 h-px flex-1 border-t-2',
        orientation === 'vertical' && 'ml-4 my-2 w-px flex-1 border-l-2',
        isCompleted && 'border-primary'
      )}
    />
  )
}

export function Step({ label, description, className, ...props }: StepProps) {
  const { currentStep, orientation, stepNumber } = useStepperContext()

  const getStepState = (step: number, current: number): StepState => {
    if (step < current) {
      return 'completed'
    }
    if (step === current) {
      return 'current'
    }
    return 'pending'
  }

  const state = getStepState(stepNumber, currentStep)
  const isCurrent = state === 'current'

  return (
    <div
      data-step
      aria-current={isCurrent ? 'step' : undefined}
      className={clsx(
        'flex items-start gap-3',
        orientation === 'vertical' && 'w-full',
        className
      )}
      {...props}
    >
      <StepIndicator state={state} stepNumber={stepNumber} />
      <div className={clsx('flex flex-col', orientation === 'horizontal' && 'min-w-0')}>
        <div
          className={clsx(
            'text-sm font-medium',
            state === 'current' && 'text-primary',
            state === 'completed' && 'text-on-surface',
            state === 'pending' && 'text-on-surface-variant'
          )}
        >
          {label}
        </div>
        {description !== undefined && description !== null && (
          <div
            className={clsx(
              'text-sm',
              state === 'current' && 'text-on-surface-variant',
              state === 'completed' && 'text-on-surface-variant',
              state === 'pending' && 'text-on-surface-variant opacity-60'
            )}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

function StepIndicator({ state, stepNumber }: { state: StepState; stepNumber: number }) {
  return (
    <div
      data-step-indicator
      className={clsx(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
        state === 'completed' && 'bg-primary text-white',
        state === 'current' && 'bg-primary text-white',
        state === 'pending' && 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
      )}
    >
      {state === 'completed' ? (
        <span aria-label="Completed">
          <CheckIcon className="h-5 w-5" />
        </span>
      ) : (
        <span>{stepNumber}</span>
      )}
    </div>
  )
}
