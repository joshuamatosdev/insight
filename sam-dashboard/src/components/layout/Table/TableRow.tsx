import { CSSProperties, useState } from 'react';
import { TableRowProps } from './Table.types';

export function TableRow({ isHoverable = true, className, style, children }: TableRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const rowStyles: CSSProperties = {
    backgroundColor: isHoverable && isHovered ? 'var(--color-gray-50)' : 'transparent',
    transition: 'var(--transition-fast)',
    ...style,
  };

  return (
    <tr
      className={className}
      style={rowStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </tr>
  );
}

export default TableRow;
