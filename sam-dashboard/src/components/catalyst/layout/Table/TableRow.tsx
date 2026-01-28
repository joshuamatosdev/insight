import {createContext} from 'react';
import clsx from 'clsx';
import {TableRowProps} from './Table.types';

export interface TableRowContextValue {
    href?: string;
    target?: string;
    title?: string;
}

export const TableRowContext = createContext<TableRowContextValue>({});

export function TableRow({isHoverable = true, className, style, children, href, target, title}: TableRowProps) {
    return (
        <TableRowContext.Provider value={{href, target, title}}>
            <tr
                className={clsx(
                    'transition-colors duration-150',
                    isHoverable === true && 'hover:bg-zinc-50',
                    href !== undefined && 'cursor-pointer',
                    className
                )}
                style={style}
            >
                {children}
            </tr>
        </TableRowContext.Provider>
    );
}

export default TableRow;
