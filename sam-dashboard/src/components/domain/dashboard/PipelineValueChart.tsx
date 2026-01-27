import { useMemo } from 'react';
import { Card, CardBody, CardHeader, Stack, Flex, Box } from '../../../components/layout';
import { Text } from '../../../components/primitives';

interface PipelineStage {
  name: string;
  value: number;
  count: number;
  color: string;
}

interface PipelineValueChartProps {
  data: PipelineStage[];
  totalValue: number;
}

/**
 * Pipeline value chart showing opportunity funnel by stage
 */
export function PipelineValueChart({
  data,
  totalValue,
}: PipelineValueChartProps): React.ReactElement {
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Text variant="heading5">Pipeline Value</Text>
          <Text variant="heading4" color="primary">
            {formatCurrency(totalValue)}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack spacing="var(--spacing-3)">
          {data.map((stage) => (
            <Stack key={stage.name} spacing="var(--spacing-1)">
              <Flex justify="space-between">
                <Text variant="body">{stage.name}</Text>
                <Text variant="body" style={{ fontWeight: 600 }}>
                  {formatCurrency(stage.value)}
                </Text>
              </Flex>
              <Box
                style={{
                  height: '8px',
                  backgroundColor: 'var(--color-gray-200)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    height: '100%',
                    width: `${(stage.value / maxValue) * 100}%`,
                    backgroundColor: stage.color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
              <Text variant="caption" color="muted">
                {stage.count} opportunities
              </Text>
            </Stack>
          ))}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default PipelineValueChart;
