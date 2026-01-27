import { useState } from 'react';
import { Stack } from '../../../components/layout';
import { Input } from '../../../components/primitives';
import { OnboardingCard } from '../../../components/domain/onboarding';

interface CompanyProfileStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 1: Company Profile setup.
 */
export function CompanyProfileStep({ onNext, onBack }: CompanyProfileStepProps): React.ReactElement {
  const [companyName, setCompanyName] = useState('');
  const [uei, setUei] = useState('');
  const [cage, setCage] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleNext = () => {
    // TODO: Save company profile data
    onNext();
  };

  return (
    <OnboardingCard
      title="Company Profile"
      description="Tell us about your organization. This information will be used across the platform."
      onNext={handleNext}
      onBack={onBack}
      isFirst={true}
    >
      <Stack spacing="var(--spacing-4)">
        <Input
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter your company name"
          required
        />
        <Input
          label="UEI Number"
          value={uei}
          onChange={(e) => setUei(e.target.value)}
          placeholder="12-character Unique Entity ID"
          helperText="Your SAM.gov Unique Entity Identifier"
        />
        <Input
          label="CAGE Code"
          value={cage}
          onChange={(e) => setCage(e.target.value)}
          placeholder="5-character CAGE code"
          helperText="Commercial and Government Entity Code"
        />
        <Input
          label="Business Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, City, State ZIP"
        />
        <Input
          label="Primary Contact Name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="John Smith"
        />
        <Input
          label="Primary Contact Email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="john@company.com"
        />
      </Stack>
    </OnboardingCard>
  );
}

export default CompanyProfileStep;
