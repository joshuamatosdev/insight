import {CSSProperties} from 'react';
import clsx from 'clsx';
import {SidebarProps} from './Sidebar.types';
import {ChevronLeftIcon, ChevronRightIcon} from '../../primitives/Icon';

function formatDimension(value: string | number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

export function Sidebar({
  isOpen = true,
  width = '16rem',
  collapsed = false,
  collapsedWidth = '4rem',
  onToggleCollapse,
  position,
  top,
  left,
  height = '100%',
  zIndex,
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Main navigation',
}: SidebarProps) {
  const currentWidth = collapsed ? collapsedWidth : width;

  const sidebarStyles: CSSProperties = {
    position: position,
    top: formatDimension(top),
    left: formatDimension(left),
    height: formatDimension(height),
    width: formatDimension(currentWidth),
    zIndex: zIndex,
    transition: 'width 0.2s ease, transform 0.3s ease',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    ...style,
  };

  return (
    <aside
      className={clsx(
        // Base styles
        'flex flex-col overflow-y-auto overflow-x-hidden',
        // Theme-aware colors
        'bg-white dark:bg-zinc-900',
        'border-r border-zinc-200 dark:border-zinc-700',
        className
      )}
      style={sidebarStyles}
      role="complementary"
      aria-label={ariaLabel}
      aria-hidden={isOpen === false}
      data-collapsed={collapsed}
    >
      {/* Collapse toggle button */}
      {onToggleCollapse !== undefined && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className={clsx(
            'flex items-center justify-center',
            'h-10 w-full',
            'border-b border-zinc-200 dark:border-zinc-700',
            'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            'transition-colors'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRightIcon className="size-5" />
          ) : (
            <ChevronLeftIcon className="size-5" />
          )}
        </button>
      )}

      {/* Navigation content */}
      <nav
        role="navigation"
        aria-label={ariaLabel}
        className="flex-1 overflow-y-auto"
      >
        {children}
      </nav>
    </aside>
  );
}

export default Sidebar;
