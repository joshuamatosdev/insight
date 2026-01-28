import {useCallback, useEffect, useState} from 'react';
import {Button, Text,} from '../components/catalyst/primitives';
import {RefreshIcon, SpeedometerIcon,} from '../components/catalyst/primitives/Icon';
import {
    Card,
    CardBody,
    CardHeader,
    Grid,
    GridItem,
    HStack,
    Section,
    SectionHeader,
    Stack,
} from '../components/catalyst/layout';
import {ActivityFeed, MetricCard, TopPerformersTable, TrendChart,} from '../components/domain';
import {StatsGrid} from '../components/domain/stats';
import {ActivityItem, DashboardStats, TopPerformer, TrendPoint,} from '../types/analytics.types';

/**
 * Mock data for development - replace with API calls
 */
const mockDashboardStats: DashboardStats = {
    opportunitiesViewed: 1247,
    opportunitiesSaved: 89,
    pipelineValue: 4500000,
    winRate: 35.2,
    activeUsers: 24,
    recentActivity: 156,
    eventCounts: {
        OPPORTUNITY_VIEWED: 1247,
        OPPORTUNITY_SAVED: 89,
        SEARCH_PERFORMED: 342,
        REPORT_GENERATED: 28,
        DOCUMENT_DOWNLOADED: 67,
    },
    viewsTrend: [
        {date: '2026-01-01', value: 42},
        {date: '2026-01-02', value: 38},
        {date: '2026-01-03', value: 45},
        {date: '2026-01-04', value: 51},
        {date: '2026-01-05', value: 48},
        {date: '2026-01-06', value: 39},
        {date: '2026-01-07', value: 55},
        {date: '2026-01-08', value: 62},
        {date: '2026-01-09', value: 58},
        {date: '2026-01-10', value: 67},
        {date: '2026-01-11', value: 71},
        {date: '2026-01-12', value: 65},
        {date: '2026-01-13', value: 73},
        {date: '2026-01-14', value: 78},
    ],
};

const mockActivities: ActivityItem[] = [
    {
        id: '1',
        userId: 'user-1',
        userName: 'John Smith',
        eventType: 'OPPORTUNITY_SAVED',
        entityType: 'OPPORTUNITY',
        entityId: 'OPP-2026-001',
        description: 'Saved opportunity to pipeline',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        userId: 'user-2',
        userName: 'Jane Doe',
        eventType: 'REPORT_GENERATED',
        entityType: 'REPORT',
        entityId: 'RPT-456',
        description: 'Generated pipeline report',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        userId: 'user-3',
        userName: 'Bob Wilson',
        eventType: 'OPPORTUNITY_VIEWED',
        entityType: 'OPPORTUNITY',
        entityId: 'OPP-2026-002',
        description: 'Viewed opportunity details',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
        id: '4',
        userId: 'user-1',
        userName: 'John Smith',
        eventType: 'PIPELINE_OPPORTUNITY_MOVED',
        entityType: 'PIPELINE_OPPORTUNITY',
        entityId: 'PO-789',
        description: 'Moved to Qualified stage',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
        id: '5',
        userId: 'user-4',
        userName: 'Alice Brown',
        eventType: 'DOCUMENT_UPLOADED',
        entityType: 'DOCUMENT',
        entityId: 'DOC-123',
        description: 'Uploaded proposal draft',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
        id: '6',
        userId: 'user-2',
        userName: 'Jane Doe',
        eventType: 'SEARCH_PERFORMED',
        entityType: 'SEARCH',
        entityId: null,
        description: 'Searched for IT services contracts',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
        id: '7',
        userId: 'user-5',
        userName: 'Charlie Davis',
        eventType: 'CONTRACT_CREATED',
        entityType: 'CONTRACT',
        entityId: 'CTR-2026-001',
        description: 'Created new contract record',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '8',
        userId: 'user-3',
        userName: 'Bob Wilson',
        eventType: 'BID_DECISION_MADE',
        entityType: 'PIPELINE_OPPORTUNITY',
        entityId: 'PO-456',
        description: 'Decided to bid - Go',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
];

const mockTopPerformers: TopPerformer[] = [
    {userId: 'user-1', userName: 'John Smith', actionCount: 342, value: 0},
    {userId: 'user-2', userName: 'Jane Doe', actionCount: 287, value: 0},
    {userId: 'user-3', userName: 'Bob Wilson', actionCount: 234, value: 0},
    {userId: 'user-4', userName: 'Alice Brown', actionCount: 198, value: 0},
    {userId: 'user-5', userName: 'Charlie Davis', actionCount: 156, value: 0},
];

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
}

