import { CSSProperties } from 'react';
import { TableProps } from './Table.types';

export function Table({ className, style, children }: TableProps) {
  const tableStyles: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    ...style,
  };

  return (
    <table className={className} style={tableStyles}>
      {children}
    </table>
  );
}

export default Table;
