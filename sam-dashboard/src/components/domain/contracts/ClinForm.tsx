import { useState, useCallback, CSSProperties } from 'react';
import { Text, Button, Input, Select } from '../../primitives';
import { Card, CardHeader, CardBody, CardFooter, Grid, HStack, Box } from '../../layout';
import type {
  ClinFormProps,
  CreateClinRequest,
  UpdateClinRequest,
  ClinType,
  PricingType,
} from './Contract.types';

const CLIN_TYPES: { value: ClinType; label: string }[] = [
  { value: 'BASE', label: 'Base' },
  { value: 'OPTION', label: 'Option' },
  { value: 'DATA', label: 'Data' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'SUPPLIES', label: 'Supplies' },
  { value: 'OTHER', label: 'Other' },
];

const PRICING_TYPES: { value: PricingType; label: string }[] = [
  { value: 'FIRM_FIXED_PRICE', label: 'Firm Fixed Price (FFP)' },
  { value: 'TIME_AND_MATERIALS', label: 'Time and Materials (T&M)' },
  { value: 'LABOR_HOUR', label: 'Labor Hour (LH)' },
  { value: 'COST_PLUS_FIXED_FEE', label: 'Cost Plus Fixed Fee (CPFF)' },
  { value: 'COST_PLUS_INCENTIVE_FEE', label: 'Cost Plus Incentive Fee (CPIF)' },
  { value: 'COST_REIMBURSEMENT', label: 'Cost Reimbursement (CR)' },
];

interface FormState {
  clinNumber: string;
  description: string;
  clinType: ClinType;
  pricingType: PricingType | '';
  totalValue: string;
  fundedAmount: string;
  invoicedAmount: string;
  isOption: boolean;
  optionPeriod: string;
  notes: string;
}

