import clsx from 'clsx';
import {AppLayoutProps} from './AppLayout.types';

export function AppLayout({
  sidebar,
  children,
  className,
  style,
  mainContentId = 'main-content',
  skipLinkText = 'Skip to main content',
}: AppLayoutProps) {
  return (
    <div className={clsx('flex min-h-screen', className)} style={style}>
      {/* Skip link for keyboard navigation */}
      <a
        href={`#${mainContentId}`}
        className="absolute -top-10 left-0 z-[9999] px-4 py-2 bg-blue-600 text-white no-underline font-semibold transition-[top] duration-200 ease-in-out focus:top-0"
      >
        {skipLinkText}
      </a>
      {sidebar}
      {children}
    </div>
  );
}

export default AppLayout;
