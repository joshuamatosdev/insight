import clsx from 'clsx';
import { StackProps, HStackProps } from './Stack.types';

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

export function Stack({
  spacing = 'md',
  align = 'stretch',
  className,
  children,
  ...rest
}: StackProps) {
  return (
    <div
      className={clsx(
        'flex flex-col',
        alignMap[align],
        spacingMap[spacing],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function HStack({
  spacing = 'md',
  justify = 'start',
  align = 'center',
  className,
  children,
  ...rest
}: HStackProps) {
  return (
    <div
      className={clsx(
        'flex flex-row',
        alignMap[align],
        justifyMap[justify],
        spacingMap[spacing],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Stack;
