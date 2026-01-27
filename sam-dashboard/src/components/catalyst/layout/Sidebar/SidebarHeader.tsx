import { CSSProperties } from 'react';
import { SidebarHeaderProps } from './Sidebar.types';

export function SidebarHeader({ className, style, children }: SidebarHeaderProps) {
  const headerStyles: CSSProperties = {
    padding: '1.5rem 1rem',
    borderBottom: '1px solid #e5e7eb',
    ...style,
  };

  return (
    <header className={className} style={headerStyles} role="banner">
      {children}
    </header>
  );
}

export default SidebarHeader;
