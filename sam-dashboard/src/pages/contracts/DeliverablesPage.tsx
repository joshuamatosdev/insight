import { useState, useCallback } from 'react';
import { Text, Button, ChevronLeftIcon, PlusIcon, Input, Select } from '../../components/primitives';
import { Box, Stack, HStack, Flex, Section, SectionHeader, Card, CardHeader, CardBody, CardFooter, Grid } from '../../components/layout';
import { DeliverableTracker } from '../../components/domain/contracts';
import { useContract } from '../../hooks/useContracts';
import type {
  CreateDeliverableRequest,
  DeliverableStatus,
  DeliverableType,
  DeliverableFrequency,
} from '../../components/domain/contracts';

export interface DeliverablesPageProps {
  contractId: string;
  onBack?: () => void;
}

const DELIVERABLE_TYPES: { value: DeliverableType; label: string }[] = [
  { value: 'REPORT', label: 'Report' },
  { value: 'DATA', label: 'Data' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'DOCUMENTATION', label: 'Documentation' },
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'MILESTONE', label: 'Milestone' },
  { value: 'STATUS_REPORT', label: 'Status Report' },
  { value: 'FINANCIAL_REPORT', label: 'Financial Report' },
  { value: 'TECHNICAL_REPORT', label: 'Technical Report' },
  { value: 'OTHER', label: 'Other' },
];

const FREQUENCIES: { value: DeliverableFrequency; label: string }[] = [
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BI_WEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMI_ANNUALLY', label: 'Semi-annually' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'AS_REQUIRED', label: 'As Required' },
];

interface DeliverableFormState {
  cdrlNumber: string;
  title: string;
  description: string;
  deliverableType: DeliverableType;
  dueDate: string;
  frequency: DeliverableFrequency | '';
  notes: string;
}

