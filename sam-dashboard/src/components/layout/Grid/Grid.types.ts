import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  columns?: number | string;
  rows?: number | string;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface GridItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  colSpan?: number;
  rowSpan?: number;
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}
