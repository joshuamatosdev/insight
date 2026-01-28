/**
 * CostBreakdownChart - Visual breakdown of costs by category
 */

import type {CostBreakdownChartProps} from './Financial.types';
import {formatCurrency, formatPercentage} from '../../../services/financialService';

export function CostBreakdownChart({
  data,
  total,
  title = 'Cost Breakdown',
  className,
}: CostBreakdownChartProps) {
  // Sort data by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div>
      <div>
        {/* Header */}
        <div>
          <h3>
            {title}
          </h3>
          <span>
            {formatCurrency(total)}
          </span>
        </div>

        {/* Stacked Bar Chart */}
        <div>
          {sortedData.map((item) => {
            const widthPercent = total > 0 ? (item.amount / total) * 100 : 0;
            if (widthPercent < 0.5) return null; // Skip very small segments

            return (
              <div
                key={item.category}
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
        <div>
          {sortedData.map((item) => {
            const percent = total > 0 ? (item.amount / total) * 100 : 0;

            return (
              <div key={item.category}>
                <div
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p>
                    {item.category}
                  </p>
                  <div>
                    <span>
                      {formatCurrency(item.amount)}
                    </span>
                    <span>
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
