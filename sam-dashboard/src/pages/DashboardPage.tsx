import { useMemo } from 'react';
import {
  Text,
  SpeedometerIcon,
  Button,
} from '../components/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  Grid,
  GridItem,
  HStack,
} from '../components/layout';
import {
  Opportunity,
  getOpportunityType,
  OpportunityTable,
  StatCard,
  StatsGrid,
  NAICSDistribution,
} from '../components/domain';

interface DashboardPageProps {
  opportunities: Opportunity[];
  onNavigate: (section: string) => void;
}

export function DashboardPage({ opportunities, onNavigate }: DashboardPageProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const sourcesSought = opportunities.filter(
      (o) => getOpportunityType(o.type) === 'sources-sought'
    ).length;

    const urgent = opportunities.filter((o) => {
      if (!o.responseDeadLine) return false;
      const deadline = new Date(o.responseDeadLine);
      const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 7;
    }).length;

    const uniqueNaics = new Set(
      opportunities.map((o) => o.naicsCode).filter(Boolean)
    ).size;

    return {
      total: opportunities.length,
      sourcesSought,
      urgent,
      naicsCount: uniqueNaics,
    };
  }, [opportunities]);

  const naicsDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    opportunities.forEach((o) => {
      if (o.naicsCode) {
        dist[o.naicsCode] = (dist[o.naicsCode] || 0) + 1;
      }
    });
    return dist;
  }, [opportunities]);

  const recentOpportunities = useMemo(() => {
    return [...opportunities]
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
      .slice(0, 10);
  }, [opportunities]);

  return (
    <Section id="dashboard">
      <SectionHeader title="Dashboard Overview" icon={<SpeedometerIcon size="lg" />} />

      <StatsGrid columns={4}>
        <StatCard variant="primary" value={stats.total} label="Total Opportunities" />
        <StatCard variant="success" value={stats.sourcesSought} label="Sources Sought" />
        <StatCard variant="warning" value={stats.urgent} label="Deadline < 7 Days" />
        <StatCard variant="info" value={stats.naicsCount} label="NAICS Codes" />
      </StatsGrid>

      <Grid columns="2fr 1fr" gap="var(--spacing-6)">
        <GridItem>
          <Card>
            <CardHeader>
              <HStack justify="between" align="center">
                <Text variant="heading5">Recent Opportunities</Text>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('all-opportunities')}
                >
                  View All
                </Button>
              </HStack>
            </CardHeader>
            <CardBody padding="none">
              <OpportunityTable opportunities={recentOpportunities} maxRows={10} />
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader>
              <Text variant="heading5">NAICS Distribution</Text>
            </CardHeader>
            <CardBody>
              <NAICSDistribution
                distribution={naicsDistribution}
                total={opportunities.length}
                maxItems={8}
              />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Section>
  );
}

export default DashboardPage;