export function ClinForm({
  clin,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
  style,
}: ClinFormProps) {
  const isEditing = clin !== undefined;

  const [formState, setFormState] = useState<FormState>({
    clinNumber: clin?.clinNumber ?? '',
    description: clin?.description ?? '',
    clinType: clin?.clinType ?? 'BASE',
    pricingType: clin?.pricingType ?? '',
    totalValue:
      clin?.totalValue !== null && clin?.totalValue !== undefined
        ? String(clin.totalValue)
        : '',
    fundedAmount:
      clin?.fundedAmount !== null && clin?.fundedAmount !== undefined
        ? String(clin.fundedAmount)
        : '',
    invoicedAmount:
      clin?.invoicedAmount !== null && clin?.invoicedAmount !== undefined
        ? String(clin.invoicedAmount)
        : '',
    isOption: clin?.isOption ?? false,
    optionPeriod:
      clin?.optionPeriod !== null && clin?.optionPeriod !== undefined
        ? String(clin.optionPeriod)
        : '',
    notes: clin?.notes ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value =
          event.target.type === 'checkbox'
            ? (event.target as HTMLInputElement).checked
            : event.target.value;
        setFormState((prev) => ({
          ...prev,
          [field]: value,
        }));
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (formState.clinNumber.trim().length === 0) {
      newErrors.clinNumber = 'CLIN number is required';
    }

    if (
      formState.totalValue.length > 0 &&
      (isNaN(Number(formState.totalValue)) || Number(formState.totalValue) < 0)
    ) {
      newErrors.totalValue = 'Total value must be a positive number';
    }

    if (
      formState.fundedAmount.length > 0 &&
      (isNaN(Number(formState.fundedAmount)) || Number(formState.fundedAmount) < 0)
    ) {
      newErrors.fundedAmount = 'Funded amount must be a positive number';
    }

    if (
      formState.invoicedAmount.length > 0 &&
      (isNaN(Number(formState.invoicedAmount)) || Number(formState.invoicedAmount) < 0)
    ) {
      newErrors.invoicedAmount = 'Invoiced amount must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      if (validate() === false) {
        return;
      }

      if (isEditing) {
        const updateData: UpdateClinRequest = {
          description: formState.description.length > 0 ? formState.description : undefined,
          totalValue: formState.totalValue.length > 0 ? Number(formState.totalValue) : undefined,
          fundedAmount:
            formState.fundedAmount.length > 0 ? Number(formState.fundedAmount) : undefined,
          invoicedAmount:
            formState.invoicedAmount.length > 0 ? Number(formState.invoicedAmount) : undefined,
          notes: formState.notes.length > 0 ? formState.notes : undefined,
        };
        onSubmit(updateData);
      } else {
        const createData: CreateClinRequest = {
          clinNumber: formState.clinNumber,
          description: formState.description.length > 0 ? formState.description : undefined,
          clinType: formState.clinType,
          pricingType: formState.pricingType.length > 0 ? (formState.pricingType as PricingType) : undefined,
          totalValue: formState.totalValue.length > 0 ? Number(formState.totalValue) : undefined,
          fundedAmount:
            formState.fundedAmount.length > 0 ? Number(formState.fundedAmount) : undefined,
          isOption: formState.isOption,
          optionPeriod:
            formState.isOption && formState.optionPeriod.length > 0
              ? Number(formState.optionPeriod)
              : undefined,
          notes: formState.notes.length > 0 ? formState.notes : undefined,
        };
        onSubmit(createData);
      }
    },
    [formState, isEditing, onSubmit, validate]
  );

  const formStyles: CSSProperties = {
    ...style,
  };

  return (
    <Card className={className} style={formStyles}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <Text variant="heading4">{isEditing ? 'Edit CLIN' : 'Add CLIN'}</Text>
        </CardHeader>
        <CardBody>
          <Grid columns={2} gap="var(--spacing-4)">
            <Box>
              <label htmlFor="clinNumber">
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  className="mb-1"
                >
                  CLIN Number *
                </Text>
              </label>
              <Input
                id="clinNumber"
                value={formState.clinNumber}
                onChange={handleChange('clinNumber')}
                disabled={isEditing || isLoading}
                placeholder="e.g., 0001"
              />
              {errors.clinNumber !== undefined && (
                <Text
                  variant="caption"
                  color="danger"
                  className="mt-1"
                >
                  {errors.clinNumber}
                </Text>
              )}
            </Box>
            <Box>
              <label htmlFor="clinType">
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  className="mb-1"
                >
                  CLIN Type
                </Text>
              </label>
              <Select
                id="clinType"
                value={formState.clinType}
                onChange={handleChange('clinType')}
                disabled={isEditing || isLoading}
              >
                {CLIN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Box>
            <Box style={{ gridColumn: 'span 2' }}>
              <label htmlFor="description">
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  className="mb-1"
                >
                  Description
                </Text>
              </label>
              <Input
                id="description"
                value={formState.description}
                onChange={handleChange('description')}
                disabled={isLoading}
                placeholder="CLIN description"
              />
            </Box>
            <Box>
              <label htmlFor="pricingType">
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  className="mb-1"
                >
                  Pricing Type
                </Text>
              </label>
              <Select
                id="pricingType"
                value={formState.pricingType}
                onChange={handleChange('pricingType')}
                disabled={isEditing || isLoading}
              >
                <option value="">Select...</option>
                {PRICING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Box>
            <Box>
              <label htmlFor="totalValue">
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  className="mb-1"
                >
                  Total Value ($)
                </Text>
              </label>
              <Input
                id="totalValue"
                type="number"
                value={formState.totalValue}
                onChange={handleChange('totalValue')}
                disabled={isLoading}
                placeholder="0"
              />
              {errors.totalValue !== undefined && (
                <Text
                  variant="caption"
                  color="danger"
                  className="mt-1"
                >
                  {errors.totalValue}
                </Text>
              )}
            </Box>
            <Box>
              <label htmlFor="fundedAmount">
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  className="mb-1"
                >
                  Funded Amount ($)
                </Text>
              </label>
              <Input
                id="fundedAmount"
                type="number"
                value={formState.fundedAmount}
                onChange={handleChange('fundedAmount')}
                disabled={isLoading}
                placeholder="0"
              />
              {errors.fundedAmount !== undefined && (
                <Text
                  variant="caption"
                  color="danger"
                  className="mt-1"
                >
                  {errors.fundedAmount}
                </Text>
              )}
            </Box>
            {isEditing && (
              <Box>
                <label htmlFor="invoicedAmount">
                  <Text
                    variant="bodySmall"
                    weight="semibold"
                    className="mb-1"
                  >
                    Invoiced Amount ($)
                  </Text>
                </label>
                <Input
                  id="invoicedAmount"
                  type="number"
                  value={formState.invoicedAmount}
                  onChange={handleChange('invoicedAmount')}
                  disabled={isLoading}
                  placeholder="0"
                />
                {errors.invoicedAmount !== undefined && (
                  <Text
                    variant="caption"
                    color="danger"
                    className="mt-1"
                  >
                    {errors.invoicedAmount}
                  </Text>
                )}
              </Box>
            )}
            <Box style={{ gridColumn: 'span 2' }}>
              <label htmlFor="notes">
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  className="mb-1"
                >
                  Notes
                </Text>
              </label>
              <Input
                id="notes"
                value={formState.notes}
                onChange={handleChange('notes')}
                disabled={isLoading}
                placeholder="Additional notes"
              />
            </Box>
          </Grid>
        </CardBody>
        <CardFooter>
          <HStack justify="end" spacing="var(--spacing-3)">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add CLIN'}
            </Button>
          </HStack>
        </CardFooter>
      </form>
    </Card>
  );
}

export default ClinForm;