export function DeliverablesPage({ contractId, onBack }: DeliverablesPageProps) {
  const {
    contract,
    deliverables,
    isLoading,
    error,
    addDeliverable,
    updateDeliverableStatusAction,
    refresh,
  } = useContract(contractId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<DeliverableFormState>({
    cdrlNumber: '',
    title: '',
    description: '',
    deliverableType: 'REPORT',
    dueDate: '',
    frequency: 'ONE_TIME',
    notes: '',
  });

  const handleChange = useCallback(
    (field: keyof DeliverableFormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (formState.title.trim().length === 0) {
        return;
      }

      const data: CreateDeliverableRequest = {
        cdrlNumber: formState.cdrlNumber.length > 0 ? formState.cdrlNumber : undefined,
        title: formState.title,
        description: formState.description.length > 0 ? formState.description : undefined,
        deliverableType: formState.deliverableType,
        dueDate: formState.dueDate.length > 0 ? formState.dueDate : undefined,
        frequency: formState.frequency.length > 0 ? (formState.frequency as DeliverableFrequency) : undefined,
        notes: formState.notes.length > 0 ? formState.notes : undefined,
      };

      setIsSaving(true);
      const result = await addDeliverable(data);
      setIsSaving(false);

      if (result !== null) {
        setShowAddForm(false);
        setFormState({
          cdrlNumber: '',
          title: '',
          description: '',
          deliverableType: 'REPORT',
          dueDate: '',
          frequency: 'ONE_TIME',
          notes: '',
        });
        refresh();
      }
    },
    [formState, addDeliverable, refresh]
  );

  const handleStatusChange = useCallback(
    async (deliverableId: string, status: DeliverableStatus) => {
      await updateDeliverableStatusAction(deliverableId, status);
    },
    [updateDeliverableStatusAction]
  );

  const handleCancelForm = useCallback(() => {
    setShowAddForm(false);
  }, []);

  if (isLoading) {
    return (
      <Section>
        <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
          <Text variant="body" color="muted">
            Loading deliverables...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (error !== null || contract === null) {
    return (
      <Section>
        <Box
          style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-danger-light)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Text variant="body" color="danger">
            {error !== null ? `Error: ${error.message}` : 'Contract not found'}
          </Text>
        </Box>
        {onBack !== undefined && (
          <Box style={{ marginTop: 'var(--spacing-4)' }}>
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
          </Box>
        )}
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader>
        <HStack justify="between" align="center">
          <Box>
            {onBack !== undefined && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ChevronLeftIcon size="sm" />}
                onClick={onBack}
                style={{ marginBottom: 'var(--spacing-2)' }}
              >
                Back to Contract
              </Button>
            )}
            <Text variant="heading3">Deliverables - {contract.contractNumber}</Text>
            <Text variant="body" color="muted">
              {contract.title}
            </Text>
          </Box>
          <Button
            variant="primary"
            leftIcon={<PlusIcon size="sm" />}
            onClick={() => setShowAddForm(true)}
          >
            Add Deliverable
          </Button>
        </HStack>
      </SectionHeader>

      {showAddForm && (
        <Card style={{ marginBottom: 'var(--spacing-6)' }}>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <Text variant="heading4">Add Deliverable</Text>
            </CardHeader>
            <CardBody>
              <Grid columns={2} gap="var(--spacing-4)">
                <Box>
                  <label htmlFor="cdrlNumber">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      style={{ marginBottom: 'var(--spacing-1)' }}
                    >
                      CDRL Number
                    </Text>
                  </label>
                  <Input
                    id="cdrlNumber"
                    value={formState.cdrlNumber}
                    onChange={handleChange('cdrlNumber')}
                    disabled={isSaving}
                    placeholder="e.g., A001"
                  />
                </Box>
                <Box>
                  <label htmlFor="deliverableType">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      style={{ marginBottom: 'var(--spacing-1)' }}
                    >
                      Type *
                    </Text>
                  </label>
                  <Select
                    id="deliverableType"
                    value={formState.deliverableType}
                    onChange={handleChange('deliverableType')}
                    disabled={isSaving}
                  >
                    {DELIVERABLE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="title">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      style={{ marginBottom: 'var(--spacing-1)' }}
                    >
                      Title *
                    </Text>
                  </label>
                  <Input
                    id="title"
                    value={formState.title}
                    onChange={handleChange('title')}
                    disabled={isSaving}
                    placeholder="Deliverable title"
                    required
                  />
                </Box>
                <Box style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="description">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      style={{ marginBottom: 'var(--spacing-1)' }}
                    >
                      Description
                    </Text>
                  </label>
                  <Input
                    id="description"
                    value={formState.description}
                    onChange={handleChange('description')}
                    disabled={isSaving}
                    placeholder="Deliverable description"
                  />
                </Box>
                <Box>
                  <label htmlFor="dueDate">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      style={{ marginBottom: 'var(--spacing-1)' }}
                    >
                      Due Date
                    </Text>
                  </label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formState.dueDate}
                    onChange={handleChange('dueDate')}
                    disabled={isSaving}
                  />
                </Box>
                <Box>
                  <label htmlFor="frequency">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      style={{ marginBottom: 'var(--spacing-1)' }}
                    >
                      Frequency
                    </Text>
                  </label>
                  <Select
                    id="frequency"
                    value={formState.frequency}
                    onChange={handleChange('frequency')}
                    disabled={isSaving}
                  >
                    <option value="">Select...</option>
                    {FREQUENCIES.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="notes">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      style={{ marginBottom: 'var(--spacing-1)' }}
                    >
                      Notes
                    </Text>
                  </label>
                  <Input
                    id="notes"
                    value={formState.notes}
                    onChange={handleChange('notes')}
                    disabled={isSaving}
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
                  onClick={handleCancelForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Adding...' : 'Add Deliverable'}
                </Button>
              </HStack>
            </CardFooter>
          </form>
        </Card>
      )}

      <DeliverableTracker deliverables={deliverables} onStatusChange={handleStatusChange} />
    </Section>
  );
}

export default DeliverablesPage;
