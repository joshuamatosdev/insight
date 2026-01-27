/**
 * CostBreakdownChart - Visual breakdown of costs by category
 */
import clsx from 'clsx';
import type { CostBreakdownChartProps } from './Financial.types';
import { formatCurrency, formatPercentage } from '../../../services/financialService';

export function CostBreakdownChart({
  data,
  total,
  title = 'Cost Breakdown',
  className,
}: CostBreakdownChartProps) {
  // Sort data by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className={clsx(
      'rounded-lg bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10',
      className
    )}>
      <div className="px-6 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base/6 font-semibold text-zinc-950 dark:text-white">
            {title}
          </h3>
          <span className="text-base/6 font-semibold text-zinc-900 dark:text-white">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Stacked Bar Chart */}
        <div className="flex h-8 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-700">
          {sortedData.map((item) => {
            const widthPercent = total > 0 ? (item.amount / total) * 100 : 0;
            if (widthPercent < 0.5) return null; // Skip very small segments

            return (
              <div
                key={item.category}
                className="h-full transition-all duration-300"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: item.color,
                }}
                title={`${item.category}: ${formatCurrency(item.amount)}`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortedData.map((item) => {
            const percent = total > 0 ? (item.amount / total) * 100 : 0;

            return (
              <div key={item.category} className="flex items-start gap-2">
                <div
                  className="mt-1 h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs/5 text-zinc-500 dark:text-zinc-400">
                    {item.category}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm/6 font-medium text-zinc-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formatPercentage(percent)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CostBreakdownChart;
