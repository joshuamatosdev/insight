import { useState } from 'react';
import { Stack, Flex, Box, Card, CardBody } from '../../../components/catalyst/layout';
import { Text, Input, Button, Select } from '../../../components/catalyst/primitives';
import {
  EmptyState,
  EmptyStateDescription,
} from '../../../components/catalyst';
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
          <Box className="flex-[2]">
            <Text as="label" variant="label" htmlFor="memberEmail">
              Email Address
            </Text>
            <Input
              id="memberEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="mt-1"
            />
          </Box>
          <Box className="flex-1">
            <Text as="label" variant="label" htmlFor="memberRole">
              Role
            </Text>
            <Select
              id="memberRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={ROLES}
              className="mt-1"
            />
          </Box>
          <Button variant="secondary" onClick={addMember}>
            Add
          </Button>
        </Flex>

        {/* Member List */}
        {members.length > 0 && (
          <Stack spacing="sm">
            <Text variant="caption" color="muted" weight="semibold">
              Pending Invitations ({members.length})
            </Text>
            {members.map((member, index) => (
              <Card
                key={index}
                className="bg-zinc-50 dark:bg-zinc-800"
              >
                <CardBody className="py-3">
                  <Flex align="center" justify="space-between">
                    <Stack spacing="xs">
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
                </CardBody>
              </Card>
            ))}
          </Stack>
        )}

        {members.length === 0 && (
          <Card className="bg-zinc-50 dark:bg-zinc-800">
            <CardBody className="py-6">
              <EmptyState>
                <EmptyStateDescription>
                  No team members added yet. You can always invite people later from Settings.
                </EmptyStateDescription>
              </EmptyState>
            </CardBody>
          </Card>
        )}
      </Stack>
    </OnboardingCard>
  );
}

export default TeamInviteStep;
