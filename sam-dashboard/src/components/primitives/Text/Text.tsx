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
    fontSize: 'var(--font-size-4xl)',
    lineHeight: 'var(--line-height-tight)',
    fontWeight: 'var(--font-weight-bold)' as unknown as number,
  },
  heading2: {
    fontSize: 'var(--font-size-3xl)',
    lineHeight: 'var(--line-height-tight)',
    fontWeight: 'var(--font-weight-bold)' as unknown as number,
  },
  heading3: {
    fontSize: 'var(--font-size-2xl)',
    lineHeight: 'var(--line-height-tight)',
    fontWeight: 'var(--font-weight-semibold)' as unknown as number,
  },
  heading4: {
    fontSize: 'var(--font-size-xl)',
    lineHeight: 'var(--line-height-tight)',
    fontWeight: 'var(--font-weight-semibold)' as unknown as number,
  },
  heading5: {
    fontSize: 'var(--font-size-lg)',
    lineHeight: 'var(--line-height-tight)',
    fontWeight: 'var(--font-weight-medium)' as unknown as number,
  },
  body: {
    fontSize: 'var(--font-size-base)',
    lineHeight: 'var(--line-height-normal)',
    fontWeight: 'var(--font-weight-normal)' as unknown as number,
  },
  bodySmall: {
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--line-height-normal)',
    fontWeight: 'var(--font-weight-normal)' as unknown as number,
  },
  caption: {
    fontSize: 'var(--font-size-xs)',
    lineHeight: 'var(--line-height-normal)',
    fontWeight: 'var(--font-weight-normal)' as unknown as number,
  },
  label: {
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--line-height-normal)',
    fontWeight: 'var(--font-weight-medium)' as unknown as number,
  },
};

const weightStyles: Record<TextWeight, React.CSSProperties> = {
  normal: { fontWeight: 'var(--font-weight-normal)' as unknown as number },
  medium: { fontWeight: 'var(--font-weight-medium)' as unknown as number },
  semibold: { fontWeight: 'var(--font-weight-semibold)' as unknown as number },
  bold: { fontWeight: 'var(--font-weight-bold)' as unknown as number },
};

const colorStyles: Record<TextColor, React.CSSProperties> = {
  primary: { color: 'var(--color-gray-900)' },
  secondary: { color: 'var(--color-gray-700)' },
  muted: { color: 'var(--color-gray-600)' },
  success: { color: 'var(--color-success)' },
  warning: { color: 'var(--color-warning)' },
  danger: { color: 'var(--color-danger)' },
  info: { color: 'var(--color-info)' },
  white: { color: 'var(--color-white)' },
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
