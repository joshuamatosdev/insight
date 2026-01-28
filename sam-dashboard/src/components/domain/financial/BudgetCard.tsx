/**
 * BudgetCard - Displays a budget item summary with Pocket-style design
 */

import {Badge, Button, Progress} from '../../catalyst';
import {PencilIcon, TrashIcon} from '@heroicons/react/20/solid';
import type {BudgetCardProps} from './Financial.types';
import {formatCurrency, formatPercentage, getCategoryLabel} from '../../../services/financialService';

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

  const getProgressColor = (): 'green' | 'yellow' | 'red' => {
    if (utilizationPercent >= 100) return 'red';
    if (utilizationPercent >= 80) return 'yellow';
    return 'green';
  };

  const getStatusTextColor = (): string => {
    if (utilizationPercent >= 100) return 'text-danger';
    if (utilizationPercent >= 80) return 'text-warning';
    return 'text-success';
  };

  return (
    <div>
      {/* Header */}
      <div>
        <div>
          <h3>
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
      <div>
        {/* Progress */}
        <div>
          <div>
            <span>
              Utilization
            </span>
            <span>
              {formatPercentage(utilizationPercent)}
            </span>
          </div>
          <Progress value={utilizationPercent} max={100} color={getProgressColor()} size="md" />
        </div>

        {/* Budget Details */}
        <dl>
          <div>
            <dt>Budgeted</dt>
            <dd>
              {formatCurrency(budget.budgetedAmount)}
            </dd>
          </div>
          <div>
            <dt>Actual</dt>
            <dd>
              {formatCurrency(budget.actualAmount)}
            </dd>
          </div>
          <div>
            <dt>Committed</dt>
            <dd>
              {formatCurrency(budget.committedAmount)}
            </dd>
          </div>
          <div>
            <dt>Remaining</dt>
            <dd>
              {formatCurrency(budget.remainingBudget)}
            </dd>
          </div>
        </dl>

        {/* Description */}
        {budget.description !== null && budget.description.length > 0 && (
          <p>
            {budget.description}
          </p>
        )}
      </div>

      {/* Footer */}
      {(onEdit !== undefined || onDelete !== undefined) && (
        <div>
          {onEdit !== undefined && (
            <Button
              plain
              onClick={() => onEdit(budget)}
              aria-label="Edit budget item"
            >
              <PencilIcon />
            </Button>
          )}
          {onDelete !== undefined && (
            <Button
              plain
              onClick={() => onDelete(budget.id)}
              aria-label="Delete budget item"
            >
              <TrashIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default BudgetCard;
