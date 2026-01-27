/**
 * BudgetForm - Form for creating/editing budget items
 */
import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { Text, Button, Input, Select } from '../../primitives';
import { Stack, HStack, Grid, GridItem, Box } from '../../layout';
import type { BudgetFormProps } from './Financial.types';
import type { BudgetFormState, BudgetFormErrors, BudgetCategory } from '../../../types/financial.types';
import { getCategoryLabel } from '../../../services/financialService';

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

function validateForm(form: BudgetFormState): BudgetFormErrors {
  const errors: BudgetFormErrors = {};

  if (form.name.trim().length === 0) {
    errors.name = 'Budget name is required';
  }

  if (form.budgetedAmount.trim().length === 0) {
    errors.budgetedAmount = 'Budgeted amount is required';
  } else if (isNaN(Number(form.budgetedAmount)) || Number(form.budgetedAmount) < 0) {
    errors.budgetedAmount = 'Please enter a valid positive number';
  }

  return errors;
}

export function BudgetForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: BudgetFormProps) {
  const [form, setForm] = useState<BudgetFormState>(initialData);
  const [errors, setErrors] = useState<BudgetFormErrors>({});

  const handleInputChange = useCallback(
    (field: keyof BudgetFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof BudgetFormErrors] !== undefined) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSelectChange = useCallback(
    (field: keyof BudgetFormState) => (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSubmit(form);
    },
    [form, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="var(--spacing-4)">
        {errors.general !== undefined && (
          <Box
            style={{
              padding: 'var(--spacing-3)',
              backgroundColor: 'var(--color-danger-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-danger)',
            }}
          >
            <Text variant="bodySmall" color="danger">
              {errors.general}
            </Text>
          </Box>
        )}

        {/* Budget Name */}
        <Box>
          <Text
            as="label"
            variant="bodySmall"
            weight="medium"
            className="block mb-1"
          >
            Budget Name *
          </Text>
          <Input
            type="text"
            value={form.name}
            onChange={handleInputChange('name')}
            placeholder="e.g., FY2024 Q1 Labor"
            fullWidth
            isInvalid={errors.name !== undefined}
          />
          {errors.name !== undefined && (
            <Text
              variant="caption"
              color="danger"
              className="mt-1"
            >
              {errors.name}
            </Text>
          )}
        </Box>

        {/* Category */}
        <Box>
          <Text
            as="label"
            variant="bodySmall"
            weight="medium"
            className="block mb-1"
          >
            Category *
          </Text>
          <Select
            value={form.category}
            onChange={handleSelectChange('category')}
            fullWidth
          >
            {BUDGET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </Select>
        </Box>

        {/* Amounts */}
        <Grid columns="1fr 1fr" gap="var(--spacing-4)">
          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              className="block mb-1"
            >
              Budgeted Amount ($) *
            </Text>
            <Input
              type="number"
              value={form.budgetedAmount}
              onChange={handleInputChange('budgetedAmount')}
              placeholder="e.g., 100000"
              fullWidth
              isInvalid={errors.budgetedAmount !== undefined}
            />
            {errors.budgetedAmount !== undefined && (
              <Text
                variant="caption"
                color="danger"
                className="mt-1"
              >
                {errors.budgetedAmount}
              </Text>
            )}
          </GridItem>

          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              className="block mb-1"
            >
              Forecast Amount ($)
            </Text>
            <Input
              type="number"
              value={form.forecastAmount}
              onChange={handleInputChange('forecastAmount')}
              placeholder="Optional forecast"
              fullWidth
            />
          </GridItem>
        </Grid>

        {/* Period */}
        <Grid columns="1fr 1fr" gap="var(--spacing-4)">
          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              className="block mb-1"
            >
              Period Start
            </Text>
            <Input
              type="date"
              value={form.periodStart}
              onChange={handleInputChange('periodStart')}
              fullWidth
            />
          </GridItem>

          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              className="block mb-1"
            >
              Period End
            </Text>
            <Input
              type="date"
              value={form.periodEnd}
              onChange={handleInputChange('periodEnd')}
              fullWidth
            />
          </GridItem>
        </Grid>

        {/* Fiscal Info */}
        <Grid columns="1fr 1fr" gap="var(--spacing-4)">
          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              className="block mb-1"
            >
              Fiscal Year
            </Text>
            <Input
              type="number"
              value={form.fiscalYear}
              onChange={handleInputChange('fiscalYear')}
              placeholder="e.g., 2024"
              fullWidth
            />
          </GridItem>

          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              className="block mb-1"
            >
              Fiscal Period
            </Text>
            <Input
              type="number"
              value={form.fiscalPeriod}
              onChange={handleInputChange('fiscalPeriod')}
              placeholder="e.g., 1"
              fullWidth
            />
          </GridItem>
        </Grid>

        {/* Description */}
        <Box>
          <Text
            as="label"
            variant="bodySmall"
            weight="medium"
            className="block mb-1"
          >
            Description
          </Text>
          <Input
            type="text"
            value={form.description}
            onChange={handleInputChange('description')}
            placeholder="Optional description"
            fullWidth
          />
        </Box>

        {/* Notes */}
        <Box>
          <Text
            as="label"
            variant="bodySmall"
            weight="medium"
            className="block mb-1"
          >
            Notes
          </Text>
          <Input
            type="text"
            value={form.notes}
            onChange={handleInputChange('notes')}
            placeholder="Optional notes"
            fullWidth
          />
        </Box>

        {/* Submit buttons */}
        <HStack justify="end" spacing="var(--spacing-2)">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {initialData.name !== '' ? 'Update Budget' : 'Create Budget'}
          </Button>
        </HStack>
      </Stack>
    </form>
  );
}

export default BudgetForm;
