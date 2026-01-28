import clsx from 'clsx';
import {CSSProperties} from 'react';
import {GridProps} from './Grid.types';

const gapMap: Record<string, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

const rowGapMap: Record<string, string> = {
  none: 'gap-y-0',
  xs: 'gap-y-1',
  sm: 'gap-y-2',
  md: 'gap-y-4',
  lg: 'gap-y-6',
  xl: 'gap-y-8',
  '2xl': 'gap-y-12',
};

const colGapMap: Record<string, string> = {
  none: 'gap-x-0',
  xs: 'gap-x-1',
  sm: 'gap-x-2',
  md: 'gap-x-4',
  lg: 'gap-x-6',
  xl: 'gap-x-8',
  '2xl': 'gap-x-12',
};

const columnsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

export function Grid({
  columns = 1,
  rows,
  gap,
  rowGap,
  columnGap,
  className,
  style,
  children,
  // Destructure BaseStyleProps to prevent them from leaking to DOM
  margin: _margin,
  marginTop: _marginTop,
  marginRight: _marginRight,
  marginBottom: _marginBottom,
  marginLeft: _marginLeft,
  padding: _padding,
  paddingTop: _paddingTop,
  paddingRight: _paddingRight,
  paddingBottom: _paddingBottom,
  paddingLeft: _paddingLeft,
  borderRadius: _borderRadius,
  borderWidth: _borderWidth,
  borderStyle: _borderStyle,
  borderColor: _borderColor,
  fullWidth: _fullWidth,
  fullHeight: _fullHeight,
  ...rest
}: GridProps) {
  // For numeric columns, use Tailwind classes
  const isNumericColumns = typeof columns === 'number';
  const columnsClass = isNumericColumns ? columnsMap[columns] : '';

  // For string columns (complex patterns), use inline style
  const customStyles: CSSProperties = {
    ...(!isNumericColumns && { gridTemplateColumns: columns }),
    ...(rows !== undefined && {
      gridTemplateRows: typeof rows === 'number' ? `repeat(${rows}, 1fr)` : rows
    }),
    ...style,
  };

  const gapClass = gap !== undefined ? gapMap[gap] ?? '' : '';
  const rowGapClass = rowGap !== undefined ? rowGapMap[rowGap] ?? '' : '';
  const colGapClass = columnGap !== undefined ? colGapMap[columnGap] ?? '' : '';

  return (
    <div
      className={clsx(
        'grid',
        columnsClass,
        gapClass,
        rowGapClass,
        colGapClass,
        className
      )}
      style={Object.keys(customStyles).length > 0 ? customStyles : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Grid;
