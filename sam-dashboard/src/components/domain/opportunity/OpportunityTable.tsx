import { OpportunityTableProps } from './Opportunity.types';
import { Box } from '../../catalyst/layout';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../../catalyst';

export function OpportunityTable({ opportunities, maxRows }: OpportunityTableProps) {
  const formatDate = (dateStr: string | undefined): string => {
    if (dateStr === undefined || dateStr === null) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getDeadlineColorClass = (deadline: string | undefined): string => {
    if (deadline === undefined || deadline === null) return 'text-on-surface-muted';
    const now = new Date();
    const dl = new Date(deadline);
    const daysUntil = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntil < 0) return 'text-on-surface-muted';
    if (daysUntil <= 3) return 'text-danger';
    if (daysUntil <= 7) return 'text-warning';
    return 'text-on-surface';
  };

  const truncate = (str: string | undefined, len: number): string => {
    if (str === undefined || str === null) return 'N/A';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const displayOpportunities = maxRows !== undefined ? opportunities.slice(0, maxRows) : opportunities;

  if (opportunities.length === 0) {
    return (
      <Box className="p-8 text-center">
        <span className="text-sm text-on-surface-muted">No opportunities to display.</span>
      </Box>
    );
  }

  return (
    <Table dense>
      <TableHead>
        <TableRow>
          <TableHeader>Title</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>NAICS</TableHeader>
          <TableHeader>Deadline</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {displayOpportunities.map((opp) => (
          <TableRow
            key={opp.id}
            href={opp.url !== undefined && opp.url !== null ? opp.url : '#'}
            title={opp.title}
          >
            <TableCell>
              <span className="text-sm font-medium text-on-surface">
                {truncate(opp.title, 50)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-on-surface-muted">
                {opp.type !== undefined && opp.type !== null ? opp.type : 'N/A'}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-on-surface">
                {opp.naicsCode !== undefined && opp.naicsCode !== null ? opp.naicsCode : '—'}
              </span>
            </TableCell>
            <TableCell>
              <span className={`text-sm ${getDeadlineColorClass(opp.responseDeadLine)}`}>
                {formatDate(opp.responseDeadLine)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default OpportunityTable;
