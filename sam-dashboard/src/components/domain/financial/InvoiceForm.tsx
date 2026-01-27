/**
 * InvoiceForm - Form for creating/editing invoices
 */
import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { Text, Button, Input, Select } from '../../primitives';
import { Stack, HStack, Grid, GridItem, Box } from '../../layout';
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

        {/* Contract Selection */}
        <Box>
          <Text
            as="label"
            variant="bodySmall"
            weight="medium"
            style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
          >
            Contract *
          </Text>
          <Select
            value={form.contractId}
            onChange={handleSelectChange('contractId')}
            fullWidth
          >
            <option value="">Select a contract</option>
            {contracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.contractNumber}
              </option>
            ))}
          </Select>
          {errors.contractId !== undefined && (
            <Text
              variant="caption"
              color="danger"
              style={{ marginTop: 'var(--spacing-1)' }}
            >
              {errors.contractId}
            </Text>
          )}
        </Box>

        {/* Invoice Number and Type */}
        <Grid columns="1fr 1fr" gap="var(--spacing-4)">
          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
            >
              Invoice Number *
            </Text>
            <Input
              type="text"
              value={form.invoiceNumber}
              onChange={handleInputChange('invoiceNumber')}
              placeholder="e.g., INV-2024-001"
              fullWidth
              isInvalid={errors.invoiceNumber !== undefined}
            />
            {errors.invoiceNumber !== undefined && (
              <Text
                variant="caption"
                color="danger"
                style={{ marginTop: 'var(--spacing-1)' }}
              >
                {errors.invoiceNumber}
              </Text>
            )}
          </GridItem>

          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
            >
              Invoice Type *
            </Text>
            <Select
              value={form.invoiceType}
              onChange={handleSelectChange('invoiceType')}
              fullWidth
            >
              {INVOICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </GridItem>
        </Grid>

        {/* Invoice Date and Due Date */}
        <Grid columns="1fr 1fr" gap="var(--spacing-4)">
          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
            >
              Invoice Date *
            </Text>
            <Input
              type="date"
              value={form.invoiceDate}
              onChange={handleInputChange('invoiceDate')}
              fullWidth
              isInvalid={errors.invoiceDate !== undefined}
            />
            {errors.invoiceDate !== undefined && (
              <Text
                variant="caption"
                color="danger"
                style={{ marginTop: 'var(--spacing-1)' }}
              >
                {errors.invoiceDate}
              </Text>
            )}
          </GridItem>

          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
            >
              Due Date
            </Text>
            <Input
              type="date"
              value={form.dueDate}
              onChange={handleInputChange('dueDate')}
              fullWidth
            />
          </GridItem>
        </Grid>

        {/* Performance Period */}
        <Grid columns="1fr 1fr" gap="var(--spacing-4)">
          <GridItem>
            <Text
              as="label"
              variant="bodySmall"
              weight="medium"
              style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
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
              style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
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

        {/* Notes */}
        <Box>
          <Text
            as="label"
            variant="bodySmall"
            weight="medium"
            style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
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
            {initialData.invoiceNumber !== '' ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </HStack>
      </Stack>
    </form>
  );
}

export default InvoiceForm;
