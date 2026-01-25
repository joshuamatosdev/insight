import { CSSProperties } from 'react';
import { GridProps } from './Grid.types';

export function Grid({
  columns = 1,
  rows,
  gap,
  rowGap,
  columnGap,
  className,
  style,
  children,
}: GridProps) {
  const gridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
    ...(rows && { gridTemplateRows: typeof rows === 'number' ? `repeat(${rows}, 1fr)` : rows }),
    ...(gap && { gap: typeof gap === 'number' ? `${gap}px` : gap }),
    ...(rowGap && { rowGap: typeof rowGap === 'number' ? `${rowGap}px` : rowGap }),
    ...(columnGap && { columnGap: typeof columnGap === 'number' ? `${columnGap}px` : columnGap }),
    ...style,
  };

  return (
    <div className={className} style={gridStyles}>
      {children}
    </div>
  );
}

export default Grid;
