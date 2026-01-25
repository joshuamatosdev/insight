import { CSSProperties, ReactNode } from 'react';

export interface StackProps {
  spacing?: string | number;
  align?: 'start' | 'end' | 'center' | 'stretch';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface HStackProps extends StackProps {
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
}
