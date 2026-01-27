import { CSSProperties } from 'react';
import { AppLayoutProps } from './AppLayout.types';

/** Visually hidden styles that show on focus (for skip links) */
const skipLinkStyles: CSSProperties = {
  position: 'absolute',
  top: '-40px',
  left: 0,
  zIndex: 9999,
  padding: '8px 16px',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-white)',
  textDecoration: 'none',
  fontWeight: 600,
  transition: 'top 0.2s ease-in-out',
};

const skipLinkFocusStyles: CSSProperties = {
  top: 0,
};

export function AppLayout({
  sidebar,
  children,
  className,
  style,
  mainContentId = 'main-content',
  skipLinkText = 'Skip to main content',
}: AppLayoutProps) {
  const layoutStyles: CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    ...style,
  };

  return (
    <div className={className} style={layoutStyles}>
      {/* Skip link for keyboard navigation */}
      <a
        href={`#${mainContentId}`}
        style={skipLinkStyles}
        onFocus={(e) => {
          Object.assign(e.currentTarget.style, skipLinkFocusStyles);
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-40px';
        }}
      >
        {skipLinkText}
      </a>
      {sidebar}
      {children}
    </div>
  );
}

export default AppLayout;
