import { CSSProperties } from 'react';
import { Badge } from '../../primitives';
import type { BadgeVariant } from '../../primitives';
import type { ContractStatusBadgeProps, ContractStatus } from './Contract.types';
import { getContractStatusLabel } from './Contract.types';

function getStatusVariant(status: ContractStatus): BadgeVariant {
  const variantMap: Record<ContractStatus, BadgeVariant> = {
    DRAFT: 'secondary',
    AWARDED: 'info',
    PENDING_SIGNATURE: 'warning',
    ACTIVE: 'success',
    ON_HOLD: 'warning',
    COMPLETED: 'primary',
    TERMINATED: 'danger',
    CANCELLED: 'danger',
    CLOSED: 'secondary',
  };
  return variantMap[status];
}

export function ContractStatusBadge({
  status,
  className,
  style,
}: ContractStatusBadgeProps) {
  const variant = getStatusVariant(status);
  const label = getContractStatusLabel(status);

  const badgeStyles: CSSProperties = {
    ...style,
  };

  return (
    <Badge variant={variant} size="sm" className={className} style={badgeStyles}>
      {label}
    </Badge>
  );
}

export default ContractStatusBadge;
