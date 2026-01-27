/**
 * BudgetForm - Form for creating/editing budget items
 */
import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import clsx from 'clsx';
import {
  Button,
  Field,
  FieldGroup,
  Fieldset,
  Input,
  Label,
  Select,
  InlineAlert,
  InlineAlertTitle,
  InlineAlertDescription,
} from '../../catalyst';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general !== undefined && (
        <InlineAlert color="error" icon={ExclamationTriangleIcon}>
          <InlineAlertTitle>Error</InlineAlertTitle>
          <InlineAlertDescription>{errors.general}</InlineAlertDescription>
        </InlineAlert>
      )}

      <Fieldset>
        <FieldGroup>
          {/* Budget Name */}
          <Field>
            <Label>Budget Name *</Label>
            <Input
              type="text"
              value={form.name}
              onChange={handleInputChange('name')}
              placeholder="e.g., FY2024 Q1 Labor"
              invalid={errors.name !== undefined}
            />
            {errors.name !== undefined && (
              <p className="mt-1 text-sm text-danger">{errors.name}</p>
            )}
          </Field>

          {/* Category */}
          <Field>
            <Label>Category *</Label>
            <Select
              value={form.category}
              onChange={handleSelectChange('category')}
            >
              {BUDGET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </Select>
          </Field>

          {/* Amounts */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field>
              <Label>Budgeted Amount ($) *</Label>
              <Input
                type="number"
                value={form.budgetedAmount}
                onChange={handleInputChange('budgetedAmount')}
                placeholder="e.g., 100000"
                invalid={errors.budgetedAmount !== undefined}
              />
              {errors.budgetedAmount !== undefined && (
                <p className="mt-1 text-sm text-danger">{errors.budgetedAmount}</p>
              )}
            </Field>

            <Field>
              <Label>Forecast Amount ($)</Label>
              <Input
                type="number"
                value={form.forecastAmount}
                onChange={handleInputChange('forecastAmount')}
                placeholder="Optional forecast"
              />
            </Field>
          </div>

          {/* Period */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field>
              <Label>Period Start</Label>
              <Input
                type="date"
                value={form.periodStart}
                onChange={handleInputChange('periodStart')}
              />
            </Field>

            <Field>
              <Label>Period End</Label>
              <Input
                type="date"
                value={form.periodEnd}
                onChange={handleInputChange('periodEnd')}
              />
            </Field>
          </div>

          {/* Fiscal Info */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field>
              <Label>Fiscal Year</Label>
              <Input
                type="number"
                value={form.fiscalYear}
                onChange={handleInputChange('fiscalYear')}
                placeholder="e.g., 2024"
              />
            </Field>

            <Field>
              <Label>Fiscal Period</Label>
              <Input
                type="number"
                value={form.fiscalPeriod}
                onChange={handleInputChange('fiscalPeriod')}
                placeholder="e.g., 1"
              />
            </Field>
          </div>

          {/* Description */}
          <Field>
            <Label>Description</Label>
            <Input
              type="text"
              value={form.description}
              onChange={handleInputChange('description')}
              placeholder="Optional description"
            />
          </Field>

          {/* Notes */}
          <Field>
            <Label>Notes</Label>
            <Input
              type="text"
              value={form.notes}
              onChange={handleInputChange('notes')}
              placeholder="Optional notes"
            />
          </Field>
        </FieldGroup>
      </Fieldset>

      {/* Submit buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-950/5 pt-6 dark:border-white/10">
        <Button plain type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          color="cyan"
          type="submit"
          disabled={isSubmitting}
        >
          {initialData.name !== '' ? 'Update Budget' : 'Create Budget'}
        </Button>
      </div>
    </form>
  );
}

export default BudgetForm;
