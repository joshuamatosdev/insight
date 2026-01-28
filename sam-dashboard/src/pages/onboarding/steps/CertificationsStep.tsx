import {useState} from 'react';
import {Card, CardBody, Flex, Stack} from '../../../components/catalyst/layout';
import {Checkbox, CheckboxField, Text} from '../../../components/catalyst/primitives';
import {OnboardingCard} from '../../../components/domain/onboarding';

interface CertificationsStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const CERTIFICATIONS = [
  { id: '8a', name: '8(a) Business Development', description: 'SBA 8(a) certified' },
  { id: 'hubzone', name: 'HUBZone', description: 'Historically Underutilized Business Zone' },
  { id: 'wosb', name: 'WOSB', description: 'Women-Owned Small Business' },
  { id: 'edwosb', name: 'EDWOSB', description: 'Economically Disadvantaged WOSB' },
  { id: 'sdvosb', name: 'SDVOSB', description: 'Service-Disabled Veteran-Owned SB' },
  { id: 'small', name: 'Small Business', description: 'SBA Small Business designation' },
];

/**
 * Step 2: Business Certifications.
 */
export function CertificationsStep({
  onNext,
  onBack,
  onSkip,
}: CertificationsStepProps): React.ReactElement {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCertification = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <OnboardingCard
      title="Business Certifications"
      description="Select any certifications your business holds. This helps match you with set-aside opportunities."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      canSkip={true}
    >
      <Stack spacing="md">
        {CERTIFICATIONS.map((cert) => {
          const isSelected = selected.includes(cert.id);
          return (
            <Card
              key={cert.id}
              onClick={() => toggleCertification(cert.id)}
            >
              <CardBody>
                <Flex align="center" gap="md">
                  <CheckboxField>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleCertification(cert.id)}
                      color="blue"
                    />
                  </CheckboxField>
                  <Stack spacing="xs">
                    <Text variant="body" weight="semibold">
                      {cert.name}
                    </Text>
                    <Text variant="caption" color="muted">
                      {cert.description}
                    </Text>
                  </Stack>
                </Flex>
              </CardBody>
            </Card>
          );
        })}
      </Stack>
    </OnboardingCard>
  );
}

export default CertificationsStep;
