/**
 * ComplianceStatusBadge - Pocket-style ring badge for certification and clearance statuses
 */


import type {CertificationStatus, ClearanceStatus, ComplianceStatusBadgeProps} from './Compliance.types';

/**
 * Pocket-style status colors (muted, not bright)
 */
const certificationStatusColors: Record<CertificationStatus, string> = {
    ACTIVE: 'text-success-text bg-success-bg ring-success/20',
    PENDING: 'text-warning-text bg-warning-bg ring-warning/20',
    RENEWAL_IN_PROGRESS: 'text-warning-text bg-warning-bg ring-warning/20',
    EXPIRING_SOON: 'text-warning-text bg-warning-bg ring-warning/20',
    EXPIRED: 'text-danger-text bg-danger-bg ring-danger/10',
    SUSPENDED: 'text-danger-text bg-danger-bg ring-danger/10',
    REVOKED: 'text-danger-text bg-danger-bg ring-danger/10',
    GRADUATED: 'text-gray-600 bg-gray-50 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
};

const clearanceStatusColors: Record<ClearanceStatus, string> = {
    ACTIVE: 'text-success-text bg-success-bg ring-success/20',
    PENDING: 'text-warning-text bg-warning-bg ring-warning/20',
    INTERIM: 'text-warning-text bg-warning-bg ring-warning/20',
    EXPIRED: 'text-danger-text bg-danger-bg ring-danger/10',
    SUSPENDED: 'text-danger-text bg-danger-bg ring-danger/10',
    REVOKED: 'text-danger-text bg-danger-bg ring-danger/10',
    INACTIVE: 'text-gray-600 bg-gray-50 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
};

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

/**
 * Gets the color class for a given status
 */
function getStatusColor(status: CertificationStatus | ClearanceStatus, type: 'certification' | 'clearance'): string {
    if (type === 'certification' && isCertificationStatus(status)) {
        return certificationStatusColors[status as CertificationStatus];
    }
    return clearanceStatusColors[status as ClearanceStatus];
}

export function ComplianceStatusBadge({
                                          status,
                                          type = 'certification',
                                      }: ComplianceStatusBadgeProps): React.ReactElement {
    const colorClass = getStatusColor(status, type);

    return (
        <div
        >
            {formatStatusText(status)}
        </div>
    );
}

export default ComplianceStatusBadge;
