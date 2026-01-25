import { useMemo, useState } from 'react';
import { Text, Badge, CheckCircleIcon, Button } from '../components/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Grid,
  GridItem,
} from '../components/layout';
import {
  Opportunity,
  isSbirOpportunity,
  getSbirPhaseLabel,
  OpportunityList,
  StatCard,
  StatsGrid,
} from '../components/domain';

interface SBIRPageProps {
  opportunities: Opportunity[];
}

type PhaseFilter = 'all' | 'I' | 'II' | 'III';

export function SBIRPage({ opportunities }: SBIRPageProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');

  const sbirOpportunities = useMemo(() => {
    return opportunities.filter(isSbirOpportunity);
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    if (phaseFilter === 'all') return sbirOpportunities;
    return sbirOpportunities.filter((o) => o.sbirPhase === phaseFilter);
  }, [sbirOpportunities, phaseFilter]);

  const stats = useMemo(() => {
    const sbir = sbirOpportunities.filter((o) => o.isSbir === true).length;
    const sttr = sbirOpportunities.filter((o) => o.isSttr === true).length;
    const phaseI = sbirOpportunities.filter((o) => o.sbirPhase === 'I').length;
    const phaseII = sbirOpportunities.filter((o) => o.sbirPhase === 'II').length;
    const phaseIII = sbirOpportunities.filter((o) => o.sbirPhase === 'III').length;

    return { total: sbirOpportunities.length, sbir, sttr, phaseI, phaseII, phaseIII };
  }, [sbirOpportunities]);

  return (
    <Section id="sbir">
      <SectionHeader title="SBIR / STTR Opportunities" icon={<CheckCircleIcon size="lg" />} />

      <StatsGrid columns={6}>
        <StatCard variant="primary" value={stats.total} label="Total SBIR/STTR" />
        <StatCard variant="info" value={stats.sbir} label="SBIR" />
        <StatCard variant="success" value={stats.sttr} label="STTR" />
        <StatCard variant="warning" value={stats.phaseI} label="Phase I" />
        <StatCard variant="secondary" value={stats.phaseII} label="Phase II" />
        <StatCard variant="danger" value={stats.phaseIII} label="Phase III" />
      </StatsGrid>

      <Card>
        <CardHeader>
          <HStack justify="between" align="center">
            <Text variant="heading5">Filter by Phase</Text>
            <HStack spacing="var(--spacing-2)">
              <Button
                variant={phaseFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPhaseFilter('all')}
              >
                All
              </Button>
              <Button
                variant={phaseFilter === 'I' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPhaseFilter('I')}
              >
                Phase I
              </Button>
              <Button
                variant={phaseFilter === 'II' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPhaseFilter('II')}
              >
                Phase II
              </Button>
              <Button
                variant={phaseFilter === 'III' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPhaseFilter('III')}
              >
                Phase III
              </Button>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody padding="none">
          <OpportunityList
            opportunities={filteredOpportunities}
            emptyMessage="No SBIR/STTR opportunities found."
            renderBadge={(opp) => (
              <HStack spacing="var(--spacing-2)">
                {opp.isSbir && <Badge variant="info" size="sm">SBIR</Badge>}
                {opp.isSttr && <Badge variant="success" size="sm">STTR</Badge>}
                {opp.sbirPhase && (
                  <Badge variant="warning" size="sm">
                    {getSbirPhaseLabel(opp.sbirPhase)}
                  </Badge>
                )}
              </HStack>
            )}
          />
        </CardBody>
      </Card>
    </Section>
  );
}

export default SBIRPage;
