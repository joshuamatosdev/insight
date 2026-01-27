import { CSSProperties } from 'react';
import { BadgeProps, BadgeVariant, BadgeSize } from './Badge.types';

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#71717a',
    color: '#ffffff',
  },
  success: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  warning: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
  },
  danger: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
  info: {
    backgroundColor: '#3b82f6',
    color: '#18181b',
  },
};

const sizeStyles: Record<BadgeSize, CSSProperties> = {
  sm: {
    padding: '0.2rem 0.5rem',
    fontSize: '0.75rem',
  },
  md: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.875rem',
  },
  lg: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
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
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: pill ? '9999px' : '0.375rem',
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
