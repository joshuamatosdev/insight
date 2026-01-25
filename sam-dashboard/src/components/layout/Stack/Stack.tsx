import { CSSProperties } from 'react';
import { StackProps } from './Stack.types';

const alignMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
};

export function Stack({
  spacing = 'var(--spacing-4)',
  align = 'stretch',
  className,
  style,
  children,
}: StackProps) {
  const stackStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: alignMap[align],
    gap: typeof spacing === 'number' ? `${spacing}px` : spacing,
    ...style,
  };

  return (
    <div className={className} style={stackStyles}>
      {children}
    </div>
  );
}

export default Stack;
