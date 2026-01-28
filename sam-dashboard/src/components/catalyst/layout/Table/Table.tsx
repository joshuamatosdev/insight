import {createContext, CSSProperties} from 'react';
import clsx from 'clsx';
import {TableProps} from './Table.types';

export interface TableContextValue {
    dense?: boolean;
    grid?: boolean;
    striped?: boolean;
    bleed?: boolean;
}

export const TableContext = createContext<TableContextValue>({});

export function Table({className, style, children, striped, dense, grid, bleed}: TableProps) {
    const tableStyles: CSSProperties = {
        width: '100%',
        borderCollapse: 'inherit',
        ...style,
    };

    return (
        <TableContext.Provider value={{dense, grid, striped, bleed}}>
            <table
                className={clsx(
                    className,
                    striped === true && '[&_tbody_tr:nth-child(even)]:bg-zinc-50 dark:[&_tbody_tr:nth-child(even)]:bg-zinc-800/50'
                )}
                style={tableStyles}
            >
                {children}
            </table>
        </TableContext.Provider>
    );
}

export default Table;
