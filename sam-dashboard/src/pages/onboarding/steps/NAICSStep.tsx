import { useState } from 'react';
import { Stack, Flex, Box } from '../../../components/catalyst/layout';
import { Text, Input } from '../../../components/catalyst/primitives';
import { OnboardingCard } from '../../../components/domain/onboarding';

interface NAICSStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Common NAICS codes for government contractors
const COMMON_NAICS = [
  { code: '541511', name: 'Custom Computer Programming Services' },
  { code: '541512', name: 'Computer Systems Design Services' },
  { code: '541519', name: 'Other Computer Related Services' },
  { code: '541611', name: 'Administrative Management Consulting' },
  { code: '541690', name: 'Other Scientific/Technical Consulting' },
  { code: '561210', name: 'Facilities Support Services' },
  { code: '561320', name: 'Temporary Help Services' },
  { code: '611430', name: 'Professional/Management Training' },
];

/**
 * Step 3: NAICS Codes selection.
 */
export function NAICSStep({ onNext, onBack }: NAICSStepProps): React.ReactElement {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [primaryCode, setPrimaryCode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    if (primaryCode === '' && selectedCodes.includes(code) === false) {
      setPrimaryCode(code);
    }
  };

  const filteredCodes = COMMON_NAICS.filter(
    (n) =>
      n.code.includes(searchTerm) ||
      n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <OnboardingCard
      title="NAICS Codes"
      description="Select the NAICS codes that describe your business. These are used to match you with relevant opportunities."
      onNext={onNext}
      onBack={onBack}
    >
      <Stack spacing="md">
        <Input
          label="Search NAICS Codes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by code or description..."
        />

        <Stack spacing="sm">
          {filteredCodes.map((naics) => {
            const isSelected = selectedCodes.includes(naics.code);
            const isPrimary = primaryCode === naics.code;
            return (
              <Flex
                key={naics.code}
                align="center"
                justify="space-between"
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: `2px solid ${isSelected ? '#2563eb' : '#e4e4e7'}`,
                  backgroundColor: isSelected ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                }}
                onClick={() => toggleCode(naics.code)}
              >
                <Flex align="center" gap="md">
                  <Box
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: `2px solid ${isSelected ? '#2563eb' : '#d4d4d8'}`,
                      backgroundColor: isSelected ? '#2563eb' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                    }}
                  >
                    {isSelected ? '✓' : ''}
                  </Box>
                  <Stack spacing="0">
                    <Text variant="body" style={{ fontWeight: 500 }}>
                      {naics.code}
                    </Text>
                    <Text variant="caption" color="muted">
                      {naics.name}
                    </Text>
                  </Stack>
                </Flex>
                {isPrimary && (
                  <Text variant="caption" style={{ color: 'rgb(37 99 235)', fontWeight: 600 }}>
                    Primary
                  </Text>
                )}
              </Flex>
            );
          })}
        </Stack>

        {selectedCodes.length > 0 && (
          <Text variant="caption" color="muted">
            Selected: {selectedCodes.length} code(s)
          </Text>
        )}
      </Stack>
    </OnboardingCard>
  );
}

export default NAICSStep;
