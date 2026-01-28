/**
 * LaborRatesPage - Labor rate management page
 */
import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { Text, Button, Badge, PlusIcon, RefreshIcon, Input, Select, InlineAlert, InlineAlertDescription } from '@/components/catalyst/primitives';
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
import { LaborRateTable } from '@/components/domain/financial';
import { useLaborRates } from '@/hooks/useFinancial';
import type { LaborRate, LaborRateFormState, LaborRateFormErrors } from '@/types/financial.types';

const INITIAL_FORM_STATE: LaborRateFormState = {
  contractId: '',
  laborCategory: '',
  laborCategoryDescription: '',
  minYearsExperience: '',
  maxYearsExperience: '',
  educationRequirement: '',
  baseRate: '',
  fringeRate: '',
  overheadRate: '',
  gaRate: '',
  feeRate: '',
  billingRate: '',
  rateType: 'Hourly',
  effectiveDate: '',
  endDate: '',
  fiscalYear: '',
  notes: '',
};

const RATE_TYPES = ['Hourly', 'Daily', 'Monthly'];

function validateForm(form: LaborRateFormState): LaborRateFormErrors {
  const errors: LaborRateFormErrors = {};

  if (form.laborCategory.trim().length === 0) {
    errors.laborCategory = 'Labor category is required';
  }

  if (form.baseRate.trim().length === 0) {
    errors.baseRate = 'Base rate is required';
  } else if (isNaN(Number(form.baseRate)) || Number(form.baseRate) <= 0) {
    errors.baseRate = 'Please enter a valid positive number';
  }

  return errors;
}

