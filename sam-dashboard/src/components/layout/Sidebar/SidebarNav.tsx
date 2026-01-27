import { CSSProperties } from 'react';
import { SidebarNavProps } from './Sidebar.types';

export function SidebarNav({ className, style, children }: SidebarNavProps) {
  const navStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    ...style,
  };

  return (
    <ul className={className} style={navStyles} role="list">
      {children}
    </ul>
  );
}

export default SidebarNav;
