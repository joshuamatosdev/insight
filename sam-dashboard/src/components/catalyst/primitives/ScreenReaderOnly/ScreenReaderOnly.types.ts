import {HTMLAttributes, ReactNode} from 'react';

export interface ScreenReaderOnlyProps extends HTMLAttributes<HTMLSpanElement> {
    /** Content to be read by screen readers */
    children: ReactNode;
    /** HTML element to render (default: span) */
    as?: 'span' | 'div' | 'p';
    /** Whether the content should become visible on focus (for skip links) */
    focusable?: boolean;
}
