import { HTMLAttributes, ReactNode } from 'react';

export type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: SpacingSize;
  align?: 'start' | 'end' | 'center' | 'stretch';
  children: ReactNode;
}

export interface HStackProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: SpacingSize;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  children: ReactNode;
}
