import { MetricCardProps } from './Analytics.types';
import { formatChangePercent } from '../../../types/analytics.types';

/**
 * MetricCard displays a single metric with optional change indicator.
 * Follows Pocket/Tailwind UI aesthetics with clean typography and no gradients.
 */
export function MetricCard({
  title,
  value,
  previousValue,
  changePercent,
  icon,
  variant = 'primary',
  loading = false,
  className = '',
}: MetricCardProps) {
  const showChange = changePercent !== undefined && changePercent !== null;

  // Determine trend color classes
  const getTrendClasses = (percent: number | null | undefined): string => {
    if (percent === null || percent === undefined) return 'text-on-surface-muted';
    if (percent > 0) return 'text-success';
    if (percent < 0) return 'text-danger';
    return 'text-on-surface-muted';
  };

  if (loading) {
    return (
      <div className={`rounded-lg bg-surface p-6 shadow dark:bg-zinc-900 ${className}`}>
        <div className="space-y-3">
          <div className="h-4 w-3/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-8 w-2/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-surface p-6 shadow dark:bg-zinc-900 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-on-surface-muted">
            {title}
          </p>
          <p className="text-3xl font-medium tracking-tight text-on-surface">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {showChange && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${getTrendClasses(changePercent)}`}>
                {formatChangePercent(changePercent)}
              </span>
              {previousValue !== undefined && previousValue !== null && (
                <span className="text-xs text-on-surface-muted">
                  vs {previousValue.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
        {icon !== undefined && icon !== null && (
          <div className="text-on-surface-muted">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
