/**
 * Upcoming Deadlines Table
 * Shows opportunities due in the next 30 days
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

import type {UpcomingDeadlinesTableProps} from './Dashboard.types';

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
  if (days <= 3) return 'red';
  if (days <= 7) return 'amber';
  if (days <= 14) return 'green';
  return 'zinc';
}

function truncateTitle(title: string, maxLength: number = 50): string {
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength)}...`;
}

export function UpcomingDeadlinesTable({
  deadlines,
  maxRows = 10,
  onRowClick,
  className,
}: UpcomingDeadlinesTableProps): React.ReactElement {
  const displayDeadlines = deadlines.slice(0, maxRows);

  if (displayDeadlines.length === 0) {
    return (
      <Flex align="center" justify="center" className="py-12 text-on-surface-muted">
        <Text>No upcoming deadlines</Text>
      </Flex>
    );
  }

  return (
    <Table dense className={className}>
      <TableHead>
        <TableRow>
          <TableHeader>Title</TableHeader>
          <TableHeader>Agency</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Set-Aside</TableHeader>
          <TableHeader className="text-right">Value</TableHeader>
          <TableHeader>Deadline</TableHeader>
          <TableHeader className="text-right">Days</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {displayDeadlines.map((deadline, index) => (
          <TableRow
            key={deadline.id ?? `row-${index}`}
            className={onRowClick !== undefined ? 'cursor-pointer hover:bg-surface-container' : ''}
            onClick={() => onRowClick?.(deadline.id)}
          >
            <TableCell>
              <Stack gap="none">
                <Text variant="bodySmall" className="font-medium">
                  {truncateTitle(deadline.title)}
                </Text>
              </Stack>
            </TableCell>
            <TableCell>
              <Text variant="bodySmall" color="muted">
                {truncateTitle(deadline.agency, 25)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="bodySmall" className="capitalize">
                {deadline.type.replace(/-/g, ' ')}
              </Text>
            </TableCell>
            <TableCell>
              {deadline.setAside !== null ? (
                <Badge color="blue">{deadline.setAside}</Badge>
              ) : (
                <Text variant="bodySmall" color="muted">Full & Open</Text>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Text variant="bodySmall">
                {formatCurrency(deadline.estimatedValue)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="bodySmall">
                {formatDate(deadline.deadline)}
              </Text>
            </TableCell>
            <TableCell className="text-right">
              <Badge color={getUrgencyBadgeColor(deadline.daysRemaining)}>
                {deadline.daysRemaining === 0
                  ? 'Today'
                  : deadline.daysRemaining === 1
                  ? '1 day'
                  : `${deadline.daysRemaining}d`}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default UpcomingDeadlinesTable;