export function AnalyticsDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [performers, setPerformers] = useState<TopPerformer[]>([]);
    const [trendData, setTrendData] = useState<TrendPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // TODO: Replace with actual API calls
            // const response = await fetchDashboardStats();
            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
            setStats(mockDashboardStats);
            setActivities(mockActivities);
            setPerformers(mockTopPerformers);
            setTrendData(mockDashboardStats.viewsTrend);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to load dashboard data';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    const handleRefresh = useCallback(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    const handleLoadMoreActivities = useCallback(() => {
        // TODO: Implement pagination
        console.log('Load more activities');
    }, []);

    // Calculate change percentages (mock data)
    const opportunitiesChange = 12.5;
    const savedChange = 8.3;
    const pipelineChange = -2.1;
    const usersChange = 15.7;

    if (error !== null && isLoading === false) {
        return (
            <Section id="analytics-dashboard">
                <SectionHeader
                    title="Analytics Dashboard"
                    icon={<SpeedometerIcon size="lg"/>}
                />
                <Card>
                    <CardBody>
                        <Stack spacing="md">
                            <Text variant="body" color="danger">
                                {error}
                            </Text>
                            <Button variant="outline" size="sm" onClick={handleRefresh}>
                                Retry
                            </Button>
                        </Stack>
                    </CardBody>
                </Card>
            </Section>
        );
    }

    return (
        <Section id="analytics-dashboard">
            <SectionHeader
                title="Analytics Dashboard"
                icon={<SpeedometerIcon size="lg"/>}
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    <RefreshIcon size="sm"/>
                    <Text as="span">Refresh</Text>
                </Button>
            </SectionHeader>

            {/* Key Metrics Cards */}
            <StatsGrid columns={4}>
                <MetricCard
                    title="Opportunities Viewed"
                    value={stats?.opportunitiesViewed ?? 0}
                    changePercent={opportunitiesChange}
                    variant="primary"
                    loading={isLoading}
                />
                <MetricCard
                    title="Opportunities Saved"
                    value={stats?.opportunitiesSaved ?? 0}
                    changePercent={savedChange}
                    variant="success"
                    loading={isLoading}
                />
                <MetricCard
                    title="Pipeline Value"
                    value={formatCurrency(stats?.pipelineValue ?? 0)}
                    changePercent={pipelineChange}
                    variant="info"
                    loading={isLoading}
                />
                <MetricCard
                    title="Active Users"
                    value={stats?.activeUsers ?? 0}
                    changePercent={usersChange}
                    variant="warning"
                    loading={isLoading}
                />
            </StatsGrid>

            {/* Win Rate Card */}
            <Card>
                <CardBody>
                    <HStack justify="between" align="center">
                        <Stack spacing="xs">
                            <Text variant="caption" color="secondary">
                                Win Rate (Last 12 Months)
                            </Text>
                            <Text
                                variant="heading1"
                            >
                                {stats?.winRate !== null && stats?.winRate !== undefined
                                    ? `${stats.winRate.toFixed(1)}%`
                                    : '--'}
                            </Text>
                        </Stack>
                        <Stack spacing="xs">
                            <Text variant="caption" color="secondary">
                                Recent Activity
                            </Text>
                            <Text variant="heading3">
                                {stats?.recentActivity.toLocaleString() ?? 0} events this week
                            </Text>
                        </Stack>
                    </HStack>
                </CardBody>
            </Card>

            {/* Charts and Tables */}
            <Grid columns="2fr 1fr" gap="lg">
                <GridItem>
                    <TrendChart
                        title="Opportunity Views Trend"
                        data={trendData}
                        height={250}
                        showLegend
                        loading={isLoading}
                    />
                </GridItem>
                <GridItem>
                    <TopPerformersTable
                        title="Top Performers (30 Days)"
                        performers={performers}
                        loading={isLoading}
                    />
                </GridItem>
            </Grid>

            {/* Activity Feed */}
            <Grid columns="1fr" gap="lg">
                <GridItem>
                    <ActivityFeed
                        activities={activities}
                        maxItems={8}
                        loading={isLoading}
                        onLoadMore={handleLoadMoreActivities}
                        hasMore={activities.length >= 8}
                    />
                </GridItem>
            </Grid>

            {/* Event Breakdown */}
            <Card>
                <CardHeader>
                    <Text variant="heading5">Event Breakdown (Last 30 Days)</Text>
                </CardHeader>
                <CardBody>
                    {isLoading ? (
                        <Text variant="body" color="secondary">
                            Loading...
                        </Text>
                    ) : (
                        <Grid columns="repeat(5, 1fr)" gap="md">
                            {Object.entries(stats?.eventCounts ?? {}).map(([eventType, count]) => (
                                <GridItem key={eventType}>
                                    <Stack spacing="xs">
                                        <Text variant="heading4">{count.toLocaleString()}</Text>
                                        <Text variant="caption" color="secondary">
                                            {eventType
                                                .toLowerCase()
                                                .split('_')
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')}
                                        </Text>
                                    </Stack>
                                </GridItem>
                            ))}
                        </Grid>
                    )}
                </CardBody>
            </Card>
        </Section>
    );
}

export default AnalyticsDashboardPage;
