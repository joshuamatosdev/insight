import { CSSProperties, useId } from 'react';
import { SidebarSectionProps } from './Sidebar.types';
import { Text } from '../../primitives';

export function SidebarSection({ title, className, style, children }: SidebarSectionProps) {
  const titleId = useId();

  const sectionStyles: CSSProperties = {
    padding: 'var(--spacing-4) 0',
    borderBottom: '1px solid var(--color-dark-border)',
    ...style,
  };

  const titleStyles: CSSProperties = {
    padding: '0.5rem var(--spacing-6)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  return (
    <section
      className={className}
      style={sectionStyles}
      aria-labelledby={titleId}
      role="group"
    >
      <Text
        id={titleId}
        variant="caption"
        color="white"
        style={{ ...titleStyles, opacity: 0.5 }}
      >
        {title}
      </Text>
      {children}
    </section>
  );
}

export default SidebarSection;
