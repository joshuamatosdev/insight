/**
 * Expiring Contracts Table
 * Shows contracts/options expiring soon
 */

import {Badge, Flex, Stack} from '@/components/catalyst';
import {Text} from '@/components/catalyst/primitives';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/layout';

import type {ExpiringContractsTableProps} from './Dashboard.types';

function formatCurrency(value: number | null): string {
  if (value === null) return 'N/A';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

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
  if (days <= 14) return 'red';
  if (days <= 30) return 'amber';
  if (days <= 60) return 'green';
  return 'zinc';
}

function truncateTitle(title: string, maxLength: number = 40): string {
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength)}...`;
}

export function ExpiringContractsTable({
  contracts,
  maxRows = 10,
  onRowClick,
  className,
}: ExpiringContractsTableProps): React.ReactElement {
  const displayContracts = contracts.slice(0, maxRows);

  if (displayContracts.length === 0) {
    return (
      <Flex align="center" justify="center" className="py-12 text-on-surface-muted">
        <Text>No expiring contracts</Text>
      </Flex>
    );
  }

  return (
    <Table dense className={className}>
      <TableHead>
        <TableRow>
          <TableHeader>Contract #</TableHeader>
          <TableHeader>Title</TableHeader>
          <TableHeader>Agency</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader className="text-right">Value</TableHeader>
          <TableHeader>End Date</TableHeader>
          <TableHeader className="text-right">Days</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {displayContracts.map((contract) => (
          <TableRow
            key={contract.id}
            className={onRowClick !== undefined ? 'cursor-pointer hover:bg-surface-container' : ''}
            onClick={() => onRowClick?.(contract.id)}
          >
            <TableCell>
              <Text variant="bodySmall" className="font-mono">
                {contract.contractNumber}
              </Text>
            </TableCell>
            <TableCell>
              <Stack gap="none">
                <Text variant="bodySmall" className="font-medium">
                  {truncateTitle(contract.title)}
                </Text>
              </Stack>
            </TableCell>
            <TableCell>
              <Text variant="bodySmall" color="muted">
                {contract.agency ?? 'N/A'}
              </Text>
            </TableCell>
            <TableCell>
              <Badge color={contract.type === 'option' ? 'violet' : 'blue'}>
                {contract.type === 'option' ? 'Option' : 'Contract'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Text variant="bodySmall">{formatCurrency(contract.value)}</Text>
            </TableCell>
            <TableCell>
              <Text variant="bodySmall">{formatDate(contract.endDate)}</Text>
            </TableCell>
            <TableCell className="text-right">
              <Badge color={getUrgencyBadgeColor(contract.daysRemaining)}>
                {contract.daysRemaining <= 0
                  ? 'Expired'
                  : contract.daysRemaining === 1
                  ? '1 day'
                  : `${contract.daysRemaining}d`}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ExpiringContractsTable;
