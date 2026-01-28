import {ContractCard} from './ContractCard';
import type {ContractListProps} from './Contract.types';

export function ContractList({
  contracts,
  onContractClick,
  emptyMessage = 'No contracts found',
  className,
}: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <div
      >
        <p>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div>
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
    </div>
  );
}

export default ContractList;
