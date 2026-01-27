import { CSSProperties } from 'react';
import { MainContentProps } from './AppLayout.types';

export function MainContent({
  className,
  style,
  children,
  id = 'main-content',
}: MainContentProps) {
  const contentStyles: CSSProperties = {
    marginLeft: '16rem',
    padding: '2rem',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
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
