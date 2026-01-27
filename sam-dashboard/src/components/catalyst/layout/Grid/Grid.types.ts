import { HTMLAttributes } from 'react';

// 1. Centralize your sizing types
export type Size = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';

// Allow custom strings (e.g. "10px") or numbers (e.g. 4) alongside your presets
export type ResponsiveSize = Size | string | number;

// 2. Create a shared interface for common styles
export interface BaseStyleProps {
  // --- Spacing ---
  margin?: ResponsiveSize;
  marginTop?: ResponsiveSize;
  marginRight?: ResponsiveSize;
  marginBottom?: ResponsiveSize;
  marginLeft?: ResponsiveSize;
  
  padding?: ResponsiveSize;
  paddingTop?: ResponsiveSize;
  paddingRight?: ResponsiveSize;
  paddingBottom?: ResponsiveSize;
  paddingLeft?: ResponsiveSize;
  
  // --- Borders ---
  borderRadius?: ResponsiveSize;
  borderWidth?: ResponsiveSize;
  borderStyle?: BorderStyle;
  borderColor?: string;

  // --- Layout Helpers (New) ---
  /** Sets width: 100% */
  fullWidth?: boolean;
  /** Sets height: 100% */
  fullHeight?: boolean;
}

// 3. Grid Props extends BaseStyleProps
export interface GridProps extends HTMLAttributes<HTMLDivElement>, BaseStyleProps {
  /** Number of columns (1-12) or CSS grid-template-columns value */
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | string | number; 
  /** Number of rows or CSS grid-template-rows value */
  rows?: number | string;
  
  gap?: ResponsiveSize;
  rowGap?: ResponsiveSize;
  columnGap?: ResponsiveSize;
}

// 4. GridItem Props extends BaseStyleProps
export interface GridItemProps extends HTMLAttributes<HTMLDivElement>, BaseStyleProps {
  colSpan?: number | "auto"; 
  rowSpan?: number | "auto";
  colStart?: number | "auto";
  colEnd?: number | "auto";
  rowStart?: number | "auto";
  rowEnd?: number | "auto";
}