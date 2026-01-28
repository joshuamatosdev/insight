import clsx from 'clsx';
import {TableHeaderCellProps} from './Table.types';

const alignClassMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function TableHeaderCell({ align = 'left', className, style, children }: TableHeaderCellProps) {
  return (
    <th
      className={clsx(
        'p-4 align-middle bg-gray-800 text-white font-medium text-sm border-0',
        alignClassMap[align],
        className
      )}
      style={style}
    >
      {children}
    </th>
  );
}

export default TableHeaderCell;
