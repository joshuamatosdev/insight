import { CSSProperties } from 'react';
import { BadgeProps, BadgeVariant, BadgeSize } from './Badge.types';

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
  },
  secondary: {
    backgroundColor: 'var(--color-gray-500)',
    color: 'var(--color-white)',
  },
  success: {
    backgroundColor: 'var(--color-success)',
    color: 'var(--color-white)',
  },
  warning: {
    backgroundColor: 'var(--color-warning)',
    color: 'var(--color-white)',
  },
  danger: {
    backgroundColor: 'var(--color-danger)',
    color: 'var(--color-white)',
  },
  info: {
    backgroundColor: 'var(--color-info)',
    color: 'var(--color-gray-900)',
  },
};

const sizeStyles: Record<BadgeSize, CSSProperties> = {
  sm: {
    padding: '0.2rem 0.5rem',
    fontSize: 'var(--font-size-xs)',
  },
  md: {
    padding: '0.35rem 0.75rem',
    fontSize: 'var(--font-size-sm)',
  },
  lg: {
    padding: '0.5rem 1rem',
    fontSize: 'var(--font-size-base)',
  },
};

export function Badge({
  variant = 'primary',
  size = 'md',
  pill = false,
  className,
  style,
  children,
  isLive = false,
  'aria-live': ariaLive,
  ...rest
}: BadgeProps) {
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'var(--font-weight-medium)' as unknown as number,
    lineHeight: 1,
    borderRadius: pill ? 'var(--radius-full)' : 'var(--radius-md)',
    whiteSpace: 'nowrap',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  // Determine role and aria-live based on props
  const role = isLive ? 'status' : undefined;
  const liveValue = isLive && ariaLive === undefined ? 'polite' : ariaLive;

  return (
    <span
      className={className}
      style={baseStyles}
      role={role}
      aria-live={liveValue}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Badge;
