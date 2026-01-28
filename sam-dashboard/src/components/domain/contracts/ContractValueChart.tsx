import { useMemo, CSSProperties } from 'react';
import { Text, Badge } from '../../catalyst/primitives';
import { Box, Stack, HStack, Grid, Card, CardHeader, CardBody } from '../../catalyst/layout';
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
      <HStack justify="between" className="mb-1">
        <Text variant="bodySmall">{label}</Text>
        <Text variant="bodySmall" weight="semibold">
          {percentage.toFixed(1)}%
        </Text>
      </HStack>
      <Box
        style={{
          height: '8px',
          backgroundColor: '#e4e4e7',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: '9999px',
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
    <Stack spacing="md" className={className} style={chartStyles}>
      <Card>
        <CardHeader>
          <HStack justify="between" align="center">
            <Text variant="heading5">Contract Overview</Text>
            <ContractStatusBadge status={summary.status} />
          </HStack>
        </CardHeader>
        <CardBody>
          <Grid columns={3} gap="lg">
            <Stack spacing="xs">
              <Text variant="caption" color="muted">
                Total Value
              </Text>
              <Text variant="heading4" weight="semibold">
                {formatCurrency(totalValue)}
              </Text>
            </Stack>
            <Stack spacing="xs">
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
            <Stack spacing="xs">
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
          <Grid columns={4} gap="md">
            <Stack spacing="xs">
              <Text variant="caption" color="muted">
                CLIN Total Value
              </Text>
              <Text variant="heading5" weight="semibold">
                {formatCurrency(summary.clinTotalValue)}
              </Text>
            </Stack>
            <Stack spacing="xs">
              <Text variant="caption" color="muted">
                CLIN Funded
              </Text>
              <Text variant="heading5" weight="semibold">
                {formatCurrency(clinFundedAmount)}
              </Text>
            </Stack>
            <Stack spacing="xs">
              <Text variant="caption" color="muted">
                CLIN Invoiced
              </Text>
              <Text variant="heading5" weight="semibold">
                {formatCurrency(clinInvoicedAmount)}
              </Text>
            </Stack>
            <Stack spacing="xs">
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

          <Box className="mt-6">
            <Stack spacing="md">
              <ProgressBar
                value={fundedValue}
                max={totalValue}
                color="#2563eb"
                label="Funding Progress"
              />
              <ProgressBar
                value={clinInvoicedAmount}
                max={clinFundedAmount}
                color={burnRate > 90 ? '#ef4444' : '#10b981'}
                label="Burn Rate"
              />
            </Stack>
          </Box>
        </CardBody>
      </Card>

      <Grid columns={2} gap="md">
        <Card>
          <CardHeader>
            <Text variant="heading5">Modifications</Text>
          </CardHeader>
          <CardBody>
            <Grid columns={2} gap="md">
              <Stack spacing="xs">
                <Text variant="caption" color="muted">
                  Total Modifications
                </Text>
                <Text variant="heading4" weight="semibold">
                  {summary.modificationCount}
                </Text>
              </Stack>
              <Stack spacing="xs">
                <Text variant="caption" color="muted">
                  Pending
                </Text>
                <HStack spacing="sm" align="center">
                  <Text variant="heading4" weight="semibold">
                    {summary.pendingModifications}
                  </Text>
                  {summary.pendingModifications > 0 && (
                    <Badge color="amber">
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
            <Grid columns={2} gap="md">
              <Stack spacing="xs">
                <Text variant="caption" color="muted">
                  Pending Options
                </Text>
                <Text variant="heading4" weight="semibold">
                  {summary.pendingOptions}
                </Text>
              </Stack>
              <Stack spacing="xs">
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
          <Grid columns={2} gap="md">
            <Stack spacing="xs">
              <Text variant="caption" color="muted">
                Pending Deliverables
              </Text>
              <Text variant="heading4" weight="semibold">
                {summary.pendingDeliverables}
              </Text>
            </Stack>
            <Stack spacing="xs">
              <Text variant="caption" color="muted">
                Overdue
              </Text>
              <HStack spacing="sm" align="center">
                <Text
                  variant="heading4"
                  weight="semibold"
                  color={summary.overdueDeliverables > 0 ? 'danger' : undefined}
                >
                  {summary.overdueDeliverables}
                </Text>
                {summary.overdueDeliverables > 0 && (
                  <Badge color="red">
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
