import { CSSProperties } from 'react';
import { TableHeaderCellProps } from './Table.types';

export function TableHeaderCell({ align = 'left', className, style, children }: TableHeaderCellProps) {
  const cellStyles: CSSProperties = {
    padding: '1rem',
    textAlign: align,
    verticalAlign: 'middle',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    fontWeight: 500,
    fontSize: '0.875rem',
    border: 'none',
    ...style,
  };

  return (
    <th className={className} style={cellStyles}>
      {children}
    </th>
  );
}

export default TableHeaderCell;
