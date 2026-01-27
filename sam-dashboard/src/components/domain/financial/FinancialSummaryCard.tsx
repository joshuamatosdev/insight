/**
 * FinancialSummaryCard - Displays key financial metrics
 */
import { CSSProperties } from 'react';
import { Text, Badge } from '../../primitives';
import { Card, CardBody, Grid, GridItem, Stack, HStack, Box } from '../../layout';
import type { FinancialSummaryCardProps } from './Financial.types';
import { formatCurrency } from '../../../services/financialService';

export function FinancialSummaryCard({
  summary,
  className,
  style,
}: FinancialSummaryCardProps) {
  const metricCardStyle: CSSProperties = {
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-gray-50)',
  };

  return (
    <Card variant="elevated" className={className} style={style}>
      <CardBody padding="lg">
        <Stack spacing="var(--spacing-4)">
          <HStack justify="between" align="center">
            <Text variant="heading5" weight="semibold">
              Financial Overview
            </Text>
            {summary.overdueInvoices > 0 && (
              <Badge variant="danger" size="sm">
                {summary.overdueInvoices} Overdue
              </Badge>
            )}
          </HStack>

          <Grid columns="repeat(auto-fit, minmax(200px, 1fr))" gap="var(--spacing-4)">
            {/* Total Invoiced */}
            <GridItem>
              <Box style={metricCardStyle}>
                <Stack spacing="var(--spacing-1)">
                  <Text variant="caption" color="muted" weight="medium">
                    Total Invoiced
                  </Text>
                  <Text variant="heading4" weight="semibold" color="primary">
                    {formatCurrency(summary.totalInvoiced)}
                  </Text>
                </Stack>
              </Box>
            </GridItem>

            {/* Outstanding Balance */}
            <GridItem>
              <Box style={metricCardStyle}>
                <Stack spacing="var(--spacing-1)">
                  <Text variant="caption" color="muted" weight="medium">
                    Outstanding
                  </Text>
                  <Text
                    variant="heading4"
                    weight="semibold"
                    color={summary.totalOutstanding > 0 ? 'warning' : 'success'}
                  >
                    {formatCurrency(summary.totalOutstanding)}
                  </Text>
                </Stack>
              </Box>
            </GridItem>

            {/* Draft Invoices */}
            <GridItem>
              <Box style={metricCardStyle}>
                <Stack spacing="var(--spacing-1)">
                  <Text variant="caption" color="muted" weight="medium">
                    Draft Invoices
                  </Text>
                  <Text variant="heading4" weight="semibold">
                    {summary.draftInvoices}
                  </Text>
                </Stack>
              </Box>
            </GridItem>

            {/* Submitted Invoices */}
            <GridItem>
              <Box style={metricCardStyle}>
                <Stack spacing="var(--spacing-1)">
                  <Text variant="caption" color="muted" weight="medium">
                    Submitted
                  </Text>
                  <Text variant="heading4" weight="semibold" color="info">
                    {summary.submittedInvoices}
                  </Text>
                </Stack>
              </Box>
            </GridItem>
          </Grid>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default FinancialSummaryCard;
