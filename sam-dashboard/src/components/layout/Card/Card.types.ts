import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type CardRole = 'article' | 'region' | 'group' | 'listitem' | 'none';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Semantic role for the card (default: 'article' for standalone content) */
  as?: CardRole;
  /** Accessible label for region role */
  'aria-label'?: string;
  /** ID of element labelling this card for region role */
  'aria-labelledby'?: string;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface CardBodyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface CardFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}
