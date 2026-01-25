import { CSSProperties } from 'react';
import { SidebarSectionProps } from './Sidebar.types';
import { Text } from '../../primitives';

export function SidebarSection({ title, className, style, children }: SidebarSectionProps) {
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
    <div className={className} style={sectionStyles}>
      <Text
        variant="caption"
        color="white"
        style={{ ...titleStyles, opacity: 0.5 }}
      >
        {title}
      </Text>
      {children}
    </div>
  );
}

export default SidebarSection;
