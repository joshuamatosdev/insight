import { CSSProperties } from 'react';
import { TableHeaderCellProps } from './Table.types';

export function TableHeaderCell({ align = 'left', className, style, children }: TableHeaderCellProps) {
  const cellStyles: CSSProperties = {
    padding: 'var(--spacing-4)',
    textAlign: align,
    verticalAlign: 'middle',
    backgroundColor: 'var(--color-dark-start)',
    color: 'var(--color-white)',
    fontWeight: 'var(--font-weight-medium)' as unknown as number,
    fontSize: 'var(--font-size-sm)',
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
