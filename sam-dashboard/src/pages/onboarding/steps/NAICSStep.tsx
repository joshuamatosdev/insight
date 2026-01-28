import { useState } from 'react';
import { Stack, Flex, Box, Card, CardBody } from '../../../components/catalyst/layout';
import { Text, Input, Checkbox, CheckboxField, Badge } from '../../../components/catalyst/primitives';
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
        <Box>
          <Text as="label" variant="label" htmlFor="naicsSearch">
            Search NAICS Codes
          </Text>
          <Input
            id="naicsSearch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code or description..."
            className="mt-1"
          />
        </Box>

        <Stack spacing="sm">
          {filteredCodes.map((naics) => {
            const isSelected = selectedCodes.includes(naics.code);
            const isPrimary = primaryCode === naics.code;
            return (
              <Card
                key={naics.code}
                onClick={() => toggleCode(naics.code)}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                }`}
              >
                <CardBody className="py-3">
                  <Flex align="center" justify="space-between">
                    <Flex align="center" gap="md">
                      <CheckboxField>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleCode(naics.code)}
                          color="blue"
                        />
                      </CheckboxField>
                      <Stack spacing="xs">
                        <Text variant="body" weight="medium">
                          {naics.code}
                        </Text>
                        <Text variant="caption" color="muted">
                          {naics.name}
                        </Text>
                      </Stack>
                    </Flex>
                    {isPrimary && (
                      <Badge color="blue">Primary</Badge>
                    )}
                  </Flex>
                </CardBody>
              </Card>
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
