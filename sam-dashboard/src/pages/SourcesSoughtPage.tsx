import { useMemo } from 'react';
import { SearchIcon } from '../components/primitives';
import { Section, SectionHeader } from '../components/layout';
import { Opportunity, getOpportunityType, OpportunityList } from '../components/domain';

interface SourcesSoughtPageProps {
  opportunities: Opportunity[];
}

export function SourcesSoughtPage({ opportunities }: SourcesSoughtPageProps) {
  const sourcesSought = useMemo(() => {
    return opportunities.filter((o) => getOpportunityType(o.type) === 'sources-sought');
  }, [opportunities]);

  return (
    <Section id="sources-sought">
      <SectionHeader title="Sources Sought" icon={<SearchIcon size="lg" />} />
      <OpportunityList
        opportunities={sourcesSought}
        emptyMessage="No Sources Sought opportunities found."
      />
    </Section>
  );
}

export default SourcesSoughtPage;
