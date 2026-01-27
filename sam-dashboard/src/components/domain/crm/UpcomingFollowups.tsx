import { Card, CardHeader, CardBody } from '../../catalyst/layout/Card';
import { Stack, HStack } from '../../catalyst/layout/Stack';
import { Text } from '../../catalyst/primitives/Text';
import { Badge } from '../../catalyst/primitives/Badge';
import { Button } from '../../catalyst/primitives/Button';
import type { UpcomingFollowup } from '../../../types/crm';

export interface UpcomingFollowupsProps {
  followups: UpcomingFollowup[];
  isLoading: boolean;
  onMarkComplete?: (followup: UpcomingFollowup) => void;
  onFollowupClick?: (followup: UpcomingFollowup) => void;
  maxItems?: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function UpcomingFollowups({
  followups,
  isLoading,
  onMarkComplete,
  onFollowupClick,
  maxItems = 5,
}: UpcomingFollowupsProps) {
  if (isLoading === true) {
    return (
      <Card>
        <CardHeader>
          <Text variant="heading5">Upcoming Follow-ups</Text>
        </CardHeader>
        <CardBody>
          <Text variant="bodySmall" color="secondary">Loading...</Text>
        </CardBody>
      </Card>
    );
  }

  const displayFollowups = followups.slice(0, maxItems);
  const overdueCount = followups.filter((f) => f.isOverdue === true).length;

  return (
    <Card>
      <CardHeader>
        <HStack justify="between" align="center">
          <Text variant="heading5">Upcoming Follow-ups</Text>
          {overdueCount > 0 && (
            <Badge color="red">{overdueCount} overdue</Badge>
          )}
        </HStack>
      </CardHeader>
      <CardBody>
        {displayFollowups.length === 0 ? (
          <Text variant="bodySmall" color="secondary">No upcoming follow-ups</Text>
        ) : (
          <Stack gap="md">
            {displayFollowups.map((followup) => (
              <HStack key={followup.id} justify="between" align="start">
                <Stack gap="xs">
                  <Text
                    variant="body"
                    onClick={onFollowupClick !== undefined ? () => onFollowupClick(followup) : undefined}
                  >
                    {followup.subject}
                  </Text>
                  {followup.contactName !== null && (
                    <Text variant="bodySmall" color="secondary">
                      {followup.contactName}
                    </Text>
                  )}
                  {followup.organizationName !== null && (
                    <Text variant="bodySmall" color="secondary">
                      {followup.organizationName}
                    </Text>
                  )}
                  <HStack gap="sm">
                    <Badge color={followup.isOverdue === true ? 'red' : 'yellow'}>
                      {formatDate(followup.followUpDate)}
                    </Badge>
                    {followup.isOverdue === true && (
                      <Text variant="bodySmall" color="danger">Overdue</Text>
                    )}
                    {followup.isOverdue === false && followup.daysUntilDue <= 3 && (
                      <Text variant="bodySmall" color="warning">Due soon</Text>
                    )}
                  </HStack>
                </Stack>
                {onMarkComplete !== undefined && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkComplete(followup)}
                  >
                    Complete
                  </Button>
                )}
              </HStack>
            ))}
            {followups.length > maxItems && (
              <Text variant="bodySmall" color="secondary">
                +{followups.length - maxItems} more
              </Text>
            )}
          </Stack>
        )}
      </CardBody>
    </Card>
  );
}
