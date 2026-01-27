import clsx from 'clsx';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

/**
 * Quick stats card for key metrics - Pocket design aesthetic
 */
export function QuickStatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
}: QuickStatsCardProps): React.ReactElement {
  const getChangeColor = (): string => {
    if (change === undefined) {
      return 'text-on-surface-muted';
    }
    if (change > 0) {
      return 'text-success';
    }
    if (change < 0) {
      return 'text-danger';
    }
    return 'text-on-surface-muted';
  };

  const formatChange = (): string => {
    if (change === undefined) {
      return '';
    }
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <div
      className={clsx(
        'rounded-lg bg-white p-6',
        'ring-1 ring-zinc-950/5',
        'dark:bg-zinc-900 dark:ring-white/10'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </dt>
          <dd className="mt-2 text-3xl font-medium tracking-tight text-zinc-900 dark:text-white">
            {value}
          </dd>
          {(change !== undefined || changeLabel !== undefined) && (
            <dd className="mt-2 flex items-center gap-2">
              {change !== undefined && (
                <span className={clsx('text-xs font-medium', getChangeColor())}>
                  {formatChange()}
                </span>
              )}
              {changeLabel !== undefined && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {changeLabel}
                </span>
              )}
            </dd>
          )}
        </div>
        {icon !== undefined && (
          <div className="text-zinc-400 dark:text-zinc-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickStatsCard;
