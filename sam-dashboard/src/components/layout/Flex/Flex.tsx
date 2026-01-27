import clsx from 'clsx';
import { FlexProps } from './Flex.types';

const directionMap: Record<string, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

const justifyMap: Record<string, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const alignMap: Record<string, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

const wrapMap: Record<string, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const gapMap: Record<string, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function Flex({
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  wrap = 'nowrap',
  gap,
  className,
  children,
  ...rest
}: FlexProps) {
  const gapClass = gap !== undefined && gap !== null ? gapMap[gap] ?? '' : '';

  return (
    <div
      className={clsx(
        'flex',
        directionMap[direction],
        justifyMap[justify],
        alignMap[align],
        wrapMap[wrap],
        gapClass,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Flex;
