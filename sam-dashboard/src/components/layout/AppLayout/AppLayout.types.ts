import { CSSProperties, ReactNode } from 'react';

export interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface MainContentProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}
