import { CSSProperties } from 'react';
import { SidebarNavProps } from './Sidebar.types';

export function SidebarNav({ className, style, children }: SidebarNavProps) {
  const navStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  return (
    <div className={className} style={navStyles}>
      {children}
    </div>
  );
}

export default SidebarNav;
