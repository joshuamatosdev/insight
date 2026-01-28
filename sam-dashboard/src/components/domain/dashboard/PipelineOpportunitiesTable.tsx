/**
 * Pipeline Opportunities Table
 * Shows current pipeline with stage, value, and ownership
 */

import {Box, Flex, Stack} from '@/components/catalyst';
import {Text} from '@/components/catalyst/primitives';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/layout';

import type {PipelineOpportunitiesTableProps} from './Dashboard.types';

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

function formatProbability(probability: number | null): string {
  if (probability === null) return '—';
  return `${Math.round(probability * 100)}%`;
}

function truncateTitle(title: string, maxLength: number = 45): string {
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength)}...`;
}

export function PipelineOpportunitiesTable({
  opportunities,
  maxRows = 10,
  onRowClick,
  className,
}: PipelineOpportunitiesTableProps): React.ReactElement {
  const displayOpportunities = opportunities.slice(0, maxRows);

  if (displayOpportunities.length === 0) {
    return (
      <Flex align="center" justify="center" className="py-12 text-on-surface-muted">
        <Text>No pipeline opportunities</Text>
      </Flex>
    );
  }

  return (
    <Table dense className={className}>
      <TableHead>
        <TableRow>
          <TableHeader>Title</TableHeader>
          <TableHeader>Stage</TableHeader>
          <TableHeader className="text-right">Est. Value</TableHeader>
          <TableHeader className="text-right">Probability</TableHeader>
          <TableHeader className="text-right">Weighted</TableHeader>
          <TableHeader>Owner</TableHeader>
          <TableHeader>Next Action</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {displayOpportunities.map((opp) => (
          <TableRow
            key={opp.id}
            className={onRowClick !== undefined ? 'cursor-pointer hover:bg-surface-container' : ''}
            onClick={() => onRowClick?.(opp.id)}
          >
            <TableCell>
              <Stack gap="none">
                <Text variant="bodySmall" className="font-medium">
                  {truncateTitle(opp.title)}
                </Text>
              </Stack>
            </TableCell>
            <TableCell>
              <Flex align="center" gap="xs">
                {opp.stageColor !== undefined && (
                  <Box
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{backgroundColor: opp.stageColor}}
                  />
                )}
                <Text variant="bodySmall">{opp.stageName}</Text>
              </Flex>
            </TableCell>
            <TableCell className="text-right">
              <Text variant="bodySmall">{formatCurrency(opp.value)}</Text>
            </TableCell>
            <TableCell className="text-right">
              <Text variant="bodySmall" color="muted">
                {formatProbability(opp.probability)}
              </Text>
            </TableCell>
            <TableCell className="text-right">
              <Text variant="bodySmall" className="font-medium">
                {formatCurrency(opp.weightedValue)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="bodySmall" color="muted">
                {opp.owner ?? '—'}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="bodySmall" color="muted" className="truncate max-w-[150px]">
                {opp.nextAction ?? '—'}
              </Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default PipelineOpportunitiesTable;
