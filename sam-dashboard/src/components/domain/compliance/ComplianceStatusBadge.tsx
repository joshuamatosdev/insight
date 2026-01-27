/**
 * ComplianceStatusBadge - Status indicator for certifications and clearances
 */

import { Badge } from '../../primitives';
import type { BadgeVariant } from '../../primitives';
import type { ComplianceStatusBadgeProps, CertificationStatus, ClearanceStatus } from './Compliance.types';

/**
 * Maps certification status to badge variant
 */
function getCertificationStatusVariant(status: CertificationStatus): BadgeVariant {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING':
    case 'RENEWAL_IN_PROGRESS':
      return 'info';
    case 'EXPIRING_SOON':
      return 'warning';
    case 'EXPIRED':
    case 'SUSPENDED':
    case 'REVOKED':
      return 'danger';
    case 'GRADUATED':
      return 'secondary';
    default:
      return 'secondary';
  }
}

/**
 * Maps clearance status to badge variant
 */
function getClearanceStatusVariant(status: ClearanceStatus): BadgeVariant {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING':
    case 'INTERIM':
      return 'info';
    case 'EXPIRED':
    case 'SUSPENDED':
    case 'REVOKED':
      return 'danger';
    case 'INACTIVE':
      return 'secondary';
    default:
      return 'secondary';
  }
}

/**
 * Formats status text for display
 */
function formatStatusText(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Determines if a status is a certification status
 */
function isCertificationStatus(status: string): status is CertificationStatus {
  const certStatuses: CertificationStatus[] = [
    'PENDING',
    'ACTIVE',
    'EXPIRING_SOON',
    'EXPIRED',
    'RENEWAL_IN_PROGRESS',
    'SUSPENDED',
    'REVOKED',
    'GRADUATED',
  ];
  return certStatuses.includes(status as CertificationStatus);
}

export function ComplianceStatusBadge({
  status,
  type = 'certification',
  size = 'sm',
}: ComplianceStatusBadgeProps): React.ReactElement {
  const variant =
    type === 'certification' && isCertificationStatus(status)
      ? getCertificationStatusVariant(status as CertificationStatus)
      : getClearanceStatusVariant(status as ClearanceStatus);

  return (
    <Badge variant={variant} size={size}>
      {formatStatusText(status)}
    </Badge>
  );
}

export default ComplianceStatusBadge;
