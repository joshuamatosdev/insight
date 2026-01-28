/**
 * Compliance Alerts Table
 * Shows certifications and clearances expiring soon
 */

import {Badge, Flex, Stack} from '@/components/catalyst';
import {Text} from '@/components/catalyst/primitives';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/catalyst/layout';

import type {ComplianceAlertsTableProps} from './Dashboard.types';

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function getUrgencyBadgeColor(days: number): 'red' | 'amber' | 'green' | 'zinc' {
    if (days <= 7) return 'red';
    if (days <= 30) return 'amber';
    if (days <= 60) return 'green';
    return 'zinc';
}

function getTypeBadgeColor(type: 'certification' | 'clearance'): 'blue' | 'violet' {
    return type === 'certification' ? 'blue' : 'violet';
}

function getStatusBadgeColor(status: string): 'green' | 'amber' | 'red' | 'zinc' {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'active' || normalizedStatus === 'current') return 'green';
    if (normalizedStatus === 'expiring' || normalizedStatus === 'pending') return 'amber';
    if (normalizedStatus === 'expired' || normalizedStatus === 'revoked') return 'red';
    return 'zinc';
}

export function ComplianceAlertsTable({
                                          alerts,
                                          maxRows = 10,
                                          onRowClick,
                                          className,
                                      }: ComplianceAlertsTableProps): React.ReactElement {
    const displayAlerts = alerts.slice(0, maxRows);

    if (displayAlerts.length === 0) {
        return (
            <Flex align="center" justify="center" className="py-12 text-on-surface-muted">
                <Text>No compliance alerts</Text>
            </Flex>
        );
    }

    return (
        <Table dense className={className}>
            <TableHead>
                <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Expiration</TableHeader>
                    <TableHeader className="text-right">Days</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {displayAlerts.map((alert) => (
                    <TableRow
                        key={alert.id}
                        className={onRowClick !== undefined ? 'cursor-pointer hover:bg-surface-container' : ''}
                        onClick={() => onRowClick?.(alert.id)}
                    >
                        <TableCell>
                            <Stack gap="none">
                                <Text variant="bodySmall" className="font-medium">
                                    {alert.name}
                                </Text>
                            </Stack>
                        </TableCell>
                        <TableCell>
                            <Badge color={getTypeBadgeColor(alert.type)}>
                                {alert.type === 'certification' ? 'Certification' : 'Clearance'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge color={getStatusBadgeColor(alert.status)}>
                                {alert.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Text variant="bodySmall">{formatDate(alert.expirationDate)}</Text>
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge color={getUrgencyBadgeColor(alert.daysRemaining)}>
                                {alert.daysRemaining <= 0
                                    ? 'Expired'
                                    : alert.daysRemaining === 1
                                        ? '1 day'
                                        : `${alert.daysRemaining}d`}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default ComplianceAlertsTable;
