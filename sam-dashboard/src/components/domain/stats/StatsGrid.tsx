import { StatsGridProps } from './Stats.types';
import clsx from 'clsx';
import { Children, cloneElement, isValidElement, ReactElement } from 'react';

const columnConfig = {
  1: 'grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-5',
  6: 'sm:grid-cols-2 lg:grid-cols-6',
} as const;

type ColumnCount = keyof typeof columnConfig;

export function StatsGrid({ children, columns = 4, className }: StatsGridProps & { columns?: ColumnCount }) {
  // Add border-l classes to appropriate children based on column layout
  const childrenWithBorders = Children.map(children, (child, index) => {
    if (!isValidElement(child)) {
      return child;
    }

    // Determine border classes based on column count and index
    let borderClass = '';

    if (columns === 2) {
      // Every odd index (1, 3, 5...) gets border on sm and up
      borderClass = index % 2 === 1 ? 'sm:border-l sm:border-border' : '';
    } else if (columns === 3) {
      // Index 1,2,4,5,7,8... get border on sm, index 2,5,8... also on lg
      if (index % 3 === 1) {
        borderClass = 'sm:border-l sm:border-border';
      } else if (index % 3 === 2) {
        borderClass = 'sm:border-l lg:border-l lg:border-border';
      }
    } else if (columns >= 4) {
      // Matches Tailwind UI pattern: odd indices on sm, index 2 on lg
      if (index % 2 === 1) {
        borderClass = 'sm:border-l sm:border-border';
      } else if (index === 2) {
        borderClass = 'lg:border-l lg:border-border';
      }
    }

    // Clone child and merge className
    return cloneElement(child as ReactElement, {
      className: clsx((child.props as { className?: string }).className, borderClass),
    });
  });

  const colConfig = columnConfig[columns] ?? columnConfig[4];

  return (
    <div className={clsx('border-b border-border lg:border-t', className)}>
      <dl
        className={clsx(
          'mx-auto grid max-w-7xl grid-cols-1',
          colConfig,
          'lg:px-2 xl:px-0'
        )}
      >
        {childrenWithBorders}
      </dl>
    </div>
  );
}

export default StatsGrid;
