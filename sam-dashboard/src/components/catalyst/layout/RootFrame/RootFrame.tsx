import clsx from 'clsx';

interface RootFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function RootFrame({ children, className }: RootFrameProps) {
  return (
    <div className="min-h-screen bg-zinc-950 p-2 sm:p-3">
      <div
        className={clsx(
          'min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-1.5rem)]',
          'bg-white dark:bg-zinc-900',
          'rounded-2xl sm:rounded-3xl',
          'overflow-hidden',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
