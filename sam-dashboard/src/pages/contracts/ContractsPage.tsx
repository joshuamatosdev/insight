import { useState, useCallback } from 'react';
import { Text, Button, Input, PlusIcon } from '../../components/catalyst/primitives';
import { Box, Stack, HStack, Flex, Section, SectionHeader } from '../../components/catalyst/layout';
import { ContractList, ContractForm } from '../../components/domain/contracts';
import { useContracts, useCreateContract } from '../../hooks/useContracts';
import type { Contract, CreateContractRequest } from '../../components/domain/contracts';

export interface ContractsPageProps {
  onContractSelect?: (contractId: string) => void;
}

export function ContractsPage({ onContractSelect }: ContractsPageProps) {
  const {
    contracts,
    isLoading,
    error,
    pagination,
    setPage,
    refresh,
    search,
  } = useContracts();
  const { createContractAction, isCreating } = useCreateContract();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleContractClick = useCallback(
    (contract: Contract) => {
      if (onContractSelect !== undefined) {
        onContractSelect(contract.id);
      }
    },
    [onContractSelect]
  );

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      search(searchTerm);
    },
    [search, searchTerm]
  );

  const handleCreateContract = useCallback(
    async (data: CreateContractRequest) => {
      const result = await createContractAction(data);
      if (result !== null) {
        setShowCreateForm(false);
        refresh();
        if (onContractSelect !== undefined) {
          onContractSelect(result.id);
        }
      }
    },
    [createContractAction, onContractSelect, refresh]
  );

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  if (showCreateForm) {
    return (
      <Section>
        <ContractForm
          onSubmit={handleCreateContract}
          onCancel={handleCancelCreate}
          isLoading={isCreating}
        />
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader>
        <HStack justify="between" align="center">
          <Text variant="heading3">Contracts</Text>
          <Button
            variant="primary"
            leftIcon={<PlusIcon size="sm" />}
            onClick={() => setShowCreateForm(true)}
          >
            New Contract
          </Button>
        </HStack>
      </SectionHeader>

      <Box className="mb-4">
        <form onSubmit={handleSearchSubmit}>
          <HStack spacing="sm">
            <Input
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={handleSearch}
              style={{ maxWidth: '400px' }}
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </HStack>
        </form>
      </Box>

      {isLoading && (
        <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
          <Text variant="body" color="muted">
            Loading contracts...
          </Text>
        </Flex>
      )}

      {error !== null && (
        <Box
          style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            borderRadius: '0.5rem',
          }}
        >
          <Text variant="body" color="danger">
            Error: {error.message}
          </Text>
        </Box>
      )}

      {isLoading === false && error === null && (
        <Stack spacing="md">
          <ContractList
            contracts={contracts}
            onContractClick={handleContractClick}
            emptyMessage="No contracts found. Create your first contract to get started."
          />

          {pagination.totalPages > 1 && (
            <HStack justify="center" spacing="sm">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 0}
                onClick={() => setPage(pagination.page - 1)}
              >
                Previous
              </Button>
              <Text variant="body">
                Page {pagination.page + 1} of {pagination.totalPages}
              </Text>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages - 1}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next
              </Button>
            </HStack>
          )}
        </Stack>
      )}
    </Section>
  );
}

export default ContractsPage;
