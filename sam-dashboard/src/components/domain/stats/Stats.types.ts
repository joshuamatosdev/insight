import { CSSProperties, ReactNode } from 'react';

export type StatVariant = 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'danger';

export interface StatCardProps {
  variant?: StatVariant;
  value: string | number;
  label: string;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface StatsGridProps {
  children: ReactNode;
  columns?: number;
}
