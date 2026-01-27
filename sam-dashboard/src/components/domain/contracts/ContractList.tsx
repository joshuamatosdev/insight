import { CSSProperties } from 'react';
import { Text } from '../../primitives';
import { Box, Stack } from '../../layout';
import { ContractCard } from './ContractCard';
import type { ContractListProps } from './Contract.types';

export function ContractList({
  contracts,
  onContractClick,
  emptyMessage = 'No contracts found',
  className,
  style,
}: ContractListProps) {
  const listStyles: CSSProperties = {
    ...style,
  };

  if (contracts.length === 0) {
    return (
      <Box
        className={className}
        style={{
          padding: 'var(--spacing-8)',
          textAlign: 'center',
          backgroundColor: 'var(--color-gray-50)',
          borderRadius: 'var(--radius-lg)',
          ...listStyles,
        }}
      >
        <Text variant="body" color="muted">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Stack spacing="var(--spacing-0)" className={className} style={listStyles}>
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onClick={
            onContractClick !== undefined
              ? () => onContractClick(contract)
              : undefined
          }
        />
      ))}
    </Stack>
  );
}

export default ContractList;
