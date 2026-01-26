import { CSSProperties } from 'react';
import { SectionProps } from './Section.types';

export function Section({ id, className, style, children, ...rest }: SectionProps) {
  const sectionStyles: CSSProperties = {
    scrollMarginTop: '20px',
    ...style,
  };

  return (
    <section id={id} className={className} style={sectionStyles} {...rest}>
      {children}
    </section>
  );
}

export default Section;
