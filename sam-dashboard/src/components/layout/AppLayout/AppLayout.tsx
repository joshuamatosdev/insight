import { CSSProperties } from 'react';
import { AppLayoutProps } from './AppLayout.types';

export function AppLayout({ sidebar, children, className, style }: AppLayoutProps) {
  const layoutStyles: CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    ...style,
  };

  return (
    <div className={className} style={layoutStyles}>
      {sidebar}
      {children}
    </div>
  );
}

export default AppLayout;
