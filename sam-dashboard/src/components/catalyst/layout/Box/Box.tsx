import {forwardRef} from 'react';
import {BoxProps} from './Box.types';

/**
 * Box - A generic container component
 *
 * Use this component instead of raw <div>, <span>, or other container elements.
 * Tailwind classes and inline styles are encapsulated here.
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
    {children, className, style, as: Element = 'div', ...rest},
    ref
) {
    return (
        <Element ref={ref} className={className} style={style} {...rest}>
            {children}
        </Element>
    );
});

export default Box;
