import { CSSProperties } from 'react';
import { SidebarProps } from './Sidebar.types';

export function Sidebar({
  isOpen = true,
  width = 'var(--sidebar-width)',
  className,
  style,
  children,
}: SidebarProps) {
  const sidebarStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: typeof width === 'number' ? `${width}px` : width,
    background: 'var(--gradient-sidebar)',
    padding: 0,
    overflowY: 'auto',
    zIndex: 'var(--z-fixed)' as unknown as number,
    transition: 'transform var(--transition-slow)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    ...style,
  };

  return (
    <nav className={className} style={sidebarStyles}>
      {children}
    </nav>
  );
}

export default Sidebar;