export function LaborRatesPage() {
  const {
    laborRates,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error,
    loadLaborRates,
    createNewLaborRate,
    updateLaborRateById,
    toggleLaborRateActive,
    deleteLaborRateById,
    refresh,
  } = useLaborRates();

  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<LaborRate | null>(null);
  const [form, setForm] = useState<LaborRateFormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<LaborRateFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const handleCreateClick = useCallback(() => {
    setEditingRate(null);
    setForm(INITIAL_FORM_STATE);
    setFormErrors({});
    setShowForm(true);
  }, []);

  const handleEditClick = useCallback((rate: LaborRate) => {
    setEditingRate(rate);
    setForm({
      contractId: rate.contractId ?? '',
      laborCategory: rate.laborCategory,
      laborCategoryDescription: rate.laborCategoryDescription ?? '',
      minYearsExperience:
        rate.minYearsExperience !== null ? String(rate.minYearsExperience) : '',
      maxYearsExperience:
        rate.maxYearsExperience !== null ? String(rate.maxYearsExperience) : '',
      educationRequirement: rate.educationRequirement ?? '',
      baseRate: String(rate.baseRate),
      fringeRate: rate.fringeRate !== null ? String(rate.fringeRate) : '',
      overheadRate: rate.overheadRate !== null ? String(rate.overheadRate) : '',
      gaRate: rate.gaRate !== null ? String(rate.gaRate) : '',
      feeRate: rate.feeRate !== null ? String(rate.feeRate) : '',
      billingRate: rate.billingRate !== null ? String(rate.billingRate) : '',
      rateType: rate.rateType ?? 'Hourly',
      effectiveDate: rate.effectiveDate ?? '',
      endDate: rate.endDate ?? '',
      fiscalYear: rate.fiscalYear !== null ? String(rate.fiscalYear) : '',
      notes: rate.notes ?? '',
    });
    setFormErrors({});
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingRate(null);
    setForm(INITIAL_FORM_STATE);
    setFormErrors({});
  }, []);

  const handleInputChange = useCallback(
    (field: keyof LaborRateFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (formErrors[field as keyof LaborRateFormErrors] !== undefined) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [formErrors]
  );

  const handleSelectChange = useCallback(
    (field: keyof LaborRateFormState) => (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmitForm = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const errors = validateForm(form);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setIsSubmitting(true);
      try {
        if (editingRate !== null) {
          await updateLaborRateById(editingRate.id, {
            baseRate: Number(form.baseRate),
            fringeRate: form.fringeRate !== '' ? Number(form.fringeRate) : undefined,
            overheadRate: form.overheadRate !== '' ? Number(form.overheadRate) : undefined,
            gaRate: form.gaRate !== '' ? Number(form.gaRate) : undefined,
            feeRate: form.feeRate !== '' ? Number(form.feeRate) : undefined,
            billingRate: form.billingRate !== '' ? Number(form.billingRate) : undefined,
            effectiveDate: form.effectiveDate.length > 0 ? form.effectiveDate : undefined,
            endDate: form.endDate.length > 0 ? form.endDate : undefined,
            notes: form.notes.length > 0 ? form.notes : undefined,
          });
        } else {
          await createNewLaborRate({
            contractId: form.contractId.length > 0 ? form.contractId : undefined,
            laborCategory: form.laborCategory,
            laborCategoryDescription:
              form.laborCategoryDescription.length > 0 ? form.laborCategoryDescription : undefined,
            minYearsExperience:
              form.minYearsExperience !== '' ? Number(form.minYearsExperience) : undefined,
            maxYearsExperience:
              form.maxYearsExperience !== '' ? Number(form.maxYearsExperience) : undefined,
            educationRequirement:
              form.educationRequirement.length > 0 ? form.educationRequirement : undefined,
            baseRate: Number(form.baseRate),
            fringeRate: form.fringeRate !== '' ? Number(form.fringeRate) : undefined,
            overheadRate: form.overheadRate !== '' ? Number(form.overheadRate) : undefined,
            gaRate: form.gaRate !== '' ? Number(form.gaRate) : undefined,
            feeRate: form.feeRate !== '' ? Number(form.feeRate) : undefined,
            billingRate: form.billingRate !== '' ? Number(form.billingRate) : undefined,
            rateType: form.rateType.length > 0 ? form.rateType : undefined,
            effectiveDate: form.effectiveDate.length > 0 ? form.effectiveDate : undefined,
            endDate: form.endDate.length > 0 ? form.endDate : undefined,
            fiscalYear: form.fiscalYear !== '' ? Number(form.fiscalYear) : undefined,
            notes: form.notes.length > 0 ? form.notes : undefined,
          });
        }
        handleCancelForm();
      } catch (err) {
        console.error('Failed to save labor rate:', err);
        setFormErrors({ general: 'Failed to save labor rate. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, editingRate, createNewLaborRate, updateLaborRateById, handleCancelForm]
  );

  const handleToggleActive = useCallback(
    async (id: string, active: boolean) => {
      try {
        await toggleLaborRateActive(id, active);
      } catch (err) {
        console.error('Failed to toggle labor rate:', err);
      }
    },
    [toggleLaborRateActive]
  );

  const handleDeleteRate = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this labor rate?') === false) {
        return;
      }
      try {
        await deleteLaborRateById(id);
      } catch (err) {
        console.error('Failed to delete labor rate:', err);
      }
    },
    [deleteLaborRateById]
  );

  const handleToggleActiveOnly = useCallback(() => {
    const newActiveOnly = !showActiveOnly;
    setShowActiveOnly(newActiveOnly);
    loadLaborRates(0, 20, newActiveOnly);
  }, [showActiveOnly, loadLaborRates]);

  const handlePageChange = useCallback(
    (page: number) => {
      loadLaborRates(page, 20, showActiveOnly);
    },
    [loadLaborRates, showActiveOnly]
  );

  if (isLoading && laborRates.length === 0) {
    return (
      <Section id="labor-rates">
        <Flex justify="center" align="center" className="min-h-[300px]">
          <Text variant="body" color="muted">
            Loading labor rates...
          </Text>
        </Flex>
      </Section>
    );
  }

  return (
    <Section id="labor-rates">
      <SectionHeader
        title="Labor Rates"
        icon={<Badge color="cyan">$</Badge>}
        actions={
          showForm === false && (
            <HStack spacing="sm">
              <Button
                variant={showActiveOnly ? 'primary' : 'outline'}
                size="sm"
                onClick={handleToggleActiveOnly}
              >
                Active Only
              </Button>
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshIcon size="sm" />
              </Button>
              <Button variant="primary" onClick={handleCreateClick}>
                <HStack spacing="xs" align="center">
                  <PlusIcon size="sm" />
                  <Text as="span" variant="bodySmall" color="white">
                    Add Rate
                  </Text>
                </HStack>
              </Button>
            </HStack>
          )
        }
      />

      {error !== null && (
        <InlineAlert color="error" className="mb-4">
          <InlineAlertDescription>{error.message}</InlineAlertDescription>
        </InlineAlert>
      )}

      {/* Form */}
      {showForm && (
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <Text variant="heading5">
              {editingRate !== null ? 'Edit Labor Rate' : 'Add Labor Rate'}
            </Text>
          </CardHeader>
          <CardBody>
            <Box as="form" onSubmit={handleSubmitForm}>
              <Stack spacing="md">
                {formErrors.general !== undefined && (
                  <InlineAlert color="error">
                    <InlineAlertDescription>{formErrors.general}</InlineAlertDescription>
                  </InlineAlert>
                )}

                {/* Category Info */}
                <Grid columns={2} gap="md">
                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Labor Category *
                    </Text>
                    <Input
                      type="text"
                      value={form.laborCategory}
                      onChange={handleInputChange('laborCategory')}
                      placeholder="e.g., Senior Software Engineer"
                      fullWidth
                      invalid={formErrors.laborCategory !== undefined}
                    />
                    {formErrors.laborCategory !== undefined && (
                      <Text
                        variant="caption"
                        color="danger"
                        className="mt-1"
                      >
                        {formErrors.laborCategory}
                      </Text>
                    )}
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Description
                    </Text>
                    <Input
                      type="text"
                      value={form.laborCategoryDescription}
                      onChange={handleInputChange('laborCategoryDescription')}
                      placeholder="Category description"
                      fullWidth
                    />
                  </GridItem>
                </Grid>

                {/* Experience & Education */}
                <Grid columns={3} gap="md">
                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Min Years Experience
                    </Text>
                    <Input
                      type="number"
                      value={form.minYearsExperience}
                      onChange={handleInputChange('minYearsExperience')}
                      placeholder="e.g., 5"
                      fullWidth
                    />
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Max Years Experience
                    </Text>
                    <Input
                      type="number"
                      value={form.maxYearsExperience}
                      onChange={handleInputChange('maxYearsExperience')}
                      placeholder="e.g., 10"
                      fullWidth
                    />
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Education Requirement
                    </Text>
                    <Input
                      type="text"
                      value={form.educationRequirement}
                      onChange={handleInputChange('educationRequirement')}
                      placeholder="e.g., BS Computer Science"
                      fullWidth
                    />
                  </GridItem>
                </Grid>

                {/* Rates */}
                <Grid columns={3} gap="md">
                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Base Rate ($) *
                    </Text>
                    <Input
                      type="number"
                      value={form.baseRate}
                      onChange={handleInputChange('baseRate')}
                      placeholder="e.g., 75.00"
                      fullWidth
                      invalid={formErrors.baseRate !== undefined}
                    />
                    {formErrors.baseRate !== undefined && (
                      <Text
                        variant="caption"
                        color="danger"
                        className="mt-1"
                      >
                        {formErrors.baseRate}
                      </Text>
                    )}
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Billing Rate ($)
                    </Text>
                    <Input
                      type="number"
                      value={form.billingRate}
                      onChange={handleInputChange('billingRate')}
                      placeholder="e.g., 150.00"
                      fullWidth
                    />
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Rate Type
                    </Text>
                    <Select
                      value={form.rateType}
                      onChange={handleSelectChange('rateType')}
                      fullWidth
                      options={RATE_TYPES.map((type) => ({ value: type, label: type }))}
                    />
                  </GridItem>
                </Grid>

                {/* Burden Rates */}
                <Grid columns={4} gap="md">
                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Fringe Rate
                    </Text>
                    <Input
                      type="number"
                      value={form.fringeRate}
                      onChange={handleInputChange('fringeRate')}
                      placeholder="e.g., 0.35"
                      fullWidth
                    />
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Overhead Rate
                    </Text>
                    <Input
                      type="number"
                      value={form.overheadRate}
                      onChange={handleInputChange('overheadRate')}
                      placeholder="e.g., 0.50"
                      fullWidth
                    />
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      G&A Rate
                    </Text>
                    <Input
                      type="number"
                      value={form.gaRate}
                      onChange={handleInputChange('gaRate')}
                      placeholder="e.g., 0.10"
                      fullWidth
                    />
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Fee Rate
                    </Text>
                    <Input
                      type="number"
                      value={form.feeRate}
                      onChange={handleInputChange('feeRate')}
                      placeholder="e.g., 0.10"
                      fullWidth
                    />
                  </GridItem>
                </Grid>

                {/* Effective Period */}
                <Grid columns={3} gap="md">
                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      Effective Date
                    </Text>
                    <Input
                      type="date"
                      value={form.effectiveDate}
                      onChange={handleInputChange('effectiveDate')}
                      fullWidth
                    />
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
                      End Date
                    </Text>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={handleInputChange('endDate')}
                      fullWidth
                    />
                  </GridItem>

                  <GridItem>
                    <Text as="label" variant="label" className="block mb-1">
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
                </Grid>

                {/* Notes */}
                <Box>
                  <Text as="label" variant="label" className="block mb-1">
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
                <HStack justify="end" spacing="sm">
                  <Button variant="outline" type="button" onClick={handleCancelForm}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  >
                    {editingRate !== null ? 'Update Rate' : 'Create Rate'}
                  </Button>
                </HStack>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Labor Rates Table */}
      <LaborRateTable
        rates={laborRates}
        onEdit={handleEditClick}
        onToggleActive={handleToggleActive}
        onDelete={handleDeleteRate}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <HStack justify="center" spacing="sm" className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 0}
          >
            Previous
          </Button>
          <Text variant="bodySmall" color="muted">
            Page {currentPage + 1} of {totalPages} ({totalElements} rates)
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
    </Section>
  );
}

export default LaborRatesPage;
