import { CSSProperties, useContext } from 'react';
import { TableCellProps } from './Table.types';
import { TableContext } from './Table';
import { TableRowContext } from './TableRow';
import { Link } from '../../primitives/link';

export function TableCell({ align = 'left', className, style, children, colSpan, rowSpan }: TableCellProps) {
  const { dense } = useContext(TableContext);
  const { href, target, title } = useContext(TableRowContext);

  const cellStyles: CSSProperties = {
    padding: dense === true ? '0.625rem 1rem' : '1rem',
    textAlign: align,
    verticalAlign: 'middle',
    borderBottom: '1px solid #e4e4e7',
    position: href !== undefined ? 'relative' : undefined,
    ...style,
  };

  return (
    <td className={className} style={cellStyles} colSpan={colSpan} rowSpan={rowSpan}>
      {href !== undefined && (
        <Link
          href={href}
          target={target}
          aria-label={title}
          className="absolute inset-0 focus:outline-hidden"
          style={{ position: 'absolute', inset: 0 }}
        />
      )}
      {children}
    </td>
  );
}

export default TableCell;
