import { useMemo, CSSProperties } from 'react';
import { Text, Badge } from '../../primitives';
import { Box, Stack, HStack, Grid, Card, CardHeader, CardBody } from '../../layout';
import type { ContractValueChartProps } from './Contract.types';
import { formatCurrency, formatDate, getContractStatusLabel } from './Contract.types';
import { ContractStatusBadge } from './ContractStatusBadge';

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  label: string;
}

function ProgressBar({ value, max, color, label }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <Box>
      <HStack justify="between" style={{ marginBottom: 'var(--spacing-1)' }}>
        <Text variant="bodySmall">{label}</Text>
        <Text variant="bodySmall" weight="semibold">
          {percentage.toFixed(1)}%
        </Text>
      </HStack>
      <Box
        style={{
          height: '8px',
          backgroundColor: 'var(--color-gray-200)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
    </Box>
  );
}

export function ContractValueChart({
  summary,
  className,
  style,
}: ContractValueChartProps) {
  const totalValue = summary.totalValue ?? 0;
  const fundedValue = summary.fundedValue ?? 0;
  const clinFundedAmount = summary.clinFundedAmount;
  const clinInvoicedAmount = summary.clinInvoicedAmount;
  const remainingFunds = summary.remainingFunds;

  const fundingPercentage = useMemo(() => {
    if (totalValue === 0) {
      return 0;
    }
    return (fundedValue / totalValue) * 100;
  }, [totalValue, fundedValue]);

  const burnRate = useMemo(() => {
    if (clinFundedAmount === 0) {
      return 0;
    }
    return (clinInvoicedAmount / clinFundedAmount) * 100;
  }, [clinFundedAmount, clinInvoicedAmount]);

  const chartStyles: CSSProperties = {
    ...style,
  };

  return (
    <Stack spacing="var(--spacing-4)" className={className} style={chartStyles}>
      <Card>
        <CardHeader>
          <HStack justify="between" align="center">
            <Text variant="heading5">Contract Overview</Text>
            <ContractStatusBadge status={summary.status} />
          </HStack>
        </CardHeader>
        <CardBody>
          <Grid columns={3} gap="var(--spacing-6)">
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                Total Value
              </Text>
              <Text variant="heading4" weight="semibold">
                {formatCurrency(totalValue)}
              </Text>
            </Stack>
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                Funded Value
              </Text>
              <Text variant="heading4" weight="semibold">
                {formatCurrency(fundedValue)}
              </Text>
              <Text variant="caption" color="muted">
                {fundingPercentage.toFixed(1)}% of total
              </Text>
            </Stack>
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                Period of Performance
              </Text>
              <Text variant="body" weight="semibold">
                {formatDate(summary.popStartDate)} - {formatDate(summary.popEndDate)}
              </Text>
            </Stack>
          </Grid>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Text variant="heading5">Financial Status</Text>
        </CardHeader>
        <CardBody>
          <Grid columns={4} gap="var(--spacing-4)">
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                CLIN Total Value
              </Text>
              <Text variant="heading5" weight="semibold">
                {formatCurrency(summary.clinTotalValue)}
              </Text>
            </Stack>
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                CLIN Funded
              </Text>
              <Text variant="heading5" weight="semibold">
                {formatCurrency(clinFundedAmount)}
              </Text>
            </Stack>
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                CLIN Invoiced
              </Text>
              <Text variant="heading5" weight="semibold">
                {formatCurrency(clinInvoicedAmount)}
              </Text>
            </Stack>
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                Remaining Funds
              </Text>
              <Text
                variant="heading5"
                weight="semibold"
                color={remainingFunds < 0 ? 'danger' : 'success'}
              >
                {formatCurrency(remainingFunds)}
              </Text>
            </Stack>
          </Grid>

          <Box style={{ marginTop: 'var(--spacing-6)' }}>
            <Stack spacing="var(--spacing-4)">
              <ProgressBar
                value={fundedValue}
                max={totalValue}
                color="var(--color-primary)"
                label="Funding Progress"
              />
              <ProgressBar
                value={clinInvoicedAmount}
                max={clinFundedAmount}
                color={burnRate > 90 ? 'var(--color-danger)' : 'var(--color-success)'}
                label="Burn Rate"
              />
            </Stack>
          </Box>
        </CardBody>
      </Card>

      <Grid columns={2} gap="var(--spacing-4)">
        <Card>
          <CardHeader>
            <Text variant="heading5">Modifications</Text>
          </CardHeader>
          <CardBody>
            <Grid columns={2} gap="var(--spacing-4)">
              <Stack spacing="var(--spacing-1)">
                <Text variant="caption" color="muted">
                  Total Modifications
                </Text>
                <Text variant="heading4" weight="semibold">
                  {summary.modificationCount}
                </Text>
              </Stack>
              <Stack spacing="var(--spacing-1)">
                <Text variant="caption" color="muted">
                  Pending
                </Text>
                <HStack spacing="var(--spacing-2)" align="center">
                  <Text variant="heading4" weight="semibold">
                    {summary.pendingModifications}
                  </Text>
                  {summary.pendingModifications > 0 && (
                    <Badge variant="warning" size="sm">
                      Action Needed
                    </Badge>
                  )}
                </HStack>
              </Stack>
            </Grid>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Text variant="heading5">Options</Text>
          </CardHeader>
          <CardBody>
            <Grid columns={2} gap="var(--spacing-4)">
              <Stack spacing="var(--spacing-1)">
                <Text variant="caption" color="muted">
                  Pending Options
                </Text>
                <Text variant="heading4" weight="semibold">
                  {summary.pendingOptions}
                </Text>
              </Stack>
              <Stack spacing="var(--spacing-1)">
                <Text variant="caption" color="muted">
                  Potential Value
                </Text>
                <Text variant="heading5" weight="semibold">
                  {formatCurrency(summary.pendingOptionValue)}
                </Text>
              </Stack>
            </Grid>
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <Text variant="heading5">Deliverables</Text>
        </CardHeader>
        <CardBody>
          <Grid columns={2} gap="var(--spacing-4)">
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                Pending Deliverables
              </Text>
              <Text variant="heading4" weight="semibold">
                {summary.pendingDeliverables}
              </Text>
            </Stack>
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                Overdue
              </Text>
              <HStack spacing="var(--spacing-2)" align="center">
                <Text
                  variant="heading4"
                  weight="semibold"
                  color={summary.overdueDeliverables > 0 ? 'danger' : undefined}
                >
                  {summary.overdueDeliverables}
                </Text>
                {summary.overdueDeliverables > 0 && (
                  <Badge variant="danger" size="sm">
                    Attention Required
                  </Badge>
                )}
              </HStack>
            </Stack>
          </Grid>
        </CardBody>
      </Card>
    </Stack>
  );
}

export default ContractValueChart;
