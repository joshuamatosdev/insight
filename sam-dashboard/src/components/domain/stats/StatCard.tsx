import { CSSProperties } from 'react';
import { StatCardProps, StatVariant } from './Stats.types';
import { Text } from '../../primitives';
import { HStack, Box, Stack } from '../../layout';

const variantStyles: Record<StatVariant, CSSProperties> = {
  primary: { background: 'var(--gradient-primary)' },
  success: { background: 'var(--gradient-success)' },
  warning: { background: 'var(--gradient-warning)' },
  info: { background: 'var(--gradient-info)' },
  secondary: { background: 'var(--gradient-secondary, linear-gradient(135deg, #6b7280 0%, #4b5563 100%))' },
  danger: { background: 'var(--gradient-danger, linear-gradient(135deg, #ef4444 0%, #dc2626 100%))' },
};

export function StatCard({ variant = 'primary', value, label, icon, className, style }: StatCardProps) {
  const cardStyles: CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-6)',
    color: 'var(--color-white)',
    ...variantStyles[variant],
    ...style,
  };

  return (
    <Box className={className} style={cardStyles}>
      <HStack justify="between" align="start">
        <Stack spacing="var(--spacing-1)">
          <Text
            variant="heading1"
            color="white"
            style={{ fontSize: 'var(--font-size-5xl)' }}
          >
            {value}
          </Text>
          <Text variant="body" color="white" style={{ opacity: 0.9 }}>
            {label}
          </Text>
        </Stack>
        {icon && (
          <Box style={{ opacity: 0.8 }}>{icon}</Box>
        )}
      </HStack>
    </Box>
  );
}

export default StatCard;
