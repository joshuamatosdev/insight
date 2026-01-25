import { CSSProperties } from 'react';

interface NAICSBadgeProps {
  code: string | undefined;
  className?: string;
  style?: CSSProperties;
}

export function NAICSBadge({ code, className, style }: NAICSBadgeProps) {
  const badgeStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'var(--gradient-primary)',
    color: 'var(--color-white)',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-medium)' as unknown as number,
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <span className={className} style={badgeStyles}>
      {code || 'N/A'}
    </span>
  );
}

export default NAICSBadge;
