import { CSSProperties, ReactNode } from 'react';

export type SidebarPosition = 'fixed' | 'absolute' | 'relative' | 'sticky' | 'static';

export interface SidebarProps {
  /** Whether the sidebar is open (visible) */
  isOpen?: boolean;
  /** Callback when sidebar requests to close */
  onClose?: () => void;
  /** Width when expanded */
  width?: string | number;
  /** Whether sidebar is collapsed to icon-only mode */
  collapsed?: boolean;
  /** Width when collapsed (icon-only mode) */
  collapsedWidth?: string | number;
  /** Callback to toggle collapsed state */
  onToggleCollapse?: () => void;
  /** CSS position property - defaults to 'relative' */
  position?: SidebarPosition;
  /** Top offset (only applies when position is fixed/absolute/sticky) */
  top?: string | number;
  /** Left offset (only applies when position is fixed/absolute/sticky) */
  left?: string | number;
  /** Height of the sidebar */
  height?: string | number;
  /** Z-index for layering */
  zIndex?: number;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles (overrides defaults) */
  style?: CSSProperties;
  /** Sidebar content */
  children: ReactNode;
  /** Accessible label for the sidebar navigation */
  'aria-label'?: string;
}

export interface SidebarHeaderProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface SidebarNavProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface SidebarNavItemProps {
  icon?: ReactNode;
  label: string;
  badge?: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  /** Whether to show only the icon (used when sidebar is collapsed) */
  iconOnly?: boolean;
}

export interface SidebarSectionProps {
  /** Section title. When omitted, no title header is rendered. */
  title?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}
