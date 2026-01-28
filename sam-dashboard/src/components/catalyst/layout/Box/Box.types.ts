import { CSSProperties, FormEvent, HTMLAttributes, ReactNode } from 'react';

export interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'span' | 'main' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'nav' | 'form';
  /** Form-specific: onSubmit handler when as="form" */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}
