/**
 * BudgetCard - Displays a budget item summary
 */
import { CSSProperties } from 'react';
import { Text, Badge, Button, PencilIcon, TrashIcon } from '../../primitives';
import { Card, CardHeader, CardBody, CardFooter, Stack, HStack, Box } from '../../layout';
import type { BudgetCardProps } from './Financial.types';
import { formatCurrency, formatPercentage, getCategoryLabel } from '../../../services/financialService';

export function BudgetCard({
  budget,
  onEdit,
  onDelete,
  className,
  style,
}: BudgetCardProps) {
  const utilizationPercent =
    budget.budgetedAmount > 0
      ? ((budget.actualAmount + budget.committedAmount) / budget.budgetedAmount) * 100
      : 0;

  const getVariantFromUtilization = (): 'success' | 'warning' | 'danger' => {
    if (utilizationPercent >= 100) return 'danger';
    if (utilizationPercent >= 80) return 'warning';
    return 'success';
  };

  const progressBarStyle: CSSProperties = {
    height: '8px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-gray-200)',
    overflow: 'hidden',
  };

  const progressFillStyle: CSSProperties = {
    height: '100%',
    width: `${Math.min(utilizationPercent, 100)}%`,
    borderRadius: 'var(--radius-full)',
    backgroundColor:
      utilizationPercent >= 100
        ? 'var(--color-danger)'
        : utilizationPercent >= 80
          ? 'var(--color-warning)'
          : 'var(--color-success)',
    transition: 'width 0.3s ease',
  };

  return (
    <Card variant="outlined" className={className} style={style}>
      <CardHeader>
        <HStack justify="between" align="start">
          <Stack spacing="var(--spacing-1)">
            <Text variant="heading6" weight="semibold">
              {budget.name}
            </Text>
            <Badge variant="secondary" size="sm">
              {getCategoryLabel(budget.category)}
            </Badge>
          </Stack>
          {budget.isOverBudget && (
            <Badge variant="danger" size="sm">
              Over Budget
            </Badge>
          )}
        </HStack>
      </CardHeader>

      <CardBody>
        <Stack spacing="var(--spacing-4)">
          {/* Progress Bar */}
          <Box>
            <HStack justify="between" className="mb-2">
              <Text variant="caption" color="muted">
                Utilization
              </Text>
              <Text
                variant="caption"
                weight="medium"
                color={getVariantFromUtilization()}
              >
                {formatPercentage(utilizationPercent)}
              </Text>
            </HStack>
            <Box style={progressBarStyle}>
              <Box style={progressFillStyle} />
            </Box>
          </Box>

          {/* Budget Details */}
          <Stack spacing="var(--spacing-2)">
            <HStack justify="between">
              <Text variant="bodySmall" color="muted">
                Budgeted
              </Text>
              <Text variant="bodySmall" weight="medium">
                {formatCurrency(budget.budgetedAmount)}
              </Text>
            </HStack>
            <HStack justify="between">
              <Text variant="bodySmall" color="muted">
                Actual
              </Text>
              <Text variant="bodySmall" weight="medium">
                {formatCurrency(budget.actualAmount)}
              </Text>
            </HStack>
            <HStack justify="between">
              <Text variant="bodySmall" color="muted">
                Committed
              </Text>
              <Text variant="bodySmall" weight="medium">
                {formatCurrency(budget.committedAmount)}
              </Text>
            </HStack>
            <HStack
              justify="between"
              style={{
                paddingTop: 'var(--spacing-2)',
                borderTop: '1px solid var(--color-gray-200)',
              }}
            >
              <Text variant="bodySmall" weight="medium">
                Remaining
              </Text>
              <Text
                variant="bodySmall"
                weight="semibold"
                color={budget.remainingBudget < 0 ? 'danger' : 'success'}
              >
                {formatCurrency(budget.remainingBudget)}
              </Text>
            </HStack>
          </Stack>

          {/* Description */}
          {budget.description !== null && budget.description.length > 0 && (
            <Text variant="caption" color="muted">
              {budget.description}
            </Text>
          )}
        </Stack>
      </CardBody>

      {(onEdit !== undefined || onDelete !== undefined) && (
        <CardFooter>
          <HStack justify="end" spacing="var(--spacing-2)">
            {onEdit !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(budget)}
                aria-label="Edit budget item"
              >
                <PencilIcon size="sm" />
              </Button>
            )}
            {onDelete !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(budget.id)}
                aria-label="Delete budget item"
              >
                <TrashIcon size="sm" color="danger" />
              </Button>
            )}
          </HStack>
        </CardFooter>
      )}
    </Card>
  );
}

export default BudgetCard;
