import {CSSProperties} from 'react';
import {TableBodyProps} from './Table.types';

export function TableBody({className, style, children}: TableBodyProps) {
    const bodyStyles: CSSProperties = {
        ...style,
    };

    return (
        <tbody className={className} style={bodyStyles}>
        {children}
        </tbody>
    );
}

export default TableBody;
