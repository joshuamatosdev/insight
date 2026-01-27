import { Card, CardBody, Flex, Stack, Box } from '../../../components/layout';
import { Text } from '../../../components/primitives';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

/**
 * Quick stats card for key metrics
 */
export function QuickStatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'primary',
}: QuickStatsCardProps): React.ReactElement {
  const getColorValue = (): string => {
    switch (color) {
      case 'primary':
        return 'var(--color-primary)';
      case 'success':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      case 'danger':
        return 'var(--color-danger)';
    }
  };

  const getChangeColor = (): string => {
    if (change === undefined) {
      return 'var(--color-gray-500)';
    }
    if (change > 0) {
      return 'var(--color-success)';
    }
    if (change < 0) {
      return 'var(--color-danger)';
    }
    return 'var(--color-gray-500)';
  };

  const formatChange = (): string => {
    if (change === undefined) {
      return '';
    }
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <Card>
      <CardBody>
        <Flex justify="space-between" align="flex-start">
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">
              {title}
            </Text>
            <Text variant="heading3" style={{ color: getColorValue() }}>
              {value}
            </Text>
            {(change !== undefined || changeLabel !== undefined) && (
              <Flex align="center" gap="xs">
                {change !== undefined && (
                  <Text
                    variant="caption"
                    style={{
                      color: getChangeColor(),
                      fontWeight: 600,
                    }}
                  >
                    {formatChange()}
                  </Text>
                )}
                {changeLabel !== undefined && (
                  <Text variant="caption" color="muted">
                    {changeLabel}
                  </Text>
                )}
              </Flex>
            )}
          </Stack>
          {icon !== undefined && (
            <Box
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: `${getColorValue()}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getColorValue(),
              }}
            >
              {icon}
            </Box>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
}

export default QuickStatsCard;
