import { useMemo } from 'react';
import { FileTextIcon } from '../components/primitives';
import { Section, SectionHeader } from '../components/layout';
import { Opportunity, getOpportunityType, OpportunityList } from '../components/domain';

interface PresolicationPageProps {
  opportunities: Opportunity[];
}

export function PresolicationPage({ opportunities }: PresolicationPageProps) {
  const presolicitations = useMemo(() => {
    return opportunities.filter((o) => getOpportunityType(o.type) === 'presolicitation');
  }, [opportunities]);

  return (
    <Section id="presolicitation">
      <SectionHeader title="Presolicitation" icon={<FileTextIcon size="lg" />} />
      <OpportunityList
        opportunities={presolicitations}
        emptyMessage="No Presolicitation opportunities found."
      />
    </Section>
  );
}

export default PresolicationPage;
