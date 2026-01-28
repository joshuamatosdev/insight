import {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    BellIcon,
    Button,
    DashboardIcon,
    FileIcon,
    InlineAlert,
    InlineAlertDescription,
    InlineAlertTitle,
    RefreshIcon,
    SearchIcon,
    Select,
    Text,
    UsersIcon,
} from '../components/catalyst/primitives';
import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Grid,
    GridItem,
    HStack,
    Section,
    SectionHeader,
    Stack,
} from '../components/catalyst/layout';
import {fetchCurrentUsage, fetchUsageLimits, fetchUsageTrend, formatUsageNumber,} from '../services';
import type {DailyUsage, MetricType, SubscriptionTier, UsageLimits, UsageSummary,} from '../types';
import type {UsagePageProps} from './UsagePage.types';

/**
 * Human-readable labels for metric types
 */
const METRIC_DISPLAY_LABELS: Record<MetricType, string> = {
  API_CALLS: 'API Calls',
  STORAGE_GB: 'Storage (GB)',
  USERS: 'Active Users',
  OPPORTUNITIES_VIEWED: 'Opportunities Viewed',
  DOCUMENTS_UPLOADED: 'Documents Uploaded',
  REPORTS_GENERATED: 'Reports Generated',
  ALERTS_SENT: 'Alerts Sent',
  SEARCH_QUERIES: 'Search Queries',
};

/**
 * All metric types
 */
const METRIC_TYPES: MetricType[] = [
  'API_CALLS',
  'STORAGE_GB',
  'USERS',
  'OPPORTUNITIES_VIEWED',
  'DOCUMENTS_UPLOADED',
  'REPORTS_GENERATED',
  'ALERTS_SENT',
  'SEARCH_QUERIES',
];

/**
 * Tier display configuration
 */
const TIER_CONFIG: Record<SubscriptionTier, { label: string; color: 'zinc' | 'blue' | 'green' }> = {
  FREE: { label: 'Free', color: 'zinc' },
  PRO: { label: 'Pro', color: 'blue' },
  ENTERPRISE: { label: 'Enterprise', color: 'green' },
};

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Progress bar component for usage metrics
 */
function UsageProgressBar({
  percentage,
  warning,
  exceeded,
}: {
  percentage: number;
  warning: boolean;
  exceeded: boolean;
}): React.ReactElement {
  let bgColor = '#10b981'; // success green
  if (exceeded) {
    bgColor = '#ef4444'; // danger red
  } else if (warning) {
    bgColor = '#f59e0b'; // warning amber
  }

  return (
    <Box>
      <Box
        style={{
          width: `${Math.min(percentage, 100)}%`,
          backgroundColor: bgColor,
        }}
      />
    </Box>
  );
}

/**
 * Usage metric card component
 */
