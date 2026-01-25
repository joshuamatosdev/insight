import { CSSProperties, ReactNode } from 'react';

export type StatVariant = 'primary' | 'success' | 'warning' | 'info';

export interface StatCardProps {
  variant?: StatVariant;
  value: string | number;
  label: string;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
