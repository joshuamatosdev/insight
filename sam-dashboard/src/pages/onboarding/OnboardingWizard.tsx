import { useNavigate } from 'react-router-dom';
import { Flex, Stack, Box } from '../../components/catalyst/layout';
import { Text, Button } from '../../components/catalyst/primitives';
import { Stepper, Step } from '../../components/catalyst';
import { useOnboarding } from '../../hooks/useOnboarding';
import { CompanyProfileStep } from './steps/CompanyProfileStep';
import { CertificationsStep } from './steps/CertificationsStep';
import { NAICSStep } from './steps/NAICSStep';
import { TeamInviteStep } from './steps/TeamInviteStep';
import { IntegrationStep } from './steps/IntegrationStep';

/**
 * Main onboarding wizard page.
 */
export function OnboardingWizard(): React.ReactElement {
  const navigate = useNavigate();
  const {
    progress,
    steps,
    loading,
    error,
    currentStepIndex,
    completeStep,
    prevStep,
    dismiss,
  } = useOnboarding();

  const handleComplete = async (stepNum: number, skipped = false) => {
    try {
      await completeStep(stepNum, skipped);
      if (stepNum === 5) {
        // Final step - redirect to dashboard
        navigate('/dashboard');
      }
    } catch {
      // Error handled in hook
    }
  };

  const handleDismiss = async () => {
    await dismiss();
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" className="min-h-screen">
        <Text>Loading...</Text>
      </Flex>
    );
  }

  if (error !== null) {
    return (
      <Flex justify="center" align="center" className="min-h-screen">
        <Stack spacing="md" className="text-center">
          <Text variant="heading4">Failed to load onboarding</Text>
          <Text color="muted">{error}</Text>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Stack>
      </Flex>
    );
  }

  if (progress !== null && progress.complete) {
    return (
      <Flex
        justify="center"
        align="center"
        direction="column"
        className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6"
      >
        <Stack spacing="lg" className="text-center max-w-lg">
          <Text as="span" className="text-6xl">
            {''}
          </Text>
          <Text variant="heading2">Setup Complete!</Text>
          <Text variant="body" color="muted">
            Your organization is ready. Start exploring opportunities and managing your contracts.
          </Text>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Stack>
      </Flex>
    );
  }

  const currentStep = currentStepIndex + 1;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyProfileStep
            onNext={() => handleComplete(1)}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <CertificationsStep
            onNext={() => handleComplete(2)}
            onBack={prevStep}
            onSkip={() => handleComplete(2, true)}
          />
        );
      case 3:
        return (
          <NAICSStep
            onNext={() => handleComplete(3)}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <TeamInviteStep
            onNext={() => handleComplete(4)}
            onBack={prevStep}
            onSkip={() => handleComplete(4, true)}
          />
        );
      case 5:
        return (
          <IntegrationStep
            onNext={() => handleComplete(5)}
            onBack={prevStep}
            onSkip={() => handleComplete(5, true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6"
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        className="w-full max-w-[700px] mb-6"
      >
        <Text variant="heading4">Welcome to SAMGov</Text>
        <Button variant="ghost" onClick={handleDismiss}>
          Skip setup
        </Button>
      </Flex>

      {/* Progress - Using Catalyst Stepper */}
      <Box className="w-full max-w-[700px] mb-6">
        <Stepper currentStep={currentStep} orientation="horizontal">
          {steps.map((step, index) => (
            <Step
              key={index}
              label={step.title}
              description={step.description}
            />
          ))}
        </Stepper>
      </Box>

      {/* Step Content */}
      {renderStep()}
    </Flex>
  );
}

export default OnboardingWizard;
