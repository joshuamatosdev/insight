import { CSSProperties } from 'react';
import { FlexProps } from './Flex.types';

const justifyMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

const alignMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
  stretch: 'stretch',
};

export function Flex({
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  wrap = 'nowrap',
  gap,
  className,
  style,
  children,
}: FlexProps) {
  const flexStyles: CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justifyMap[justify],
    alignItems: alignMap[align],
    flexWrap: wrap,
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    ...style,
  };

  return (
    <div className={className} style={flexStyles}>
      {children}
    </div>
  );
}

export default Flex;
