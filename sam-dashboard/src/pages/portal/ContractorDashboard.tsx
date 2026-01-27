import { useState, useEffect } from 'react';
import { Flex, Stack, Grid, Box, Card, CardBody } from '../../components/layout';
import { Text, Button } from '../../components/primitives';
import { ContractStatusCards } from './widgets/ContractStatusCards';
import { InvoiceSummary } from './widgets/InvoiceSummary';
import { DeliverableTracker } from './widgets/DeliverableTracker';
import { UpcomingDeadlines } from './widgets/UpcomingDeadlines';

interface DashboardMetrics {
  activeContracts: number;
  pendingInvoices: number;
  upcomingDeadlines: number;
  totalContractValue: number;
}

/**
 * Contractor portal dashboard with key metrics and widgets.
 */
export function ContractorDashboard(): React.ReactElement {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeContracts: 0,
    pendingInvoices: 0,
    upcomingDeadlines: 0,
    totalContractValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data fetch
    const loadMetrics = async () => {
      setLoading(true);
      // In production, fetch from API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMetrics({
        activeContracts: 5,
        pendingInvoices: 3,
        upcomingDeadlines: 8,
        totalContractValue: 2450000,
      });
      setLoading(false);
    };
    loadMetrics();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Stack spacing="var(--spacing-6)" className="p-6">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Stack spacing="0">
          <Text variant="heading2">Contractor Dashboard</Text>
          <Text variant="body" color="muted">
            Welcome back! Here's your contract portfolio overview.
          </Text>
        </Stack>
        <Flex gap="sm">
          <Button variant="secondary">Export Report</Button>
          <Button variant="primary">New Submission</Button>
        </Flex>
      </Flex>

      {/* Quick Stats */}
      <Grid columns={4} gap="md">
        <QuickStat
          title="Active Contracts"
          value={metrics.activeContracts.toString()}
          icon="📋"
          color="var(--color-primary)"
          loading={loading}
        />
        <QuickStat
          title="Pending Invoices"
          value={metrics.pendingInvoices.toString()}
          icon="💰"
          color="var(--color-warning)"
          loading={loading}
        />
        <QuickStat
          title="Upcoming Deadlines"
          value={metrics.upcomingDeadlines.toString()}
          icon="📅"
          color="var(--color-danger)"
          loading={loading}
        />
        <QuickStat
          title="Total Contract Value"
          value={formatCurrency(metrics.totalContractValue)}
          icon="💵"
          color="var(--color-success)"
          loading={loading}
        />
      </Grid>

      {/* Main Content Grid */}
      <Grid columns={2} gap="lg">
        {/* Left Column */}
        <Stack spacing="var(--spacing-4)">
          <ContractStatusCards />
          <DeliverableTracker />
        </Stack>

        {/* Right Column */}
        <Stack spacing="var(--spacing-4)">
          <InvoiceSummary />
          <UpcomingDeadlines />
        </Stack>
      </Grid>
    </Stack>
  );
}

interface QuickStatProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  loading?: boolean;
}

function QuickStat({ title, value, icon, color, loading }: QuickStatProps): React.ReactElement {
  return (
    <Card variant="elevated">
      <CardBody padding="md">
        <Flex align="flex-start" justify="space-between">
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">{title}</Text>
            {loading === true ? (
              <Box
                style={{
                  width: '80px',
                  height: '32px',
                  backgroundColor: 'var(--color-gray-200)',
                  borderRadius: '4px',
                }}
              />
            ) : (
              <Text
                variant="heading3"
                style={{ color, fontWeight: 700 }}
              >
                {value}
              </Text>
            )}
          </Stack>
          <Box
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            {icon}
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default ContractorDashboard;
