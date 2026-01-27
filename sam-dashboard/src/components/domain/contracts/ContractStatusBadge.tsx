/**
 * ContractStatusBadge - Pocket-style ring badge for contract statuses
 */

import clsx from 'clsx';
import type { ContractStatusBadgeProps, ContractStatus } from './Contract.types';
import { getContractStatusLabel } from './Contract.types';

/**
 * Pocket-style status colors (muted, not bright)
 */
const statusColors: Record<ContractStatus, string> = {
  ACTIVE: 'text-success-text bg-success-bg ring-success/20',
  COMPLETED: 'text-success-text bg-success-bg ring-success/20',
  AWARDED: 'text-blue-700 bg-blue-50 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
  PENDING_SIGNATURE: 'text-warning-text bg-warning-bg ring-warning/20',
  ON_HOLD: 'text-warning-text bg-warning-bg ring-warning/20',
  TERMINATED: 'text-danger-text bg-danger-bg ring-danger/10',
  CANCELLED: 'text-danger-text bg-danger-bg ring-danger/10',
  DRAFT: 'text-gray-600 bg-gray-50 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
  CLOSED: 'text-gray-600 bg-gray-50 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
};

export function ContractStatusBadge({
  status,
  className,
}: ContractStatusBadgeProps) {
  const colorClass = statusColors[status];
  const label = getContractStatusLabel(status);

  return (
    <div
      className={clsx(
        colorClass,
        'rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
        className
      )}
    >
      {label}
    </div>
  );
}

export default ContractStatusBadge;
