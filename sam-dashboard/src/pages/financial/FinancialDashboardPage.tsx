/**
 * FinancialDashboardPage - Financial overview and key metrics
 */
import { useState, useEffect, useCallback } from 'react';
import { Text, Badge, Button, SpeedometerIcon, RefreshIcon } from '../../components/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  Stack,
  HStack,
  Grid,
  GridItem,
  Flex,
  Box,
} from '../../components/layout';
import {
  FinancialSummaryCard,
  BudgetChart,
  CostBreakdownChart,
  InvoiceCard,
} from '../../components/domain/financial';
import { StatCard } from '../../components/domain/stats';
import { useFinancialSummary, useInvoices, useBudgets } from '../../hooks/useFinancial';
import { formatCurrency, formatCurrencyCompact } from '../../services/financialService';

export interface FinancialDashboardPageProps {
  onNavigate?: (section: string) => void;
}

export function FinancialDashboardPage({ onNavigate }: FinancialDashboardPageProps) {
  const { summary, isLoading: summaryLoading, error: summaryError, refresh: refreshSummary } = useFinancialSummary();
  const { invoices, isLoading: invoicesLoading, loadOverdueInvoices } = useInvoices();
  const { overBudgetItems, isLoading: budgetsLoading, refresh: refreshBudgets } = useBudgets();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadOverdueInvoices();
  }, [loadOverdueInvoices]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshSummary(), refreshBudgets(), loadOverdueInvoices()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSummary, refreshBudgets, loadOverdueInvoices]);

  const handleNavigateToInvoices = useCallback(() => {
    if (onNavigate !== undefined) {
      onNavigate('invoices');
    }
  }, [onNavigate]);

  const handleNavigateToBudgets = useCallback(() => {
    if (onNavigate !== undefined) {
      onNavigate('budgets');
    }
  }, [onNavigate]);

  const isLoading = summaryLoading || invoicesLoading || budgetsLoading;

  if (isLoading && summary === null) {
    return (
      <Section id="financial-dashboard">
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Text variant="body" color="muted">
            Loading financial data...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (summaryError !== null) {
    return (
      <Section id="financial-dashboard">
        <Box
          style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-danger-light)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-danger)',
          }}
        >
          <Text variant="body" color="danger">
            Error loading financial data: {summaryError.message}
          </Text>
        </Box>
      </Section>
    );
  }

  // Sample cost breakdown data (would come from API in real implementation)
  const costBreakdownData = [
    { category: 'Direct Labor', amount: 450000, color: 'var(--color-primary)' },
    { category: 'Subcontractor', amount: 280000, color: 'var(--color-info)' },
    { category: 'Materials', amount: 85000, color: 'var(--color-success)' },
    { category: 'Travel', amount: 35000, color: 'var(--color-warning)' },
    { category: 'ODC', amount: 25000, color: 'var(--color-secondary)' },
    { category: 'Indirect', amount: 125000, color: '#9333ea' },
  ];

  const totalCosts = costBreakdownData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Section id="financial-dashboard">
      <SectionHeader
        title="Financial Dashboard"
        icon={<SpeedometerIcon size="lg" />}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            <HStack spacing="var(--spacing-1)" align="center">
              <RefreshIcon size="sm" />
              <Text as="span" variant="bodySmall">
                Refresh
              </Text>
            </HStack>
          </Button>
        }
      />

      <Stack spacing="var(--spacing-6)">
        {/* Key Metrics */}
        {summary !== null && (
          <Grid columns="repeat(auto-fit, minmax(200px, 1fr))" gap="var(--spacing-4)">
            <GridItem>
              <StatCard
                variant="primary"
                value={formatCurrencyCompact(summary.totalInvoiced)}
                label="Total Invoiced"
              />
            </GridItem>
            <GridItem>
              <StatCard
                variant={summary.totalOutstanding > 0 ? 'warning' : 'success'}
                value={formatCurrencyCompact(summary.totalOutstanding)}
                label="Outstanding"
              />
            </GridItem>
            <GridItem>
              <StatCard
                variant="info"
                value={String(summary.draftInvoices)}
                label="Draft Invoices"
              />
            </GridItem>
            <GridItem>
              <StatCard
                variant={summary.overdueInvoices > 0 ? 'danger' : 'success'}
                value={String(summary.overdueInvoices)}
                label="Overdue Invoices"
              />
            </GridItem>
          </Grid>
        )}

        {/* Summary Card */}
        {summary !== null && <FinancialSummaryCard summary={summary} />}

        {/* Charts Row */}
        <Grid columns="1fr 1fr" gap="var(--spacing-4)">
          <GridItem>
            <BudgetChart
              budgeted={1500000}
              actual={850000}
              committed={250000}
              title="Overall Budget Status"
            />
          </GridItem>
          <GridItem>
            <CostBreakdownChart
              data={costBreakdownData}
              total={totalCosts}
              title="Cost Distribution"
            />
          </GridItem>
        </Grid>

        {/* Alerts Section */}
        <Grid columns="1fr 1fr" gap="var(--spacing-4)">
          {/* Overdue Invoices */}
          <GridItem>
            <Card variant="outlined">
              <CardHeader>
                <HStack justify="between" align="center">
                  <HStack spacing="var(--spacing-2)" align="center">
                    <Text variant="heading6" weight="semibold">
                      Overdue Invoices
                    </Text>
                    {invoices.length > 0 && (
                      <Badge variant="danger" size="sm">
                        {invoices.length}
                      </Badge>
                    )}
                  </HStack>
                  <Button variant="ghost" size="sm" onClick={handleNavigateToInvoices}>
                    View All
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                {invoices.length === 0 ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    className="p-4"
                  >
                    <Text variant="body" color="success">
                      No overdue invoices
                    </Text>
                  </Flex>
                ) : (
                  <Stack spacing="var(--spacing-3)">
                    {invoices.slice(0, 3).map((invoice) => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onView={() => handleNavigateToInvoices()}
                      />
                    ))}
                    {invoices.length > 3 && (
                      <Text variant="bodySmall" color="muted" style={{ textAlign: 'center' }}>
                        +{invoices.length - 3} more overdue invoices
                      </Text>
                    )}
                  </Stack>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Over Budget Items */}
          <GridItem>
            <Card variant="outlined">
              <CardHeader>
                <HStack justify="between" align="center">
                  <HStack spacing="var(--spacing-2)" align="center">
                    <Text variant="heading6" weight="semibold">
                      Over Budget Items
                    </Text>
                    {overBudgetItems.length > 0 && (
                      <Badge variant="danger" size="sm">
                        {overBudgetItems.length}
                      </Badge>
                    )}
                  </HStack>
                  <Button variant="ghost" size="sm" onClick={handleNavigateToBudgets}>
                    View All
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                {overBudgetItems.length === 0 ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    className="p-4"
                  >
                    <Text variant="body" color="success">
                      All budgets on track
                    </Text>
                  </Flex>
                ) : (
                  <Stack spacing="var(--spacing-3)">
                    {overBudgetItems.slice(0, 5).map((item) => (
                      <HStack key={item.id} justify="between" align="center">
                        <Stack spacing="0">
                          <Text variant="bodySmall" weight="medium">
                            {item.name}
                          </Text>
                          <Text variant="caption" color="muted">
                            {item.category}
                          </Text>
                        </Stack>
                        <Text variant="bodySmall" color="danger" weight="medium">
                          {formatCurrency(Math.abs(item.remainingBudget))} over
                        </Text>
                      </HStack>
                    ))}
                    {overBudgetItems.length > 5 && (
                      <Text variant="bodySmall" color="muted" style={{ textAlign: 'center' }}>
                        +{overBudgetItems.length - 5} more over-budget items
                      </Text>
                    )}
                  </Stack>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Stack>
    </Section>
  );
}

export default FinancialDashboardPage;
