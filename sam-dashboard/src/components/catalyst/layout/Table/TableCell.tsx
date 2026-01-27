import { CSSProperties } from 'react';
import { TableCellProps } from './Table.types';

export function TableCell({ align = 'left', className, style, children }: TableCellProps) {
  const cellStyles: CSSProperties = {
    padding: '1rem',
    textAlign: align,
    verticalAlign: 'middle',
    borderBottom: '1px solid #e4e4e7',
    ...style,
  };

  return (
    <td className={className} style={cellStyles}>
      {children}
    </td>
  );
}

export default TableCell;
