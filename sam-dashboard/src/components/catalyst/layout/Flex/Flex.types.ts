import { HTMLAttributes, ReactNode } from 'react';

export type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '0';

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'space-between';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch' | 'flex-start' | 'flex-end';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: GapSize;
  children: ReactNode;
}
