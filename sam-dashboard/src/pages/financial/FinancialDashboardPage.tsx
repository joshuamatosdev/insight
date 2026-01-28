/**
 * FinancialDashboardPage - Financial overview and key metrics
 */
import { useState, useEffect, useCallback } from 'react';
import { Text, Badge, Button, SpeedometerIcon, RefreshIcon } from '@/components/catalyst/primitives';
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
} from '@/components/catalyst/layout';
import {
  FinancialSummaryCard,
  BudgetChart,
  CostBreakdownChart,
  InvoiceCard,
} from '@/components/domain/financial';
import { StatCard } from '@/components/domain/stats';
import { useFinancialSummary, useInvoices, useBudgets } from '@/hooks/useFinancial';
import { formatCurrency, formatCurrencyCompact } from '@/services/financialService';

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
            padding: '1rem',
            backgroundColor: '#fef2f2',
            borderRadius: '0.375rem',
            border: '1px solid #ef4444',
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
    { category: 'Direct Labor', amount: 450000, color: 'rgb(37 99 235)' },
    { category: 'Subcontractor', amount: 280000, color: '#3b82f6' },
    { category: 'Materials', amount: 85000, color: 'rgb(16 185 129)' },
    { category: 'Travel', amount: 35000, color: 'rgb(245 158 11)' },
    { category: 'ODC', amount: 25000, color: '#71717a' },
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
            <HStack spacing="xs" align="center">
              <RefreshIcon size="sm" />
              <Text as="span" variant="bodySmall">
                Refresh
              </Text>
            </HStack>
          </Button>
        }
      />

      <Stack spacing="lg">
        {/* Key Metrics */}
        {summary !== null && (
          <Grid columns={4} gap="md">
            <GridItem>
              <StatCard
                value={formatCurrencyCompact(summary.totalInvoiced)}
                label="Total Invoiced"
              />
            </GridItem>
            <GridItem>
              <StatCard
                value={formatCurrencyCompact(summary.totalOutstanding)}
                label="Outstanding"
              />
            </GridItem>
            <GridItem>
              <StatCard
                value={String(summary.draftInvoices)}
                label="Draft Invoices"
              />
            </GridItem>
            <GridItem>
              <StatCard
                value={String(summary.overdueInvoices)}
                label="Overdue Invoices"
              />
            </GridItem>
          </Grid>
        )}

        {/* Summary Card */}
        {summary !== null && <FinancialSummaryCard summary={summary} />}

        {/* Charts Row */}
        <Grid columns={2} gap="md">
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
        <Grid columns={2} gap="md">
          {/* Overdue Invoices */}
          <GridItem>
            <Card variant="outlined">
              <CardHeader>
                <HStack justify="between" align="center">
                  <HStack spacing="sm" align="center">
                    <Text variant="heading6" weight="semibold">
                      Overdue Invoices
                    </Text>
                    {invoices.length > 0 && (
                      <Badge color="red">
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
                  <Stack spacing="md">
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
                  <HStack spacing="sm" align="center">
                    <Text variant="heading6" weight="semibold">
                      Over Budget Items
                    </Text>
                    {overBudgetItems.length > 0 && (
                      <Badge color="red">
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
                  <Stack spacing="md">
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
