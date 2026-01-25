import { CSSProperties } from 'react';
import { StatCardProps, StatVariant } from './Stats.types';
import { Text } from '../../primitives';
import { HStack } from '../../layout';

const variantStyles: Record<StatVariant, CSSProperties> = {
  primary: { background: 'var(--gradient-primary)' },
  success: { background: 'var(--gradient-success)' },
  warning: { background: 'var(--gradient-warning)' },
  info: { background: 'var(--gradient-info)' },
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
    <div className={className} style={cardStyles}>
      <HStack justify="between" align="start">
        <div>
          <Text
            variant="heading1"
            color="white"
            style={{ fontSize: 'var(--font-size-5xl)', marginBottom: 'var(--spacing-1)' }}
          >
            {value}
          </Text>
          <Text variant="body" color="white" style={{ opacity: 0.9 }}>
            {label}
          </Text>
        </div>
        {icon && (
          <div style={{ opacity: 0.8 }}>{icon}</div>
        )}
      </HStack>
    </div>
  );
}

export default StatCard;
