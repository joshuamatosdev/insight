import {CSSProperties, ReactNode} from 'react';

export interface TableProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Whether to show striped rows */
  striped?: boolean;
  /** Whether to use dense padding */
  dense?: boolean;
  /** Whether to show grid lines */
  grid?: boolean;
  /** Whether to extend table to edge without padding */
  bleed?: boolean;
}

export interface TableHeadProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface TableBodyProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface TableRowProps {
  isHoverable?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Link destination for the row (makes entire row clickable) */
  href?: string;
  /** Link target (e.g., '_blank') */
  target?: string;
  /** Accessible title for the row link */
  title?: string;
}

export interface TableCellProps {
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Number of columns this cell should span */
  colSpan?: number;
  /** Number of rows this cell should span */
  rowSpan?: number;
}

export type TableHeaderCellProps = TableCellProps;
