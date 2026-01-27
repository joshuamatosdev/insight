import { CSSProperties } from 'react';
import { SidebarHeaderProps } from './Sidebar.types';

export function SidebarHeader({ className, style, children }: SidebarHeaderProps) {
  const headerStyles: CSSProperties = {
    padding: 'var(--spacing-6)',
    background: 'rgba(0, 0, 0, 0.2)',
    borderBottom: '1px solid var(--color-dark-border)',
    ...style,
  };

  return (
    <header className={className} style={headerStyles} role="banner">
      {children}
    </header>
  );
}

export default SidebarHeader;
