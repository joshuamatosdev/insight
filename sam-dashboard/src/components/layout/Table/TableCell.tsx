import { CSSProperties } from 'react';
import { TableCellProps } from './Table.types';

export function TableCell({ align = 'left', className, style, children }: TableCellProps) {
  const cellStyles: CSSProperties = {
    padding: 'var(--spacing-4)',
    textAlign: align,
    verticalAlign: 'middle',
    borderBottom: '1px solid var(--color-gray-200)',
    ...style,
  };

  return (
    <td className={className} style={cellStyles}>
      {children}
    </td>
  );
}

export default TableCell;
