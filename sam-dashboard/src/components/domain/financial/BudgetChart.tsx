/**
 * BudgetChart - Visual representation of budget vs actual spending
 */
import { CSSProperties } from 'react';
import { Text } from '../../primitives';
import { Card, CardBody, Stack, HStack, Box } from '../../layout';
import type { BudgetChartProps } from './Financial.types';
import { formatCurrency, formatPercentage } from '../../../services/financialService';

export function BudgetChart({
  budgeted,
  actual,
  committed,
  title = 'Budget Overview',
  className,
  style,
}: BudgetChartProps) {
  const totalSpent = actual + committed;
  const remaining = budgeted - totalSpent;
  const utilizationPercent = budgeted > 0 ? (totalSpent / budgeted) * 100 : 0;
  const actualPercent = budgeted > 0 ? (actual / budgeted) * 100 : 0;
  const committedPercent = budgeted > 0 ? (committed / budgeted) * 100 : 0;

  const chartContainerStyle: CSSProperties = {
    height: '24px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-gray-200)',
    overflow: 'hidden',
    display: 'flex',
  };

  const actualBarStyle: CSSProperties = {
    height: '100%',
    width: `${Math.min(actualPercent, 100)}%`,
    backgroundColor: 'var(--color-primary)',
    transition: 'width 0.3s ease',
  };

  const committedBarStyle: CSSProperties = {
    height: '100%',
    width: `${Math.min(committedPercent, 100 - actualPercent)}%`,
    backgroundColor: 'var(--color-warning)',
    transition: 'width 0.3s ease',
  };

  const legendItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  };

  const legendDotStyle = (color: string): CSSProperties => ({
    width: '12px',
    height: '12px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: color,
  });

  return (
    <Card variant="elevated" className={className} style={style}>
      <CardBody padding="lg">
        <Stack spacing="var(--spacing-4)">
          {/* Header */}
          <HStack justify="between" align="center">
            <Text variant="heading6" weight="semibold">
              {title}
            </Text>
            <Text
              variant="bodySmall"
              weight="medium"
              color={utilizationPercent >= 100 ? 'danger' : utilizationPercent >= 80 ? 'warning' : 'success'}
            >
              {formatPercentage(utilizationPercent)} used
            </Text>
          </HStack>

          {/* Chart */}
          <Box style={chartContainerStyle}>
            <Box style={actualBarStyle} />
            <Box style={committedBarStyle} />
          </Box>

          {/* Legend */}
          <HStack spacing="var(--spacing-4)" style={{ flexWrap: 'wrap' }}>
            <Box style={legendItemStyle}>
              <Box style={legendDotStyle('var(--color-primary)')} />
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Actual
                </Text>
                <Text variant="bodySmall" weight="medium">
                  {formatCurrency(actual)}
                </Text>
              </Stack>
            </Box>

            <Box style={legendItemStyle}>
              <Box style={legendDotStyle('var(--color-warning)')} />
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Committed
                </Text>
                <Text variant="bodySmall" weight="medium">
                  {formatCurrency(committed)}
                </Text>
              </Stack>
            </Box>

            <Box style={legendItemStyle}>
              <Box style={legendDotStyle('var(--color-gray-200)')} />
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Remaining
                </Text>
                <Text
                  variant="bodySmall"
                  weight="medium"
                  color={remaining < 0 ? 'danger' : undefined}
                >
                  {formatCurrency(remaining)}
                </Text>
              </Stack>
            </Box>
          </HStack>

          {/* Total Budget */}
          <HStack
            justify="between"
            style={{
              paddingTop: 'var(--spacing-3)',
              borderTop: '1px solid var(--color-gray-200)',
            }}
          >
            <Text variant="bodySmall" color="muted">
              Total Budget
            </Text>
            <Text variant="body" weight="semibold">
              {formatCurrency(budgeted)}
            </Text>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default BudgetChart;
