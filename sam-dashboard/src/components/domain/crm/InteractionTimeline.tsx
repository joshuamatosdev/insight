import { Stack } from '../../catalyst/layout';
import { Text } from '../../catalyst/primitives';
import { InteractionCard } from './InteractionCard';
import type { Interaction } from '../../../types/crm';

export interface InteractionTimelineProps {
  interactions: Interaction[];
  isLoading: boolean;
  onInteractionClick?: (interaction: Interaction) => void;
  onEdit?: (interaction: Interaction) => void;
  onDelete?: (interaction: Interaction) => void;
  emptyMessage?: string;
  compact?: boolean;
}

export function InteractionTimeline({
  interactions,
  isLoading,
  onInteractionClick,
  onEdit,
  onDelete,
  emptyMessage = 'No interactions found',
  compact = false,
}: InteractionTimelineProps) {
  if (isLoading === true) {
    return (
      <Stack gap="md">
        <Text variant="body" color="secondary">Loading interactions...</Text>
      </Stack>
    );
  }

  if (interactions.length === 0) {
    return (
      <Stack gap="md">
        <Text variant="body" color="secondary">{emptyMessage}</Text>
      </Stack>
    );
  }

  // Sort by date descending (most recent first)
  const sortedInteractions = [...interactions].sort((a, b) => {
    const dateA = new Date(a.interactionDate).getTime();
    const dateB = new Date(b.interactionDate).getTime();
    return dateB - dateA;
  });

  return (
    <Stack gap="md">
      {sortedInteractions.map((interaction) => (
        <InteractionCard
          key={interaction.id}
          interaction={interaction}
          onClick={onInteractionClick}
          onEdit={onEdit}
          onDelete={onDelete}
          compact={compact}
        />
      ))}
    </Stack>
  );
}
