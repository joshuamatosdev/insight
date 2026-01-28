import {CSSProperties} from 'react';
import {TableHeadProps} from './Table.types';

export function TableHead({className, style, children}: TableHeadProps) {
    const headStyles: CSSProperties = {
        ...style,
    };

    return (
        <thead className={className} style={headStyles}>
        {children}
        </thead>
    );
}

export default TableHead;
