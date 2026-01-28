import {useMemo} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PageHeading,
  PageHeadingDescription,
  PageHeadingSection,
  PageHeadingTitle,
  Stat,
  StatGroup,
  StatLabel,
  StatValue,
} from '../components/catalyst';
import {getOpportunityType, NAICSDistribution,} from '../components/domain';
import {DashboardPageProps} from './Pages.types';
import {Grid, GridItem} from '@/components';
import OpportunityTableCatalyst from "../components/domain/opportunity/OpportunityTableCatalyst.tsx";

export function DashboardPage({ opportunities, onNavigate }: DashboardPageProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const sourcesSought = opportunities.filter(
      (o) => getOpportunityType(o.type) === 'sources-sought'
    ).length;

    const urgent = opportunities.filter((o) => {
      if (o.responseDeadLine === undefined || o.responseDeadLine === null) return false;
      const deadline = new Date(o.responseDeadLine);
      const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 7;
    }).length;

    const uniqueNaics = new Set(
      opportunities
        .map((o) => o.naicsCode)
        .filter((code): code is string => code !== undefined && code !== null)
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
      if (o.naicsCode !== undefined && o.naicsCode !== null) {
        dist[o.naicsCode] = (dist[o.naicsCode] ?? 0) + 1;
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
    <Grid columns={1} gap="lg" rowGap="lg" padding="lg" marginRight={"lg"}>
      {/* Page Header - Full Width */}
      <GridItem>
        <PageHeading>
          <PageHeadingSection>
            <PageHeadingTitle>Dashboard</PageHeadingTitle>
            <PageHeadingDescription>
              Overview of your contract opportunities
            </PageHeadingDescription>
          </PageHeadingSection>
        </PageHeading>
      </GridItem>

      {/* Stats Section - Full Width, responsive 4 columns */}
      <GridItem>
        <StatGroup columns={4}>
          <Stat>
            <StatLabel>Total Opportunities</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Sources Sought</StatLabel>
            <StatValue>{stats.sourcesSought}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Due This Week</StatLabel>
            <StatValue>{stats.urgent}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>NAICS Codes</StatLabel>
            <StatValue>{stats.naicsCount}</StatValue>
          </Stat>
        </StatGroup>
      </GridItem>

      {/* Cards Section - 2 columns on lg, 1 column on mobile */}
      <GridItem>
        <Grid columns={2} gap="lg" rowGap="lg">
          {/* Recent Opportunities */}
          <GridItem margin={"md"}>
            <Card>
              <CardHeader divider>
                <CardTitle>Recent Opportunities</CardTitle>
                <Button outline onClick={() => onNavigate('all-opportunities')}>
                  View All
                </Button>
              </CardHeader>
              <CardBody padding="md">
                <OpportunityTableCatalyst opportunities={recentOpportunities} maxRows={10} />
              </CardBody>
            </Card>
          </GridItem>

          {/* NAICS Distribution */}
          <GridItem>
            <Card padding="none">
              <CardHeader divider>
                <CardTitle>NAICS Distribution</CardTitle>
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
      </GridItem>
    </Grid>
  );
}

export default DashboardPage;
