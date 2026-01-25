import { CSSProperties } from 'react';
import { MainContentProps } from './AppLayout.types';

export function MainContent({ className, style, children }: MainContentProps) {
  const contentStyles: CSSProperties = {
    marginLeft: 'var(--sidebar-width)',
    padding: 'var(--spacing-8)',
    minHeight: '100vh',
    backgroundColor: 'var(--color-gray-50)',
    flex: 1,
    ...style,
  };

  return (
    <main className={className} style={contentStyles}>
      {children}
    </main>
  );
}

export default MainContent;
