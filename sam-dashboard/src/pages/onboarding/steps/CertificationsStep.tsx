import { useState } from 'react';
import { Stack, Flex, Box } from '../../../components/layout';
import { Text } from '../../../components/primitives';
import { OnboardingCard } from '../../../components/domain/onboarding';

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
      <Stack spacing="var(--spacing-3)">
        {CERTIFICATIONS.map((cert) => {
          const isSelected = selected.includes(cert.id);
          return (
            <Box
              key={cert.id}
              onClick={() => toggleCertification(cert.id)}
              style={{
                padding: 'var(--spacing-4)',
                borderRadius: '8px',
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
                backgroundColor: isSelected ? 'var(--color-primary-50)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Flex align="center" gap="md">
                <Box
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                  }}
                >
                  {isSelected ? '✓' : ''}
                </Box>
                <Stack spacing="0">
                  <Text variant="body" style={{ fontWeight: 600 }}>
                    {cert.name}
                  </Text>
                  <Text variant="caption" color="muted">
                    {cert.description}
                  </Text>
                </Stack>
              </Flex>
            </Box>
          );
        })}
      </Stack>
    </OnboardingCard>
  );
}

export default CertificationsStep;
