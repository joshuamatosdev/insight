import clsx from 'clsx';
import { Text } from '../../catalyst/primitives';

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
          <Text as="div" variant="bodySmall" weight="medium">
            {title}
          </Text>
          <Text as="div" className="mt-2 text-3xl font-medium tracking-tight" color="primary">
            {value}
          </Text>
          {(change !== undefined || changeLabel !== undefined) && (
            <div className="mt-2 flex items-center gap-2">
              {change !== undefined && (
                <Text as="span" variant="caption" weight="medium" className={getChangeColor()}>
                  {formatChange()}
                </Text>
              )}
              {changeLabel !== undefined && (
                <Text as="span" variant="caption">
                  {changeLabel}
                </Text>
              )}
            </div>
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
