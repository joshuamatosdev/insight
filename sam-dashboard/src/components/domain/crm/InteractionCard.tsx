import {Card, CardBody, CardHeader, HStack, Stack} from '../../catalyst/layout';
import {Badge, Button, Text} from '../../catalyst/primitives';
import type {Interaction, InteractionOutcome, InteractionType} from '../../../types/crm';

export interface InteractionCardProps {
  interaction: Interaction;
  onEdit?: (interaction: Interaction) => void;
  onDelete?: (interaction: Interaction) => void;
  onClick?: (interaction: Interaction) => void;
  showActions?: boolean;
  compact?: boolean;
}

function getInteractionTypeLabel(type: InteractionType): string {
  const labels: Record<InteractionType, string> = {
    PHONE_CALL: 'Phone Call',
    EMAIL: 'Email',
    MEETING_IN_PERSON: 'In-Person Meeting',
    MEETING_VIRTUAL: 'Virtual Meeting',
    CONFERENCE: 'Conference',
    TRADE_SHOW: 'Trade Show',
    INDUSTRY_DAY: 'Industry Day',
    SITE_VISIT: 'Site Visit',
    PRESENTATION: 'Presentation',
    PROPOSAL_SUBMISSION: 'Proposal Submission',
    DEBRIEF: 'Debrief',
    NETWORKING_EVENT: 'Networking Event',
    LINKEDIN_MESSAGE: 'LinkedIn Message',
    NOTE: 'Note',
    OTHER: 'Other',
  };
  return labels[type];
}

function getInteractionTypeVariant(type: InteractionType): 'blue' | 'green' | 'purple' | 'yellow' | 'gray' {
  if (type === 'PHONE_CALL' || type === 'EMAIL' || type === 'LINKEDIN_MESSAGE') {
    return 'blue';
  }
  if (type === 'MEETING_IN_PERSON' || type === 'MEETING_VIRTUAL') {
    return 'green';
  }
  if (type === 'CONFERENCE' || type === 'TRADE_SHOW' || type === 'INDUSTRY_DAY') {
    return 'purple';
  }
  if (type === 'PROPOSAL_SUBMISSION' || type === 'DEBRIEF') {
    return 'yellow';
  }
  return 'gray';
}

function getOutcomeLabel(outcome: InteractionOutcome): string {
  const labels: Record<InteractionOutcome, string> = {
    POSITIVE: 'Positive',
    NEUTRAL: 'Neutral',
    NEGATIVE: 'Negative',
    FOLLOW_UP_REQUIRED: 'Follow-up Required',
    NO_ANSWER: 'No Answer',
    LEFT_MESSAGE: 'Left Message',
    MEETING_SCHEDULED: 'Meeting Scheduled',
    REFERRAL_RECEIVED: 'Referral Received',
    INFORMATION_GATHERED: 'Info Gathered',
    RELATIONSHIP_STRENGTHENED: 'Relationship Strengthened',
  };
  return labels[outcome];
}

function getOutcomeVariant(outcome: InteractionOutcome): 'green' | 'gray' | 'red' | 'yellow' | 'blue' {
  if (outcome === 'POSITIVE' || outcome === 'RELATIONSHIP_STRENGTHENED' || outcome === 'MEETING_SCHEDULED') {
    return 'green';
  }
  if (outcome === 'NEGATIVE') {
    return 'red';
  }
  if (outcome === 'FOLLOW_UP_REQUIRED') {
    return 'yellow';
  }
  if (outcome === 'INFORMATION_GATHERED' || outcome === 'REFERRAL_RECEIVED') {
    return 'blue';
  }
  return 'gray';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function InteractionCard({
  interaction,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
  compact = false,
}: InteractionCardProps) {
  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(interaction);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit !== undefined) {
      onEdit(interaction);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete !== undefined) {
      onDelete(interaction);
    }
  };

  return (
    <Card onClick={onClick !== undefined ? handleClick : undefined}>
      <CardHeader>
        <HStack justify="between" align="center">
          <Stack gap="xs">
            <Text variant={compact === true ? 'body1' : 'heading5'}>{interaction.subject}</Text>
            <Text variant="bodySmall" color="secondary">
              {formatDate(interaction.interactionDate)}
            </Text>
          </Stack>
          <HStack gap="sm">
            <Badge color={getInteractionTypeVariant(interaction.interactionType)}>
              {getInteractionTypeLabel(interaction.interactionType)}
            </Badge>
            {interaction.outcome !== null && (
              <Badge color={getOutcomeVariant(interaction.outcome)}>
                {getOutcomeLabel(interaction.outcome)}
              </Badge>
            )}
          </HStack>
        </HStack>
      </CardHeader>
      {compact === false && (
        <CardBody>
          <HStack justify="between" align="start">
            <Stack gap="sm">
              {interaction.description !== null && (
                <Text variant="bodySmall">{interaction.description}</Text>
              )}
              {interaction.contactName !== null && (
                <Text variant="bodySmall" color="secondary">
                  Contact: {interaction.contactName}
                </Text>
              )}
              {interaction.organizationName !== null && (
                <Text variant="bodySmall" color="secondary">
                  Organization: {interaction.organizationName}
                </Text>
              )}
              {interaction.followUpRequired === true && interaction.followUpCompleted === false && (
                <Badge color="yellow">Follow-up: {interaction.followUpDate ?? 'Pending'}</Badge>
              )}
            </Stack>
            {showActions === true && (onEdit !== undefined || onDelete !== undefined) && (
              <HStack gap="sm">
                {onEdit !== undefined && (
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    Edit
                  </Button>
                )}
                {onDelete !== undefined && (
                  <Button variant="ghost" size="sm" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
              </HStack>
            )}
          </HStack>
        </CardBody>
      )}
    </Card>
  );
}
