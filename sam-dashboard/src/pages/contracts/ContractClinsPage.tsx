import { useState, useCallback } from 'react';
import { Text, Button, ChevronLeftIcon, PlusIcon } from '../../components/primitives';
import { Box, Stack, HStack, Flex, Section, SectionHeader } from '../../components/layout';
import { ClinTable, ClinForm } from '../../components/domain/contracts';
import { useContract } from '../../hooks/useContracts';
import type {
  ContractClin,
  CreateClinRequest,
  UpdateClinRequest,
} from '../../components/domain/contracts';

export interface ContractClinsPageProps {
  contractId: string;
  onBack?: () => void;
}

export function ContractClinsPage({ contractId, onBack }: ContractClinsPageProps) {
  const { contract, clins, isLoading, error, addClin, updateClinData, refresh } =
    useContract(contractId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClin, setEditingClin] = useState<ContractClin | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddClin = useCallback(
    async (data: CreateClinRequest) => {
      setIsSaving(true);
      const result = await addClin(data);
      setIsSaving(false);
      if (result !== null) {
        setShowAddForm(false);
        refresh();
      }
    },
    [addClin, refresh]
  );

  const handleUpdateClin = useCallback(
    async (data: UpdateClinRequest) => {
      if (editingClin === null) {
        return;
      }
      setIsSaving(true);
      const result = await updateClinData(editingClin.id, data);
      setIsSaving(false);
      if (result !== null) {
        setEditingClin(null);
        refresh();
      }
    },
    [editingClin, updateClinData, refresh]
  );

  const handleEditClin = useCallback((clin: ContractClin) => {
    setEditingClin(clin);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowAddForm(false);
    setEditingClin(null);
  }, []);

  if (isLoading) {
    return (
      <Section>
        <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
          <Text variant="body" color="muted">
            Loading CLINs...
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

  if (showAddForm) {
    return (
      <Section>
        <SectionHeader>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ChevronLeftIcon size="sm" />}
            onClick={handleCancelForm}
          >
            Cancel
          </Button>
        </SectionHeader>
        <ClinForm onSubmit={handleAddClin} onCancel={handleCancelForm} isLoading={isSaving} />
      </Section>
    );
  }

  if (editingClin !== null) {
    return (
      <Section>
        <SectionHeader>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ChevronLeftIcon size="sm" />}
            onClick={handleCancelForm}
          >
            Cancel
          </Button>
        </SectionHeader>
        <ClinForm
          clin={editingClin}
          onSubmit={handleUpdateClin}
          onCancel={handleCancelForm}
          isLoading={isSaving}
        />
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
            <Text variant="heading3">CLINs - {contract.contractNumber}</Text>
            <Text variant="body" color="muted">
              {contract.title}
            </Text>
          </Box>
          <Button
            variant="primary"
            leftIcon={<PlusIcon size="sm" />}
            onClick={() => setShowAddForm(true)}
          >
            Add CLIN
          </Button>
        </HStack>
      </SectionHeader>

      <ClinTable clins={clins} onEditClin={handleEditClin} />
    </Section>
  );
}

export default ContractClinsPage;
