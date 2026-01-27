import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Accessible label for the section */
  'aria-label'?: string;
  /** ID of element labelling this section */
  'aria-labelledby'?: string;
}

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** ID for the header (used for aria-labelledby) */
  id?: string;
}
