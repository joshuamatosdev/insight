import { CSSProperties } from 'react';
import { MainContentProps } from './AppLayout.types';

export function MainContent({
  className,
  style,
  children,
  id = 'main-content',
}: MainContentProps) {
  const contentStyles: CSSProperties = {
    marginLeft: 'var(--sidebar-width)',
    padding: 'var(--spacing-8)',
    minHeight: '100vh',
    backgroundColor: 'var(--color-gray-50)',
    flex: 1,
    ...style,
  };

  return (
    <main
      id={id}
      className={className}
      style={contentStyles}
      role="main"
      aria-label="Main content"
      tabIndex={-1}
    >
      {children}
    </main>
  );
}

export default MainContent;
