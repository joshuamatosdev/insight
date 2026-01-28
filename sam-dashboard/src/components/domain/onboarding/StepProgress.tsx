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
export function StepProgress({steps, currentStep}: StepProgressProps): React.ReactElement {
    return (
        <div>
            <div>
                {steps.map((step, index) => {
                    const isComplete = step.complete;
                    const isCurrent = step.stepNumber === currentStep;
                    const isPast = step.stepNumber < currentStep;

                    return (
                        <div key={step.stepNumber}>
                            {/* Step Circle */}
                            <div
                            >
                                {isComplete ? '✓' : step.stepNumber}
                            </div>

                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Labels */}
            <div>
                {steps.map((step) => (
                    <div
                        key={step.stepNumber}
                    >
                        <p
                        >
                            {step.title}
                            {step.required && <span> *</span>}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StepProgress;
