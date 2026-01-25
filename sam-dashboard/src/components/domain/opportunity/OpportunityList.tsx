import { ReactNode } from 'react';
import { Opportunity } from './Opportunity.types';
import { OpportunityCard } from './OpportunityCard';
import { Text } from '../../primitives';
import { Stack } from '../../layout';

interface OpportunityListProps {
  opportunities: Opportunity[];
  emptyMessage?: string;
  renderBadge?: (opportunity: Opportunity) => ReactNode;
}

export function OpportunityList({ 
  opportunities, 
  emptyMessage = 'No opportunities found.',
  renderBadge,
}: OpportunityListProps) {
  if (opportunities.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--spacing-8)',
          textAlign: 'center',
          backgroundColor: 'var(--color-info-light)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Text variant="body" color="info">
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return (
    <Stack spacing="var(--spacing-4)">
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
