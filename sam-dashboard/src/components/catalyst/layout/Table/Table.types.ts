import { CSSProperties, ReactNode } from 'react';

export interface TableProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
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
}

export interface TableCellProps {
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export type TableHeaderCellProps = TableCellProps;
