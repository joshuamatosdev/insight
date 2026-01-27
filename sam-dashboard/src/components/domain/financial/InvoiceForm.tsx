/**
 * InvoiceForm - Form for creating/editing invoices
 */
import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
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
import type { InvoiceFormProps } from './Financial.types';
import type { InvoiceFormState, InvoiceFormErrors, InvoiceType } from '../../../types/financial.types';

const INVOICE_TYPES: { value: InvoiceType; label: string }[] = [
  { value: 'PROGRESS', label: 'Progress Payment' },
  { value: 'MILESTONE', label: 'Milestone Payment' },
  { value: 'FIXED_PRICE', label: 'Fixed Price' },
  { value: 'FINAL', label: 'Final Invoice' },
  { value: 'RETAINAGE_RELEASE', label: 'Retainage Release' },
  { value: 'ADJUSTMENT', label: 'Adjustment/Credit' },
  { value: 'REIMBURSEMENT', label: 'Reimbursement' },
];

function validateForm(form: InvoiceFormState): InvoiceFormErrors {
  const errors: InvoiceFormErrors = {};

  if (form.contractId.trim().length === 0) {
    errors.contractId = 'Please select a contract';
  }

  if (form.invoiceNumber.trim().length === 0) {
    errors.invoiceNumber = 'Invoice number is required';
  }

  if (form.invoiceDate.trim().length === 0) {
    errors.invoiceDate = 'Invoice date is required';
  }

  return errors;
}

export function InvoiceForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  contracts,
}: InvoiceFormProps) {
  const [form, setForm] = useState<InvoiceFormState>(initialData);
  const [errors, setErrors] = useState<InvoiceFormErrors>({});

  const handleInputChange = useCallback(
    (field: keyof InvoiceFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof InvoiceFormErrors] !== undefined) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSelectChange = useCallback(
    (field: keyof InvoiceFormState) => (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof InvoiceFormErrors] !== undefined) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
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
          {/* Contract Selection */}
          <Field>
            <Label>Contract *</Label>
            <Select
              value={form.contractId}
              onChange={handleSelectChange('contractId')}
            >
              <option value="">Select a contract</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.contractNumber}
                </option>
              ))}
            </Select>
            {errors.contractId !== undefined && (
              <p className="mt-1 text-sm text-danger">{errors.contractId}</p>
            )}
          </Field>

          {/* Invoice Number and Type */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field>
              <Label>Invoice Number *</Label>
              <Input
                type="text"
                value={form.invoiceNumber}
                onChange={handleInputChange('invoiceNumber')}
                placeholder="e.g., INV-2024-001"
                invalid={errors.invoiceNumber !== undefined}
              />
              {errors.invoiceNumber !== undefined && (
                <p className="mt-1 text-sm text-danger">{errors.invoiceNumber}</p>
              )}
            </Field>

            <Field>
              <Label>Invoice Type *</Label>
              <Select
                value={form.invoiceType}
                onChange={handleSelectChange('invoiceType')}
              >
                {INVOICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Invoice Date and Due Date */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field>
              <Label>Invoice Date *</Label>
              <Input
                type="date"
                value={form.invoiceDate}
                onChange={handleInputChange('invoiceDate')}
                invalid={errors.invoiceDate !== undefined}
              />
              {errors.invoiceDate !== undefined && (
                <p className="mt-1 text-sm text-danger">{errors.invoiceDate}</p>
              )}
            </Field>

            <Field>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={handleInputChange('dueDate')}
              />
            </Field>
          </div>

          {/* Performance Period */}
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
          color="dark/zinc"
          type="submit"
          disabled={isSubmitting}
        >
          {initialData.invoiceNumber !== '' ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}

export default InvoiceForm;
