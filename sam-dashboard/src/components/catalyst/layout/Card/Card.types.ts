import {HTMLAttributes, ReactNode} from 'react';

export type CardRole = 'article' | 'region' | 'group' | 'listitem' | 'none';
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'bordered' | 'default';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
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

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
  /** Whether to show a divider below the header */
  divider?: boolean;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
}

export interface CardFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  className?: string;
  children: ReactNode;
}
