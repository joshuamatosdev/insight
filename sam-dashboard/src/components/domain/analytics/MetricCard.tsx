import {MetricCardProps} from './Analytics.types';
import {formatChangePercent} from '../../../types/analytics.types';

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
      <div>
        <div>
          <div />
          <div />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <p>
            {title}
          </p>
          <p>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {showChange && (
            <div>
              <span>
                {formatChangePercent(changePercent)}
              </span>
              {previousValue !== undefined && previousValue !== null && (
                <span>
                  vs {previousValue.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
        {icon !== undefined && icon !== null && (
          <div>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
