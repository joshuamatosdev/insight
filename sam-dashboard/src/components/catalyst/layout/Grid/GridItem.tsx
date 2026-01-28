import {CSSProperties} from 'react';
import {GridItemProps} from './Grid.types';

export function GridItem({
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  className,
  style,
  children,
  ...rest
}: GridItemProps) {
  const itemStyles: CSSProperties = {
    ...(colSpan && { gridColumn: `span ${colSpan}` }),
    ...(rowSpan && { gridRow: `span ${rowSpan}` }),
    ...(colStart && { gridColumnStart: colStart }),
    ...(colEnd && { gridColumnEnd: colEnd }),
    ...(rowStart && { gridRowStart: rowStart }),
    ...(rowEnd && { gridRowEnd: rowEnd }),
    ...style,
  };

  return (
    <div className={className} style={itemStyles} {...rest}>
      {children}
    </div>
  );
}

export default GridItem;
