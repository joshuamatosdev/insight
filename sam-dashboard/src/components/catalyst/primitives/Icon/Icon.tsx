import {CSSProperties, ReactNode} from 'react';
import clsx from 'clsx';
import {IconComponentProps, IconSize} from './Icon.types';

const sizeMap: Record<IconSize, string> = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
};

/** Map of semantic color presets to Tailwind fill classes */
const colorClassMap: Record<string, string> = {
  inherit: 'fill-current',
  primary: 'fill-blue-600',
  secondary: 'fill-zinc-700',
  muted: 'fill-zinc-500',
  success: 'fill-emerald-500',
  warning: 'fill-amber-500',
  danger: 'fill-red-500',
  info: 'fill-blue-500',
  white: 'fill-white',
};

interface IconPropsWithChildren extends Omit<IconComponentProps, 'paths'> {
  paths?: string[];
  children?: ReactNode;
}

/**
 * Checks if a color value is a Tailwind class name (starts with text-, fill-, or other common prefixes)
 */
function isTailwindClass(color: string): boolean {
  return color.startsWith('text-') ||
         color.startsWith('fill-') ||
         color.startsWith('bg-') ||
         color.startsWith('stroke-');
}

export function Icon({
  size = 'md',
  color,
  className,
  style,
  viewBox = '0 0 16 16',
  paths,
  fillRule = 'nonzero',
  children,
  ...rest
}: IconPropsWithChildren) {
  const sizeValue = sizeMap[size];

  // Determine color class: use provided Tailwind class, mapped preset, or default to fill-current
  let colorClass = 'fill-current';
  if (color !== undefined) {
    if (isTailwindClass(color)) {
      // If it's a text-* class, convert to fill-* for SVG compatibility
      colorClass = color.startsWith('text-') ? color.replace('text-', 'fill-') : color;
    } else if (colorClassMap[color] !== undefined) {
      colorClass = colorClassMap[color];
    }
  }

  const iconStyles: CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    flexShrink: 0,
    ...style,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={clsx(colorClass, className)}
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
