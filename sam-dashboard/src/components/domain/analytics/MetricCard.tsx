import { CSSProperties } from 'react';
import { MetricCardProps } from './Analytics.types';
import { Text } from '../../primitives';
import { HStack, Box, Stack } from '../../layout';
import { getChangeColor, formatChangePercent } from '../../../types/analytics.types';

const variantStyles: Record<string, CSSProperties> = {
  primary: { background: 'var(--gradient-primary)' },
  success: { background: 'var(--gradient-success)' },
  warning: { background: 'var(--gradient-warning)' },
  info: { background: 'var(--gradient-info)' },
  secondary: {
    background: 'var(--gradient-secondary, linear-gradient(135deg, #6b7280 0%, #4b5563 100%))',
  },
  danger: {
    background: 'var(--gradient-danger, linear-gradient(135deg, #ef4444 0%, #dc2626 100%))',
  },
};

/**
 * MetricCard displays a single metric with optional change indicator.
 */
export function MetricCard({
  title,
  value,
  previousValue,
  changePercent,
  icon,
  variant = 'primary',
  loading = false,
  className,
  style,
}: MetricCardProps) {
  const cardStyles: CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-6)',
    color: 'var(--color-white)',
    minWidth: '200px',
    ...variantStyles[variant],
    ...style,
  };

  const showChange = changePercent !== undefined && changePercent !== null;

  if (loading) {
    return (
      <Box className={className} style={cardStyles}>
        <Stack spacing="var(--spacing-2)">
          <Box
            style={{
              width: '60%',
              height: '16px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <Box
            style={{
              width: '40%',
              height: '32px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Box className={className} style={cardStyles}>
      <HStack justify="between" align="start">
        <Stack spacing="var(--spacing-1)">
          <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
            {title}
          </Text>
          <Text
            variant="heading1"
            color="white"
            style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
          {showChange && (
            <HStack spacing="var(--spacing-2)" align="center">
              <Text
                variant="caption"
                style={{
                  color: getChangeColor(changePercent),
                  fontWeight: 600,
                }}
              >
                {formatChangePercent(changePercent)}
              </Text>
              {previousValue !== undefined && previousValue !== null && (
                <Text variant="caption" color="white" style={{ opacity: 0.7 }}>
                  vs {previousValue.toLocaleString()}
                </Text>
              )}
            </HStack>
          )}
        </Stack>
        {icon !== undefined && icon !== null && (
          <Box style={{ opacity: 0.8 }}>{icon}</Box>
        )}
      </HStack>
    </Box>
  );
}

export default MetricCard;
