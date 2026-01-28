import clsx from 'clsx';
import {SidebarHeaderProps} from './Sidebar.types';

export function SidebarHeader({ className, style, children }: SidebarHeaderProps) {
  return (
    <header
      className={clsx('px-4 py-6 border-b border-gray-200', className)}
      style={style}
      role="banner"
    >
      {children}
    </header>
  );
}

export default SidebarHeader;
