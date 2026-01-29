import {useCallback} from 'react';
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
import {useAnalyticsDashboard} from '../hooks/useAnalytics';

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
    const {
        stats,
        activities,
        performers,
        trendData,
        isLoading,
        error,
        refresh,
    } = useAnalyticsDashboard();

    const handleRefresh = useCallback(() => {
        void refresh();
    }, [refresh]);

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
                                {error.message}
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
