import { CSSProperties, ReactNode } from 'react';

export interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Skip link target ID (defaults to 'main-content') */
  mainContentId?: string;
  /** Custom skip link text */
  skipLinkText?: string;
}

export interface MainContentProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** ID for skip link targeting (defaults to 'main-content') */
  id?: string;
}
