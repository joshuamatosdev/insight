/**
 * BudgetsPage - Budget management list page
 */
import {useCallback, useState} from 'react';
import {
    Badge,
    Button,
    InlineAlert,
    InlineAlertDescription,
    PlusIcon,
    RefreshIcon,
    Text
} from '@/components/catalyst/primitives';
import {
    Card,
    CardBody,
    CardHeader,
    Flex,
    Grid,
    GridItem,
    HStack,
    Section,
    SectionHeader,
    Stack,
} from '@/components/catalyst/layout';
import {BudgetCard, BudgetForm} from '@/components/domain/financial';
import {useBudgets} from '@/hooks/useFinancial';
import type {BudgetCategory, BudgetFormState, BudgetItem} from '@/types/financial.types';

const INITIAL_FORM_STATE: BudgetFormState = {
  contractId: '',
  clinId: '',
  name: '',
  description: '',
  category: 'DIRECT_LABOR',
  budgetedAmount: '',
  forecastAmount: '',
  periodStart: '',
  periodEnd: '',
  fiscalYear: '',
  fiscalPeriod: '',
  notes: '',
};

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

export interface BudgetsPageProps {
  /** Optional callback when a budget is viewed */
  onViewBudget?: (id: string) => void;
}

export function BudgetsPage({ onViewBudget }: BudgetsPageProps) {
  const {
    budgets,
    overBudgetItems,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error,
    loadBudgets,
    createNewBudget,
    updateBudgetById,
    deleteBudgetById,
    refresh,
  } = useBudgets();

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');

  const handleCreateClick = useCallback(() => {
    setEditingBudget(null);
    setShowForm(true);
  }, []);

  const handleEditClick = useCallback((budget: BudgetItem) => {
    setEditingBudget(budget);
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingBudget(null);
  }, []);

  const handleSubmitForm = useCallback(
    async (formData: BudgetFormState) => {
      setIsSubmitting(true);
      try {
        if (editingBudget !== null) {
          await updateBudgetById(editingBudget.id, {
            budgetedAmount: Number(formData.budgetedAmount),
            forecastAmount:
              formData.forecastAmount !== '' ? Number(formData.forecastAmount) : undefined,
            notes: formData.notes.length > 0 ? formData.notes : undefined,
          });
        } else {
          await createNewBudget({
            contractId: formData.contractId,
            clinId: formData.clinId.length > 0 ? formData.clinId : undefined,
            name: formData.name,
            description: formData.description.length > 0 ? formData.description : undefined,
            category: formData.category as BudgetCategory,
            budgetedAmount: Number(formData.budgetedAmount),
            forecastAmount:
              formData.forecastAmount !== '' ? Number(formData.forecastAmount) : undefined,
            periodStart: formData.periodStart.length > 0 ? formData.periodStart : undefined,
            periodEnd: formData.periodEnd.length > 0 ? formData.periodEnd : undefined,
            fiscalYear: formData.fiscalYear !== '' ? Number(formData.fiscalYear) : undefined,
            fiscalPeriod: formData.fiscalPeriod !== '' ? Number(formData.fiscalPeriod) : undefined,
            notes: formData.notes.length > 0 ? formData.notes : undefined,
          });
        }
        setShowForm(false);
        setEditingBudget(null);
      } catch (err) {
        console.error('Failed to save budget:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingBudget, createNewBudget, updateBudgetById]
  );

  const handleDeleteBudget = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this budget item?') === false) {
        return;
      }
      try {
        await deleteBudgetById(id);
      } catch (err) {
        console.error('Failed to delete budget:', err);
      }
    },
    [deleteBudgetById]
  );

  const handleFilterChange = useCallback(
    (category: string) => {
      setFilterCategory(category);
      loadBudgets(0, 20, category.length > 0 ? category : undefined);
    },
    [loadBudgets]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      loadBudgets(page, 20, filterCategory.length > 0 ? filterCategory : undefined);
    },
    [loadBudgets, filterCategory]
  );

  const getFormInitialData = useCallback((): BudgetFormState => {
    if (editingBudget !== null) {
      return {
        contractId: editingBudget.contractId,
        clinId: editingBudget.clinId ?? '',
        name: editingBudget.name,
        description: editingBudget.description ?? '',
        category: editingBudget.category,
        budgetedAmount: String(editingBudget.budgetedAmount),
        forecastAmount:
          editingBudget.forecastAmount !== null ? String(editingBudget.forecastAmount) : '',
        periodStart: editingBudget.periodStart ?? '',
        periodEnd: editingBudget.periodEnd ?? '',
        fiscalYear: editingBudget.fiscalYear !== null ? String(editingBudget.fiscalYear) : '',
        fiscalPeriod: editingBudget.fiscalPeriod !== null ? String(editingBudget.fiscalPeriod) : '',
        notes: editingBudget.notes ?? '',
      };
    }
    return INITIAL_FORM_STATE;
  }, [editingBudget]);

  if (isLoading && budgets.length === 0) {
    return (
      <Section id="budgets">
        <Flex justify="center" align="center">
          <Text variant="body" color="muted">
            Loading budgets...
          </Text>
        </Flex>
      </Section>
    );
  }

  return (
    <Section id="budgets">
      <SectionHeader
        title="Budget Management"
        icon={
          <Badge color="blue">
            $
          </Badge>
        }
        actions={
          showForm === false && (
            <HStack spacing="sm">
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshIcon size="sm" />
              </Button>
              <Button variant="primary" onClick={handleCreateClick}>
                <HStack spacing="xs" align="center">
                  <PlusIcon size="sm" />
                  <Text as="span" variant="bodySmall" color="white">
                    Add Budget Item
                  </Text>
                </HStack>
              </Button>
            </HStack>
          )
        }
      />

      {error !== null && (
        <InlineAlert color="error">
          <InlineAlertDescription>{error.message}</InlineAlertDescription>
        </InlineAlert>
      )}

      {/* Over Budget Alert */}
      {overBudgetItems.length > 0 && (
        <InlineAlert color="warning">
          <HStack spacing="sm" align="center">
            <Badge color="red">
              {overBudgetItems.length}
            </Badge>
            <InlineAlertDescription>
              budget items are over budget
            </InlineAlertDescription>
          </HStack>
        </InlineAlert>
      )}

      {/* Form */}
      {showForm && (
        <Card variant="elevated">
          <CardHeader>
            <Text variant="heading5">
              {editingBudget !== null ? 'Edit Budget Item' : 'Add Budget Item'}
            </Text>
          </CardHeader>
          <CardBody>
            <BudgetForm
              initialData={getFormInitialData()}
              onSubmit={handleSubmitForm}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
              categories={BUDGET_CATEGORIES}
            />
          </CardBody>
        </Card>
      )}

      {/* Filter */}
      <Stack spacing="md">
        <HStack spacing="sm">
          <Button
            variant={filterCategory === '' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('')}
          >
            All
          </Button>
          {BUDGET_CATEGORIES.slice(0, 5).map((cat) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(cat)}
            >
              {cat.replace('_', ' ')}
            </Button>
          ))}
        </HStack>

        {/* Budget Grid */}
        {budgets.length === 0 ? (
          <Card variant="outlined">
            <CardBody>
              <Flex
                direction="column"
                align="center"
                gap="md"
              >
                <Stack spacing="xs">
                  <Text variant="body" color="muted">
                    No budget items found.
                  </Text>
                  <Text variant="body" color="muted">
                    Create a budget item to start tracking your contract finances.
                  </Text>
                </Stack>
                <Button variant="primary" onClick={handleCreateClick}>
                  <HStack spacing="xs" align="center">
                    <PlusIcon size="sm" />
                    <Text as="span" variant="bodySmall" color="white">
                      Add First Budget Item
                    </Text>
                  </HStack>
                </Button>
              </Flex>
            </CardBody>
          </Card>
        ) : (
          <Stack spacing="lg">
            <Grid columns="repeat(auto-fill, minmax(350px, 1fr))" gap="md">
              {budgets.map((budget) => (
                <GridItem key={budget.id}>
                  <BudgetCard
                    budget={budget}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteBudget}
                  />
                </GridItem>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <HStack justify="center" spacing="sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Text variant="bodySmall" color="muted">
                  Page {currentPage + 1} of {totalPages} ({totalElements} items)
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </HStack>
            )}
          </Stack>
        )}
      </Stack>
    </Section>
  );
}

export default BudgetsPage;
