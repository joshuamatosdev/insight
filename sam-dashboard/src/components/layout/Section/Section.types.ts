import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
