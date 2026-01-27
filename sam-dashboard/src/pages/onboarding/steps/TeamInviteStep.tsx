import { useState } from 'react';
import { Stack, Flex, Box } from '../../../components/catalyst/layout';
import { Text, Input, Button, Select } from '../../../components/catalyst/primitives';
import { OnboardingCard } from '../../../components/domain/onboarding';

interface TeamInviteStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface TeamMember {
  email: string;
  role: string;
}

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'viewer', label: 'Viewer' },
];

/**
 * Step 4: Invite Team Members.
 */
export function TeamInviteStep({
  onNext,
  onBack,
  onSkip,
}: TeamInviteStepProps): React.ReactElement {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('analyst');

  const addMember = () => {
    if (email.trim() !== '' && email.includes('@')) {
      setMembers([...members, { email: email.trim(), role }]);
      setEmail('');
      setRole('analyst');
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  return (
    <OnboardingCard
      title="Invite Team Members"
      description="Add your colleagues to collaborate on opportunities and contracts."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      canSkip={true}
    >
      <Stack spacing="md">
        {/* Add Member Form */}
        <Flex gap="sm" align="flex-end">
          <Box style={{ flex: 2 }}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={ROLES}
            />
          </Box>
          <Button variant="secondary" onClick={addMember}>
            Add
          </Button>
        </Flex>

        {/* Member List */}
        {members.length > 0 && (
          <Stack spacing="sm">
            <Text variant="caption" color="muted" style={{ fontWeight: 600 }}>
              Pending Invitations ({members.length})
            </Text>
            {members.map((member, index) => (
              <Flex
                key={index}
                align="center"
                justify="space-between"
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fafafa',
                  borderRadius: '6px',
                }}
              >
                <Stack spacing="0">
                  <Text variant="body">{member.email}</Text>
                  <Text variant="caption" color="muted">
                    {ROLES.find((r) => r.value === member.role)?.label ?? member.role}
                  </Text>
                </Stack>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMember(index)}
                >
                  Remove
                </Button>
              </Flex>
            ))}
          </Stack>
        )}

        {members.length === 0 && (
          <Box
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
            }}
          >
            <Text variant="body" color="muted">
              No team members added yet. You can always invite people later from Settings.
            </Text>
          </Box>
        )}
      </Stack>
    </OnboardingCard>
  );
}

export default TeamInviteStep;
