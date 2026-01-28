import { HTMLAttributes, ReactNode } from 'react';

export type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between items (alias: spacing) */
  gap?: SpacingSize | number;
  /** @deprecated Use gap instead */
  spacing?: SpacingSize;
  align?: 'start' | 'end' | 'center' | 'stretch';
  children: ReactNode;
}

export interface HStackProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between items (alias: spacing) */
  gap?: SpacingSize | number;
  /** @deprecated Use gap instead */
  spacing?: SpacingSize;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  children: ReactNode;
}
