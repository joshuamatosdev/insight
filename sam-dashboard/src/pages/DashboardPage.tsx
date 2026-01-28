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
  StatChange,
  StatGroup,
  StatLabel,
  StatValue,
} from '../components/catalyst';
import type {
  AgencyDistributionData,
  ComplianceAlert,
  DeadlineItem,
  PipelineStageData,
  SetAsideData,
  UpcomingDeadline,
} from '../components/domain';
import {
  AgencyDistribution,
  ComplianceAlertsTable,
  DeadlineTimeline,
  getOpportunityType,
  NAICSDistribution,
  PipelineFunnel,
  SetAsideDistribution,
  UpcomingDeadlinesTable,
} from '../components/domain';
import {DashboardPageProps} from './Pages.types';
import {Grid, GridItem} from '@/components';
import OpportunityTableCatalyst from '../components/domain/opportunity/OpportunityTableCatalyst';
import {useDashboardSummary} from '@/hooks';

// Helper to calculate days until deadline
function getDaysUntil(dateStr: string): number {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format large currency values
function formatLargeCurrency(value: number): string {
    if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
}

export function DashboardPage({opportunities, onNavigate}: DashboardPageProps) {
    // Fetch dashboard data from API
    const {data: dashboardData, isLoading: dashboardLoading} = useDashboardSummary();

    // Basic stats from opportunities
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

        // Calculate total estimated value
        const totalValue = opportunities.reduce((sum, o) => {
            const value = o.estimatedValue ?? o.awardAmount ?? 0;
            return sum + value;
        }, 0);

        return {
            total: opportunities.length,
            sourcesSought,
            urgent,
            naicsCount: uniqueNaics,
            totalValue,
        };
    }, [opportunities]);

    // NAICS distribution
    const naicsDistribution = useMemo(() => {
        const dist: Record<string, number> = {};
        opportunities.forEach((o) => {
            if (o.naicsCode !== undefined && o.naicsCode !== null) {
                dist[o.naicsCode] = (dist[o.naicsCode] ?? 0) + 1;
            }
        });
        return dist;
    }, [opportunities]);

    // Agency distribution data
    const agencyData = useMemo((): AgencyDistributionData[] => {
        const agencyMap = new Map<string, { count: number; value: number }>();
        opportunities.forEach((o) => {
            const agency = o.fullParentPathName ?? o.officeAddress?.state ?? 'Unknown';
            const existing = agencyMap.get(agency) ?? {count: 0, value: 0};
            agencyMap.set(agency, {
                count: existing.count + 1,
                value: existing.value + (o.estimatedValue ?? 0),
            });
        });
        return Array.from(agencyMap.entries()).map(([agency, data]) => ({
            agency,
            count: data.count,
            value: data.value,
        }));
    }, [opportunities]);

    // Set-aside distribution data
    const setAsideData = useMemo((): SetAsideData[] => {
        const setAsideMap = new Map<string, { count: number; value: number }>();
        opportunities.forEach((o) => {
            const setAside = o.typeOfSetAside ?? 'Full & Open';
            const existing = setAsideMap.get(setAside) ?? {count: 0, value: 0};
            setAsideMap.set(setAside, {
                count: existing.count + 1,
                value: existing.value + (o.estimatedValue ?? 0),
            });
        });
        return Array.from(setAsideMap.entries()).map(([setAside, data]) => ({
            setAside,
            label: setAside,
            count: data.count,
            value: data.value,
        }));
    }, [opportunities]);

    // Pipeline stage data (simulated from opportunity types)
    const pipelineStages = useMemo((): PipelineStageData[] => {
        const stageMap = new Map<string, { count: number; value: number }>();
        opportunities.forEach((o) => {
            const type = getOpportunityType(o.type);
            const stageName = type === 'sources-sought' ? 'Sources Sought'
                : type === 'presolicitation' ? 'Pre-Solicitation'
                    : type === 'solicitation' ? 'Active Solicitation'
                        : type === 'award' ? 'Awarded'
                            : 'Other';
            const existing = stageMap.get(stageName) ?? {count: 0, value: 0};
            stageMap.set(stageName, {
                count: existing.count + 1,
                value: existing.value + (o.estimatedValue ?? 0),
            });
        });
        return Array.from(stageMap.entries()).map(([stageName, data], index) => ({
            stageId: `stage-${index}`,
            stageName,
            count: data.count,
            value: data.value,
            weightedValue: data.value * 0.5, // Simplified weighting
        }));
    }, [opportunities]);

    // Upcoming deadlines
    const upcomingDeadlines = useMemo((): UpcomingDeadline[] => {
        return opportunities
            .filter((o) => o.responseDeadLine !== undefined && o.responseDeadLine !== null)
            .map((o) => ({
                id: o.noticeId,
                title: o.title,
                agency: o.fullParentPathName ?? 'Unknown Agency',
                type: getOpportunityType(o.type),
                setAside: o.typeOfSetAside ?? null,
                estimatedValue: o.estimatedValue ?? null,
                deadline: o.responseDeadLine as string,
                daysRemaining: getDaysUntil(o.responseDeadLine as string),
            }))
            .filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 30)
            .sort((a, b) => a.daysRemaining - b.daysRemaining)
            .slice(0, 15);
    }, [opportunities]);

    // Deadline items for timeline
    const deadlineItems = useMemo((): DeadlineItem[] => {
        return upcomingDeadlines.map((d) => ({
            id: d.id,
            title: d.title,
            deadline: d.deadline,
            type: d.type,
            agency: d.agency,
            value: d.estimatedValue ?? undefined,
        }));
    }, [upcomingDeadlines]);

    // Compliance alerts from dashboard data
    const complianceAlerts = useMemo((): ComplianceAlert[] => {
        if (dashboardData === null) return [];

        const alerts: ComplianceAlert[] = [];

        // Add expiring certifications
        dashboardData.expiringCertificationsList.forEach((cert) => {
            alerts.push({
                id: cert.id,
                name: cert.name,
                type: 'certification',
                expirationDate: cert.expirationDate,
                daysRemaining: getDaysUntil(cert.expirationDate),
                status: cert.status,
            });
        });

        // Add expiring clearances
        dashboardData.expiringClearancesList.forEach((clearance) => {
            alerts.push({
                id: clearance.id,
                name: `${clearance.level} Clearance - ${clearance.employeeName}`,
                type: 'clearance',
                expirationDate: clearance.expirationDate ?? clearance.reinvestigationDate,
                daysRemaining: getDaysUntil(clearance.expirationDate ?? clearance.reinvestigationDate),
                status: clearance.status,
            });
        });

        return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }, [dashboardData]);

    // Recent opportunities
    const recentOpportunities = useMemo(() => {
        return [...opportunities]
            .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
            .slice(0, 10);
    }, [opportunities]);

    // Total pipeline value from stages
    const totalPipelineValue = useMemo(() => {
        return pipelineStages.reduce((sum, s) => sum + s.value, 0);
    }, [pipelineStages]);

    return (
        <Grid columns={1} gap="lg" rowGap="lg" padding="lg" marginRight="lg">
            {/* Page Header */}
            <GridItem>
                <PageHeading>
                    <PageHeadingSection>
                        <PageHeadingTitle>Federal/DoD Dashboard</PageHeadingTitle>
                        <PageHeadingDescription>
                            Overview of your contract opportunities and pipeline
                        </PageHeadingDescription>
                    </PageHeadingSection>
                </PageHeading>
            </GridItem>

            {/* KPI Stats Row - 4 columns */}
            <GridItem>
                <StatGroup columns={4}>
                    <Stat>
                        <StatLabel>Pipeline Value</StatLabel>
                        <StatValue>{formatLargeCurrency(totalPipelineValue)}</StatValue>
                        <StatChange trend="up">{stats.total} opportunities</StatChange>
                    </Stat>
                    <Stat>
                        <StatLabel>Active Contracts</StatLabel>
                        <StatValue>
                            {dashboardLoading ? '...' : (dashboardData?.metrics.activeContracts ?? 0)}
                        </StatValue>
                        <StatChange trend="neutral">
                            {formatLargeCurrency(dashboardData?.metrics.totalContractValue ?? 0)} value
                        </StatChange>
                    </Stat>
                    <Stat>
                        <StatLabel>Expiring Soon</StatLabel>
                        <StatValue>
                            {dashboardLoading ? '...' : (dashboardData?.metrics.totalExpiringSoon ?? stats.urgent)}
                        </StatValue>
                        <StatChange trend={stats.urgent > 5 ? 'down' : 'neutral'}>
                            Within 30 days
                        </StatChange>
                    </Stat>
                    <Stat>
                        <StatLabel>Win Rate</StatLabel>
                        <StatValue>
                            {dashboardLoading ? '...' : `${((dashboardData?.metrics.winRate ?? 0) * 100).toFixed(0)}%`}
                        </StatValue>
                        <StatChange trend="up">
                            {dashboardData?.metrics.winsCount ?? 0} wins
                            / {dashboardData?.metrics.lossesCount ?? 0} losses
                        </StatChange>
                    </Stat>
                </StatGroup>
            </GridItem>

            {/* Charts Row 1 - 3 columns */}
            <GridItem>
                <Grid columns={3} gap="lg" rowGap="lg">
                    {/* Pipeline Funnel */}
                    <GridItem>
                        <Card>
                            <CardHeader divider>
                                <CardTitle>Pipeline by Stage</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <PipelineFunnel stages={pipelineStages} totalValue={totalPipelineValue}/>
                            </CardBody>
                        </Card>
                    </GridItem>

                    {/* Opportunities by Agency */}
                    <GridItem>
                        <Card>
                            <CardHeader divider>
                                <CardTitle>By Agency</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <AgencyDistribution data={agencyData} total={stats.total} maxItems={8}/>
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

            {/* Charts Row 2 - 3 columns */}
            <GridItem>
                <Grid columns={3} gap="lg" rowGap="lg">
                    {/* Deadline Timeline */}
                    <GridItem>
                        <Card>
                            <CardHeader divider>
                                <CardTitle>Deadline Timeline</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <DeadlineTimeline deadlines={deadlineItems} maxItems={8}/>
                            </CardBody>
                        </Card>
                    </GridItem>

                    {/* Set-Aside Distribution */}
                    <GridItem>
                        <Card>
                            <CardHeader divider>
                                <CardTitle>Set-Aside Distribution</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <SetAsideDistribution data={setAsideData} total={stats.total} maxItems={8}/>
                            </CardBody>
                        </Card>
                    </GridItem>

                    {/* Compliance Alerts */}
                    <GridItem>
                        <Card>
                            <CardHeader divider>
                                <CardTitle>Compliance Alerts</CardTitle>
                                <Button outline onClick={() => onNavigate('compliance')}>
                                    View All
                                </Button>
                            </CardHeader>
                            <CardBody padding="none">
                                <ComplianceAlertsTable alerts={complianceAlerts} maxRows={5}/>
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>
            </GridItem>

            {/* Tables Row - 2 columns */}
            <GridItem>
                <Grid columns={2} gap="lg" rowGap="lg">
                    {/* Upcoming Deadlines Table */}
                    <GridItem>
                        <Card>
                            <CardHeader divider>
                                <CardTitle>Upcoming Deadlines</CardTitle>
                                <Button outline onClick={() => onNavigate('all-opportunities')}>
                                    View All
                                </Button>
                            </CardHeader>
                            <CardBody padding="none">
                                <UpcomingDeadlinesTable deadlines={upcomingDeadlines} maxRows={8}/>
                            </CardBody>
                        </Card>
                    </GridItem>

                    {/* Recent Opportunities */}
                    <GridItem>
                        <Card>
                            <CardHeader divider>
                                <CardTitle>Recent Opportunities</CardTitle>
                                <Button outline onClick={() => onNavigate('all-opportunities')}>
                                    View All
                                </Button>
                            </CardHeader>
                            <CardBody padding="md">
                                <OpportunityTableCatalyst opportunities={recentOpportunities} maxRows={8}/>
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>
            </GridItem>
        </Grid>
    );
}

export default DashboardPage;
