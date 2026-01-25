import { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface CardHeaderProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface CardBodyProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface CardFooterProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}
