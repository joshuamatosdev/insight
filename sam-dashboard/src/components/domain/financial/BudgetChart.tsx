/**
 * BudgetChart - Visual representation of budget vs actual spending
 */

import type {BudgetChartProps} from './Financial.types';
import {formatCurrency, formatPercentage} from '../../../services/financialService';

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
        {label: 'Actual', value: actual, color: 'bg-accent'},
        {label: 'Committed', value: committed, color: 'bg-warning'},
        {label: 'Remaining', value: remaining, color: 'bg-zinc-200 dark:bg-zinc-600', isNegative: remaining < 0},
    ];

    return (
        <div>
            <div>
                {/* Header */}
                <div>
                    <h3>
                        {title}
                    </h3>
                    <span>
            {formatPercentage(utilizationPercent)} used
          </span>
                </div>

                {/* Stacked Bar */}
                <div>
                    <div
                        style={{width: `${Math.min(actualPercent, 100)}%`}}
                    />
                    <div
                        style={{width: `${Math.min(committedPercent, 100 - actualPercent)}%`}}
                    />
                </div>

                {/* Legend */}
                <div>
                    {legendItems.map((item) => (
                        <div key={item.label}>
                            <div/>
                            <div>
                                <p>
                                    {item.label}
                                </p>
                                <p>
                                    {formatCurrency(item.value)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Budget */}
                <div>
          <span>
            Total Budget
          </span>
                    <span>
            {formatCurrency(budgeted)}
          </span>
                </div>
            </div>
        </div>
    );
}

export default BudgetChart;
