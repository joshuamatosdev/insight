import { StatCardProps } from './Stats.types';
import clsx from 'clsx';

export function StatCard({ value, label, icon, change, className }: StatCardProps) {
  const getChangeColor = (type: 'positive' | 'negative' | 'neutral'): string => {
    if (type === 'positive') {
      return 'text-success';
    }
    if (type === 'negative') {
      return 'text-danger';
    }
    return 'text-on-surface-muted';
  };

  return (
    <div
      className={clsx(
        'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2',
        'border-t border-border px-4 py-10 sm:px-6 xl:px-8',
        'lg:border-t-0',
        className
      )}
    >
      <dt className="text-sm/6 font-medium text-on-surface-muted">
        {label}
      </dt>

      {change !== undefined && change !== null && (
        <dd className={clsx('text-xs font-medium', getChangeColor(change.type))}>
          {change.value}
        </dd>
      )}

      <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-on-surface">
        <div className="flex items-center justify-between">
          <span>{value}</span>
          {icon !== undefined && icon !== null && (
            <span className="text-on-surface-muted opacity-60">
              {icon}
            </span>
          )}
        </div>
      </dd>
    </div>
  );
}

export default StatCard;
