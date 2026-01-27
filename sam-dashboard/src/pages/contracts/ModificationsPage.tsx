import { useState, useCallback } from 'react';
import { Text, Button, ChevronLeftIcon, PlusIcon, Input, Select } from '../../components/catalyst/primitives';
import { Box, Stack, HStack, Flex, Section, SectionHeader, Card, CardHeader, CardBody, CardFooter, Grid, GridItem } from '../../components/catalyst/layout';
import { ModificationTimeline } from '../../components/domain/contracts';
import { useContract } from '../../hooks/useContracts';
import type { CreateModificationRequest, ModificationType } from '../../components/domain/contracts';

export interface ModificationsPageProps {
  contractId: string;
  onBack?: () => void;
}

const MODIFICATION_TYPES: { value: ModificationType; label: string }[] = [
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
  { value: 'BILATERAL', label: 'Bilateral' },
  { value: 'UNILATERAL', label: 'Unilateral' },
  { value: 'SUPPLEMENTAL', label: 'Supplemental' },
  { value: 'INCREMENTAL_FUNDING', label: 'Incremental Funding' },
  { value: 'NO_COST_EXTENSION', label: 'No-Cost Extension' },
  { value: 'OPTION_EXERCISE', label: 'Option Exercise' },
  { value: 'TERMINATION', label: 'Termination' },
  { value: 'SCOPE_CHANGE', label: 'Scope Change' },
  { value: 'OTHER', label: 'Other' },
];

interface ModificationFormState {
  modificationNumber: string;
  title: string;
  description: string;
  modificationType: ModificationType;
  effectiveDate: string;
  valueChange: string;
  fundingChange: string;
  popExtensionDays: string;
  newPopEndDate: string;
  scopeChangeSummary: string;
  reason: string;
}

