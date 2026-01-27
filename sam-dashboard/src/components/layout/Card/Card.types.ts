import { HTMLAttributes, ReactNode } from 'react';

export type CardRole = 'article' | 'region' | 'group' | 'listitem' | 'none';
export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
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
  children: ReactNode;
}

export interface CardBodyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
}

export interface CardFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  className?: string;
  children: ReactNode;
}
