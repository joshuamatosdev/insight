import clsx from 'clsx';
import {MainContentProps} from './AppLayout.types';

export function MainContent({
  className,
  style,
  children,
  id = 'main-content',
}: MainContentProps) {
  return (
    <main
      id={id}
      className={clsx('ml-64 p-8 min-h-screen bg-zinc-50 flex-1', className)}
      style={style}
      role="main"
      aria-label="Main content"
      tabIndex={-1}
    >
      {children}
    </main>
  );
}

export default MainContent;
