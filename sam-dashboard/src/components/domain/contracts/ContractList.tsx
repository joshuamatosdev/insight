import clsx from 'clsx';
import { ContractCard } from './ContractCard';
import type { ContractListProps } from './Contract.types';

export function ContractList({
  contracts,
  onContractClick,
  emptyMessage = 'No contracts found',
  className,
}: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <div
        className={clsx(
          'rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-8 text-center',
          className
        )}
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-0', className)}>
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
