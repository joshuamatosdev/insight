import { CSSProperties, useState, createContext } from 'react';
import { TableRowProps } from './Table.types';

export interface TableRowContextValue {
  href?: string;
  target?: string;
  title?: string;
}

export const TableRowContext = createContext<TableRowContextValue>({});

export function TableRow({ isHoverable = true, className, style, children, href, target, title }: TableRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const rowStyles: CSSProperties = {
    backgroundColor: isHoverable && isHovered ? '#fafafa' : 'transparent',
    transition: '0.15s ease',
    cursor: href !== undefined ? 'pointer' : undefined,
    ...style,
  };

  return (
    <TableRowContext.Provider value={{ href, target, title }}>
      <tr
        className={className}
        style={rowStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </tr>
    </TableRowContext.Provider>
  );
}

export default TableRow;