function UsageMetricCard({
  metricType,
  current,
  limit,
  percentageUsed,
  warning,
  exceeded,
  onClick,
  isSelected,
}: {
  metricType: MetricType;
  current: number;
  limit: number;
  percentageUsed: number;
  warning: boolean;
  exceeded: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}): React.ReactElement {
  const isUnlimited = limit < 0;
  const displayLimit = isUnlimited ? 'Unlimited' : formatUsageNumber(limit);

  return (
    <Card
      variant={isSelected === true ? 'elevated' : 'default'}
      onClick={onClick}
    >
      <CardBody>
        <Stack spacing="md">
          <HStack justify="between" align="center">
            <Text variant="bodySmall" color="muted" weight="medium">
              {METRIC_DISPLAY_LABELS[metricType]}
            </Text>
            {(warning || exceeded) && (
              <Badge color={exceeded ? 'red' : 'amber'}>
                {exceeded ? 'Exceeded' : 'Warning'}
              </Badge>
            )}
          </HStack>

          <HStack justify="between" align="end">
            <Text variant="heading3" weight="bold">
              {formatUsageNumber(current)}
            </Text>
            <Text variant="caption" color="muted">
              / {displayLimit}
            </Text>
          </HStack>

          {isUnlimited === false && (
            <UsageProgressBar
              percentage={percentageUsed}
              warning={warning}
              exceeded={exceeded}
            />
          )}

          {isUnlimited === false && (
            <Text variant="caption" color="muted">
              {percentageUsed.toFixed(1)}% used
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

/**
 * Simple trend chart component using CSS bars
 */
function TrendChart({
  data,
  isLoading,
}: {
  data: DailyUsage[];
  isLoading: boolean;
}): React.ReactElement {
  if (isLoading) {
    return (
      <Flex justify="center" align="center">
        <Text variant="body" color="muted">
          Loading trend data...
        </Text>
      </Flex>
    );
  }

  if (data.length === 0) {
    return (
      <Flex justify="center" align="center">
        <Text variant="body" color="muted">
          No trend data available
        </Text>
      </Flex>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.total), 1);

  return (
    <Box>
      {data.map((point) => {
        const height = (point.total / maxValue) * 100;
        return (
          <Box
            key={point.date}
            style={{ height: `${Math.max(height, 2)}%` }}
            title={`${formatDate(point.date)}: ${point.total}`}
          />
        );
      })}
    </Box>
  );
}

/**
 * Warning banner for limit warnings
 */
function LimitWarningBanner({
  warnings,
}: {
  warnings: Array<{ metricType: MetricType; percentageUsed: number; exceeded: boolean }>;
}): React.ReactElement | null {
  if (warnings.length === 0) {
    return null;
  }

  const exceededCount = warnings.filter((w) => w.exceeded).length;
  const warningCount = warnings.filter((w) => w.exceeded === false).length;

  return (
    <InlineAlert
      color={exceededCount > 0 ? 'error' : 'warning'}
      icon={BellIcon}
    >
      <InlineAlertTitle>
        {exceededCount > 0
          ? `${exceededCount} limit${exceededCount > 1 ? 's' : ''} exceeded`
          : `${warningCount} metric${warningCount > 1 ? 's' : ''} approaching limit`}
      </InlineAlertTitle>
      <InlineAlertDescription>
        {warnings.map((w) => METRIC_DISPLAY_LABELS[w.metricType]).join(', ')}
      </InlineAlertDescription>
    </InlineAlert>
  );
}

/**
 * Usage Page Component
 */
export function UsagePage({ tenantId: _tenantId }: UsagePageProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('API_CALLS');
  const [trendData, setTrendData] = useState<DailyUsage[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendDays, setTrendDays] = useState(30);

  const loadUsageData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summary, limits] = await Promise.all([
        fetchCurrentUsage(),
        fetchUsageLimits(),
      ]);
      setUsageSummary(summary);
      setUsageLimits(limits);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load usage data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTrendData = useCallback(async () => {
    setTrendLoading(true);
    try {
      const trend = await fetchUsageTrend(selectedMetric, trendDays);
      setTrendData(trend);
    } catch (err) {
      // Don't show error for trend, just show empty
      setTrendData([]);
    } finally {
      setTrendLoading(false);
    }
  }, [selectedMetric, trendDays]);

  useEffect(() => {
    void loadUsageData();
  }, [loadUsageData]);

  useEffect(() => {
    void loadTrendData();
  }, [loadTrendData]);

  const handleMetricClick = useCallback((metricType: MetricType) => {
    setSelectedMetric(metricType);
  }, []);

  const handleRefresh = useCallback(() => {
    void loadUsageData();
    void loadTrendData();
  }, [loadUsageData, loadTrendData]);

  const handleTrendDaysChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setTrendDays(Number(event.target.value));
    },
    []
  );

  // Calculate warnings
  const warnings = useMemo(() => {
    if (usageLimits === null) {
      return [];
    }
    return Object.values(usageLimits.limits)
      .filter((status) => status.warning || status.exceeded)
      .map((status) => ({
        metricType: status.metricType,
        percentageUsed: status.percentageUsed,
        exceeded: status.exceeded,
      }));
  }, [usageLimits]);

  const trendDaysOptions = useMemo(
    () => [
      { value: '7', label: 'Last 7 days' },
      { value: '14', label: 'Last 14 days' },
      { value: '30', label: 'Last 30 days' },
      { value: '60', label: 'Last 60 days' },
      { value: '90', label: 'Last 90 days' },
    ],
    []
  );

  if (isLoading) {
    return (
      <Section id="usage">
        <Flex justify="center" align="center">
          <Text variant="body" color="muted">
            Loading usage data...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (error !== null) {
    return (
      <Section id="usage">
        <Card>
          <CardBody>
            <Stack spacing="md">
              <Text variant="body" color="danger">
                {error}
              </Text>
              <Button variant="outline" onClick={handleRefresh}>
                Retry
              </Button>
            </Stack>
          </CardBody>
        </Card>
      </Section>
    );
  }

  return (
    <Section id="usage">
      <SectionHeader
        title="Usage & Billing"
        icon={<DashboardIcon size="lg" />}
        actions={
          <HStack spacing="md">
            {usageSummary !== null && (
              <Badge
                color={TIER_CONFIG[usageSummary.subscriptionTier].color}
              >
                {TIER_CONFIG[usageSummary.subscriptionTier].label} Plan
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <HStack spacing="xs" align="center">
                <RefreshIcon size="sm" />
                <Text as="span" variant="caption">
                  Refresh
                </Text>
              </HStack>
            </Button>
          </HStack>
        }
      />

      {/* Warning Banner */}
      <LimitWarningBanner warnings={warnings} />

      {/* Billing Period Info */}
      {usageSummary !== null && (
        <Card>
          <CardBody>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <Text variant="caption" color="muted">
                  Current Billing Period
                </Text>
                <Text variant="body" weight="medium">
                  {new Date(usageSummary.periodStart).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(usageSummary.periodEnd).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </Stack>
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* Usage Metrics Grid */}
      {usageLimits !== null && (
        <Grid columns="repeat(auto-fill, minmax(250px, 1fr))" gap="md">
          {METRIC_TYPES.map((metricType) => {
            const status = usageLimits.limits[metricType];
            if (status === undefined) {
              return null;
            }
            return (
              <GridItem key={metricType}>
                <UsageMetricCard
                  metricType={status.metricType}
                  current={status.current}
                  limit={status.limit}
                  percentageUsed={status.percentageUsed}
                  warning={status.warning}
                  exceeded={status.exceeded}
                  onClick={() => handleMetricClick(status.metricType)}
                  isSelected={selectedMetric === status.metricType}
                />
              </GridItem>
            );
          })}
        </Grid>
      )}

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <HStack justify="between" align="center">
            <Text variant="heading5">
              {METRIC_DISPLAY_LABELS[selectedMetric]} Trend
            </Text>
            <Select
              value={String(trendDays)}
              onChange={handleTrendDaysChange}
              options={trendDaysOptions}
              aria-label="Select trend period"
            />
          </HStack>
        </CardHeader>
        <CardBody>
          <TrendChart data={trendData} isLoading={trendLoading} />
          {trendData.length > 0 && (
            <HStack justify="between">
              <Text variant="caption" color="muted">
                {formatDate(trendData.at(0)?.date ?? '')}
              </Text>
              <Text variant="caption" color="muted">
                {formatDate(trendData.at(-1)?.date ?? '')}
              </Text>
            </HStack>
          )}
        </CardBody>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <Text variant="heading5">Tips to Optimize Usage</Text>
        </CardHeader>
        <CardBody>
          <Stack spacing="md">
            <HStack spacing="md">
              <SearchIcon size="sm" color="primary" />
              <Text variant="bodySmall">
                Use saved searches to reduce API calls and search queries.
              </Text>
            </HStack>
            <HStack spacing="md">
              <FileIcon size="sm" color="primary" />
              <Text variant="bodySmall">
                Compress documents before uploading to save storage space.
              </Text>
            </HStack>
            <HStack spacing="md">
              <BellIcon size="sm" color="primary" />
              <Text variant="bodySmall">
                Set up alerts instead of manually checking for new opportunities.
              </Text>
            </HStack>
            <HStack spacing="md">
              <UsersIcon size="sm" color="primary" />
              <Text variant="bodySmall">
                Review team member access regularly to optimize user count.
              </Text>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    </Section>
  );
}

export default UsagePage;
