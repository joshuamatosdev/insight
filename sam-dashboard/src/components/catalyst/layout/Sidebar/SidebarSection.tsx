import { CSSProperties, useId } from 'react';
import { SidebarSectionProps } from './Sidebar.types';

export function SidebarSection({ title, className, style, children }: SidebarSectionProps) {
  const titleId = useId();
  const hasTitle = title !== undefined && title !== null && title.length > 0;

  const sectionStyles: CSSProperties = {
    padding: '1.5rem 0 0.5rem',
    ...style,
  };

  const titleStyles: CSSProperties = {
    padding: '0 1rem 0.5rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#9ca3af',
  };

  return (
    <section
      className={className}
      style={sectionStyles}
      aria-labelledby={hasTitle ? titleId : undefined}
      role="group"
    >
      {hasTitle && (
        <div id={titleId} style={titleStyles}>
          {title}
        </div>
      )}
      {children}
    </section>
  );
}

export default SidebarSection;
