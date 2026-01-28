import { CSSProperties, ReactNode } from 'react';
import { IconComponentProps, IconSize, IconColor } from './Icon.types';

const sizeMap: Record<IconSize, string> = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
};

const colorMap: Record<IconColor, string> = {
  inherit: 'currentColor',
  primary: '#2563eb',
  secondary: '#3f3f46',
  muted: '#71717a',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  white: '#ffffff',
};

interface IconPropsWithChildren extends Omit<IconComponentProps, 'paths'> {
  paths?: string[];
  children?: ReactNode;
}

export function Icon({
  size = 'md',
  color = 'inherit',
  className,
  style,
  viewBox = '0 0 16 16',
  paths,
  fillRule = 'nonzero',
  children,
  ...rest
}: IconPropsWithChildren) {
  const sizeValue = sizeMap[size];
  const colorValue = colorMap[color];
  const iconStyles: CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    fill: colorValue,
    flexShrink: 0,
    ...style,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={className}
      style={iconStyles}
      aria-hidden="true"
      {...rest}
    >
      {children !== undefined
        ? children
        : paths !== undefined
          ? paths.map((d, i) => (
              <path key={i} d={d} fillRule={fillRule} />
            ))
          : null}
    </svg>
  );
}

export default Icon;
