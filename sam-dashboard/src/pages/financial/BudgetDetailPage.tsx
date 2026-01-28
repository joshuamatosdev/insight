/**
 * BudgetDetailPage - Single budget item detail view
 */
import { useState, useCallback } from 'react';
import {
  Text,
  Button,
  Badge,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  InlineAlert,
  InlineAlertDescription,
} from '@/components/catalyst/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  Stack,
  HStack,
  Grid,
  GridItem,
  Flex,
  Box,
} from '@/components/catalyst/layout';
import { BudgetChart, BudgetForm } from '@/components/domain/financial';
import { useBudget } from '@/hooks/useFinancial';
import { updateBudget, deleteBudget, formatCurrency, formatDate, getCategoryLabel } from '@/services/financialService';
import type { BudgetFormState, BudgetCategory } from '@/types/financial.types';

export interface BudgetDetailPageProps {
  budgetId: string;
  onBack?: () => void;
}

const BUDGET_CATEGORIES: BudgetCategory[] = [
  'DIRECT_LABOR',
  'SUBCONTRACTOR',
  'MATERIALS',
  'EQUIPMENT',
  'TRAVEL',
  'ODC',
  'INDIRECT',
  'FEE',
  'CONTINGENCY',
  'OTHER',
];

export function BudgetDetailPage({ budgetId, onBack }: BudgetDetailPageProps) {
  const { budget, isLoading, error, refresh } = useBudget(budgetId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSubmitEdit = useCallback(
    async (formData: BudgetFormState) => {
      setIsSubmitting(true);
      try {
        await updateBudget(budgetId, {
          budgetedAmount: Number(formData.budgetedAmount),
          forecastAmount:
            formData.forecastAmount !== '' ? Number(formData.forecastAmount) : undefined,
          notes: formData.notes.length > 0 ? formData.notes : undefined,
        });
        setIsEditing(false);
        await refresh();
      } catch (err) {
        console.error('Failed to update budget:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [budgetId, refresh]
  );

  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this budget item?') === false) {
      return;
    }
    try {
      await deleteBudget(budgetId);
      if (onBack !== undefined) {
        onBack();
      }
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  }, [budgetId, onBack]);

  if (isLoading) {
    return (
      <Section id="budget-detail">
        <Flex justify="center" align="center" className="min-h-[300px]">
          <Text variant="body" color="muted">
            Loading budget details...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (error !== null || budget === null) {
    return (
      <Section id="budget-detail">
        <InlineAlert color="error">
          <InlineAlertDescription>
            {error !== null ? error.message : 'Budget not found'}
          </InlineAlertDescription>
        </InlineAlert>
      </Section>
    );
  }

  const getFormInitialData = (): BudgetFormState => ({
    contractId: budget.contractId,
    clinId: budget.clinId ?? '',
    name: budget.name,
    description: budget.description ?? '',
    category: budget.category,
    budgetedAmount: String(budget.budgetedAmount),
    forecastAmount: budget.forecastAmount !== null ? String(budget.forecastAmount) : '',
    periodStart: budget.periodStart ?? '',
    periodEnd: budget.periodEnd ?? '',
    fiscalYear: budget.fiscalYear !== null ? String(budget.fiscalYear) : '',
    fiscalPeriod: budget.fiscalPeriod !== null ? String(budget.fiscalPeriod) : '',
    notes: budget.notes ?? '',
  });

  return (
    <Section id="budget-detail">
      <SectionHeader
        title={budget.name}
        icon={
          onBack !== undefined ? (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeftIcon size="md" />
            </Button>
          ) : undefined
        }
        actions={
          isEditing === false && (
            <HStack spacing="sm">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <HStack spacing="xs" align="center">
                  <PencilIcon size="sm" />
                  <Text as="span" variant="bodySmall">
                    Edit
                  </Text>
                </HStack>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <TrashIcon size="sm" color="danger" />
              </Button>
            </HStack>
          )
        }
      />

      <Stack spacing="lg">
        {/* Status Badges */}
        <HStack spacing="sm">
          <Badge color="zinc">
            {getCategoryLabel(budget.category)}
          </Badge>
          {budget.isOverBudget && (
            <Badge color="red">
              Over Budget
            </Badge>
          )}
          {budget.fiscalYear !== null && (
            <Badge color="cyan">
              FY{budget.fiscalYear}
            </Badge>
          )}
        </HStack>

        {/* Edit Form */}
        {isEditing && (
          <Card variant="elevated">
            <CardHeader>
              <Text variant="heading5">Edit Budget Item</Text>
            </CardHeader>
            <CardBody>
              <BudgetForm
                initialData={getFormInitialData()}
                onSubmit={handleSubmitEdit}
                onCancel={handleCancelEdit}
                isSubmitting={isSubmitting}
                categories={BUDGET_CATEGORIES}
              />
            </CardBody>
          </Card>
        )}

        {/* Budget Chart */}
        {isEditing === false && (
          <BudgetChart
            budgeted={budget.budgetedAmount}
            actual={budget.actualAmount}
            committed={budget.committedAmount}
            title="Budget Status"
          />
        )}

        {/* Details Cards */}
        {isEditing === false && (
          <Grid columns={2} gap="md">
            {/* Financial Details */}
            <GridItem>
              <Card variant="outlined">
                <CardHeader>
                  <Text variant="heading6" weight="semibold">
                    Financial Details
                  </Text>
                </CardHeader>
                <CardBody>
                  <Stack spacing="md">
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Budgeted Amount
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {formatCurrency(budget.budgetedAmount)}
                      </Text>
                    </HStack>
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Actual Spent
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
                    {budget.forecastAmount !== null && (
                      <HStack justify="between">
                        <Text variant="bodySmall" color="muted">
                          Forecast
                        </Text>
                        <Text variant="bodySmall" weight="medium">
                          {formatCurrency(budget.forecastAmount)}
                        </Text>
                      </HStack>
                    )}
                    <HStack
                      justify="between"
                      className="pt-2 border-t border-outline-variant"
                    >
                      <Text variant="bodySmall" weight="medium">
                        Remaining
                      </Text>
                      <Text
                        variant="body"
                        weight="semibold"
                        color={budget.remainingBudget < 0 ? 'danger' : 'success'}
                      >
                        {formatCurrency(budget.remainingBudget)}
                      </Text>
                    </HStack>
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Variance
                      </Text>
                      <Text
                        variant="bodySmall"
                        weight="medium"
                        color={budget.variance < 0 ? 'danger' : 'success'}
                      >
                        {formatCurrency(budget.variance)} ({budget.variancePercentage.toFixed(1)}%)
                      </Text>
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Period & Tracking */}
            <GridItem>
              <Card variant="outlined">
                <CardHeader>
                  <Text variant="heading6" weight="semibold">
                    Period & Tracking
                  </Text>
                </CardHeader>
                <CardBody>
                  <Stack spacing="md">
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Period Start
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {formatDate(budget.periodStart)}
                      </Text>
                    </HStack>
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Period End
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {formatDate(budget.periodEnd)}
                      </Text>
                    </HStack>
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Fiscal Year
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {budget.fiscalYear ?? '-'}
                      </Text>
                    </HStack>
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Fiscal Period
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {budget.fiscalPeriod ?? '-'}
                      </Text>
                    </HStack>
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Last Updated
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {formatDate(budget.lastUpdatedDate)}
                      </Text>
                    </HStack>
                    {budget.clinNumber !== null && (
                      <HStack justify="between">
                        <Text variant="bodySmall" color="muted">
                          CLIN
                        </Text>
                        <Text variant="bodySmall" weight="medium">
                          {budget.clinNumber}
                        </Text>
                      </HStack>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        )}

        {/* Description & Notes */}
        {isEditing === false && (budget.description !== null || budget.notes !== null) && (
          <Card variant="outlined">
            <CardBody>
              <Stack spacing="md">
                {budget.description !== null && budget.description.length > 0 && (
                  <Box>
                    <Text variant="caption" color="muted" weight="medium">
                      Description
                    </Text>
                    <Text variant="body">{budget.description}</Text>
                  </Box>
                )}
                {budget.notes !== null && budget.notes.length > 0 && (
                  <Box>
                    <Text variant="caption" color="muted" weight="medium">
                      Notes
                    </Text>
                    <Text variant="body">{budget.notes}</Text>
                  </Box>
                )}
              </Stack>
            </CardBody>
          </Card>
        )}
      </Stack>
    </Section>
  );
}

export default BudgetDetailPage;
