import clsx from 'clsx';
import { StackProps, HStackProps, SpacingSize } from './Stack.types';

const alignMap: Record<string, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyMap: Record<string, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
};

const spacingMap: Record<string, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

// Convert numeric gap to Tailwind class or style
function resolveGap(gap: SpacingSize | number | undefined, spacing: SpacingSize | undefined): { className?: string; style?: React.CSSProperties } {
  // gap takes priority over spacing
  const value = gap ?? spacing ?? 'md';

  if (typeof value === 'number') {
    // For numeric values, use inline style
    return { style: { gap: `${value * 0.25}rem` } };
  }

  return { className: spacingMap[value] };
}

export function Stack({
  gap,
  spacing = 'md',
  align = 'stretch',
  className,
  children,
  style,
  ...rest
}: StackProps) {
  const gapResolved = resolveGap(gap, spacing);

  return (
    <div
      className={clsx(
        'flex flex-col',
        alignMap[align],
        gapResolved.className,
        className
      )}
      style={{ ...style, ...gapResolved.style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function HStack({
  gap,
  spacing = 'md',
  justify = 'start',
  align = 'center',
  className,
  children,
  style,
  ...rest
}: HStackProps) {
  const gapResolved = resolveGap(gap, spacing);

  return (
    <div
      className={clsx(
        'flex flex-row',
        alignMap[align],
        justifyMap[justify],
        gapResolved.className,
        className
      )}
      style={{ ...style, ...gapResolved.style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Stack;
