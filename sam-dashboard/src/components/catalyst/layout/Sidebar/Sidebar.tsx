import { CSSProperties } from 'react';
import { SidebarProps } from './Sidebar.types';

export function Sidebar({
  isOpen = true,
  width = '16rem',
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Main navigation',
}: SidebarProps) {
  const sidebarStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: typeof width === 'number' ? `${width}px` : width,
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    padding: 0,
    overflowY: 'auto',
    zIndex: '100' as unknown as number,
    transition: 'transform 0.3s ease',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    ...style,
  };

  return (
    <aside
      className={className}
      style={sidebarStyles}
      role="complementary"
      aria-label={ariaLabel}
      aria-hidden={isOpen === false}
    >
      <nav role="navigation" aria-label={ariaLabel}>
        {children}
      </nav>
    </aside>
  );
}

export default Sidebar;
