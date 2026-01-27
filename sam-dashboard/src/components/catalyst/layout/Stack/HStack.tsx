import { CSSProperties } from 'react';
import { HStackProps } from './Stack.types';

const alignMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
};

const justifyMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
};

export function HStack({
  spacing = '1rem',
  align = 'center',
  justify = 'start',
  className,
  style,
  children,
  ...rest
}: HStackProps) {
  const stackStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: alignMap[align],
    justifyContent: justifyMap[justify],
    gap: typeof spacing === 'number' ? `${spacing}px` : spacing,
    ...style,
  };

  return (
    <div className={className} style={stackStyles} {...rest}>
      {children}
    </div>
  );
}

export default HStack;
