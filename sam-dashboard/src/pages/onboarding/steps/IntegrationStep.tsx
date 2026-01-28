import {useState} from 'react';
import {Box, Card, CardBody, Flex, Stack} from '../../../components/catalyst/layout';
import {Button, Text} from '../../../components/catalyst/primitives';
import {OnboardingCard} from '../../../components/domain/onboarding';

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
      icon: '',
      connected: false,
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Sync deadlines to Google Calendar or Outlook',
      icon: '',
      connected: false,
    },
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Get alerts for new matching opportunities',
      icon: '',
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in your Slack workspace',
      icon: '',
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
      <Stack spacing="md">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
          >
            <CardBody>
              <Flex align="center" justify="space-between">
                <Flex align="center" gap="md">
                  <Box>
                    <Text as="span">{integration.icon}</Text>
                  </Box>
                  <Stack spacing="xs">
                    <Text variant="body" weight="semibold">
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
            </CardBody>
          </Card>
        ))}

        {connectedCount > 0 && (
          <Text variant="caption" color="success">
            {connectedCount} integration(s) connected
          </Text>
        )}
      </Stack>
    </OnboardingCard>
  );
}

export default IntegrationStep;
