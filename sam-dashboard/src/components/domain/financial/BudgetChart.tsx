/**
 * BudgetChart - Visual representation of budget vs actual spending
 */
import clsx from 'clsx';
import type { BudgetChartProps } from './Financial.types';
import { formatCurrency, formatPercentage } from '../../../services/financialService';

export function BudgetChart({
  budgeted,
  actual,
  committed,
  title = 'Budget Overview',
  className,
}: BudgetChartProps) {
  const totalSpent = actual + committed;
  const remaining = budgeted - totalSpent;
  const utilizationPercent = budgeted > 0 ? (totalSpent / budgeted) * 100 : 0;
  const actualPercent = budgeted > 0 ? (actual / budgeted) * 100 : 0;
  const committedPercent = budgeted > 0 ? (committed / budgeted) * 100 : 0;

  const getStatusColor = (): string => {
    if (utilizationPercent >= 100) return 'text-danger';
    if (utilizationPercent >= 80) return 'text-warning';
    return 'text-success';
  };

  const legendItems = [
    { label: 'Actual', value: actual, color: 'bg-accent' },
    { label: 'Committed', value: committed, color: 'bg-warning' },
    { label: 'Remaining', value: remaining, color: 'bg-zinc-200 dark:bg-zinc-600', isNegative: remaining < 0 },
  ];

  return (
    <div className={clsx(
      'rounded-lg bg-surface ring-1 ring-border dark:bg-zinc-800/50 dark:ring-white/10',
      className
    )}>
      <div className="px-6 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base/6 font-semibold text-on-surface">
            {title}
          </h3>
          <span className={clsx('text-sm/6 font-semibold', getStatusColor())}>
            {formatPercentage(utilizationPercent)} used
          </span>
        </div>

        {/* Stacked Bar */}
        <div className="flex h-6 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.min(actualPercent, 100)}%` }}
          />
          <div
            className="h-full bg-warning transition-all duration-300"
            style={{ width: `${Math.min(committedPercent, 100 - actualPercent)}%` }}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={clsx('h-3 w-3 shrink-0 rounded-sm', item.color)} />
              <div className="min-w-0 flex-1">
                <p className="text-xs/5 text-on-surface-muted">
                  {item.label}
                </p>
                <p className={clsx(
                  'text-sm/6 font-medium',
                  item.isNegative
                    ? 'text-danger'
                    : 'text-on-surface'
                )}>
                  {formatCurrency(item.value)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total Budget */}
        <div className="flex items-center justify-between border-t border-border pt-4 dark:border-white/10">
          <span className="text-sm/6 text-on-surface-muted">
            Total Budget
          </span>
          <span className="text-base/6 font-semibold text-on-surface">
            {formatCurrency(budgeted)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BudgetChart;
