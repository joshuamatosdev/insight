import { ElementType, ComponentPropsWithoutRef } from 'react';
import {
  TextProps,
  TextVariant,
  TextWeight,
  TextColor,
  TEXT_ELEMENT_MAP,
} from './Text.types';

const variantStyles: Record<TextVariant, React.CSSProperties> = {
  heading1: {
    fontSize: '2.25rem',
    lineHeight: '1.25',
    fontWeight: 700,
  },
  heading2: {
    fontSize: '1.875rem',
    lineHeight: '1.25',
    fontWeight: 700,
  },
  heading3: {
    fontSize: '1.5rem',
    lineHeight: '1.25',
    fontWeight: 600,
  },
  heading4: {
    fontSize: '1.25rem',
    lineHeight: '1.25',
    fontWeight: 600,
  },
  heading5: {
    fontSize: '1.125rem',
    lineHeight: '1.25',
    fontWeight: 500,
  },
  heading6: {
    fontSize: '1rem',
    lineHeight: '1.25',
    fontWeight: 500,
  },
  body: {
    fontSize: '1rem',
    lineHeight: '1.5',
    fontWeight: 400,
  },
  bodySmall: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: '1.5',
    fontWeight: 400,
  },
  label: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    fontWeight: 500,
  },
};

const weightStyles: Record<TextWeight, React.CSSProperties> = {
  normal: { fontWeight: 400 },
  medium: { fontWeight: 500 },
  semibold: { fontWeight: 600 },
  bold: { fontWeight: 700 },
};

const colorStyles: Record<TextColor, React.CSSProperties> = {
  primary: { color: '#18181b' },
  secondary: { color: '#3f3f46' },
  muted: { color: '#52525b' },
  success: { color: '#10b981' },
  warning: { color: '#f59e0b' },
  danger: { color: '#ef4444' },
  info: { color: '#3b82f6' },
  white: { color: '#ffffff' },
  inherit: { color: 'inherit' },
};

export function Text<T extends ElementType = 'span'>({
  as,
  variant = 'body',
  weight,
  color = 'primary',
  align,
  truncate = false,
  className,
  style,
  children,
  ...rest
}: TextProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof TextProps<T>>) {
  const Component = as || TEXT_ELEMENT_MAP[variant];

  const combinedStyles: React.CSSProperties = {
    margin: 0,
    ...variantStyles[variant],
    ...(weight && weightStyles[weight]),
    ...colorStyles[color],
    ...(align && { textAlign: align }),
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    ...style,
  };

  return (
    <Component className={className} style={combinedStyles} {...rest}>
      {children}
    </Component>
  );
}

export default Text;
