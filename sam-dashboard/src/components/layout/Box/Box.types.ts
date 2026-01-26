import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'span' | 'main' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
}
