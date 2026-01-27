import { Flex, Box } from '../../layout';
import { Text } from '../../primitives';

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
    <Flex
      direction="column"
      gap="sm"
      style={{ width: '100%', marginBottom: 'var(--spacing-6)' }}
    >
      <Flex gap="sm" align="center" style={{ width: '100%' }}>
        {steps.map((step, index) => {
          const isComplete = step.complete;
          const isCurrent = step.stepNumber === currentStep;
          const isPast = step.stepNumber < currentStep;

          return (
            <Flex key={step.stepNumber} align="center" style={{ flex: 1 }}>
              {/* Step Circle */}
              <Box
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isComplete
                    ? 'var(--color-success)'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--color-gray-200)',
                  color: isComplete || isCurrent ? 'white' : 'var(--color-gray-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                {isComplete ? '✓' : step.stepNumber}
              </Box>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <Box
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: isPast || isComplete
                      ? 'var(--color-success)'
                      : 'var(--color-gray-200)',
                    marginLeft: 'var(--spacing-2)',
                    marginRight: 'var(--spacing-2)',
                  }}
                />
              )}
            </Flex>
          );
        })}
      </Flex>

      {/* Step Labels */}
      <Flex gap="sm" style={{ width: '100%' }}>
        {steps.map((step) => (
          <Box
            key={step.stepNumber}
            style={{
              flex: 1,
              textAlign: 'center',
            }}
          >
            <Text
              variant="caption"
              style={{
                color: step.stepNumber === currentStep
                  ? 'var(--color-primary)'
                  : 'var(--color-gray-600)',
                fontWeight: step.stepNumber === currentStep ? 600 : 400,
              }}
            >
              {step.title}
              {step.required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
            </Text>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}

export default StepProgress;
