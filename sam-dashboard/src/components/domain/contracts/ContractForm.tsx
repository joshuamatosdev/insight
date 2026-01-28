import {CSSProperties, useCallback, useState} from 'react';
import {Button, Input, Select, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardFooter, CardHeader, Grid, HStack, Stack} from '../../catalyst/layout';
import type {
    ContractFormProps,
    ContractStatus,
    ContractType,
    CreateContractRequest,
    UpdateContractRequest,
} from './Contract.types';

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'FIRM_FIXED_PRICE', label: 'Firm Fixed Price (FFP)' },
  { value: 'TIME_AND_MATERIALS', label: 'Time and Materials (T&M)' },
  { value: 'COST_PLUS_FIXED_FEE', label: 'Cost Plus Fixed Fee (CPFF)' },
  { value: 'COST_PLUS_INCENTIVE_FEE', label: 'Cost Plus Incentive Fee (CPIF)' },
  { value: 'COST_PLUS_AWARD_FEE', label: 'Cost Plus Award Fee (CPAF)' },
  { value: 'COST_REIMBURSEMENT', label: 'Cost Reimbursement (CR)' },
  { value: 'INDEFINITE_DELIVERY', label: 'Indefinite Delivery (IDIQ)' },
  { value: 'BLANKET_PURCHASE_AGREEMENT', label: 'Blanket Purchase Agreement (BPA)' },
  { value: 'BASIC_ORDERING_AGREEMENT', label: 'Basic Ordering Agreement (BOA)' },
  { value: 'TASK_ORDER', label: 'Task Order' },
  { value: 'DELIVERY_ORDER', label: 'Delivery Order' },
  { value: 'GRANT', label: 'Grant' },
  { value: 'COOPERATIVE_AGREEMENT', label: 'Cooperative Agreement' },
  { value: 'OTHER', label: 'Other' },
];

const CONTRACT_STATUSES: { value: ContractStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'AWARDED', label: 'Awarded' },
  { value: 'PENDING_SIGNATURE', label: 'Pending Signature' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'CLOSED', label: 'Closed' },
];

interface FormState {
  contractNumber: string;
  title: string;
  description: string;
  contractType: ContractType;
  status: ContractStatus;
  agency: string;
  popStartDate: string;
  popEndDate: string;
  totalValue: string;
  fundedValue: string;
  naicsCode: string;
  contractingOfficerName: string;
  contractingOfficerEmail: string;
  corName: string;
  corEmail: string;
}

