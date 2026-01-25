import { CSSProperties } from 'react';
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
  primary: 'var(--color-primary)',
  secondary: 'var(--color-gray-700)',
  muted: 'var(--color-gray-500)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  white: 'var(--color-white)',
};

export function Icon({
  size = 'md',
  color = 'inherit',
  className,
  style,
  viewBox = '0 0 16 16',
  paths,
  fillRule = 'nonzero',
}: IconComponentProps) {
  const iconStyles: CSSProperties = {
    width: sizeMap[size],
    height: sizeMap[size],
    fill: colorMap[color],
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
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fillRule={fillRule} />
      ))}
    </svg>
  );
}

export default Icon;
