import { CSSProperties, ReactNode } from 'react';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  width?: string | number;
  className?: string;
  style?: CSSProperties;
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
}

export interface SidebarSectionProps {
  title: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}