export function ContractForm({
  contract,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
  style,
}: ContractFormProps) {
  const isEditing = contract !== undefined;

  const [formState, setFormState] = useState<FormState>({
    contractNumber: contract?.contractNumber ?? '',
    title: contract?.title ?? '',
    description: contract?.description ?? '',
    contractType: contract?.contractType ?? 'FIRM_FIXED_PRICE',
    status: contract?.status ?? 'ACTIVE',
    agency: contract?.agency ?? '',
    popStartDate: contract?.popStartDate ?? '',
    popEndDate: contract?.popEndDate ?? '',
    totalValue: contract?.totalValue !== null && contract?.totalValue !== undefined
      ? String(contract.totalValue)
      : '',
    fundedValue: contract?.fundedValue !== null && contract?.fundedValue !== undefined
      ? String(contract.fundedValue)
      : '',
    naicsCode: contract?.naicsCode ?? '',
    contractingOfficerName: contract?.contractingOfficerName ?? '',
    contractingOfficerEmail: contract?.contractingOfficerEmail ?? '',
    corName: contract?.corName ?? '',
    corEmail: contract?.corEmail ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState((prev) => ({
          ...prev,
          [field]: event.target.value,
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

    if (formState.contractNumber.trim().length === 0) {
      newErrors.contractNumber = 'Contract number is required';
    }

    if (formState.title.trim().length === 0) {
      newErrors.title = 'Title is required';
    }

    if (
      formState.totalValue.length > 0 &&
      (isNaN(Number(formState.totalValue)) || Number(formState.totalValue) < 0)
    ) {
      newErrors.totalValue = 'Total value must be a positive number';
    }

    if (
      formState.fundedValue.length > 0 &&
      (isNaN(Number(formState.fundedValue)) || Number(formState.fundedValue) < 0)
    ) {
      newErrors.fundedValue = 'Funded value must be a positive number';
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
        const updateData: UpdateContractRequest = {
          title: formState.title,
          description: formState.description.length > 0 ? formState.description : undefined,
          status: formState.status,
          agency: formState.agency.length > 0 ? formState.agency : undefined,
          popStartDate: formState.popStartDate.length > 0 ? formState.popStartDate : undefined,
          popEndDate: formState.popEndDate.length > 0 ? formState.popEndDate : undefined,
          totalValue: formState.totalValue.length > 0 ? Number(formState.totalValue) : undefined,
          fundedValue: formState.fundedValue.length > 0 ? Number(formState.fundedValue) : undefined,
          contractingOfficerName:
            formState.contractingOfficerName.length > 0
              ? formState.contractingOfficerName
              : undefined,
          contractingOfficerEmail:
            formState.contractingOfficerEmail.length > 0
              ? formState.contractingOfficerEmail
              : undefined,
          corName: formState.corName.length > 0 ? formState.corName : undefined,
          corEmail: formState.corEmail.length > 0 ? formState.corEmail : undefined,
        };
        onSubmit(updateData);
      } else {
        const createData: CreateContractRequest = {
          contractNumber: formState.contractNumber,
          title: formState.title,
          description: formState.description.length > 0 ? formState.description : undefined,
          contractType: formState.contractType,
          agency: formState.agency.length > 0 ? formState.agency : undefined,
          popStartDate: formState.popStartDate.length > 0 ? formState.popStartDate : undefined,
          popEndDate: formState.popEndDate.length > 0 ? formState.popEndDate : undefined,
          totalValue: formState.totalValue.length > 0 ? Number(formState.totalValue) : undefined,
          fundedValue: formState.fundedValue.length > 0 ? Number(formState.fundedValue) : undefined,
          naicsCode: formState.naicsCode.length > 0 ? formState.naicsCode : undefined,
          contractingOfficerName:
            formState.contractingOfficerName.length > 0
              ? formState.contractingOfficerName
              : undefined,
          contractingOfficerEmail:
            formState.contractingOfficerEmail.length > 0
              ? formState.contractingOfficerEmail
              : undefined,
          corName: formState.corName.length > 0 ? formState.corName : undefined,
          corEmail: formState.corEmail.length > 0 ? formState.corEmail : undefined,
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
    <Card style={formStyles}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <Text variant="heading4">
            {isEditing ? 'Edit Contract' : 'Create Contract'}
          </Text>
        </CardHeader>
        <CardBody>
          <Stack spacing="lg">
            <Box>
              <Text variant="heading5">
                Basic Information
              </Text>
              <Grid columns={2} gap="md">
                <Box>
                  <label htmlFor="contractNumber">
                    <Text variant="bodySmall" weight="semibold">
                      Contract Number *
                    </Text>
                  </label>
                  <Input
                    id="contractNumber"
                    value={formState.contractNumber}
                    onChange={handleChange('contractNumber')}
                    disabled={isEditing || isLoading}
                    placeholder="e.g., GS-35F-0123X"
                  />
                  {errors.contractNumber !== undefined && (
                    <Text variant="caption" color="danger">
                      {errors.contractNumber}
                    </Text>
                  )}
                </Box>
                <Box>
                  <label htmlFor="contractType">
                    <Text variant="bodySmall" weight="semibold">
                      Contract Type *
                    </Text>
                  </label>
                  <Select
                    id="contractType"
                    value={formState.contractType}
                    onChange={handleChange('contractType')}
                    disabled={isEditing || isLoading}
                  >
                    {CONTRACT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="title">
                    <Text variant="bodySmall" weight="semibold">
                      Title *
                    </Text>
                  </label>
                  <Input
                    id="title"
                    value={formState.title}
                    onChange={handleChange('title')}
                    disabled={isLoading}
                    placeholder="Contract title"
                  />
                  {errors.title !== undefined && (
                    <Text variant="caption" color="danger">
                      {errors.title}
                    </Text>
                  )}
                </Box>
                <Box style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="description">
                    <Text variant="bodySmall" weight="semibold">
                      Description
                    </Text>
                  </label>
                  <Input
                    id="description"
                    value={formState.description}
                    onChange={handleChange('description')}
                    disabled={isLoading}
                    placeholder="Contract description"
                  />
                </Box>
                {isEditing && (
                  <Box>
                    <label htmlFor="status">
                      <Text variant="bodySmall" weight="semibold">
                        Status
                      </Text>
                    </label>
                    <Select
                      id="status"
                      value={formState.status}
                      onChange={handleChange('status')}
                      disabled={isLoading}
                    >
                      {CONTRACT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </Select>
                  </Box>
                )}
                <Box>
                  <label htmlFor="agency">
                    <Text variant="bodySmall" weight="semibold">
                      Agency
                    </Text>
                  </label>
                  <Input
                    id="agency"
                    value={formState.agency}
                    onChange={handleChange('agency')}
                    disabled={isLoading}
                    placeholder="e.g., Department of Defense"
                  />
                </Box>
              </Grid>
            </Box>

            <Box>
              <Text variant="heading5">
                Period of Performance
              </Text>
              <Grid columns={2} gap="md">
                <Box>
                  <label htmlFor="popStartDate">
                    <Text variant="bodySmall" weight="semibold">
                      Start Date
                    </Text>
                  </label>
                  <Input
                    id="popStartDate"
                    type="date"
                    value={formState.popStartDate}
                    onChange={handleChange('popStartDate')}
                    disabled={isLoading}
                  />
                </Box>
                <Box>
                  <label htmlFor="popEndDate">
                    <Text variant="bodySmall" weight="semibold">
                      End Date
                    </Text>
                  </label>
                  <Input
                    id="popEndDate"
                    type="date"
                    value={formState.popEndDate}
                    onChange={handleChange('popEndDate')}
                    disabled={isLoading}
                  />
                </Box>
              </Grid>
            </Box>

            <Box>
              <Text variant="heading5">
                Contract Value
              </Text>
              <Grid columns={2} gap="md">
                <Box>
                  <label htmlFor="totalValue">
                    <Text variant="bodySmall" weight="semibold">
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
                    <Text variant="caption" color="danger">
                      {errors.totalValue}
                    </Text>
                  )}
                </Box>
                <Box>
                  <label htmlFor="fundedValue">
                    <Text variant="bodySmall" weight="semibold">
                      Funded Value ($)
                    </Text>
                  </label>
                  <Input
                    id="fundedValue"
                    type="number"
                    value={formState.fundedValue}
                    onChange={handleChange('fundedValue')}
                    disabled={isLoading}
                    placeholder="0"
                  />
                  {errors.fundedValue !== undefined && (
                    <Text variant="caption" color="danger">
                      {errors.fundedValue}
                    </Text>
                  )}
                </Box>
              </Grid>
            </Box>

            <Box>
              <Text variant="heading5">
                Key Contacts
              </Text>
              <Grid columns={2} gap="md">
                <Box>
                  <label htmlFor="contractingOfficerName">
                    <Text variant="bodySmall" weight="semibold">
                      Contracting Officer Name
                    </Text>
                  </label>
                  <Input
                    id="contractingOfficerName"
                    value={formState.contractingOfficerName}
                    onChange={handleChange('contractingOfficerName')}
                    disabled={isLoading}
                    placeholder="Name"
                  />
                </Box>
                <Box>
                  <label htmlFor="contractingOfficerEmail">
                    <Text variant="bodySmall" weight="semibold">
                      Contracting Officer Email
                    </Text>
                  </label>
                  <Input
                    id="contractingOfficerEmail"
                    type="email"
                    value={formState.contractingOfficerEmail}
                    onChange={handleChange('contractingOfficerEmail')}
                    disabled={isLoading}
                    placeholder="email@agency.gov"
                  />
                </Box>
                <Box>
                  <label htmlFor="corName">
                    <Text variant="bodySmall" weight="semibold">
                      COR Name
                    </Text>
                  </label>
                  <Input
                    id="corName"
                    value={formState.corName}
                    onChange={handleChange('corName')}
                    disabled={isLoading}
                    placeholder="Name"
                  />
                </Box>
                <Box>
                  <label htmlFor="corEmail">
                    <Text variant="bodySmall" weight="semibold">
                      COR Email
                    </Text>
                  </label>
                  <Input
                    id="corEmail"
                    type="email"
                    value={formState.corEmail}
                    onChange={handleChange('corEmail')}
                    disabled={isLoading}
                    placeholder="email@agency.gov"
                  />
                </Box>
              </Grid>
            </Box>
          </Stack>
        </CardBody>
        <CardFooter>
          <HStack justify="end" spacing="md">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Contract'}
            </Button>
          </HStack>
        </CardFooter>
      </form>
    </Card>
  );
}

export default ContractForm;
