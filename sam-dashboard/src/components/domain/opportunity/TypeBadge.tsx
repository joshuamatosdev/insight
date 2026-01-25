import { CSSProperties } from 'react';
import { OpportunityType } from './Opportunity.types';

interface TypeBadgeProps {
  type: OpportunityType;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const typeStyles: Record<OpportunityType, CSSProperties> = {
  'sources-sought': {
    backgroundColor: 'var(--color-info-light)',
    color: '#1565c0',
  },
  presolicitation: {
    backgroundColor: 'var(--color-warning-light)',
    color: '#e65100',
  },
  solicitation: {
    backgroundColor: 'var(--color-success-light)',
    color: '#2e7d32',
  },
  other: {
    backgroundColor: 'var(--color-gray-200)',
    color: 'var(--color-gray-700)',
  },
};

export function TypeBadge({ type, label, className, style }: TypeBadgeProps) {
  const badgeStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-medium)' as unknown as number,
    whiteSpace: 'nowrap',
    ...typeStyles[type],
    ...style,
  };

  const displayLabel = label || type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span className={className} style={badgeStyles}>
      {displayLabel}
    </span>
  );
}

export default TypeBadge;
