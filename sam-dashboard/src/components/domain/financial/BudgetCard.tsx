/**
 * BudgetCard - Displays a budget item summary with Pocket-style design
 */
import clsx from 'clsx';
import { Badge, Button, Progress } from '../../catalyst';
import { PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import type { BudgetCardProps } from './Financial.types';
import { formatCurrency, formatPercentage, getCategoryLabel } from '../../../services/financialService';

export function BudgetCard({
  budget,
  onEdit,
  onDelete,
  className,
}: BudgetCardProps) {
  const utilizationPercent =
    budget.budgetedAmount > 0
      ? ((budget.actualAmount + budget.committedAmount) / budget.budgetedAmount) * 100
      : 0;

  const getProgressColor = (): 'green' | 'amber' | 'red' => {
    if (utilizationPercent >= 100) return 'red';
    if (utilizationPercent >= 80) return 'amber';
    return 'green';
  };

  const getStatusTextColor = (): string => {
    if (utilizationPercent >= 100) return 'text-danger';
    if (utilizationPercent >= 80) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className={clsx(
      'rounded-lg bg-surface ring-1 ring-border dark:bg-zinc-800/50 dark:ring-white/10',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-6 py-4 dark:border-white/10">
        <div className="space-y-1">
          <h3 className="text-base/6 font-semibold text-on-surface">
            {budget.name}
          </h3>
          <Badge color="zinc">
            {getCategoryLabel(budget.category)}
          </Badge>
        </div>
        {budget.isOverBudget && (
          <Badge color="red">Over Budget</Badge>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {/* Progress */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm/6 font-medium text-on-surface-muted">
              Utilization
            </span>
            <span className={clsx('text-sm/6 font-semibold', getStatusTextColor())}>
              {formatPercentage(utilizationPercent)}
            </span>
          </div>
          <Progress value={utilizationPercent} max={100} color={getProgressColor()} size="md" />
        </div>

        {/* Budget Details */}
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-sm/6 text-on-surface-muted">Budgeted</dt>
            <dd className="text-sm/6 font-medium text-on-surface">
              {formatCurrency(budget.budgetedAmount)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm/6 text-on-surface-muted">Actual</dt>
            <dd className="text-sm/6 font-medium text-on-surface">
              {formatCurrency(budget.actualAmount)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm/6 text-on-surface-muted">Committed</dt>
            <dd className="text-sm/6 font-medium text-on-surface">
              {formatCurrency(budget.committedAmount)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 dark:border-white/10">
            <dt className="text-sm/6 font-medium text-on-surface">Remaining</dt>
            <dd className={clsx(
              'text-sm/6 font-semibold',
              budget.remainingBudget < 0
                ? 'text-danger'
                : 'text-success'
            )}>
              {formatCurrency(budget.remainingBudget)}
            </dd>
          </div>
        </dl>

        {/* Description */}
        {budget.description !== null && budget.description.length > 0 && (
          <p className="text-sm/6 text-on-surface-muted">
            {budget.description}
          </p>
        )}
      </div>

      {/* Footer */}
      {(onEdit !== undefined || onDelete !== undefined) && (
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3 dark:border-white/10">
          {onEdit !== undefined && (
            <Button
              plain
              onClick={() => onEdit(budget)}
              aria-label="Edit budget item"
            >
              <PencilIcon className="size-4" />
            </Button>
          )}
          {onDelete !== undefined && (
            <Button
              plain
              onClick={() => onDelete(budget.id)}
              aria-label="Delete budget item"
            >
              <TrashIcon className="size-4 text-danger" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default BudgetCard;
