import {CSSProperties} from 'react';
import {GridItemProps} from './Grid.types';

export function GridItem({
                             colSpan,
                             rowSpan,
                             colStart,
                             colEnd,
                             rowStart,
                             rowEnd,
                             className,
                             style,
                             children,
                             // Destructure BaseStyleProps to prevent them from leaking to DOM
                             margin: _margin,
                             marginTop: _marginTop,
                             marginRight: _marginRight,
                             marginBottom: _marginBottom,
                             marginLeft: _marginLeft,
                             padding: _padding,
                             paddingTop: _paddingTop,
                             paddingRight: _paddingRight,
                             paddingBottom: _paddingBottom,
                             paddingLeft: _paddingLeft,
                             borderRadius: _borderRadius,
                             borderWidth: _borderWidth,
                             borderStyle: _borderStyle,
                             borderColor: _borderColor,
                             fullWidth: _fullWidth,
                             fullHeight: _fullHeight,
                             ...rest
                         }: GridItemProps) {
    const itemStyles: CSSProperties = {
        ...(colSpan && {gridColumn: `span ${colSpan}`}),
        ...(rowSpan && {gridRow: `span ${rowSpan}`}),
        ...(colStart && {gridColumnStart: colStart}),
        ...(colEnd && {gridColumnEnd: colEnd}),
        ...(rowStart && {gridRowStart: rowStart}),
        ...(rowEnd && {gridRowEnd: rowEnd}),
        ...style,
    };

    return (
        <div className={className} style={itemStyles} {...rest}>
            {children}
        </div>
    );
}

export default GridItem;
