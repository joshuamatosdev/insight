import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Whether this badge represents a live status update */
  isLive?: boolean;
  /** ARIA live politeness for status badges */
  'aria-live'?: 'polite' | 'assertive' | 'off';
}
