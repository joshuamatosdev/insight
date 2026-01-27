/**
 * CostBreakdownChart - Visual breakdown of costs by category
 */
import { CSSProperties } from 'react';
import { Text } from '../../primitives';
import { Card, CardBody, Stack, HStack, Box, Grid, GridItem } from '../../layout';
import type { CostBreakdownChartProps } from './Financial.types';
import { formatCurrency, formatPercentage } from '../../../services/financialService';

export function CostBreakdownChart({
  data,
  total,
  title = 'Cost Breakdown',
  className,
  style,
}: CostBreakdownChartProps) {
  // Sort data by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  const barContainerStyle: CSSProperties = {
    display: 'flex',
    height: '32px',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-gray-100)',
  };

  return (
    <Card variant="elevated" className={className} style={style}>
      <CardBody padding="lg">
        <Stack spacing="var(--spacing-4)">
          {/* Header */}
          <HStack justify="between" align="center">
            <Text variant="heading6" weight="semibold">
              {title}
            </Text>
            <Text variant="body" weight="semibold">
              {formatCurrency(total)}
            </Text>
          </HStack>

          {/* Stacked Bar Chart */}
          <Box style={barContainerStyle}>
            {sortedData.map((item) => {
              const widthPercent = total > 0 ? (item.amount / total) * 100 : 0;
              if (widthPercent < 0.5) return null; // Skip very small segments

              return (
                <Box
                  key={item.category}
                  style={{
                    width: `${widthPercent}%`,
                    height: '100%',
                    backgroundColor: item.color,
                    transition: 'width 0.3s ease',
                  }}
                  title={`${item.category}: ${formatCurrency(item.amount)}`}
                />
              );
            })}
          </Box>

          {/* Legend Grid */}
          <Grid
            columns="repeat(auto-fill, minmax(180px, 1fr))"
            gap="var(--spacing-3)"
          >
            {sortedData.map((item) => {
              const percent = total > 0 ? (item.amount / total) * 100 : 0;

              return (
                <GridItem key={item.category}>
                  <HStack spacing="var(--spacing-2)" align="center">
                    <Box
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Stack spacing="0" style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        variant="caption"
                        color="muted"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.category}
                      </Text>
                      <HStack justify="between">
                        <Text variant="bodySmall" weight="medium">
                          {formatCurrency(item.amount)}
                        </Text>
                        <Text variant="caption" color="muted">
                          {formatPercentage(percent)}
                        </Text>
                      </HStack>
                    </Stack>
                  </HStack>
                </GridItem>
              );
            })}
          </Grid>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default CostBreakdownChart;
