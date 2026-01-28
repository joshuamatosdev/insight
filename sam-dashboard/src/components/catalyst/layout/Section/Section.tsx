import {CSSProperties} from 'react';
import {SectionProps} from './Section.types';

export function Section({
                            id,
                            className,
                            style,
                            children,
                            'aria-label': ariaLabel,
                            'aria-labelledby': ariaLabelledBy,
                            ...rest
                        }: SectionProps) {
    const sectionStyles: CSSProperties = {
        scrollMarginTop: '20px',
        ...style,
    };

    return (
        <section
            id={id}
            className={className}
            style={sectionStyles}
            role="region"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            {...rest}
        >
            {children}
        </section>
    );
}

export default Section;
