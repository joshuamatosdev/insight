import {useContext} from 'react';
import clsx from 'clsx';
import {TableCellProps} from './Table.types';
import {TableContext} from './Table';
import {TableRowContext} from './TableRow';
import {Link} from '../../primitives/link';

const alignClassMap: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

export function TableCell({align = 'left', className, style, children, colSpan, rowSpan}: TableCellProps) {
    const {dense} = useContext(TableContext);
    const {href, target, title} = useContext(TableRowContext);

    return (
        <td
            className={clsx(
                dense === true ? 'px-4 py-2.5' : 'p-4',
                'align-middle border-b border-zinc-200',
                href !== undefined && 'relative',
                alignClassMap[align],
                className
            )}
            style={style}
            colSpan={colSpan}
            rowSpan={rowSpan}
        >
            {href !== undefined && (
                <Link
                    href={href}
                    target={target}
                    aria-label={title}
                    className="absolute inset-0 focus:outline-hidden"
                />
            )}
            {children}
        </td>
    );
}

export default TableCell;
