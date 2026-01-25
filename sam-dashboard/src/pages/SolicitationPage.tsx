import { useMemo } from 'react';
import { FileCheckIcon } from '../components/primitives';
import { Section, SectionHeader } from '../components/layout';
import { Opportunity, getOpportunityType, OpportunityList } from '../components/domain';

interface SolicitationPageProps {
  opportunities: Opportunity[];
}

export function SolicitationPage({ opportunities }: SolicitationPageProps) {
  const solicitations = useMemo(() => {
    return opportunities.filter((o) => getOpportunityType(o.type) === 'solicitation');
  }, [opportunities]);

  return (
    <Section id="solicitation">
      <SectionHeader title="Solicitation" icon={<FileCheckIcon size="lg" />} />
      <OpportunityList
        opportunities={solicitations}
        emptyMessage="No Solicitation opportunities found."
      />
    </Section>
  );
}

export default SolicitationPage;
