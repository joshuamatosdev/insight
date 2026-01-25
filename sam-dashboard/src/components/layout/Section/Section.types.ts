import { CSSProperties, ReactNode } from 'react';

export interface SectionProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
