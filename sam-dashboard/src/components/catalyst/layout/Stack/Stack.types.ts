import {HTMLAttributes, ReactNode} from 'react';

export type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '0';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between items (alias: spacing) */
  gap?: SpacingSize | number;
  /** @deprecated Use gap instead */
  spacing?: SpacingSize;
  align?: 'start' | 'end' | 'center' | 'stretch' | 'flex-start' | 'flex-end';
  children: ReactNode;
}

export interface HStackProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between items (alias: spacing) */
  gap?: SpacingSize | number;
  /** @deprecated Use gap instead */
  spacing?: SpacingSize;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'space-between';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch' | 'flex-start' | 'flex-end';
  /** Whether to wrap items */
  wrap?: boolean | string;
  children: ReactNode;
}
