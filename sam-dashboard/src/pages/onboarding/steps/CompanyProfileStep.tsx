import {useState} from 'react';
import {Box, Stack} from '../../../components/catalyst/layout';
import {Input, Text} from '../../../components/catalyst/primitives';
import {OnboardingCard} from '../../../components/domain/onboarding';

interface CompanyProfileStepProps {
    onNext: () => void;
    onBack: () => void;
}

/**
 * Step 1: Company Profile setup.
 */
export function CompanyProfileStep({onNext, onBack}: CompanyProfileStepProps): React.ReactElement {
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
            <Stack spacing="md">
                <Box>
                    <Text as="label" variant="label" htmlFor="companyName">
                        Company Name *
                    </Text>
                    <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter your company name"
                        required
                    />
                </Box>
                <Box>
                    <Text as="label" variant="label" htmlFor="uei">
                        UEI Number
                    </Text>
                    <Input
                        id="uei"
                        value={uei}
                        onChange={(e) => setUei(e.target.value)}
                        placeholder="12-character Unique Entity ID"
                    />
                    <Text variant="caption" color="muted">
                        Your SAM.gov Unique Entity Identifier
                    </Text>
                </Box>
                <Box>
                    <Text as="label" variant="label" htmlFor="cage">
                        CAGE Code
                    </Text>
                    <Input
                        id="cage"
                        value={cage}
                        onChange={(e) => setCage(e.target.value)}
                        placeholder="5-character CAGE code"
                    />
                    <Text variant="caption" color="muted">
                        Commercial and Government Entity Code
                    </Text>
                </Box>
                <Box>
                    <Text as="label" variant="label" htmlFor="address">
                        Business Address
                    </Text>
                    <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St, City, State ZIP"
                    />
                </Box>
                <Box>
                    <Text as="label" variant="label" htmlFor="contactName">
                        Primary Contact Name
                    </Text>
                    <Input
                        id="contactName"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Smith"
                    />
                </Box>
                <Box>
                    <Text as="label" variant="label" htmlFor="contactEmail">
                        Primary Contact Email
                    </Text>
                    <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="john@company.com"
                    />
                </Box>
            </Stack>
        </OnboardingCard>
    );
}

export default CompanyProfileStep;
