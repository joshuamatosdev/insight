import { useState } from 'react';
import { Stack, Flex, Box } from '../../../components/layout';
import { Text, Button } from '../../../components/primitives';
import { OnboardingCard } from '../../../components/domain/onboarding';

interface IntegrationStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
}

/**
 * Step 5: Connect Integrations.
 */
export function IntegrationStep({
  onNext,
  onBack,
  onSkip,
}: IntegrationStepProps): React.ReactElement {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'sam',
      name: 'SAM.gov',
      description: 'Sync opportunities directly from SAM.gov',
      icon: '🏛️',
      connected: false,
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Sync deadlines to Google Calendar or Outlook',
      icon: '📅',
      connected: false,
    },
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Get alerts for new matching opportunities',
      icon: '📧',
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in your Slack workspace',
      icon: '💬',
      connected: false,
    },
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, connected: i.connected === false } : i
      )
    );
  };

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <OnboardingCard
      title="Connect Integrations"
      description="Connect external services to enhance your workflow."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      canSkip={true}
      isLast={true}
    >
      <Stack spacing="var(--spacing-3)">
        {integrations.map((integration) => (
          <Flex
            key={integration.id}
            align="center"
            justify="space-between"
            style={{
              padding: 'var(--spacing-4)',
              borderRadius: '8px',
              border: `2px solid ${integration.connected ? 'var(--color-success)' : 'var(--color-gray-200)'}`,
              backgroundColor: integration.connected ? 'var(--color-success-50)' : 'white',
            }}
          >
            <Flex align="center" gap="md">
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-gray-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                {integration.icon}
              </Box>
              <Stack spacing="0">
                <Text variant="body" style={{ fontWeight: 600 }}>
                  {integration.name}
                </Text>
                <Text variant="caption" color="muted">
                  {integration.description}
                </Text>
              </Stack>
            </Flex>
            <Button
              variant={integration.connected ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => toggleConnection(integration.id)}
            >
              {integration.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </Flex>
        ))}

        {connectedCount > 0 && (
          <Text variant="caption" style={{ color: 'var(--color-success)', textAlign: 'center' }}>
            {connectedCount} integration(s) connected
          </Text>
        )}
      </Stack>
    </OnboardingCard>
  );
}

export default IntegrationStep;
