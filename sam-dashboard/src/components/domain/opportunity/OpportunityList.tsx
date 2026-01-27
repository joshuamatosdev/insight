import { OpportunityListProps } from './Opportunity.types';
import { OpportunityCard } from './OpportunityCard';
import { Text } from '../../primitives';
import { Stack, Box } from '../../layout';

export function OpportunityList({
  opportunities,
  emptyMessage = 'No opportunities found.',
  renderBadge,
}: OpportunityListProps) {
  if (opportunities.length === 0) {
    return (
      <Box
        style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f0f9ff',
          borderRadius: '0.5rem',
        }}
      >
        <Text variant="body" color="info">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Stack spacing="md">
      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
          extraBadge={renderBadge?.(opportunity)}
        />
      ))}
    </Stack>
  );
}

export default OpportunityList;