export function ModificationsPage({ contractId, onBack }: ModificationsPageProps) {
  const {
    contract,
    modifications,
    isLoading,
    error,
    addModification,
    executeModificationAction,
    refresh,
  } = useContract(contractId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<ModificationFormState>({
    modificationNumber: '',
    title: '',
    description: '',
    modificationType: 'BILATERAL',
    effectiveDate: '',
    valueChange: '',
    fundingChange: '',
    popExtensionDays: '',
    newPopEndDate: '',
    scopeChangeSummary: '',
    reason: '',
  });

  const handleChange = useCallback(
    (field: keyof ModificationFormState) =>
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

      if (formState.modificationNumber.trim().length === 0) {
        return;
      }

      const data: CreateModificationRequest = {
        modificationNumber: formState.modificationNumber,
        title: formState.title.length > 0 ? formState.title : undefined,
        description: formState.description.length > 0 ? formState.description : undefined,
        modificationType: formState.modificationType,
        effectiveDate: formState.effectiveDate.length > 0 ? formState.effectiveDate : undefined,
        valueChange:
          formState.valueChange.length > 0 ? Number(formState.valueChange) : undefined,
        fundingChange:
          formState.fundingChange.length > 0 ? Number(formState.fundingChange) : undefined,
        popExtensionDays:
          formState.popExtensionDays.length > 0
            ? Number(formState.popExtensionDays)
            : undefined,
        newPopEndDate:
          formState.newPopEndDate.length > 0 ? formState.newPopEndDate : undefined,
        scopeChangeSummary:
          formState.scopeChangeSummary.length > 0 ? formState.scopeChangeSummary : undefined,
        reason: formState.reason.length > 0 ? formState.reason : undefined,
      };

      setIsSaving(true);
      const result = await addModification(data);
      setIsSaving(false);

      if (result !== null) {
        setShowAddForm(false);
        setFormState({
          modificationNumber: '',
          title: '',
          description: '',
          modificationType: 'BILATERAL',
          effectiveDate: '',
          valueChange: '',
          fundingChange: '',
          popExtensionDays: '',
          newPopEndDate: '',
          scopeChangeSummary: '',
          reason: '',
        });
        refresh();
      }
    },
    [formState, addModification, refresh]
  );

  const handleExecuteModification = useCallback(
    async (modificationId: string) => {
      await executeModificationAction(modificationId);
    },
    [executeModificationAction]
  );

  const handleCancelForm = useCallback(() => {
    setShowAddForm(false);
  }, []);

  if (isLoading) {
    return (
      <Section>
        <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
          <Text variant="body" color="muted">
            Loading modifications...
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
            padding: '1rem',
            backgroundColor: '#fef2f2',
            borderRadius: '0.5rem',
          }}
        >
          <Text variant="body" color="danger">
            {error !== null ? `Error: ${error.message}` : 'Contract not found'}
          </Text>
        </Box>
        {onBack !== undefined && (
          <Box className="mt-4">
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
                className="mb-2"
              >
                Back to Contract
              </Button>
            )}
            <Text variant="heading3">Modifications - {contract.contractNumber}</Text>
            <Text variant="body" color="muted">
              {contract.title}
            </Text>
          </Box>
          <Button
            variant="primary"
            leftIcon={<PlusIcon size="sm" />}
            onClick={() => setShowAddForm(true)}
          >
            Create Modification
          </Button>
        </HStack>
      </SectionHeader>

      {showAddForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <Text variant="heading4">Create Modification</Text>
            </CardHeader>
            <CardBody>
              <Stack spacing="lg">
                <Box>
                  <Text variant="heading5" className="mb-4">
                    Basic Information
                  </Text>
                  <Grid columns={2} gap="md">
                    <Box>
                      <label htmlFor="modificationNumber">
                        <Text
                          variant="bodySmall"
                          weight="semibold"
                          className="mb-1"
                        >
                          Modification Number *
                        </Text>
                      </label>
                      <Input
                        id="modificationNumber"
                        value={formState.modificationNumber}
                        onChange={handleChange('modificationNumber')}
                        disabled={isSaving}
                        placeholder="e.g., P00001"
                        required
                      />
                    </Box>
                    <Box>
                      <label htmlFor="modificationType">
                        <Text
                          variant="bodySmall"
                          weight="semibold"
                          className="mb-1"
                        >
                          Type *
                        </Text>
                      </label>
                      <Select
                        id="modificationType"
                        value={formState.modificationType}
                        onChange={handleChange('modificationType')}
                        disabled={isSaving}
                      >
                        {MODIFICATION_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <GridItem colSpan={2}>
                      <Box>
                        <label htmlFor="title">
                          <Text
                            variant="bodySmall"
                            weight="semibold"
                            className="mb-1"
                          >
                            Title
                          </Text>
                        </label>
                        <Input
                          id="title"
                          value={formState.title}
                          onChange={handleChange('title')}
                          disabled={isSaving}
                          placeholder="Modification title"
                        />
                      </Box>
                    </GridItem>
                    <GridItem colSpan={2}>
                      <Box>
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
                          disabled={isSaving}
                          placeholder="Detailed description of the modification"
                        />
                      </Box>
                    </GridItem>
                    <Box>
                      <label htmlFor="effectiveDate">
                        <Text
                          variant="bodySmall"
                          weight="semibold"
                          className="mb-1"
                        >
                          Effective Date
                        </Text>
                      </label>
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={formState.effectiveDate}
                        onChange={handleChange('effectiveDate')}
                        disabled={isSaving}
                      />
                    </Box>
                  </Grid>
                </Box>

                <Box>
                  <Text variant="heading5" className="mb-4">
                    Value Changes
                  </Text>
                  <Grid columns={2} gap="md">
                    <Box>
                      <label htmlFor="valueChange">
                        <Text
                          variant="bodySmall"
                          weight="semibold"
                          className="mb-1"
                        >
                          Value Change ($)
                        </Text>
                      </label>
                      <Input
                        id="valueChange"
                        type="number"
                        value={formState.valueChange}
                        onChange={handleChange('valueChange')}
                        disabled={isSaving}
                        placeholder="Use negative for decreases"
                      />
                    </Box>
                    <Box>
                      <label htmlFor="fundingChange">
                        <Text
                          variant="bodySmall"
                          weight="semibold"
                          className="mb-1"
                        >
                          Funding Change ($)
                        </Text>
                      </label>
                      <Input
                        id="fundingChange"
                        type="number"
                        value={formState.fundingChange}
                        onChange={handleChange('fundingChange')}
                        disabled={isSaving}
                        placeholder="Use negative for decreases"
                      />
                    </Box>
                  </Grid>
                </Box>

                <Box>
                  <Text variant="heading5" className="mb-4">
                    Period of Performance Changes
                  </Text>
                  <Grid columns={2} gap="md">
                    <Box>
                      <label htmlFor="popExtensionDays">
                        <Text
                          variant="bodySmall"
                          weight="semibold"
                          className="mb-1"
                        >
                          PoP Extension (days)
                        </Text>
                      </label>
                      <Input
                        id="popExtensionDays"
                        type="number"
                        value={formState.popExtensionDays}
                        onChange={handleChange('popExtensionDays')}
                        disabled={isSaving}
                        placeholder="0"
                      />
                    </Box>
                    <Box>
                      <label htmlFor="newPopEndDate">
                        <Text
                          variant="bodySmall"
                          weight="semibold"
                          className="mb-1"
                        >
                          New PoP End Date
                        </Text>
                      </label>
                      <Input
                        id="newPopEndDate"
                        type="date"
                        value={formState.newPopEndDate}
                        onChange={handleChange('newPopEndDate')}
                        disabled={isSaving}
                      />
                    </Box>
                  </Grid>
                </Box>

                <Box>
                  <label htmlFor="scopeChangeSummary">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      className="mb-1"
                    >
                      Scope Change Summary
                    </Text>
                  </label>
                  <Input
                    id="scopeChangeSummary"
                    value={formState.scopeChangeSummary}
                    onChange={handleChange('scopeChangeSummary')}
                    disabled={isSaving}
                    placeholder="Summary of any scope changes"
                  />
                </Box>

                <Box>
                  <label htmlFor="reason">
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      className="mb-1"
                    >
                      Reason
                    </Text>
                  </label>
                  <Input
                    id="reason"
                    value={formState.reason}
                    onChange={handleChange('reason')}
                    disabled={isSaving}
                    placeholder="Reason for the modification"
                  />
                </Box>
              </Stack>
            </CardBody>
            <CardFooter>
              <HStack justify="end" spacing="md">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create Modification'}
                </Button>
              </HStack>
            </CardFooter>
          </form>
        </Card>
      )}

      <ModificationTimeline
        modifications={modifications}
        onExecuteModification={handleExecuteModification}
      />
    </Section>
  );
}

export default ModificationsPage;
