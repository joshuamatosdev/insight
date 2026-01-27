import { ReactNode, ElementType, CSSProperties } from 'react';

export type TextVariant =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'white'
  | 'inherit';

export type TextAlign = 'left' | 'center' | 'right';

export interface TextProps<T extends ElementType = 'span'> {
  as?: T;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  truncate?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export const TEXT_ELEMENT_MAP: Record<TextVariant, ElementType> = {
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  heading4: 'h4',
  heading5: 'h5',
  heading6: 'h6',
  body: 'p',
  bodySmall: 'p',
  caption: 'span',
  label: 'label',
};
