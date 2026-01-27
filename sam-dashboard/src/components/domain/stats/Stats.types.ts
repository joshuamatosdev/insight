import { ReactNode } from 'react';

export type StatChangeType = 'positive' | 'negative' | 'neutral';

export interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  change?: {
    value: string;
    type: StatChangeType;
  };
  className?: string;
}

export interface StatsGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}
